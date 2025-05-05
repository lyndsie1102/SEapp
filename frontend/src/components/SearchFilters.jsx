import React from 'react';

const SearchFilters = ({ filters, filterConfig, onFilterChange, pageSize, onPageSizeChange }) => {
  return (
    <div className="filters-container">
      {filterConfig.map((filter) => (
        <div key={filter.name} className="filter-group">
          <label className="filter-label">{filter.label}:</label>
          {filter.type === 'select' ? (
            <select
              value={filters[filter.name] || ''}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
              className="filter-select"
            >
              <option value="">Any</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={filters[filter.name] || ''}
              onChange={(e) => onFilterChange(filter.name, e.target.value, true)}
              placeholder={filter.placeholder}
              className="filter-input"
            />
          )}
        </div>
      ))}
      
      <div className="filter-group">
        <label className="filter-label">Items per page:</label>
        <select
          value={pageSize}
          onChange={onPageSizeChange}
          className="filter-select"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilters;