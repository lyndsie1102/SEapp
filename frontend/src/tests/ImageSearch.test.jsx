import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ImageSearch from '../pages/ImageSearch';
import '@testing-library/jest-dom';

// Mock the useSearch hook
jest.mock('../components/useSearch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('ImageSearch Component', () => {
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
    filters: { license: '', source: '', filetype: '' },
    setFilters: jest.fn(),
    performSearch: jest.fn(),
    handleSaveSearch: jest.fn(),
  };

  beforeEach(() => {
    require('../components/useSearch').default.mockImplementation(() => mockUseSearch);
    render(
      <MemoryRouter>
        <ImageSearch />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders ImageSearch component with basic elements', () => {
    expect(screen.getByText('Image Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for images...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Save Search')).toBeInTheDocument();
  });

  test('displays search input and responds to input changes', () => {
    const searchInput = screen.getByPlaceholderText('Search for images...');
    fireEvent.change(searchInput, { target: { value: 'cats' } });
    expect(mockUseSearch.setQuery).toHaveBeenCalledWith('cats');
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
        <ImageSearch />
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
        <ImageSearch />
      </MemoryRouter>
    );

    expect(screen.getByText('No image results found for your search.')).toBeInTheDocument();
  });

  test('displays error message when there is an error', () => {
    require('../components/useSearch').default.mockImplementation(() => ({
      ...mockUseSearch,
      error: 'Failed to fetch results',
    }));

    render(
      <MemoryRouter>
        <ImageSearch />
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to fetch results')).toBeInTheDocument();
  });

  test('shows image-specific filters with proper labels and controls', () => {
    // Test that all filter labels are present
    expect(screen.getByText(/License\s*:/)).toBeInTheDocument();
    expect(screen.getByText(/Source\s*:/)).toBeInTheDocument();
    expect(screen.getByText(/File Type\s*:/)).toBeInTheDocument();
  
    // Get all comboboxes (select elements)
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBe(3);

    // Get all filter groups
    const filterGroups = document.querySelectorAll('.filter-group');
  
    // Test License filter options
    const licenseFilter = filterGroups[0]
    expect(within(licenseFilter).getByText(/License\s*:/)).toBeInTheDocument();
    const licenseSelect = within(licenseFilter).getByRole('combobox');
    expect(screen.getAllByRole('option', { name: 'Any' })).toHaveLength(2); // Present in both License and File Type
    expect(screen.getByRole('option', { name: 'cc0' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'by' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'by-sa' })).toBeInTheDocument();
  
    // Test File Type filter options
    const fileTypeFilter = filterGroups[2]
    expect(within(fileTypeFilter).getByText(/File Type\s*:/)).toBeInTheDocument();
    const fileTypeSelect = within(fileTypeFilter).getByRole('combobox');
    expect(screen.getByRole('option', { name: 'jpg' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'png' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'svg' })).toBeInTheDocument();
  
    // Test Source filter
    const sourceFilter = filterGroups[1];
    expect(within(sourceFilter).getByText(/Source\s*:/)).toBeInTheDocument();
    expect(within(sourceFilter).getByPlaceholderText('e.g. stocksnap')).toBeInTheDocument();
  });
  
  test('handles filter changes correctly', () => {
    render(
      <MemoryRouter>
        <ImageSearch />
      </MemoryRouter>
    );
  

});

  test('opens save search popover when save button is clicked', () => {
    fireEvent.click(screen.getByText('Save Search'));
    expect(screen.getByText('Save Search')).toBeInTheDocument();
  });
});