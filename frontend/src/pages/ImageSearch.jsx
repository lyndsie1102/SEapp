import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SaveSearchPopover from '../components/SaveSearchPopover';
import SearchFilters from '../components/SearchFilters';
import PaginationControls from '../components/PaginationControls';
import SearchResultsGrid from '../components/SearchResultsGrid';
import useSearch from '../components/useSearch';

const ImageSearch = () => {
  const [savePopoverOpen, setSavePopoverOpen] = useState(false);
  const handlePopoverClose = () => {
    setSavePopoverOpen(false);
  };

  const initialFilters = {
    license: "",
    source: "",
    filetype: ""
  };

  const filterConfig = [
    { name: "license", label: "License", type: "select", options: ["cc0", "by", "by-sa"] },
    { name: "source", label: "Source", type: "text", placeholder: "e.g. stocksnap" },
    { name: "filetype", label: "File Type", type: "select", options: ["jpg", "png", "svg"] },
  ];

  const {
    query,
    setQuery,
    results,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    isSearching,
    totalResults,
    filters,
    setFilters,
    performSearch,
    handleSaveSearch
  } = useSearch(initialFilters, '/search_images');


  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleSearch = () => performSearch(query);

  return (
    <div className="header-container">
      <div className="search-header">
        <h2 className="header-text">Image Search</h2>
        <button
          onClick={() => setSavePopoverOpen(true)}
          className="save-search-button"
        >
          Save Search
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for images..."
          className="search-input"
        />
        <button onClick={handleSearch} disabled={isSearching} className="search-button">
          {isSearching ? "Searching..." : "Search"}
        </button>

        <SearchFilters
          filters={filters}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <div className="total-results">Total Results: {totalResults}</div>

      <SearchResultsGrid 
      items={results} 
      mediaType="image" 
      loading={isSearching} 
      error={error}
      emptyMessage={!isSearching && query ? "No image results found for your search." : null}
      />

      {results.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {savePopoverOpen && (
        <div className="popover-overlay">F
          <div className="save-popover">
            <div className="popover-content">
              <SaveSearchPopover
                onClose={handlePopoverClose}
                onSave={(name) => handleSaveSearch(name, 'image')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSearch;