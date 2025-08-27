/**
 * Sample Requests Service
 * Handles sending ICP requests as sample requests to the team
 */

import { API_CONFIG, getApiKey } from '@/config/apiConfig';

export class SampleRequestsService {
  constructor() {
    this.apiKey = getApiKey('SAMPLE_REQUESTS');
    this.baseUrl = API_CONFIG.SAMPLE_REQUESTS.BASE_URL;
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
   * Submit an ICP request as a sample request
   */
  async submitICPRequest(icpData) {
    try {
      const url = `${this.baseUrl}${API_CONFIG.SAMPLE_REQUESTS.ENDPOINTS.SUBMIT_ICP}`;
      
      const payload = {
        ...icpData,
        submitted_at: new Date().toISOString(),
        source: 'lakeb2b_reseller_portal',
        status: 'pending_review'
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.request || data,
        message: 'ICP request submitted successfully as sample request'
      };
    } catch (error) {
      console.error('Error submitting ICP request:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all sample requests
   */
  async getSampleRequests(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
      if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const url = `${this.baseUrl}${API_CONFIG.SAMPLE_REQUESTS.ENDPOINTS.GET_SAMPLES}?${queryParams}`;
      
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
        data: data.requests || data,
        total: data.total || data.requests?.length || 0
      };
    } catch (error) {
      console.error('Error fetching sample requests:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get a specific sample request by ID
   */
  async getSampleRequest(requestId) {
    try {
      const url = `${this.baseUrl}${API_CONFIG.SAMPLE_REQUESTS.ENDPOINTS.GET_SAMPLES}/${requestId}`;
      
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
        data: data.request || data
      };
    } catch (error) {
      console.error('Error fetching sample request:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update the status of a sample request
   */
  async updateSampleRequestStatus(requestId, status, notes = '') {
    try {
      const url = `${this.baseUrl}${API_CONFIG.SAMPLE_REQUESTS.ENDPOINTS.UPDATE_STATUS.replace(':id', requestId)}`;
      
      const payload = {
        status,
        notes,
        updated_at: new Date().toISOString()
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.request || data,
        message: 'Sample request status updated successfully'
      };
    } catch (error) {
      console.error('Error updating sample request status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get sample request statistics
   */
  async getSampleRequestStats() {
    try {
      const url = `${this.baseUrl}${API_CONFIG.SAMPLE_REQUESTS.ENDPOINTS.GET_SAMPLES}/stats`;
      
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
        data: data.stats || data
      };
    } catch (error) {
      console.error('Error fetching sample request stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Health check for the sample requests API
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

export const sampleRequestsService = new SampleRequestsService();


