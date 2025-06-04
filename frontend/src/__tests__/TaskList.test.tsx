import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../components/TaskList';
import { apiService } from '../services/api';

// Mock the API service
jest.mock('../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

const mockTasks = [
  { id: 1, title: 'Learn Node.js', completed: false, userId: 1 },
  { id: 2, title: 'Build React app', completed: true, userId: 1 },
  { id: 3, title: 'Write tests', completed: false, userId: 2 },
];

describe('TaskList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    mockedApiService.getTasks.mockImplementation(() => new Promise(() => {}));
    mockedApiService.getUsers.mockImplementation(() => new Promise(() => {}));
    
    render(<TaskList />);
    
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('renders tasks after successful fetch', async () => {
    mockedApiService.getTasks.mockResolvedValue({ data: mockTasks } as any);
    mockedApiService.getUsers.mockResolvedValue({ data: mockUsers } as any);
    
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Learn Node.js')).toBeInTheDocument();
      expect(screen.getByText('Build React app')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  test('renders error message when fetch fails', async () => {
    mockedApiService.getTasks.mockRejectedValue(new Error('Network error'));
    mockedApiService.getUsers.mockRejectedValue(new Error('Network error'));
    
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    });
  });

  test('displays task status correctly', async () => {
    mockedApiService.getTasks.mockResolvedValue({ data: mockTasks } as any);
    mockedApiService.getUsers.mockResolvedValue({ data: mockUsers } as any);
    
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Status: Pending')).toBeInTheDocument();
      expect(screen.getByText('Status: Completed')).toBeInTheDocument();
    });
  });

  test('displays add task button', async () => {
    mockedApiService.getTasks.mockResolvedValue({ data: mockTasks } as any);
    mockedApiService.getUsers.mockResolvedValue({ data: mockUsers } as any);
    
    render(<TaskList />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Task')).toBeInTheDocument();
    });
  });
});
