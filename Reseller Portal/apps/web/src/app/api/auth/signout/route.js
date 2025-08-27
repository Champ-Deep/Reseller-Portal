export async function POST(request) {
  try {
    // Clear session cookie
    const response = Response.json({
      success: true,
      message: "Signed out successfully"
    });

    response.headers.set('Set-Cookie', 
      'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
    );

    return response;

  } catch (error) {
    console.error("Signout error:", error);
    return Response.json(
      { error: "Signout failed" },
      { status: 500 }
    );
  }
}