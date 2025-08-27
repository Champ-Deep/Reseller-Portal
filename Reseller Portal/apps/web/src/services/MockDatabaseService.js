/**
 * Mock Database Service
 * Provides basic functionality without requiring a real database connection
 * This allows the app to run and demonstrate functionality
 */

export class MockDatabaseService {
  constructor() {
    // In-memory storage for demo purposes
    this.storage = {
      users: new Map(),
      organizations: new Map(),
      icpFilters: new Map(),
      sampleRequests: new Map(),
      campaigns: new Map(),
      enrichmentJobs: new Map()
    };
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  /**
   * Initialize with sample data for demonstration
   */
  initializeSampleData() {
    // Sample organization
    const orgId = 'org_1';
    this.storage.organizations.set(orgId, {
      id: orgId,
      name: 'Demo Reseller Organization',
      slug: 'demo-reseller',
      created_at: new Date().toISOString()
    });

    // Sample user
    const userId = 'user_1';
    this.storage.users.set(userId, {
      id: userId,
      organization_id: orgId,
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString()
    });

    // Sample ICP filters
    const filterId1 = 'filter_1';
    this.storage.icpFilters.set(filterId1, {
      id: filterId1,
      organization_id: orgId,
      user_id: userId,
      name: 'Enterprise SaaS Companies',
      description: 'High-growth SaaS companies in enterprise space',
      filters: {
        industries: ['Software', 'SaaS'],
        company_size: ['1000-5000', '5000+'],
        regions: ['North America', 'Europe'],
        technologies: ['Cloud', 'AI/ML']
      },
      estimated_count: 2500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const filterId2 = 'filter_2';
    this.storage.icpFilters.set(filterId2, {
      id: filterId2,
      organization_id: orgId,
      user_id: userId,
      name: 'Healthcare Tech Startups',
      description: 'Early-stage healthcare technology companies',
      filters: {
        industries: ['Healthcare', 'Technology'],
        company_size: ['10-50', '50-200'],
        regions: ['North America'],
        technologies: ['Digital Health', 'Telemedicine']
      },
      estimated_count: 800,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updated_at: new Date(Date.now() - 86400000).toISOString()
    });

    // Sample campaigns
    const campaignId1 = 'campaign_1';
    this.storage.campaigns.set(campaignId1, {
      id: campaignId1,
      organization_id: orgId,
      user_id: userId,
      name: 'Q4 Enterprise SaaS Campaign',
      description: 'Targeting enterprise SaaS decision makers',
      status: 'active',
      target_audience: {
        icp_filter_id: filterId1,
        estimated_volume: 2500
      },
      start_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Get or create user organization
   */
  async getOrCreateUserOrganization(authUser) {
    if (!authUser?.email) {
      throw new Error('Valid authenticated user required');
    }

    // Check if user already exists
    const existingUser = Array.from(this.storage.users.values())
      .find(user => user.email === authUser.email);

    if (existingUser) {
      const organization = this.storage.organizations.get(existingUser.organization_id);
      return {
        user: existingUser,
        organization
      };
    }

    // Create new organization and user
    const orgId = `org_${Date.now()}`;
    const userId = `user_${Date.now()}`;

    const organization = {
      id: orgId,
      name: authUser.name || authUser.email,
      slug: this.generateSlug(authUser.name || authUser.email),
      created_at: new Date().toISOString()
    };

    const user = {
      id: userId,
      organization_id: orgId,
      email: authUser.email,
      name: authUser.name || 'New User',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString()
    };

    this.storage.organizations.set(orgId, organization);
    this.storage.users.set(userId, user);

    return { user, organization };
  }

  /**
   * Get user context
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
    if (!userId || !organizationId || !name || !filters) {
      throw new Error('Missing required fields');
    }

    const filterId = `filter_${Date.now()}`;
    const filter = {
      id: filterId,
      organization_id: organizationId,
      user_id: userId,
      name,
      description: description || '',
      filters,
      estimated_count: estimatedCount || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.storage.icpFilters.set(filterId, filter);
    return filter;
  }

  async getICPFilters(organizationId, limit = 50) {
    const filters = Array.from(this.storage.icpFilters.values())
      .filter(filter => filter.organization_id === organizationId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    return filters;
  }

  async updateICPFilter(filterId, organizationId, updates) {
    const filter = this.storage.icpFilters.get(filterId);
    if (!filter || filter.organization_id !== organizationId) {
      throw new Error('Filter not found or access denied');
    }

    const updatedFilter = {
      ...filter,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.storage.icpFilters.set(filterId, updatedFilter);
    return updatedFilter;
  }

  async deleteICPFilter(filterId, organizationId) {
    const filter = this.storage.icpFilters.get(filterId);
    if (!filter || filter.organization_id !== organizationId) {
      throw new Error('Filter not found or access denied');
    }

    this.storage.icpFilters.delete(filterId);
    return true;
  }

  /**
   * Sample Requests Operations
   */
  async createSampleRequest({
    organizationId,
    userId,
    name,
    description,
    filters,
    estimatedCount,
    contactInfo
  }) {
    const requestId = `request_${Date.now()}`;
    const request = {
      id: requestId,
      organization_id: organizationId,
      user_id: userId,
      name,
      description: description || '',
      filters,
      estimated_count: estimatedCount || 0,
      contact_info: contactInfo || {},
      status: 'pending_review',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.storage.sampleRequests.set(requestId, request);
    return request;
  }

  async getSampleRequests(organizationId, limit = 50) {
    const requests = Array.from(this.storage.sampleRequests.values())
      .filter(request => request.organization_id === organizationId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    return requests;
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
    if (!userId || !organizationId || !name) {
      throw new Error('Missing required fields');
    }

    const campaignId = `campaign_${Date.now()}`;
    const campaign = {
      id: campaignId,
      organization_id: organizationId,
      user_id: userId,
      name,
      description: description || '',
      status: 'draft',
      target_audience: targetAudience || {},
      start_date: startDate || null,
      end_date: endDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.storage.campaigns.set(campaignId, campaign);
    return campaign;
  }

  async getCampaigns(organizationId, limit = 50) {
    const campaigns = Array.from(this.storage.campaigns.values())
      .filter(campaign => campaign.organization_id === organizationId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    return campaigns;
  }

  /**
   * Utility Functions
   */
  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Health check
   */
  async healthCheck() {
    return { 
      status: 'healthy', 
      timestamp: new Date(),
      storage: {
        users: this.storage.users.size,
        organizations: this.storage.organizations.size,
        icpFilters: this.storage.icpFilters.size,
        sampleRequests: this.storage.sampleRequests.size,
        campaigns: this.storage.campaigns.size
      }
    };
  }
}

export const mockDatabaseService = new MockDatabaseService();


