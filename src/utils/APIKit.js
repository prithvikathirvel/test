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
    return Promise.reject(error);
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
      return Promise.reject(error.response);
    } else if (error.request) {
      return Promise.reject({ message: 'No response from server' });
    } else {
      return Promise.reject({ message: 'Request failed' });
    }
  }
);

export default APIKit;
