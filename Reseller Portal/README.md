# Lake B2B Reseller Portal

A comprehensive B2B data reseller platform that integrates with Lake B2B data platform and campaign systems.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "LakeB2B Reseller Portal/Reseller Portal"
   ```

2. **Install dependencies**
   ```bash
   cd apps/web
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the .env file and update with your API keys
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:4000`

## 🔑 API Configuration

All API keys and endpoints are centralized in one file: `src/config/apiConfig.js`

### Lake B2B Data Platform Integration
- **API Key**: Set `LAKE_B2B_API_KEY` in your `.env` file
- **Base URL**: Configure `LAKE_B2B_BASE_URL` (default: `https://api.lakeb2b.com/v1`)
- **Endpoints**: Automatically configured for accounts, contacts, companies, enrichment, segments, campaigns, and analytics

### Lake B2B Campaign Platform (lakeb2b.ai)
- **API Key**: Set `LAKE_B2B_CAMPAIGN_API_KEY` in your `.env` file
- **Base URL**: Configure `LAKE_B2B_CAMPAIGN_BASE_URL` (default: `https://api.lakeb2b.ai/v1`)
- **Endpoints**: Campaigns, audiences, templates, analytics, and deliverability

### Sample Requests API
- **API Key**: Set `SAMPLE_REQUESTS_API_KEY` in your `.env` file
- **Base URL**: Configure `SAMPLE_REQUESTS_BASE_URL` to your internal API endpoint
- **Purpose**: Sends ICP requests as sample requests to your team for review

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with React Router 7
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **UI Components**: Chakra UI + custom components

### Backend (API Routes)
- **Runtime**: Node.js with Hono server
- **Authentication**: Auth.js (NextAuth) with credentials provider
- **Database**: Mock database service for development (easily replaceable with real database)

### Key Services
- **LakeB2BService**: Integrates with Lake B2B data platform
- **SampleRequestsService**: Handles sample request submissions
- **MockDatabaseService**: Provides in-memory data storage for development

## 📱 Features

### Core Functionality
- **User Authentication**: Secure login/signup system
- **Dashboard**: Overview of campaigns, data segments, and analytics
- **ICP Builder**: Create and manage Ideal Customer Profile filters
- **Data Marketplace**: Browse and purchase data segments
- **Campaign Management**: Create and track marketing campaigns
- **Data Enrichment**: Enhance contact and company data

### ICP Builder
- **Filter Creation**: Build complex filters using industry, company size, region, and technology criteria
- **Estimated Counts**: Get real-time estimates of matching companies
- **Filter Management**: Save, edit, and delete ICP filters
- **Sample Requests**: Submit ICP requests for team review

### Data Integration
- **Lake B2B Accounts**: Pull company accounts from Lake B2B platform
- **Contact Enrichment**: Enhance contact information using multiple data sources
- **Real-time Updates**: Live data synchronization with Lake B2B platform

## 🔧 Development

### Project Structure
```
src/
├── app/                 # React Router app routes
│   ├── api/            # API endpoints
│   ├── dashboard/      # Dashboard page
│   ├── icp/           # ICP Builder page
│   └── ...
├── components/         # Reusable UI components
├── services/          # Business logic services
├── config/            # Configuration files
└── utils/             # Utility functions
```

### Adding New API Integrations
1. **Update API Config**: Add new service configuration in `src/config/apiConfig.js`
2. **Create Service**: Implement business logic in `src/services/`
3. **Add API Routes**: Create endpoints in `src/app/api/`
4. **Update Frontend**: Add UI components to interact with new functionality

### Environment Variables
```bash
# Required
DATABASE_URL=your-database-url
AUTH_SECRET=your-auth-secret
AUTH_URL=http://localhost:4000

# Lake B2B Integration
LAKE_B2B_API_KEY=your-lakeb2b-api-key
LAKE_B2B_BASE_URL=https://api.lakeb2b.com/v1

# Campaign Platform
LAKE_B2B_CAMPAIGN_API_KEY=your-campaign-api-key
LAKE_B2B_CAMPAIGN_BASE_URL=https://api.lakeb2b.ai/v1

# Sample Requests
SAMPLE_REQUESTS_API_KEY=your-sample-requests-api-key
SAMPLE_REQUESTS_BASE_URL=https://your-api-endpoint.com/api
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. Set all required environment variables
2. Configure your database connection
3. Update API endpoints to production URLs
4. Set up proper authentication secrets

### Database Migration
The current implementation uses a mock database service. To use a real database:

1. **Replace MockDatabaseService** with your preferred database service
2. **Update API routes** to use the real database service
3. **Run migrations** to create necessary tables
4. **Update environment variables** with database connection details

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out

### ICP Management
- `GET /api/icp/filters` - Get all ICP filters
- `POST /api/icp/filters` - Create new ICP filter
- `PUT /api/icp/filters/:id` - Update ICP filter
- `DELETE /api/icp/filters/:id` - Delete ICP filter

### Sample Requests
- `GET /api/sample-requests` - Get all sample requests
- `POST /api/sample-requests` - Submit new sample request
- `PUT /api/sample-requests/:id` - Update sample request status

### Data Integration
- `GET /api/lakeb2b/accounts` - Get accounts from Lake B2B platform
- `GET /api/lakeb2b/segments` - Get available data segments
- `POST /api/lakeb2b/segments/:id/purchase` - Purchase data segment

## 🧪 Testing

### Development Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual Testing
1. **Authentication**: Test login with any email/password combination
2. **ICP Builder**: Create, edit, and delete ICP filters
3. **Sample Requests**: Submit ICP requests for team review
4. **Dashboard**: Navigate through all main sections

## 🔒 Security

### Authentication
- JWT-based authentication with Auth.js
- Secure session management
- Role-based access control (admin, user)

### API Security
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration for cross-origin requests

### Data Protection
- Encrypted API keys storage
- Secure database connections
- Audit logging for all data operations

## 📈 Monitoring & Analytics

### Health Checks
- Database connection monitoring
- API endpoint health checks
- Service availability monitoring

### Usage Analytics
- User activity tracking
- API usage metrics
- Campaign performance analytics

## 🆘 Support

### Common Issues
1. **Authentication Errors**: Check AUTH_SECRET and AUTH_URL configuration
2. **API Connection Issues**: Verify API keys and base URLs
3. **Database Errors**: Ensure database service is properly configured

### Getting Help
- Check the console for error messages
- Verify environment variable configuration
- Ensure all required services are running

## 🔄 Updates & Maintenance

### Regular Maintenance
- Update API keys and endpoints as needed
- Monitor API rate limits and usage
- Review and update security configurations

### Version Updates
- Keep dependencies up to date
- Test new features in development environment
- Deploy updates during maintenance windows

---

**Note**: This is a development version with mock data services. For production use, replace mock services with real database and API integrations.


