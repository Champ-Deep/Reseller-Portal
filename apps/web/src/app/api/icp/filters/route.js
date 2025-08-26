import { auth } from '@/auth';
import { mockDatabaseService } from '@/services/MockDatabaseService';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user context from mock database service
    const userContext = await mockDatabaseService.getUserContext(session.user);
    const filters = await mockDatabaseService.getICPFilters(userContext.organizationId);

    return Response.json({ filters });
  } catch (error) {
    console.error('Error fetching ICP filters:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, filters, estimated_count } = body;

    if (!name || !filters) {
      return Response.json({ error: 'Name and filters are required' }, { status: 400 });
    }

    // Get user context from mock database service
    const userContext = await mockDatabaseService.getUserContext(session.user);
    
    const filter = await mockDatabaseService.createICPFilter({
      userId: userContext.userId,
      organizationId: userContext.organizationId,
      name,
      description,
      filters,
      estimatedCount: estimated_count
    });

    return Response.json({ filter });
  } catch (error) {
    console.error('Error creating ICP filter:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}