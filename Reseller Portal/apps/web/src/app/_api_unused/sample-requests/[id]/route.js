import { auth } from "@/auth";
import { databaseService } from "@/services/DatabaseService.js";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;
    
    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    // Get the specific sample request
    const requests = await databaseService.getSampleRequests(
      userContext.organizationId,
      1000 // Get all to find the specific one
    );
    
    const sampleRequest = requests.find(req => req.id.toString() === requestId);
    
    if (!sampleRequest) {
      return Response.json({ error: "Sample request not found" }, { status: 404 });
    }

    return Response.json({ request: sampleRequest });
  } catch (error) {
    console.error("Error fetching sample request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;
    const body = await request.json();
    
    // Get user context
    const userContext = await databaseService.getUserContext(session.user);

    const { status, internal_notes, response_data } = body;

    const updates = {};
    if (status) updates.status = status;
    if (internal_notes) updates.internal_notes = internal_notes;
    if (response_data) updates.response_data = response_data;
    
    // Set processed_at if status is being changed to completed
    if (status === 'completed' || status === 'fulfilled') {
      updates.processed_at = new Date();
    }

    const updatedRequest = await databaseService.updateSampleRequest(
      requestId,
      updates
    );

    // Log audit event
    await databaseService.logAuditEvent({
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      action: "update_sample_request",
      resourceType: "sample_request",
      resourceId: requestId,
      newValues: updates,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    return Response.json({ 
      request: updatedRequest,
      message: "Sample request updated successfully"
    });
  } catch (error) {
    console.error("Error updating sample request:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}