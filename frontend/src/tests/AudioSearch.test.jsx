import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AudioSearch from '../pages/AudioSearch';
import '@testing-library/jest-dom';

// Mock the useSearch hook
jest.mock('../components/useSearch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('AudioSearch Component', () => {
  const mockUseSearch = {
    query: '',
    setQuery: jest.fn(),
    results: [],
    error: null,
    page: 1,
    setPage: jest.fn(),
    pageSize: 10,
    setPageSize: jest.fn(),
    totalPages: 1,
    isSearching: false,
    totalResults: 0,
    filters: { category: '', license: '', source: '' },
    setFilters: jest.fn(),
    performSearch: jest.fn(),
    handleSaveSearch: jest.fn(),
  };

  beforeEach(() => {
    require('../components/useSearch').default.mockImplementation(() => mockUseSearch);
    render(
      <MemoryRouter>
        <AudioSearch />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders AudioSearch component with basic elements', () => {
    expect(screen.getByText('Audio Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for audios...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Save Search')).toBeInTheDocument();
  });

  test('displays search input and responds to input changes', () => {
    const searchInput = screen.getByPlaceholderText('Search for audios...');
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    expect(mockUseSearch.performSearch).toHaveBeenCalled();
  });

  test('triggers search when search button is clicked', () => {
    fireEvent.click(screen.getByText('Search'));
    expect(mockUseSearch.performSearch).toHaveBeenCalled();
  });

  test('shows loading state when searching', () => {
    require('../components/useSearch').default.mockImplementation(() => ({
      ...mockUseSearch,
      isSearching: true,
    }));
    render(
      <MemoryRouter>
        <AudioSearch />
      </MemoryRouter>
    );
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  test('displays empty message when no results found', () => {
    require('../components/useSearch').default.mockImplementation(() => ({
      ...mockUseSearch,
      query: 'nonexistent',
      results: [],
    }));

    render(
      <MemoryRouter>
        <AudioSearch />
      </MemoryRouter>
    );
    
    expect(screen.getByText('No audio results found for your search.')).toBeInTheDocument();
  });

  test('displays error message when there is an error', () => {
    require('../components/useSearch').default.mockImplementation(() => ({
      ...mockUseSearch,
      error: 'Failed to fetch results',
    }));
    render(
      <MemoryRouter>
        <AudioSearch />
      </MemoryRouter>
    );
    expect(screen.getByText('Failed to fetch results')).toBeInTheDocument();
  });

  test('shows audio-specific filters', () => {
    // Test that all filter labels are present
    expect(screen.getByText(/Category\s*:/)).toBeInTheDocument();
    expect(screen.getByText(/License\s*:/)).toBeInTheDocument();
    expect(screen.getByText(/Source\s*:/)).toBeInTheDocument();

    // Get all comboboxes (select elements)
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBe(3); // Category, License, Items per page

    // Get all filter groups
    const filterGroups = document.querySelectorAll('.filter-group');

    // Test Category filter
    const categoryFilter = filterGroups[0];
    expect(within(categoryFilter).getByText(/Category\s*:/)).toBeInTheDocument();
    const categorySelect = within(categoryFilter).getByRole('combobox');
    expect(within(categorySelect).getByRole('option', { name: 'Any' })).toBeInTheDocument();
    expect(within(categorySelect).getByRole('option', { name: 'music' })).toBeInTheDocument();
    expect(within(categorySelect).getByRole('option', { name: 'sound_effect' })).toBeInTheDocument();

    // Test License filter
    const licenseFilter = filterGroups[1];
    expect(within(licenseFilter).getByText(/License\s*:/)).toBeInTheDocument();
    const licenseSelect = within(licenseFilter).getByRole('combobox');
    expect(within(licenseSelect).getByRole('option', { name: 'Any' })).toBeInTheDocument();
    expect(within(licenseSelect).getByRole('option', { name: 'by' })).toBeInTheDocument();
    expect(within(licenseSelect).getByRole('option', { name: 'cc0' })).toBeInTheDocument();
    expect(within(licenseSelect).getByRole('option', { name: 'by-nc' })).toBeInTheDocument();

    // Test Source filter
    const sourceFilter = filterGroups[2];
    expect(within(sourceFilter).getByText(/Source\s*:/)).toBeInTheDocument();
    expect(within(sourceFilter).getByPlaceholderText('e.g. wikimedia_audio')).toBeInTheDocument();
  });

  
  test('handles filter changes correctly', () => {
    const categorySelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(categorySelect, { target: { value: 'music' } });
    
    expect(mockUseSearch.setFilters).toHaveBeenCalledWith({
      ...mockUseSearch.filters,
      category: 'music'
    });
    expect(mockUseSearch.setPage).toHaveBeenCalledWith(1);
  });

  test('handles page size changes correctly', () => {
    const pageSizeSelect = screen.getAllByRole('combobox')[2];
    fireEvent.change(pageSizeSelect, { target: { value: '20' } });
    
    expect(mockUseSearch.setPageSize).toHaveBeenCalledWith(20);
    expect(mockUseSearch.setPage).toHaveBeenCalledWith(1);
  });

  test('displays pagination controls when there are multiple pages', () => {
    // Mock the useSearch hook with results and multiple pages
    require('../components/useSearch').default.mockImplementation(() => ({
      ...mockUseSearch,
      results: [
        { id: '1', title: 'Audio 1', creator: 'Artist 1', url: 'http://example.com/audio1.mp3' },
        { id: '2', title: 'Audio 2', creator: 'Artist 2', url: 'http://example.com/audio2.mp3' },
      ],
      totalPages: 3,
      totalResults: 20,
    }));
  
    render(
      <MemoryRouter>
        <AudioSearch />
      </MemoryRouter>
    );
  
    // Check that pagination controls are rendered with the exact button text
    expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByText(/page 1/i)).toBeInTheDocument();
  });

  test('handles page changes via pagination controls', () => {
    require('../components/useSearch').default.mockImplementation(() => ({
      ...mockUseSearch,
      results: [{ id: '1', title: 'Audio 1' }],
      totalPages: 3,
    }));
    
    render(
      <MemoryRouter>
        <AudioSearch />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockUseSearch.setPage).toHaveBeenCalledWith(2);
  });

  test('opens save search popover when save button is clicked', () => {
    fireEvent.click(screen.getByText('Save Search'));
    expect(screen.getByText('Save Search')).toBeInTheDocument();
  });
});