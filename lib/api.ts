import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure Authorization header is set with Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove Authorization header if no token exists
      delete config.headers.Authorization;
      // Log warning for protected routes (not login/register)
      if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
        console.warn('Request made without token:', config.url);
      }
    }
  }
  return config;
});

// Track the last time we set a token to avoid clearing it immediately after login
let lastTokenSetTime = 0;
const TOKEN_SET_GRACE_PERIOD = 5000; // 5 seconds grace period after setting token

// Track if we've had a successful authenticated request (to know token was valid)
let hasSuccessfulAuthRequest = false;

// Handle 401 errors - clear invalid tokens only when appropriate
apiClient.interceptors.response.use(
  (response) => {
    // Track successful authenticated requests (those that had Authorization header)
    if (response.config.headers?.Authorization) {
      hasSuccessfulAuthRequest = true;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const errorMessage = (error.response?.data?.message || '').toLowerCase();
      const timeSinceTokenSet = Date.now() - lastTokenSetTime;
      const token = localStorage.getItem('token');
      
      // Only proceed if token exists (don't clear if already cleared)
      if (!token) {
        return Promise.reject(error);
      }
      
      // Check if this is a token-related error (not just any 401)
      const isTokenError = 
        errorMessage.includes('token') ||
        errorMessage.includes('authentication') ||
        errorMessage.includes('authorization') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('malformed') ||
        errorMessage.includes('missing');
      
      // Only clear token if:
      // 1. It's a token-related error (not a general 401 from other causes)
      // 2. We're past the grace period (to avoid clearing immediately after login)
      // 3. We've had at least one successful auth request OR it's been a while since login
      const isPastGracePeriod = timeSinceTokenSet > TOKEN_SET_GRACE_PERIOD;
      const shouldClearToken = 
        isTokenError && 
        isPastGracePeriod &&
        (hasSuccessfulAuthRequest || timeSinceTokenSet > 30000); // 30 seconds for first request
      
      if (shouldClearToken) {
        console.warn('Clearing invalid token due to 401 error:', errorMessage);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        hasSuccessfulAuthRequest = false; // Reset flag
      } else if (isTokenError && !isPastGracePeriod) {
        console.warn('Received token error but within grace period, not clearing token');
      }
    }
    return Promise.reject(error);
  }
);

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      user_email: email,
      user_password: password,
    });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Track when we set the token to prevent immediate clearing on 401
      lastTokenSetTime = Date.now();
      // Reset the successful auth request flag on new login
      hasSuccessfulAuthRequest = false;
    }
    return response.data;
  },
  register: async (data: {
    user_name: string;
    user_email: string;
    user_password: string;
    organization_name: string;
    role_name?: string;
  }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  },
};

// Organization API
export const organizationAPI = {
  getOne: async (orgId: string) => {
    const response = await apiClient.get(`/organizations/${orgId}`);
    return response.data;
  },
  getAll: async () => {
    const response = await apiClient.get('/organizations');
    return response.data;
  },
  update: async (orgId: string, data: {
    theme_color?: string;
    logo_url?: string;
    description?: string;
    website?: string;
  }) => {
    const response = await apiClient.patch(`/organizations/${orgId}`, data);
    return response.data;
  },
};

// Cloudinary API
export const cloudinaryAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post('/cloudinary/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteImage: async (url: string) => {
    const response = await apiClient.delete('/cloudinary/delete', {
      data: { url },
    });
    return response.data;
  },
};

// Jobs API
export const jobsAPI = {
  getAll: async (orgId: string, params?: PaginationParams) => {
    const response = await apiClient.get(`/jobs/org/${orgId}`, { params });
    return response.data;
  },
  getOne: async (jobId: string) => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },
  create: async (data: {
    org_id: string;
    title: string;
    job_description?: string;
    work_policy?: string;
    location?: string;
    department?: string;
    employment_type?: string;
    experience_level?: string;
    job_type?: string;
    salary_range?: string;
    job_slug?: string;
    closed_at?: string;
  }) => {
    const response = await apiClient.post('/jobs', data);
    return response.data;
  },
  update: async (jobId: string, data: Partial<{
    title: string;
    job_description?: string;
    work_policy?: string;
    location?: string;
    department?: string;
    employment_type?: string;
    experience_level?: string;
    job_type?: string;
    salary_range?: string;
    job_slug?: string;
    closed_at?: string;
  }>) => {
    const response = await apiClient.patch(`/jobs/${jobId}`, data);
    return response.data;
  },
  delete: async (jobId: string) => {
    const response = await apiClient.delete(`/jobs/${jobId}`);
    return response.data;
  },
  getAnalytics: async (orgId: string, params?: {
    jobName?: string;
    jobType?: string;
    workPolicy?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get(`/jobs/org/${orgId}/analytics`, { params });
    return response.data;
  },
};

// Applications API
export const applicationsAPI = {
  getAll: async (orgId: string, params?: PaginationParams) => {
    const response = await apiClient.get(`/applications/org/${orgId}`, { params });
    return response.data;
  },
  getOne: async (applicationId: string) => {
    const response = await apiClient.get(`/applications/${applicationId}`);
    return response.data;
  },
  create: async (data: {
    user_id: string;
    org_id: string;
    job_id: string;
  }) => {
    const response = await apiClient.post('/applications', data);
    return response.data;
  },
  getUserApplications: async (userId: string, params?: PaginationParams) => {
    const response = await apiClient.get(`/applications/user/${userId}`, { params });
    return response.data;
  },
  updateStatus: async (applicationId: string, status: string) => {
    const response = await apiClient.patch(`/applications/${applicationId}/status`, { status });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  createCandidate: async (data: {
    user_name: string;
    user_email: string;
    user_password: string;
    org_id: string;
  }) => {
    const response = await apiClient.post('/users/candidate', data);
    return response.data;
  },
  getOne: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },
};

export default apiClient;

