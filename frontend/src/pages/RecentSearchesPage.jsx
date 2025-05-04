import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaginationControls from '../components/PaginationControls';

const RecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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


  useEffect(() => {
    setTotalPages(Math.ceil(recentSearches.length / pageSize));
    setPage(1);
  }, [pageSize, recentSearches.length]);
 
  //Handle delete search
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

  //Handle endpoints when search and filter
  const handleSearchClick = (search_query, mediaType, filters = {}) => {
    const params = new URLSearchParams();
    params.append('q', search_query);

    if (filters.license) params.append('license', filters.license);
    if (filters.source) params.append('source', filters.source);
    if (filters.filetype) params.append('filetype', filters.filetype);
    navigate(`/home/${mediaType}search?${params.toString()}`);
  };

  //Handle pagination
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1); 
  };

  const paginatedSearches = recentSearches.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="header-container">
      <h2 className="header-text">Recent Searches</h2>
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
                <th>Results</th>
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
                    <td>{new Date(safeSearch.timestamp).toLocaleString()}</td>
                    <td>
                      <button
                        className="action-button"
                        onClick={() => handleSearchClick(
                          safeSearch.search_query,
                          safeSearch.media_type,
                          safeSearch.filters
                        )}
                      >
                        View
                      </button>
                      <button
                        className="action-button delete-button"
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

      
          <div className="pagination-controls-container">
            <div>
              <label className="filter-label" style={{ marginRight: "8px" }}>Items per page:</label>
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

            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default RecentSearches;