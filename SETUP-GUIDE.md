# Lake B2B Reseller Portal - Complete Setup Guide

## 🚀 Quick Start (5 Minutes to Running)

### Prerequisites
- Node.js 18+ installed
- A Neon (PostgreSQL) database
- Lake B2B API credentials

### Step 1: Configure Environment
1. Navigate to the web app directory:
   ```bash
   cd "Reseller Portal/apps/web"
   ```

2. Update the `.env` file with your actual credentials:
   ```bash
   # Required - Replace with your actual Neon database URL
   DATABASE_URL="postgresql://username:password@host:port/database_name"
   
   # Required - Your Lake B2B API credentials
   LAKE_B2B_API_KEY="your-actual-lake-b2b-api-key"
   LAKE_B2B_CAMPAIGN_API_KEY="your-actual-campaign-api-key"
   
   # Required - API key for your internal systems
   RESELLER_API_KEY="generate-a-secure-key-here"
   INTERNAL_SAMPLE_REQUEST_ENDPOINT="https://your-internal-api.com/sample-requests"
   
   # Optional but recommended
   UPLOADCARE_PUBLIC_KEY="your-uploadcare-public-key"
   UPLOADCARE_SECRET_KEY="your-uploadcare-secret-key"
   ```

### Step 2: Setup Database
```bash
npm run setup
```

### Step 3: Start the Application
```bash
npm run dev
```

🎉 **That's it!** Your portal is now running at http://localhost:4001

---

## 📋 Complete Configuration Guide

### Environment Variables Explanation

#### **Core Requirements (Must Configure)**
```bash
# Database - Get from Neon.tech
DATABASE_URL="postgresql://..."

# Lake B2B Data API - Get from Lake B2B dashboard
LAKE_B2B_API_KEY="your-key"
LAKE_B2B_BASE_URL="https://api.lakeb2b.com/v1"

# Lake B2B Campaign API - Get from Lake B2B campaign platform
LAKE_B2B_CAMPAIGN_API_KEY="your-campaign-key"
LAKE_B2B_CAMPAIGN_BASE_URL="https://campaigns.lakeb2b.ai/api/v1"

# Internal API for sample requests to your team
RESELLER_API_KEY="secure-random-key-for-your-systems"
INTERNAL_SAMPLE_REQUEST_ENDPOINT="https://your-api.com/sample-requests"
```

#### **Authentication (Auto-configured)**
```bash
AUTH_SECRET="auto-generated-for-development"
AUTH_URL="http://localhost:4001"
```

#### **Optional Integrations**
```bash
# File uploads
UPLOADCARE_PUBLIC_KEY="your-uploadcare-key"
UPLOADCARE_SECRET_KEY="your-uploadcare-secret"

# Additional data enrichment APIs (optional)
EMAIL_CHECK_API_KEY=""
WHOIS_API_KEY=""
OPENAI_API_KEY=""
GOOGLE_MAPS_API_KEY=""
# ... etc
```

---

## 🔧 API Integration Details

### Lake B2B Data Platform Integration

The portal integrates with Lake B2B in two ways:

1. **Data API** (`LAKE_B2B_API_KEY`)
   - Pulls account data from Lake B2B platform
   - Syncs accounts to local database
   - Searches and filters accounts

2. **Campaign API** (`LAKE_B2B_CAMPAIGN_API_KEY`)
   - Creates campaigns in lakeb2b.ai
   - Syncs campaign data
   - Tracks campaign performance

### Sample Request System

When users create ICP filters, they can send sample requests to your team:

1. **User Action**: Creates ICP filter and requests samples
2. **Portal**: Saves request in database 
3. **API Call**: Sends standardized request to your internal endpoint
4. **Your System**: Receives request with all ICP details
5. **Response**: Your team can provide samples back through the API

