import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecentSearches from '../pages/RecentSearchesPage';
import '@testing-library/jest-dom';

// Mock console.log and console.error to keep test output clean
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

// Mock the fetch API and localStorage
beforeEach(() => {
  global.fetch = jest.fn();
  Storage.prototype.getItem = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
  console.log.mockClear();
  console.error.mockClear();
});

describe('RecentSearches Component', () => {
  const mockSearches = [
    {
      id: '1',
      search_query: 'test query 1',
      media_type: 'image',
      total_results: 10,
      timestamp: '2023-05-01T12:00:00Z',
      filters: {}
    },
    {
      id: '2',
      search_query: 'test query 2',
      media_type: 'video',
      total_results: 5,
      timestamp: '2023-05-02T12:00:00Z',
      filters: { license: 'cc0', source: 'flickr' }
    }
  ];

  test('renders loading state initially', () => {
    Storage.prototype.getItem.mockReturnValue('mock-token');
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <MemoryRouter>
        <RecentSearches />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading recent searches...')).toBeInTheDocument();
  });

  test('shows error when not authenticated', async () => {
    Storage.prototype.getItem.mockReturnValue(null);
    
    render(
      <MemoryRouter>
        <RecentSearches />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Please log in to view recent searches')).toBeInTheDocument();
    });
  });

  test('displays empty state when no searches available', async () => {
    Storage.prototype.getItem.mockReturnValue('mock-token');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    
    render(
      <MemoryRouter>
        <RecentSearches />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('No recent searches available.')).toBeInTheDocument();
    });
  });

  test('displays recent searches when data is available', async () => {
    Storage.prototype.getItem.mockReturnValue('mock-token');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearches,
    });
    
    render(
      <MemoryRouter>
        <RecentSearches />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('test query 1')).toBeInTheDocument();
      expect(screen.getByText('test query 2')).toBeInTheDocument();
      expect(screen.getByText('image')).toBeInTheDocument();
      expect(screen.getByText('video')).toBeInTheDocument();
      expect(screen.getAllByText('View')).toHaveLength(2);
      expect(screen.getAllByText('Delete')).toHaveLength(2);
    });
  });


  test('handles search deletion', async () => {
    Storage.prototype.getItem.mockReturnValue('mock-token');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearches,
    });
    
    // Mock successful delete response
    fetch.mockResolvedValueOnce({ ok: true });
    
    render(
      <MemoryRouter>
        <RecentSearches />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('test query 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getAllByText('Delete')[0]);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/recent_searches/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer mock-token',
          },
        })
      );
      expect(screen.queryByText('test query 1')).not.toBeInTheDocument();
    });
  });

  test('shows error when fetch fails', async () => {
    Storage.prototype.getItem.mockReturnValue('mock-token');
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <MemoryRouter>
        <RecentSearches />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});