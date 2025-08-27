/**
 * Server-side authentication helper
 * Replaces the complex auth system with a simple session-based approach
 */

export async function getSessionFromRequest(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return null;
    }

    // Parse session cookie
    const sessionMatch = cookieHeader.match(/session=([^;]+)/);
    if (!sessionMatch) {
      return null;
    }

    let sessionData;
    try {
      sessionData = JSON.parse(Buffer.from(sessionMatch[1], 'base64').toString());
    } catch (error) {
      return null;
    }

    // Check session age (24 hours)
    const sessionAge = Date.now() - sessionData.timestamp;
    if (sessionAge > 86400000) { // 24 hours
      return null;
    }

    return {
      user: {
        id: sessionData.userId,
        email: sessionData.email,
        name: sessionData.email.split('@')[0]
      }
    };

  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Compatibility wrapper for existing auth() calls
export async function auth(request) {
  if (!request) {
    // If no request object provided, return null (for middleware compatibility)
    return null;
  }
  
  return getSessionFromRequest(request);
}