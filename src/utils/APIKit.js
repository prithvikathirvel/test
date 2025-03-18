import axios from 'axios';

const APIKit = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://fakestoreapi.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

APIKit.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject({
      message: 'Request failed',
      error
    });
  }
);

APIKit.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject({
        message: error.response.data?.message || 'Server error',
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response from server:', error.request);
      return Promise.reject({
        message: 'No response from server. Please check your network connection.',
        error
      });
    } else {
      console.error('Request failed:', error);
      return Promise.reject({
        message: 'Request failed. Please try again.',
        error
      });
    }
  }
);

export default APIKit;
