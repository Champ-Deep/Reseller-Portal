/**
 * Database Service
 * Following SOLID principles: Single Responsibility for database operations
 */

import sql from "@/app/api/utils/sql";
import { BaseService, ValidationError } from "./BaseService.js";

export class DatabaseService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Get or create organization for authenticated user
   */
  async getOrCreateUserOrganization(authUser) {
    if (!authUser?.id) {
      throw new ValidationError("Valid authenticated user required");
    }

    try {
      // First check if user already exists in our users table
      const existingUser = await sql`
        SELECT u.*, o.id as organization_id, o.name as organization_name, o.slug as organization_slug
        FROM users u 
        JOIN organizations o ON u.organization_id = o.id
        WHERE u.email = ${authUser.email}
        LIMIT 1
      `;

      if (existingUser.length > 0) {
        return {
          user: existingUser[0],
          organization: {
            id: existingUser[0].organization_id,
            name: existingUser[0].organization_name,
            slug: existingUser[0].organization_slug,
          },
        };
      }

      // Create new organization for new user
      const organizationSlug = this.generateSlug(
        authUser.name || authUser.email,
      );

      // Use transaction to ensure atomicity
      const [organization, user] = await sql.transaction([
        sql`
          INSERT INTO organizations (name, slug)
          VALUES (${authUser.name || authUser.email}, ${organizationSlug})
          RETURNING *
        `,
        sql`
          INSERT INTO users (organization_id, email, name, role, status)
          VALUES (
            (SELECT id FROM organizations WHERE slug = ${organizationSlug}),
            ${authUser.email},
            ${authUser.name},
            'admin',
            'active'
          )
          RETURNING *
        `,
      ]);

      return {
        user: user[0],
        organization: organization[0],
      };
    } catch (error) {
      console.error("Error getting/creating user organization:", error);
      throw error;
    }
  }

  /**
   * Get user context with organization
   */
  async getUserContext(authUser) {
    const context = await this.getOrCreateUserOrganization(authUser);
    return {
      userId: context.user.id,
      organizationId: context.organization.id,
      userRole: context.user.role,
      userStatus: context.user.status,
      organizationName: context.organization.name,
    };
  }

  /**
   * Enrichment Jobs Operations
   */
  async createEnrichmentJob({
    userId,
    organizationId,
    name,
    inputFileUrl,
    columnMapping,
    totalRecords,
  }) {
    this.validateRequired(
      { userId, organizationId, name, inputFileUrl, columnMapping },
      ["userId", "organizationId", "name", "inputFileUrl", "columnMapping"],
    );

    const job = await sql`
      INSERT INTO enrichment_jobs (
        organization_id,
        user_id,
        name,
        status,
        input_file_url,
        column_mapping,
        total_records,
        progress,
        processed_records
      ) VALUES (
        ${organizationId},
        ${userId},
        ${name},
        'pending',
        ${inputFileUrl},
        ${JSON.stringify(columnMapping)},
        ${totalRecords || 0},
        0,
        0
      )
      RETURNING *
    `;

    return job[0];
  }

  async getEnrichmentJobs(organizationId, limit = 50) {
    return await sql`
      SELECT 
        id,
        name,
        status,
        input_file_url,
        output_file_url,
        column_mapping,
        progress,
        total_records,
        processed_records,
        error_message,
        created_at,
        updated_at
      FROM enrichment_jobs 
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  async getEnrichmentJob(jobId, organizationId) {
    const jobs = await sql`
      SELECT 
        id,
        name,
        status,
        input_file_url,
        output_file_url,
        column_mapping,
        progress,
        total_records,
        processed_records,
        error_message,
        created_at,
        updated_at
      FROM enrichment_jobs 
      WHERE id = ${jobId} AND organization_id = ${organizationId}
      LIMIT 1
    `;

    return jobs[0] || null;
  }

  async updateEnrichmentJob(jobId, updates) {
    const allowedFields = [
      "status",
      "progress",
      "processed_records",
      "output_file_url",
      "error_message",
    ];

    const updateFields = [];
    const updateValues = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${updateValues.length + 1}`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE enrichment_jobs 
      SET ${updateFields.join(", ")}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `;

    const result = await sql(query, [...updateValues, jobId]);
    return result[0];
  }

  /**
   * ICP Filters Operations
   */
  async createICPFilter({
    userId,
    organizationId,
    name,
    description,
    filters,
    estimatedCount,
  }) {
    this.validateRequired({ userId, organizationId, name, filters }, [
      "userId",
      "organizationId",
      "name",
      "filters",
    ]);

    const filter = await sql`
      INSERT INTO icp_filters (
        organization_id,
        user_id,
        name,
        description,
        filters,
        estimated_count
      ) VALUES (
        ${organizationId},
        ${userId},
        ${name},
        ${description || ""},
        ${JSON.stringify(filters)},
        ${estimatedCount || 0}
      )
      RETURNING *
    `;

    return filter[0];
  }

  async getICPFilters(organizationId, limit = 50) {
    return await sql`
      SELECT 
        id,
        name,
        description,
        filters,
        estimated_count,
        created_at,
        updated_at
      FROM icp_filters 
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  async updateICPFilter(filterId, organizationId, updates) {
    const allowedFields = ["name", "description", "filters", "estimated_count"];

    const updateFields = [];
    const updateValues = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${updateValues.length + 1}`);
        updateValues.push(key === "filters" ? JSON.stringify(value) : value);
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE icp_filters 
      SET ${updateFields.join(", ")}
      WHERE id = $${updateValues.length + 1} AND organization_id = $${updateValues.length + 2}
      RETURNING *
    `;

    const result = await sql(query, [
      ...updateValues,
      filterId,
      organizationId,
    ]);
    return result[0];
  }

  /**
   * Data Segments Operations
   */
  async createDataSegment({
    organizationId,
    name,
    description,
    category,
    pricePerRecord,
    totalRecords,
    metadata,
  }) {
    this.validateRequired({ organizationId, name, category, pricePerRecord }, [
      "organizationId",
      "name",
      "category",
      "pricePerRecord",
    ]);

    const segment = await sql`
      INSERT INTO data_segments (
        organization_id,
        name,
        description,
        category,
        price_per_record,
        total_records,
        metadata,
        is_active
      ) VALUES (
        ${organizationId},
        ${name},
        ${description || ""},
        ${category},
        ${pricePerRecord},
        ${totalRecords || 0},
        ${JSON.stringify(metadata || {})},
        true
      )
      RETURNING *
    `;

    return segment[0];
  }

  async getDataSegments(organizationId = null, activeOnly = true) {
    // Gracefully handle missing database configuration so callers can fallback
    if (!process.env.DATABASE_URL) {
      return [];
    }

    // Use explicit query variants instead of composing tagged templates
    if (organizationId && activeOnly) {
      return await sql`
        SELECT 
          id,
          organization_id,
          name,
          description,
          category,
          price_per_record,
          total_records,
          metadata,
          is_active,
          created_at,
          updated_at
        FROM data_segments 
        WHERE organization_id = ${organizationId} AND is_active = true
        ORDER BY created_at DESC
      `;
    }

    if (organizationId && !activeOnly) {
      return await sql`
        SELECT 
          id,
          organization_id,
          name,
          description,
          category,
          price_per_record,
          total_records,
          metadata,
          is_active,
          created_at,
          updated_at
        FROM data_segments 
        WHERE organization_id = ${organizationId}
        ORDER BY created_at DESC
      `;
    }

    if (!organizationId && activeOnly) {
      return await sql`
        SELECT 
          id,
          organization_id,
          name,
          description,
          category,
          price_per_record,
          total_records,
          metadata,
          is_active,
          created_at,
          updated_at
        FROM data_segments 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
    }

    return await sql`
      SELECT 
        id,
        organization_id,
        name,
        description,
        category,
        price_per_record,
        total_records,
        metadata,
        is_active,
        created_at,
        updated_at
      FROM data_segments 
      ORDER BY created_at DESC
    `;
  }

  /**
   * Campaigns Operations
   */
  async createCampaign({
    userId,
    organizationId,
    name,
    description,
    targetAudience,
    startDate,
    endDate,
  }) {
    this.validateRequired({ userId, organizationId, name }, [
      "userId",
      "organizationId",
      "name",
    ]);

    const campaign = await sql`
      INSERT INTO campaigns (
        organization_id,
        user_id,
        name,
        description,
        status,
        target_audience,
        start_date,
        end_date
      ) VALUES (
        ${organizationId},
        ${userId},
        ${name},
        ${description || ""},
        'draft',
        ${JSON.stringify(targetAudience || {})},
        ${startDate || null},
        ${endDate || null}
      )
      RETURNING *
    `;

    return campaign[0];
  }

  async updateCampaign(campaignId, updates) {
    const allowedFields = ['name', 'description', 'status', 'target_audience', 'metrics', 'start_date', 'end_date'];

    const updateFields = [];
    const updateValues = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${updateValues.length + 1}`);
        updateValues.push(['target_audience', 'metrics'].includes(key) ? JSON.stringify(value) : value);
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE campaigns 
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `;

    const result = await sql(query, [...updateValues, campaignId]);
    return result[0];
  }

  async getCampaigns(organizationId, limit = 50) {
    return await sql`
      SELECT 
        id,
        name,
        description,
        status,
        target_audience,
        metrics,
        start_date,
        end_date,
        created_at,
        updated_at
      FROM campaigns 
      WHERE organization_id = ${organizationId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  /**
   * Audit Logging
   */
  async logAuditEvent({
    organizationId,
    userId,
    action,
    resourceType,
    resourceId,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
  }) {
    await sql`
      INSERT INTO audit_logs (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent
      ) VALUES (
        ${organizationId},
        ${userId || null},
        ${action},
        ${resourceType},
        ${resourceId || null},
        ${oldValues ? JSON.stringify(oldValues) : null},
        ${newValues ? JSON.stringify(newValues) : null},
        ${ipAddress || null},
        ${userAgent || null}
      )
    `;
  }

  /**
   * Utility Functions
   */
  generateSlug(text) {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim() +
      "-" +
      Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Lake B2B Account Operations
   */
  async createLakeB2BAccount({
    organizationId,
    lakeB2BAccountId,
    accountData,
    syncStatus = 'active'
  }) {
    this.validateRequired({ organizationId, lakeB2BAccountId, accountData }, [
      'organizationId',
      'lakeB2BAccountId', 
      'accountData'
    ]);

    const account = await sql`
      INSERT INTO lake_b2b_accounts (
        organization_id,
        lake_b2b_account_id,
        account_data,
        sync_status,
        last_synced_at
      ) VALUES (
        ${organizationId},
        ${lakeB2BAccountId},
        ${JSON.stringify(accountData)},
        ${syncStatus},
        NOW()
      )
      RETURNING *
    `;

    return account[0];
  }

  async getLakeB2BAccounts(organizationId, limit = 50) {
    return await sql`
      SELECT 
        id,
        lake_b2b_account_id,
        account_data,
        sync_status,
        last_synced_at,
        created_at,
        updated_at
      FROM lake_b2b_accounts 
      WHERE organization_id = ${organizationId}
      ORDER BY last_synced_at DESC
      LIMIT ${limit}
    `;
  }

  async getLakeB2BAccountsByLakeId(lakeB2BAccountId) {
    return await sql`
      SELECT 
        id,
        organization_id,
        lake_b2b_account_id,
        account_data,
        sync_status,
        last_synced_at,
        created_at,
        updated_at
      FROM lake_b2b_accounts 
      WHERE lake_b2b_account_id = ${lakeB2BAccountId}
    `;
  }

  async updateLakeB2BAccount(accountId, updates) {
    const allowedFields = ['account_data', 'sync_status', 'last_synced_at'];

    const updateFields = [];
    const updateValues = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${updateValues.length + 1}`);
        updateValues.push(key === 'account_data' ? JSON.stringify(value) : value);
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE lake_b2b_accounts 
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `;

    const result = await sql(query, [...updateValues, accountId]);
    return result[0];
  }

  /**
   * Sample Request Operations
   */
  async createSampleRequest({
    organizationId,
    userId,
    icpFilterId,
    requestType = 'icp_sample',
    requestData,
    estimatedVolume,
    priority = 'medium'
  }) {
    this.validateRequired({ organizationId, userId, requestData }, [
      'organizationId',
      'userId',
      'requestData'
    ]);

    const request = await sql`
      INSERT INTO sample_requests (
        organization_id,
        user_id,
        icp_filter_id,
        request_type,
        status,
        request_data,
        estimated_volume,
        priority,
        submitted_at
      ) VALUES (
        ${organizationId},
        ${userId},
        ${icpFilterId || null},
        ${requestType},
        'pending',
        ${JSON.stringify(requestData)},
        ${estimatedVolume || null},
        ${priority},
        NOW()
      )
      RETURNING *
    `;

    return request[0];
  }

  async getSampleRequests(organizationId, limit = 50) {
    return await sql`
      SELECT 
        sr.*,
        u.name as user_name,
        u.email as user_email,
        icpf.name as icp_filter_name
      FROM sample_requests sr
      LEFT JOIN users u ON sr.user_id = u.id
      LEFT JOIN icp_filters icpf ON sr.icp_filter_id = icpf.id
      WHERE sr.organization_id = ${organizationId}
      ORDER BY sr.submitted_at DESC
      LIMIT ${limit}
    `;
  }

  async updateSampleRequest(requestId, updates) {
    const allowedFields = ['status', 'internal_notes', 'response_data', 'processed_at'];

    const updateFields = [];
    const updateValues = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${updateValues.length + 1}`);
        updateValues.push(key === 'response_data' ? JSON.stringify(value) : value);
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE sample_requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `;

    const result = await sql(query, [...updateValues, requestId]);
    return result[0];
  }

  /**
   * Health check for database connection
   */
  async healthCheck() {
    try {
      const result = await sql`SELECT 1 as status`;
      return { status: "healthy", timestamp: new Date() };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}

export const databaseService = new DatabaseService();
