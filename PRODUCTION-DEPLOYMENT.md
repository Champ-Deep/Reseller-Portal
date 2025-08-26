# Lake B2B Reseller Portal - Production Deployment Guide

## 🚀 Quick Production Setup

### Prerequisites
- Production Neon database
- Production Lake B2B API credentials
- Production domain/hosting
- SSL certificate

### 1. Environment Configuration

Create a production `.env` file:

```bash
# =============================================================================
# PRODUCTION ENVIRONMENT
# =============================================================================
NODE_ENV="production"
NEXT_PUBLIC_APP_ENV="production"

# =============================================================================
# DATABASE (PRODUCTION)
# =============================================================================
DATABASE_URL="postgresql://prod_user:secure_password@prod-host:5432/prod_db"

# =============================================================================
# AUTHENTICATION (PRODUCTION)
# =============================================================================
# Generate a secure 32-character random string
AUTH_SECRET="your-secure-random-32-char-secret-here"
AUTH_URL="https://your-production-domain.com"

# =============================================================================
# LAKE B2B API (PRODUCTION)
# =============================================================================
LAKE_B2B_API_KEY="your-production-lake-b2b-api-key"
LAKE_B2B_BASE_URL="https://api.lakeb2b.com/v1"

LAKE_B2B_CAMPAIGN_API_KEY="your-production-campaign-api-key"
LAKE_B2B_CAMPAIGN_BASE_URL="https://campaigns.lakeb2b.ai/api/v1"

# =============================================================================
# SAMPLE REQUEST API (PRODUCTION)
# =============================================================================
# Generate a secure API key for your internal systems
RESELLER_API_KEY="your-secure-production-reseller-api-key"
INTERNAL_SAMPLE_REQUEST_ENDPOINT="https://your-production-api.com/sample-requests"

# =============================================================================
# FILE UPLOAD (PRODUCTION)
# =============================================================================
UPLOADCARE_PUBLIC_KEY="your-production-uploadcare-public-key"
UPLOADCARE_SECRET_KEY="your-production-uploadcare-secret-key"

# =============================================================================
# OPTIONAL INTEGRATIONS (PRODUCTION)
# =============================================================================
GOOGLE_MAPS_API_KEY="your-production-google-maps-key"
OPENAI_API_KEY="your-production-openai-key"
RESEND_API_KEY="your-production-resend-key"

# =============================================================================
# PERFORMANCE & SECURITY
# =============================================================================
MAX_RECORDS_PER_BATCH="50000"
MAX_API_CALLS_PER_MINUTE="1000"
WEBHOOK_SECRET="your-secure-webhook-secret"
```

### 2. Database Setup

```bash
# 1. Create production database tables
npm run setup

# 2. Verify database connection
curl https://your-domain.com/api/health
```

### 3. Security Configuration

#### A. Generate Secure Keys
```bash
# AUTH_SECRET (32 characters)
openssl rand -hex 32

# RESELLER_API_KEY (32 characters)  
openssl rand -hex 32

# WEBHOOK_SECRET (32 characters)
openssl rand -hex 32
```

#### B. SSL/HTTPS Setup
- ✅ Ensure HTTPS is enforced
- ✅ Use production SSL certificates
- ✅ Configure secure headers

#### C. Database Security
- ✅ Use production database credentials
- ✅ Enable connection pooling
- ✅ Configure proper access controls
- ✅ Enable audit logging

---

## 🏗 Deployment Options

### Option 1: Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variables in Vercel dashboard
# Go to your project → Settings → Environment Variables
# Add all production environment variables
```

### Option 2: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and deploy
docker build -t lake-b2b-portal .
docker run -p 3000:3000 --env-file .env.production lake-b2b-portal
```

### Option 3: Traditional VPS/Server

