import React, { useState, useEffect } from "react";

const ImageSearch = () => {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `/search_images?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      } else {
        setImages([]);
      }

      setError(null);
    } catch (e) {
      console.error("Error fetching images:", e);
      setError("Error fetching images. Please try again.");
      setImages([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setPage(1); // Reset page on new query
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1); // Reset page when changing size
  };

  return (
    <div>
      <h2>Image Search</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search for images..."
        />
        <button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Results per page: </label>
        <select value={pageSize} onChange={handlePageSizeChange}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
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
