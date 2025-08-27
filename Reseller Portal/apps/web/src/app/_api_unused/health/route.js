/**
 * Health Check Endpoint
 * Following SOLID principles: Single Responsibility for system health monitoring
 */

import { databaseService } from '@/services/DatabaseService.js';
import { lakeB2BService } from '@/services/LakeB2BService.js';
import config from '@/config/environment.js';

export async function GET(request) {
  const startTime = Date.now();
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.environment.nodeEnv,
    version: '1.0.0',
    services: {},
    features: {},
    performance: {}
  };

  try {
    // Database Health Check
    try {
      const dbHealth = await databaseService.healthCheck();
      healthCheck.services.database = {
        status: dbHealth.status,
        response_time_ms: Date.now() - startTime
      };
    } catch (error) {
      healthCheck.services.database = {
        status: 'unhealthy',
        error: error.message,
        response_time_ms: Date.now() - startTime
      };
      healthCheck.status = 'degraded';
    }

    // File Upload Service Health
    healthCheck.services.file_upload = {
      status: config.upload.publicKey ? 'configured' : 'not_configured',
      enabled: !!config.upload.publicKey
    };

    // Lake B2B API Health Check
    try {
      const lakeB2BHealth = await lakeB2BService.testConnection();
      healthCheck.services.lake_b2b = {
        data_api: {
          status: lakeB2BHealth.data_api.connected ? 'healthy' : 'unhealthy',
          connected: lakeB2BHealth.data_api.connected,
          error: lakeB2BHealth.data_api.error
        },
        campaign_api: {
          status: lakeB2BHealth.campaign_api.connected ? 'healthy' : 'unhealthy',
          connected: lakeB2BHealth.campaign_api.connected,
          error: lakeB2BHealth.campaign_api.error
        }
      };
    } catch (error) {
      healthCheck.services.lake_b2b = {
        status: 'error',
        error: error.message
      };
    }

    // Sample Request API Health
    healthCheck.services.sample_request_api = {
      status: config.sampleRequest.enabled ? 'configured' : 'not_configured',
      enabled: config.sampleRequest.enabled,
      endpoint: config.sampleRequest.endpoint || 'not_set'
    };

    // API Integrations Health
    const apiServices = [
      'emailCheck',
      'whois', 
      'lakeB2B',
      'localBusiness',
      'webScraper',
      'openai',
      'googleMaps',
      'googleTranslate',
      'resend'
    ];

    healthCheck.services.integrations = {};
    apiServices.forEach(service => {
      const apiConfig = config.apis[service];
      healthCheck.services.integrations[service] = {
        status: apiConfig?.enabled ? 'configured' : 'not_configured',
        enabled: apiConfig?.enabled || false
      };
    });

    // Feature Flags
    healthCheck.features = {
      real_time_enrichment: config.features.realTimeEnrichment,
      bulk_processing: config.features.bulkProcessing,
      ai_suggestions: config.features.aiSuggestions,
      premium_features: config.features.premiumFeatures
    };

    // Performance Metrics
    const responseTime = Date.now() - startTime;
    healthCheck.performance = {
      response_time_ms: responseTime,
      status: responseTime < 1000 ? 'fast' : responseTime < 3000 ? 'moderate' : 'slow'
    };

    // Rate Limiting Configuration
    healthCheck.limits = {
      max_records_per_batch: config.limits.maxRecordsPerBatch,
      max_api_calls_per_minute: config.limits.maxApiCallsPerMinute
    };

    // Overall Health Assessment
    const unhealthyServices = Object.values(healthCheck.services)
      .filter(service => service.status === 'unhealthy').length;
    
    if (unhealthyServices > 0) {
      healthCheck.status = unhealthyServices === Object.keys(healthCheck.services).length 
        ? 'unhealthy' 
        : 'degraded';
    }

    // Set appropriate HTTP status
    const httpStatus = healthCheck.status === 'healthy' ? 200 
      : healthCheck.status === 'degraded' ? 207 
      : 503;

    return Response.json(healthCheck, { status: httpStatus });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      performance: {
        response_time_ms: Date.now() - startTime
      }
    }, { status: 503 });
  }
}

// Additional endpoint for readiness check
export async function HEAD(request) {
  try {
    // Quick database connection test
    await databaseService.healthCheck();
    return new Response(null, { status: 200 });
  } catch (error) {
    return new Response(null, { status: 503 });
  }
}