**Sample Request Payload Format**:
```json
{
  "request_id": "123",
  "organization": {
    "id": 1,
    "name": "Client Company"
  },
  "user": {
    "id": 1,
    "email": "client@company.com"
  },
  "request_type": "icp_sample",
  "priority": "medium",
  "estimated_volume": 10000,
  "request_data": {
    "icp_name": "Enterprise Tech Decision Makers",
    "filters": {
      "industries": ["Technology", "Software"],
      "company_size": "500+",
      "regions": ["United States"],
      "technologies": ["Salesforce"]
    },
    "user_notes": "Looking for CTO/VP level contacts"
  },
  "submitted_at": "2024-01-15T10:30:00Z",
  "api_key": "your-reseller-api-key"
}
```

---

## 🛠 Available Scripts

```bash
# Setup database and start development
npm run setup          # Create database tables and seed data
npm run dev            # Start development server
npm run typecheck      # Run TypeScript checks

# Database management
npm run db:schema      # Create/update database schema
npm run db:reset       # Reset database (same as setup)
```

---

## 🏗 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Reseller      │    │   Lake B2B       │    │   Your Team     │
│   Portal        │◄──►│   Platform       │    │   Internal API  │
│                 │    │                  │    │                 │
│ • ICP Builder   │    │ • Account Data   │    │ • Sample        │
│ • Campaigns     │    │ • Campaign Mgmt  │    │   Requests      │
│ • Data Enrichment│   │ • Real-time Sync │    │ • Manual Review │
│ • Sample Requests│   │                  │    │ • Response API  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
          │                       │                       │
          └───────────────────────┼───────────────────────┘
                                  │
                        ┌─────────▼─────────┐
                        │   Neon Database   │
                        │                   │
                        │ • User Management │
                        │ • ICP Filters     │
                        │ • Audit Logs      │
                        │ • Cache Layer     │
                        └───────────────────┘
```

---

## 🔍 Testing Your Setup

### 1. Health Check
Visit: http://localhost:4001/api/health

This endpoint shows:
- ✅ Database connectivity
- ✅ Lake B2B API status
- ✅ Configuration completeness
- ✅ All system components

### 2. Manual Testing Flow
1. **Visit Dashboard**: http://localhost:4001/dashboard
2. **Create ICP Filter**: Go to ICP Builder
3. **Request Samples**: Submit sample request
4. **Check Database**: Verify data is saved
5. **API Integration**: Confirm your endpoint receives the request

### 3. Database Verification
```bash
# Connect to your Neon database and check:
SELECT COUNT(*) FROM organizations;  -- Should show 1 demo org
SELECT COUNT(*) FROM users;         -- Should show 1 demo user
SELECT COUNT(*) FROM icp_filters;   -- Should show 3 sample filters
```

---

## 🚨 Troubleshooting

### Database Connection Issues
- ✅ Verify `DATABASE_URL` is correct
- ✅ Check Neon database is running
- ✅ Confirm network connectivity

### Lake B2B API Issues
- ✅ Verify API keys are valid
- ✅ Check API endpoint URLs
- ✅ Confirm account has proper permissions

### Sample Request API Issues
- ✅ Verify `INTERNAL_SAMPLE_REQUEST_ENDPOINT` is reachable
- ✅ Check your endpoint accepts POST requests
- ✅ Confirm authentication setup

### Common Errors

**"Database connection failed"**
```bash
# Check your DATABASE_URL format
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

**"Lake B2B API unauthorized"**
```bash
# Verify your API key
LAKE_B2B_API_KEY="your-actual-key-not-placeholder"
```

**"Internal endpoint unreachable"**
```bash
# Test your endpoint manually
curl -X POST your-endpoint -H "Content-Type: application/json"
```

---

## 🚀 Production Deployment

### Environment Setup
1. Use production database URL
2. Set strong `AUTH_SECRET`
3. Configure production API endpoints
4. Set up monitoring

### Security Checklist
- [ ] All API keys are production keys
- [ ] Database has proper access controls
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Audit logging is enabled

---

## 📞 Support

If you encounter issues:

1. **Check Health Endpoint**: `/api/health` for system status
2. **Review Logs**: Check browser console and server logs
3. **Verify Configuration**: Ensure all required environment variables are set
4. **Test APIs**: Verify external API connectivity

The system is designed to be **plug-and-play** - just add your API keys and run!