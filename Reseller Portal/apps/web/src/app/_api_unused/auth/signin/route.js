import { databaseService } from "@/services/DatabaseService.js";
import config from "@/config/environment.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // For demo purposes, we'll accept any email/password combination
    // In production, you would verify against a proper auth system
    
    let user;
    
    // Try to find existing user
    try {
      const userContext = await databaseService.getOrCreateUserOrganization({
        email,
        name: email.split('@')[0] // Use email prefix as name
      });
      
      user = {
        id: userContext.user.id,
        email: userContext.user.email,
        name: userContext.user.name,
        organizationId: userContext.organization.id,
        organizationName: userContext.organization.name
      };
    } catch (error) {
      // If database is not configured, create a temporary user
      if (!config.database.url) {
        user = {
          id: 1,
          email,
          name: email.split('@')[0],
          organizationId: 1,
          organizationName: 'Demo Organization'
        };
      } else {
        throw error;
      }
    }

    // Create a simple session token (in production, use proper JWT)
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      timestamp: Date.now()
    })).toString('base64');

    // Set session cookie
    const response = Response.json({
      success: true,
      user,
      message: "Signed in successfully"
    });

    response.headers.set('Set-Cookie', 
      `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
    );

    return response;

  } catch (error) {
    console.error("Signin error:", error);
    return Response.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}