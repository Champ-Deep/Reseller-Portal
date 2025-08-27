import { auth } from '@/auth';
import { sampleRequestsService } from '@/services/SampleRequestsService';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status'),
      dateFrom: searchParams.get('date_from'),
      dateTo: searchParams.get('date_to'),
      limit: parseInt(searchParams.get('limit')) || 50,
      offset: parseInt(searchParams.get('offset')) || 0
    };

    const result = await sampleRequestsService.getSampleRequests(filters);
    
    if (result.success) {
      return Response.json(result);
    } else {
      return Response.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching sample requests:', error);
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
    const { name, description, filters, estimated_count, contact_info } = body;

    if (!name || !filters) {
      return Response.json({ error: 'Name and filters are required' }, { status: 400 });
    }

    const icpData = {
      name,
      description: description || '',
      filters,
      estimated_count: estimated_count || 0,
      contact_info: contact_info || {},
      user_id: session.user.id,
      user_email: session.user.email
    };

    const result = await sampleRequestsService.submitICPRequest(icpData);
    
    if (result.success) {
      return Response.json(result);
    } else {
      return Response.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error submitting sample request:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}