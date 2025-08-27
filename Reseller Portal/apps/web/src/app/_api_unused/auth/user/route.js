import { databaseService } from "@/services/DatabaseService.js";
import config from "@/config/environment.js";

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return Response.json({ user: null });
    }

    // Parse session cookie
    const sessionMatch = cookieHeader.match(/session=([^;]+)/);
    if (!sessionMatch) {
      return Response.json({ user: null });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(Buffer.from(sessionMatch[1], 'base64').toString());
    } catch (error) {
      return Response.json({ user: null });
    }

    // Check session age (24 hours)
    const sessionAge = Date.now() - sessionData.timestamp;
    if (sessionAge > 86400000) { // 24 hours
      return Response.json({ user: null });
    }

    // Get full user data
    let user;
    try {
      const userContext = await databaseService.getOrCreateUserOrganization({
        email: sessionData.email,
        name: sessionData.email.split('@')[0]
      });
      
      user = {
        id: userContext.user.id,
        email: userContext.user.email,
        name: userContext.user.name,
        organizationId: userContext.organization.id,
        organizationName: userContext.organization.name
      };
    } catch (error) {
      // If database is not configured, return demo user
      if (!config.database.url) {
        user = {
          id: sessionData.userId,
          email: sessionData.email,
          name: sessionData.email.split('@')[0],
          organizationId: 1,
          organizationName: 'Demo Organization'
        };
      } else {
        console.error("Error fetching user:", error);
        return Response.json({ user: null });
      }
    }

    return Response.json({ user });

  } catch (error) {
    console.error("Auth user error:", error);
    return Response.json({ user: null });
  }
}