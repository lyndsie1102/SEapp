import React, { useState } from 'react';
import useSearch from '../components/useSearch';
import SearchFilters from '../components/SearchFilters';
import PaginationControls from '../components/PaginationControls';
import SaveSearchPopover from '../components/SaveSearchPopover';
import SearchResultsGrid from '../components/SearchResultsGrid';

const AudioSearch = () => {
  const [savePopoverOpen, setSavePopoverOpen] = useState(false);
  const handlePopoverClose = () => {
    setSavePopoverOpen(false);
  };

  const initialFilters = {
    category: "",
    license: "",
    source: ""
  };

  const filterConfig = [
    { name: "category", label: "Category", type: "select", options: ["music", "sound_effect"] },
    { name: "license", label: "License", type: "select", options: ["by", "cc0", "by-nc"] },
    { name: "source", label: "Source", type: "text", placeholder: "e.g. wikimedia_audio" },
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
  } = useSearch(initialFilters, '/search_audio');


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
    <div className="header-container" style={{ position: 'relative' }}>
      <div className="search-header">
        <h2 className="header-text">Audio Search</h2>
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
          placeholder="Search for audios..."
          className="search-input"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="search-button"
        >
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


      <div className="audio-results-container">
        <SearchResultsGrid
          items={results}
          mediaType="audio"
          loading={isSearching}
          error={error}
          emptyMessage={!isSearching && query ? "No audio results found for your search." : null}
          customClasses={{
            grid: "audio-results-grid",  
            box: "audio-card",          
          }}
        />
      </div>

      {results.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {savePopoverOpen && (
        <div className="popover-overlay">
          <div className="save-popover">
            <div className="popover-content">
              <SaveSearchPopover
                onClose={handlePopoverClose}
                onSave={(name) => handleSaveSearch(name, 'audio')}
              />
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AudioSearch;