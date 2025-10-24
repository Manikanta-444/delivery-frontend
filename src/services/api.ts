import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Create axios instances for each service
export const orderServiceApi = axios.create({
  baseURL: `http://localhost:8001/api/v1`,
  timeout: 10000,
});

export const routeOptimizerApi = axios.create({
  baseURL: `http://localhost:8003/api/v1`,
  timeout: 30000, // Longer timeout for optimization requests
});
console.log('routeOptimizerApi', routeOptimizerApi.defaults.baseURL);

export const trafficServiceApi = axios.create({
  baseURL: `http://localhost:8002/api/v1`,
  timeout: 10000,
});

// Request interceptors for authentication
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

orderServiceApi.interceptors.request.use(addAuthToken);
routeOptimizerApi.interceptors.request.use(addAuthToken);
trafficServiceApi.interceptors.request.use(addAuthToken);

// Response interceptors for error handling
const handleResponseError = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

orderServiceApi.interceptors.response.use(
  (response) => response,
  handleResponseError
);

routeOptimizerApi.interceptors.response.use(
  (response) => response,
  handleResponseError
);

trafficServiceApi.interceptors.response.use(
  (response) => response,
  handleResponseError
);
