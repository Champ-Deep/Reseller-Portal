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

    const url = new URL(request.url);
    const source = url.searchParams.get('source') || 'database'; // 'database' or 'api'
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    if (source === 'api') {
      // Fetch directly from Lake B2B API
      try {
        const accountsResponse = await lakeB2BService.getAllAccounts({
          limit,
          offset,
          includeContacts: false
        });

        return Response.json({
          accounts: accountsResponse.accounts,
          total_count: accountsResponse.total_count,
          has_more: accountsResponse.has_more,
          source: 'lake_b2b_api'
        });
      } catch (error) {
        console.error('Failed to fetch from Lake B2B API:', error);
        return Response.json(
          { error: 'Failed to fetch accounts from Lake B2B API' },
          { status: 502 }
        );
      }
    } else {
      // Fetch from local database
      const accounts = await databaseService.getLakeB2BAccounts(
        userContext.organizationId,
        limit
      );

      return Response.json({
        accounts: accounts.map(acc => ({
          ...acc.account_data,
          sync_status: acc.sync_status,
          last_synced_at: acc.last_synced_at
        })),
        total_count: accounts.length,
        source: 'database'
      });
    }
  } catch (error) {
    console.error("Error fetching Lake B2B accounts:", error);
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
    const { action, ...options } = body;

    if (action === 'sync') {
      // Sync accounts from Lake B2B API to local database
      try {
        const syncResult = await lakeB2BService.syncAccountsToDatabase(
          databaseService,
          userContext.organizationId,
          {
            batchSize: options.batch_size || 100,
            maxAccounts: options.max_accounts || 1000
          }
        );

        // Log audit event
        await databaseService.logAuditEvent({
          organizationId: userContext.organizationId,
          userId: userContext.userId,
          action: "sync_lake_b2b_accounts",
          resourceType: "lake_b2b_accounts",
          newValues: syncResult.results,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        });

        return Response.json({
          message: "Account sync completed",
          results: syncResult.results
        });
      } catch (error) {
        console.error('Account sync failed:', error);
        return Response.json(
          { error: 'Account sync failed', details: error.message },
          { status: 500 }
        );
      }
    } else if (action === 'search') {
      // Search accounts via Lake B2B API
      try {
        const searchResult = await lakeB2BService.searchAccounts({
          query: options.query,
          filters: options.filters || {},
          limit: options.limit || 100,
          includeContacts: options.include_contacts || false
        });

        return Response.json({
          accounts: searchResult.accounts,
          total_found: searchResult.total_found,
          search_query: searchResult.search_query
        });
      } catch (error) {
        console.error('Account search failed:', error);
        return Response.json(
          { error: 'Account search failed', details: error.message },
          { status: 500 }
        );
      }
    } else {
      return Response.json(
        { error: 'Invalid action. Supported actions: sync, search' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing Lake B2B accounts request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}