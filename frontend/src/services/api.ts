import axios from 'axios';
import config from '../config/config';

const API_BASE_URL = config.API_BASE_URL;

// Debug logging - this will help you see what URL is being used
console.log('API Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_BASE_URL: API_BASE_URL
});

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

console.log('API instance created with base URL:', API_BASE_URL);

// API functions
export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Users
  getUsers: () => api.get<User[]>('/users'),
  getUser: (id: number) => api.get<User>(`/users/${id}`),
  createUser: (user: Omit<User, 'id'>) => api.post<User>('/users', user),

  // Tasks
  getTasks: () => api.get<Task[]>('/tasks'),
  getTask: (id: number) => api.get<Task>(`/tasks/${id}`),
  createTask: (task: Omit<Task, 'id' | 'completed'>) => api.post<Task>('/tasks', task),
  updateTask: (id: number, updates: Partial<Task>) => api.put<Task>(`/tasks/${id}`, updates),
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
};

export default apiService;
