import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SaveSearchPopover from "../components/SaveSearchPopover";
import axios from 'axios';

const ImageSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [pendingSourceFilter, setPendingSourceFilter] = useState("");
  const [savePopoverAnchor, setSavePopoverAnchor] = useState(null);
  const [savePopoverOpen, setSavePopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [filterValues, setFilterValues] = useState({
    license: "",
    source: "",
    filetype: ""
  });

  const imageFilters = [
    { name: "license", label: "License", type: "select", options: ["cc0", "by", "by-sa"] },
    { name: "source", label: "Source", type: "text", placeholder: "e.g. stocksnap" },
    { name: "filetype", label: "File Type", type: "select", options: ["jpg", "png", "svg"] },
  ];

  const handleSaveSearchClick = (event) => {
    if (images.length === 0) {
      alert("No results to save!");
      return;
    }

    const buttonRect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      top: buttonRect.bottom + window.scrollY + 5,
      left: buttonRect.left + window.scrollX
    });
    setSavePopoverOpen(!savePopoverOpen);
  };

  // Add this handler
  const handlePopoverClose = () => {
    setSavePopoverOpen(false);
    setSavePopoverAnchor(null);
  };

  const checkRateLimit = async () => {
    try {
      const response = await fetch('/rate_limit');
      const data = await response.json();
      return data;
    } catch (e) {
      console.error("Failed to check rate limits", e);
      return null;
    }
  };



  const handleFilterChange = (name, value, isTextInput = false) => {
    if (name === "source" && isTextInput) {
      // For source text input, just update the pending value
      setPendingSourceFilter(value);
      return;
    }

    // For non-text inputs (selects), proceed with immediate update
    const newFilters = { ...filterValues, [name]: value };
    setFilterValues(newFilters);

    // Update URL with all current parameters
    const params = {
      q: query,
      ...newFilters
    };

    // Clean empty/undefined values
    Object.keys(params).forEach(key => {
      if (!params[key] || params[key] === "Any") delete params[key];
    });

    setSearchParams(params);
    setPage(1); // Reset to first page when filters change
  };

  const handleSourceFilterKeyDown = (e) => {
    if (e.key === 'Enter') {
      const newFilters = { ...filterValues, source: pendingSourceFilter };
      setFilterValues(newFilters);

      // Update URL
      const params = {
        q: query,
        ...newFilters
      };
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === "Any") delete params[key];
      });
      setSearchParams(params);
      setPage(1);
    }
  };

  const performSearch = async (searchQuery) => {
    // 1. Check rate limits first
    const limits = await checkRateLimit();
    if (limits?.remaining <= 0) {
      setError(`Rate limit exceeded. Try again in ${Math.ceil(limits.reset_in)} seconds`);
      setIsSearching(false);
      return;
    }

    // 2. Validate search query
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // 3. Prepare query parameters
    const queryParams = new URLSearchParams({
      q: searchQuery,
      page,
      page_size: pageSize
    });

    // Add active filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== "Any") {
        queryParams.append(key, value);
      }
    });

    try {
      // 4. Make the API request
      const token = localStorage.getItem("token");
      const response = await fetch(`/search_images?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 5. Handle response
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 30;
          throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 6. Process successful response
      const results = data.results || [];
      setImages(results.map(img => ({
        url: img.thumbnail || img.url,
        title: img.title || "Untitled Image",
      })));
      const resultCount = data.result_count || results.length;
      setTotalResults(data.result_count || results.length);
      setTotalPages(Math.ceil((data.result_count || results.length) / pageSize));
      setError(null);

    } catch (e) {
      // 7. Handle errors
      console.error("Search error:", e);
      setError(e.message.includes("Rate limit") ? e.message : "Error fetching images. Please try again.");
      setImages([]);
      setTotalResults(0);

      // Auto-retry for rate limits
      if (e.message.includes("Rate limit")) {
        setTimeout(() => performSearch(searchQuery), 2000);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Handle manual search button click
  const handleSearch = () => {
    performSearch(query);
  };

  // Initialize from URL on first load
  // Initialize from URL on first load
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    const initialFilters = {
      license: searchParams.get("license") || "",
      source: searchParams.get("source") || "",
      filetype: searchParams.get("filetype") || ""
    };

    setFilterValues(initialFilters);
    setQuery(urlQuery || "");

    if (urlQuery) {
      performSearch(urlQuery);
    }
  }, [searchParams]);

  // Handle filter/page changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [page, pageSize, filterValues]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleSaveSearch = async (name) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to save searches");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/save_search", {
        name: name,
        query: query,
        media_type: "image",
        results: images.map(item => ({ url: item.url })),
        filters: filterValues
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
  
      return response.data;
    } catch (error) {
      console.error("Error saving search:", error);
      if (error.response) {
        throw error.response;  // <<< THROW the full response, not a new Error
      }
      throw new Error('Failed to save search. Please try again.');
    }
  };
  

  return (
    <div className="image-search-container" style={{ position: 'relative' }}>
      <h2>Image Search</h2>
      <button
        onClick={handleSaveSearchClick}
        className="save-search-button"
        aria-describedby="save-search-popover"
      >
        Save Search
      </button>

      {/* Search and Filter Container */}
      <div className="search-container">
        {/* Search Bar */}
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search for images..."
          className="search-input"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="search-button"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>


        {/* Filters */}
        <div className="filters-container">
          {/* License Filter */}
          <div className="filter-group">
            <label className="filter-label">License:</label>
            <select
              value={filterValues.license || "Any"}
              onChange={(e) => handleFilterChange("license", e.target.value)}
              className="filter-select"
            >
              <option value="Any">Any</option>
              <option value="cc0">CC0</option>
              <option value="by">BY</option>
              <option value="by-sa">BY-SA</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="filter-group">
            <label className="filter-label">Source:</label>
            <input
              type="text"
              value={pendingSourceFilter}
              onChange={(e) => handleFilterChange("source", e.target.value, true)}
              onKeyDown={handleSourceFilterKeyDown}
              placeholder="e.g. stocksnap"
              className="filter-input"
            />

          </div>

          {/* File Type Filter */}
          <div className="filter-group">
            <label className="filter-label">File Type:</label>
            <select
              value={filterValues.filetype || "Any"}
              onChange={(e) => handleFilterChange("filetype", e.target.value)}
              className="filter-select"
            >
              <option value="Any">Any</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
              <option value="others">Others</option>
            </select>
          </div>

          {/* Items per page */}
          <div className="filter-group">
            <label className="filter-label">Items per page:</label>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="filter-select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <strong>Total Results: </strong>{totalResults}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {isSearching && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="image-grid">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div key={index} className="image-box">
              <img
                src={image.url}
                alt={image.title}
                className="image"
                onError={(e) => {
                  e.target.src = 'fallback-image-url.jpg'; // Add error handling
                  console.error("Failed to load image:", image.url);
                }}
              />
              <p className="image-title">{image.title}</p>
            </div>
          ))
        ) : !isSearching && query ? (
          <p>No images found for your search.</p>
        ) : null}
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            ⬅ Prev
          </button>
          <span style={{ margin: "0 10px" }}>Page {page}</span>
          <button onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages}  // Add this condition
          >
            Next ➡
          </button>
        </div>
      )}

      {savePopoverOpen && (
        <div className="popover-overlay">
          <div className="save-popover">
            <SaveSearchPopover
              onClose={handlePopoverClose}
              onSave={handleSaveSearch}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ImageSearch;