```bash
# 1. Clone repository
git clone your-repo
cd lake-b2b-portal/apps/web

# 2. Install dependencies
npm ci

# 3. Set up environment
cp .env.production .env

# 4. Set up database
npm run setup

# 5. Start with PM2
npm install -g pm2
pm2 start npm --name "lake-b2b-portal" -- run dev
pm2 save
pm2 startup
```

---

## 🔧 Production Configuration

### Performance Optimization

#### 1. Database Connection Pooling
```javascript
// In production, configure connection pooling
const sql = neon(process.env.DATABASE_URL, {
  connectionTimeoutMs: 5000,
  maxConnections: 20
});
```

#### 2. Rate Limiting
```bash
# Increase rate limits for production
MAX_API_CALLS_PER_MINUTE="1000"
MAX_RECORDS_PER_BATCH="50000"
```

#### 3. Caching (Optional)
```bash
# Add Redis for caching (optional)
REDIS_URL="redis://your-redis-instance"
```

### Security Hardening

#### 1. Environment Variables
- ✅ Never commit production `.env` files
- ✅ Use secure random keys (32+ characters)
- ✅ Rotate API keys regularly

#### 2. Database Security
- ✅ Use dedicated production database
- ✅ Enable SSL connections
- ✅ Configure proper user permissions
- ✅ Regular backups

#### 3. API Security
- ✅ Rate limiting enabled
- ✅ Input validation on all endpoints
- ✅ Audit logging configured
- ✅ CORS properly configured

---

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# Set up monitoring endpoint
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "services": {
    "database": { "status": "healthy" },
    "lake_b2b": { "status": "healthy" }
  }
}
```

### Log Monitoring

```bash
# Monitor application logs
tail -f /var/log/lake-b2b-portal.log

# Monitor database performance
# Check slow queries and connection counts
```

### Backup Strategy

```bash
# 1. Database backups (daily)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# 2. Environment configuration backup
cp .env backup/.env.$(date +%Y%m%d)

# 3. Application code backup (via git)
git push origin main
```

---

## 🚨 Troubleshooting Production Issues

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database URL format
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"

# Test connection
npm run setup
```

#### 2. API Authentication Errors
```bash
# Verify API keys are production keys
curl -H "Authorization: Bearer $LAKE_B2B_API_KEY" https://api.lakeb2b.com/v1/health
```

#### 3. Sample Request Endpoint Issues
```bash
# Test internal endpoint
curl -X POST $INTERNAL_SAMPLE_REQUEST_ENDPOINT \
  -H "Authorization: Bearer $RESELLER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Error Monitoring

```javascript
// Add error tracking (Sentry, etc.)
if (process.env.NODE_ENV === 'production') {
  // Configure error monitoring
  Sentry.init({
    dsn: process.env.SENTRY_DSN
  });
}
```

---

## 📈 Scaling Considerations

### Database Scaling
- Connection pooling configured
- Read replicas for heavy read workloads
- Regular performance monitoring

### Application Scaling
- Horizontal scaling with load balancer
- CDN for static assets
- Background job processing for heavy tasks

### API Rate Limiting
- Implement proper rate limiting per user/organization
- Queue system for bulk operations
- Monitoring and alerting for API usage

---

## ✅ Production Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Monitoring set up

### Post-Deployment
- [ ] Health check passes
- [ ] Authentication working
- [ ] Lake B2B API integration working
- [ ] Sample request endpoint working
- [ ] Performance monitoring active
- [ ] Backup strategy implemented

### Security Verification
- [ ] HTTPS enforced
- [ ] Strong random secrets generated
- [ ] Database connections secured
- [ ] API rate limiting active
- [ ] Audit logging enabled

---

## 📞 Production Support

### Emergency Contacts
- Database issues: Check Neon dashboard
- API issues: Check Lake B2B status page  
- Application issues: Check application logs

### Key Metrics to Monitor
- Response times < 2 seconds
- Database connection pool health
- API rate limit usage
- Error rates < 1%
- Uptime > 99.9%

The system is designed to be **production-ready** with proper configuration!