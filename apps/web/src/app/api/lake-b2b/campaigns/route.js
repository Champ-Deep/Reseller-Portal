import { auth } from "@/auth";
import { databaseService } from "@/services/DatabaseService.js";
import { lakeB2BService } from "@/services/LakeB2BService.js";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    // Get campaigns from local database
    const campaigns = await databaseService.getCampaigns(
      userContext.organizationId
    );

    return Response.json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    const body = await request.json();
    const {
      name,
      description,
      target_accounts,
      campaign_type = 'email',
      settings = {},
      start_date,
      end_date,
      sync_to_lake_b2b = false
    } = body;

    if (!name || !target_accounts || !Array.isArray(target_accounts)) {
      return Response.json(
        { error: "Name and target_accounts array are required" },
        { status: 400 }
      );
    }

    // Create campaign in local database
    const localCampaign = await databaseService.createCampaign({
      userId: userContext.userId,
      organizationId: userContext.organizationId,
      name,
      description,
      targetAudience: {
        accounts: target_accounts,
        campaign_type,
        settings
      },
      startDate: start_date,
      endDate: end_date
    });

    let lakeB2BCampaign = null;
    let syncError = null;

    // Optionally sync to Lake B2B campaign platform
    if (sync_to_lake_b2b) {
      try {
        const campaignResult = await lakeB2BService.createCampaign({
          name,
          description,
          target_accounts,
          campaign_type,
          settings: {
            ...settings,
            source: 'reseller_portal',
            local_campaign_id: localCampaign.id
          },
          start_date,
          end_date
        });

        lakeB2BCampaign = campaignResult.campaign;

        // Update local campaign with Lake B2B campaign ID
        await databaseService.updateCampaign(localCampaign.id, {
          metrics: {
            lake_b2b_campaign_id: campaignResult.campaign_id,
            synced_at: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to sync campaign to Lake B2B:', error);
        syncError = error.message;
        // Continue without failing the entire request
      }
    }

    // Log audit event
    await databaseService.logAuditEvent({
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      action: "create_campaign",
      resourceType: "campaign",
      resourceId: localCampaign.id,
      newValues: { 
        name, 
        target_accounts_count: target_accounts.length,
        sync_to_lake_b2b,
        lake_b2b_synced: !!lakeB2BCampaign
      },
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return Response.json({
      campaign: localCampaign,
      lake_b2b_campaign: lakeB2BCampaign,
      sync_error: syncError,
      message: syncError 
        ? "Campaign created locally but failed to sync to Lake B2B" 
        : "Campaign created successfully"
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}