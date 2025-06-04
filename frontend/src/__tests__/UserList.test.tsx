import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '../components/UserList';
import { apiService } from '../services/api';

// Mock the API service
jest.mock('../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

describe('UserList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    mockedApiService.getUsers.mockImplementation(() => new Promise(() => {}));
    
    render(<UserList />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  test('renders users after successful fetch', async () => {
    mockedApiService.getUsers.mockResolvedValue({ data: mockUsers } as any);
    
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  test('renders error message when fetch fails', async () => {
    mockedApiService.getUsers.mockRejectedValue(new Error('Network error'));
    
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });
  });

  test('displays add user button', async () => {
    mockedApiService.getUsers.mockResolvedValue({ data: mockUsers } as any);
    
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('Add User')).toBeInTheDocument();
    });
  });
});
