import React, { useState } from "react";

const AudioSearch = () => {
  const [query, setQuery] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    license: "",
    source: ""
  });
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchAudioResults(newFilters);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const fetchAudioResults = async (filters) => {
    const params = new URLSearchParams({
      q: query,
      page: currentPage,
      page_size: itemsPerPage,
      ...filters,
    });

    try {
      const res = await fetch(`http://localhost:5000/search_audio?${params.toString()}`);
      const data = await res.json();

      if (data.results) {
        setResults(data.results);
        setTotalResults(data.result_count || 0);
      }
    } catch (e) {
      console.error("Error searching audios:", e);
      setError("Error fetching audios. Please try again.");
    }
  };

  const handleSearch = () => {
    fetchAudioResults(filters);
  };

  const handleSaveSearch = async () => {
    if (results.length === 0) {
      alert("No results to save!");
      return;
    }
  
    // Alert that only Page 1 results will be saved
    alert("Only the currently loaded results (Page 1) will be saved.");
  
    try {
      const token = localStorage.getItem("token");
      const media_type = "audio";
      const response = await fetch("http://localhost:5000/save_search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          media_type,
          results: results.map(item => ({ url: item.url }))
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Search saved successfully!");
      } else {
        alert("Error saving search: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Audio Search</h2>
      <button onClick={handleSaveSearch}>Save Search</button>

      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search for audios..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>

        <div className="filters-container">
          <label className="filter-label">Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="filter-select"
          >
            <option value="">Any</option>
            <option value="music">Music</option>
            <option value="sound_effect">Sound Effect</option>
          </select>

          <label className="filter-label">License:</label>
          <select
            value={filters.license}
            onChange={(e) => handleFilterChange("license", e.target.value)}
            className="filter-select"
          >
            <option value="">Any</option>
            <option value="by">BY</option>
            <option value="cc0">CC0</option>
            <option value="by-nc">BY-NC</option>
          </select>

          <label className="filter-label">Source:</label>
          <input
            type="text"
            value={filters.source}
            onChange={(e) => handleFilterChange("source", e.target.value)}
            placeholder="e.g. wikimedia_audio"
            className="search-input"
          />

          <label className="filter-label">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="filter-select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>
      </div>

      <p><strong>Total Results:</strong> {totalResults}</p>

      <div className="audio-results">
        {results.map((audio) => (
          <div key={audio.id} className="audio-card">
            <h4>{audio.title}</h4>
            <audio controls src={audio.url}></audio>
          </div>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AudioSearch;
