import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view recent searches");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("http://localhost:5000/recent_searches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch recent searches: ${response.status}`);
        }

        const data = await response.json();
        console.log("Recent searches data:", data);
        const searches = Array.isArray(data) ? data : [];
        setRecentSearches(searches);
        setTotalPages(Math.ceil(searches.length / pageSize));
      } catch (e) {
        console.error("Error fetching recent searches:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSearches();
  }, []);

  // Update total pages when pageSize changes
  useEffect(() => {
    setTotalPages(Math.ceil(recentSearches.length / pageSize));
    setPage(1); // Reset to first page when page size changes
  }, [pageSize, recentSearches.length]);

  const handleDeleteSearch = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/recent_searches/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRecentSearches((prev) => {
          const updatedSearches = prev.filter((search) => search.id !== id);
          setTotalPages(Math.ceil(updatedSearches.length / pageSize));
          return updatedSearches;
        });
      } else {
        throw new Error('Failed to delete search');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSearchClick = (search_query, mediaType, filters = {}) => {
    const params = new URLSearchParams();
    params.append('q', search_query);

    // Add each filter if it exists
    if (filters.license) params.append('license', filters.license);
    if (filters.source) params.append('source', filters.source);
    if (filters.filetype) params.append('filetype', filters.filetype);
    navigate(`/home/${mediaType}search?${params.toString()}`);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  // Calculate the current page's data
  const paginatedSearches = recentSearches.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="recent-searches-container">
      <h2 className="recent-searches-header">Recent Searches</h2>
      {error && <p className="error-message">{error}</p>}

      {isLoading ? (
        <p>Loading recent searches...</p>
      ) : recentSearches.length === 0 ? (
        <p className="empty-state">No recent searches available.</p>
      ) : (
        <>
          <table className="searches-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Media Type</th>
                <th>Total Results</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSearches.map((search) => {
                const safeSearch = {
                  id: search.id || '',
                  search_query: search.search_query || '',
                  media_type: search.media_type || 'image',
                  total_results: search.total_results || 0,
                  timestamp: search.timestamp || new Date().toISOString(),
                  filters: search.filters || {}
                };

                return (
                  <tr key={safeSearch.id}>
                    <td>{safeSearch.search_query}</td>
                    <td>{safeSearch.media_type}</td>
                    <td>{safeSearch.total_results}</td>
                    <td>{safeSearch.timestamp.replace('T', ' ')}</td>
                    <td>
                      <button
                        onClick={() => handleSearchClick(
                          safeSearch.search_query,
                          safeSearch.media_type,
                          safeSearch.filters
                        )}
                      >
                        View Results
                      </button>
                      <button
                        onClick={() => handleDeleteSearch(safeSearch.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination controls - matches ImageSearch style */}
          <div style={{ marginTop: "1rem", display: 'flex', alignItems: 'center' }}>
            <div className="filter-group" style={{ marginRight: 'auto' }}>
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
            
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              ⬅ Prev
            </button>
            <span style={{ margin: "0 10px" }}>Page {page}</span>
            <button 
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages}
            >
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentSearches;