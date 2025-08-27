/**
 * Lake B2B Data Platform Integration Service
 * Handles all interactions with the Lake B2B data platform
 */

import { API_CONFIG, buildApiUrl, getApiKey } from '@/config/apiConfig';

export class LakeB2BService {
  constructor() {
    this.apiKey = getApiKey('LAKE_B2B');
    this.baseUrl = API_CONFIG.LAKE_B2B.BASE_URL;
  }

  /**
   * Get authentication headers
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Fetch accounts from Lake B2B platform
   */
  async getAccounts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.companySize) queryParams.append('company_size', filters.companySize);
      if (filters.region) queryParams.append('region', filters.region);
      if (filters.technology) queryParams.append('technology', filters.technology);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const url = `${this.baseUrl}${API_CONFIG.LAKE_B2B.ENDPOINTS.ACCOUNTS}?${queryParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.accounts || data,
        total: data.total || data.accounts?.length || 0,
        pagination: data.pagination || {}
      };
    } catch (error) {
      console.error('Error fetching accounts from Lake B2B:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get account details by ID
   */
  async getAccountById(accountId) {
    try {
      const url = `${this.baseUrl}${API_CONFIG.LAKE_B2B.ENDPOINTS.ACCOUNTS}/${accountId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.account || data
      };
    } catch (error) {
      console.error('Error fetching account details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get contacts for an account
   */
  async getAccountContacts(accountId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.seniority) queryParams.append('seniority', filters.seniority);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const url = `${this.baseUrl}${API_CONFIG.LAKE_B2B.ENDPOINTS.ACCOUNTS}/${accountId}/contacts?${queryParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.contacts || data,
        total: data.total || data.contacts?.length || 0
      };
    } catch (error) {
      console.error('Error fetching account contacts:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get data segments available for purchase
   */
  async getDataSegments(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.region) queryParams.append('region', filters.region);
      if (filters.minRecords) queryParams.append('min_records', filters.minRecords);
      if (filters.maxRecords) queryParams.append('max_records', filters.maxRecords);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const url = `${this.baseUrl}${API_CONFIG.LAKE_B2B.ENDPOINTS.SEGMENTS}?${queryParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.segments || data,
        total: data.total || data.segments?.length || 0
      };
    } catch (error) {
      console.error('Error fetching data segments:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Purchase a data segment
   */
  async purchaseDataSegment(segmentId, quantity = 1) {
    try {
      const url = `${this.baseUrl}${API_CONFIG.LAKE_B2B.ENDPOINTS.SEGMENTS}/${segmentId}/purchase`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          quantity,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.purchase || data,
        message: 'Data segment purchased successfully'
      };
    } catch (error) {
      console.error('Error purchasing data segment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('start_date', filters.startDate);
      if (filters.endDate) queryParams.append('end_date', filters.endDate);
      if (filters.metric) queryParams.append('metric', filters.metric);
      if (filters.groupBy) queryParams.append('group_by', filters.groupBy);

      const url = `${this.baseUrl}${API_CONFIG.LAKE_B2B.ENDPOINTS.ANALYTICS}?${queryParams}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.analytics || data
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Health check for the Lake B2B API
   */
  async healthCheck() {
    try {
      const url = `${this.baseUrl}/health`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const lakeB2BService = new LakeB2BService();