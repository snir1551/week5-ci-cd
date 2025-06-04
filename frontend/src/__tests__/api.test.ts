import { apiService } from '../services/api';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a mock axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
} as any;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  test('creates axios instance with correct base URL', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('healthCheck makes GET request to /health', async () => {
    const mockResponse = { data: { status: 'OK' } };
    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const result = await apiService.healthCheck();

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
    expect(result).toEqual(mockResponse);
  });

  test('getUsers makes GET request to /users', async () => {
    const mockUsers = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
    const mockResponse = { data: mockUsers };
    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const result = await apiService.getUsers();

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users');
    expect(result).toEqual(mockResponse);
  });

  test('createUser makes POST request to /users', async () => {
    const newUser = { name: 'John Doe', email: 'john@example.com' };
    const mockResponse = { data: { id: 1, ...newUser } };
    mockAxiosInstance.post.mockResolvedValue(mockResponse);

    const result = await apiService.createUser(newUser);

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', newUser);
    expect(result).toEqual(mockResponse);
  });

  test('getTasks makes GET request to /tasks', async () => {
    const mockTasks = [{ id: 1, title: 'Test task', completed: false, userId: 1 }];
    const mockResponse = { data: mockTasks };
    mockAxiosInstance.get.mockResolvedValue(mockResponse);

    const result = await apiService.getTasks();

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tasks');
    expect(result).toEqual(mockResponse);
  });

  test('createTask makes POST request to /tasks', async () => {
    const newTask = { title: 'New task', userId: 1 };
    const mockResponse = { data: { id: 1, completed: false, ...newTask } };
    mockAxiosInstance.post.mockResolvedValue(mockResponse);

    const result = await apiService.createTask(newTask);

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tasks', newTask);
    expect(result).toEqual(mockResponse);
  });

  test('updateTask makes PUT request to /tasks/:id', async () => {
    const taskId = 1;
    const updates = { completed: true };
    const mockResponse = { data: { id: taskId, title: 'Task', completed: true, userId: 1 } };
    mockAxiosInstance.put.mockResolvedValue(mockResponse);

    const result = await apiService.updateTask(taskId, updates);

    expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/tasks/${taskId}`, updates);
    expect(result).toEqual(mockResponse);
  });

  test('deleteTask makes DELETE request to /tasks/:id', async () => {
    const taskId = 1;
    const mockResponse = { data: { message: 'Task deleted successfully' } };
    mockAxiosInstance.delete.mockResolvedValue(mockResponse);

    const result = await apiService.deleteTask(taskId);

    expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/tasks/${taskId}`);
    expect(result).toEqual(mockResponse);
  });
});
