import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log API requests in development
if (import.meta.env.DEV) {
  api.interceptors.request.use(request => {
    console.log('API Request:', {
      url: request.url,
      method: request.method,
      headers: request.headers,
      data: request.data
    });
    return request;
  });
  
  api.interceptors.response.use(
    response => {
      console.log('API Response:', {
        status: response.status,
        data: response.data
      });
      return response;
    },
    error => {
      console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return Promise.reject(error);
    }
  );
}

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
