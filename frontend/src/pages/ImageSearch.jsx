import React, { useState, useEffect } from "react";
import AdvancedFilter from "../components/AdvancedFilter";

const ImageSearch = () => {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [filterValues, setFilterValues] = useState({});

  const imageFilters = [
    { name: "license", label: "License", type: "select", options: ["cc0", "by", "by-sa"] },
    { name: "source", label: "Source", type: "text", placeholder: "e.g. stocksnap" },
    { name: "filetype", label: "File Type", type: "select", options: ["jpg", "png", "svg"] },
  ];

  const handleFilterChange = (name, value) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);

    const token = localStorage.getItem("token");

    try {
      const queryParams = new URLSearchParams({
        q: query,
        page,
        page_size: pageSize,
        ...filterValues,
      });

      const response = await fetch(`/search_images?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.results) {
        setImages(
          data.results.map((img) => ({
            url: img.thumbnail || img.url,
            title: img.title || "Untitled Image",
          }))
        );
        setTotalResults(data.result_count || 0);
      } else {
        setImages([]);
        setTotalResults(0);
      }

      setError(null);
    } catch (e) {
      console.error("Error fetching images:", e);
      setError("Error fetching images. Please try again.");
      setImages([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filterValues]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  return (
    <div>
      <h2>Image Search</h2>

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
              value={filterValues.source || ""}
              onChange={(e) => handleFilterChange("source", e.target.value)}
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
              <img src={image.url} alt={image.title} className="image" />
              <p className="image-title">{image.title}</p>
            </div>
          ))
        ) : (
          <p>No images to display. Try searching for something!</p>
        )}
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
          <button onClick={() => setPage((prev) => prev + 1)}>
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSearch;