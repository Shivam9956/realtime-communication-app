/**
 * API Service layer for OmniSync
 * Communicates with the Express backend REST API
 */

const PROD_BACKEND_URL = 'https://realtime-communication-app-saty.onrender.com';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    const isLocalIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
    if (isLocalIP) {
      return `http://${host}:5000/api`;
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return `${PROD_BACKEND_URL}/api`;
};

class ApiService {
  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  /**
   * Universal fetch helper with automatic JSON handling and error parsing
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // If token exists in localStorage, attach Authorization header
    const token = localStorage.getItem('omnisync_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          (data?.errors && data.errors[0]?.message) ||
          `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        error.errors = data?.errors || [];
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err.message);
      throw err;
    }
  }

  /**
   * Health check endpoint
   */
  async getHealth() {
    return this.request('/health');
  }

  /**
   * Ping endpoint
   */
  async ping() {
    return this.request('/health/ping');
  }

  /**
   * Authentication endpoints
   */
  auth = {
    register: async ({ name, email, password }) => {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    },

    login: async ({ email, password }) => {
      return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    logout: async () => {
      return this.request('/auth/logout', {
        method: 'POST',
      });
    },

    getMe: async () => {
      return this.request('/auth/me', {
        method: 'GET',
      });
    },
  };

  /**
   * Meeting session endpoints
   */
  meetings = {
    create: async ({ title, customMeetingId, settings } = {}) => {
      return this.request('/meetings', {
        method: 'POST',
        body: JSON.stringify({ title, customMeetingId, settings }),
      });
    },

    getById: async (meetingId) => {
      return this.request(`/meetings/${meetingId}`, {
        method: 'GET',
      });
    },

    join: async (meetingId) => {
      return this.request(`/meetings/${meetingId}/join`, {
        method: 'POST',
      });
    },

    leave: async (meetingId) => {
      return this.request(`/meetings/${meetingId}/leave`, {
        method: 'POST',
      });
    },

    getHistory: async () => {
      return this.request('/meetings/history', {
        method: 'GET',
      });
    },
  };
}

export const api = new ApiService();
export default api;
