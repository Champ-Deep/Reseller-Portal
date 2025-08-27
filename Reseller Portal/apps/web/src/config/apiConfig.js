/**
 * Centralized API Configuration
 * This file contains all API keys and endpoints for easy management
 * Just update the values here to connect to different services
 */

export const API_CONFIG = {
  // Lake B2B Data Platform API
  LAKE_B2B: {
    API_KEY: process.env.LAKE_B2B_API_KEY || 'your-lakeb2b-api-key',
    BASE_URL: process.env.LAKE_B2B_BASE_URL || 'https://api.lakeb2b.com/v1',
    ENDPOINTS: {
      ACCOUNTS: '/accounts',
      CONTACTS: '/contacts',
      COMPANIES: '/companies',
      ENRICHMENT: '/enrichment',
      SEGMENTS: '/segments',
      CAMPAIGNS: '/campaigns',
      ANALYTICS: '/analytics'
    }
  },

  // Lake B2B Campaign Platform (lakeb2b.ai)
  LAKE_B2B_CAMPAIGNS: {
    API_KEY: process.env.LAKE_B2B_CAMPAIGN_API_KEY || 'your-lakeb2b-campaign-api-key',
    BASE_URL: process.env.LAKE_B2B_CAMPAIGN_BASE_URL || 'https://api.lakeb2b.ai/v1',
    ENDPOINTS: {
      CAMPAIGNS: '/campaigns',
      AUDIENCES: '/audiences',
      TEMPLATES: '/templates',
      ANALYTICS: '/analytics',
      DELIVERABILITY: '/deliverability'
    }
  },

  // Sample Request API (for sending ICP requests to your team)
  SAMPLE_REQUESTS: {
    API_KEY: process.env.SAMPLE_REQUESTS_API_KEY || 'your-sample-requests-api-key',
    BASE_URL: process.env.SAMPLE_REQUESTS_BASE_URL || 'https://your-api-endpoint.com/api',
    ENDPOINTS: {
      SUBMIT_ICP: '/icp-requests',
      GET_SAMPLES: '/icp-requests',
      UPDATE_STATUS: '/icp-requests/:id'
    }
  },

  // Data Enrichment APIs
  ENRICHMENT: {
    EMAIL_CHECK: {
      API_KEY: process.env.EMAIL_CHECK_API_KEY || 'your-email-check-api-key',
      BASE_URL: 'https://api.emailcheck.com/v1'
    },
    WHOIS: {
      API_KEY: process.env.WHOIS_API_KEY || 'your-whois-api-key',
      BASE_URL: 'https://api.whois.com/v1'
    },
    LOCAL_BUSINESS: {
      API_KEY: process.env.LOCAL_BUSINESS_DATA_API_KEY || 'your-local-business-api-key',
      BASE_URL: 'https://api.localbusiness.com/v1'
    },
    WEB_SCRAPER: {
      API_KEY: process.env.WEB_SCRAPER_API_KEY || 'your-web-scraper-api-key',
      BASE_URL: 'https://api.webscraper.com/v1'
    }
  },

  // AI and Analytics
  AI: {
    OPENAI: {
      API_KEY: process.env.OPENAI_API_KEY || 'your-openai-api-key',
      MODEL: process.env.GPT_VISION_MODEL || 'gpt-4-vision-preview',
      BASE_URL: 'https://api.openai.com/v1'
    },
    SEO_KEYWORD: {
      API_KEY: process.env.SEO_KEYWORD_API_KEY || 'your-seo-keyword-api-key',
      BASE_URL: 'https://api.seokeyword.com/v1'
    }
  },

  // External Services
  EXTERNAL: {
    GOOGLE_TRANSLATE: {
      API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY || 'your-google-translate-api-key',
      BASE_URL: 'https://translation.googleapis.com/language/translate/v2'
    },
    GOOGLE_MAPS: {
      API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'your-google-maps-api-key',
      BASE_URL: 'https://maps.googleapis.com/maps/api'
    },
    FILE_CONVERTER: {
      API_KEY: process.env.FILE_CONVERTER_API_KEY || 'your-file-converter-api-key',
      BASE_URL: 'https://api.fileconverter.com/v1'
    }
  },

  // Communication
  COMMUNICATION: {
    RESEND: {
      API_KEY: process.env.RESEND_API_KEY || 'your-resend-api-key',
      BASE_URL: 'https://api.resend.com'
    }
  },

  // File Upload
  UPLOAD: {
    UPLOADCARE: {
      PUBLIC_KEY: process.env.UPLOADCARE_PUBLIC_KEY || 'your-uploadcare-public-key',
      SECRET_KEY: process.env.UPLOADCARE_SECRET_KEY || 'your-uploadcare-secret-key',
      BASE_URL: 'https://api.uploadcare.com'
    }
  }
};

/**
 * Helper function to get API configuration for a specific service
 */
export const getApiConfig = (service, subService = null) => {
  if (subService) {
    return API_CONFIG[service]?.[subService];
  }
  return API_CONFIG[service];
};

/**
 * Helper function to build full API URLs
 */
export const buildApiUrl = (service, subService, endpoint) => {
  const config = getApiConfig(service, subService);
  if (!config) {
    throw new Error(`API configuration not found for ${service}.${subService || 'main'}`);
  }
  return `${config.BASE_URL}${endpoint}`;
};

/**
 * Helper function to get API key for a specific service
 */
export const getApiKey = (service, subService = null) => {
  const config = getApiConfig(service, subService);
  return config?.API_KEY || config?.PUBLIC_KEY || config?.SECRET_KEY;
};

export default API_CONFIG;


