import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
        setRecentSearches(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error fetching recent searches:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentSearches();
  }, []);

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
        setRecentSearches((prev) => prev.filter((search) => search.id !== id));
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

  return (
    <div className="recent-searches-container">
      <h2 className="recent-searches-header">Recent Searches</h2>
      {error && <p className="error-message">{error}</p>}

      {isLoading ? (
        <p>Loading recent searches...</p>
      ) : recentSearches.length === 0 ? (
        <p className="empty-state">No recent searches available.</p>
      ) : (
        <table className="searches-table">
          <thead>
            <tr>
              <th>Query</th>
              <th>Media Type</th>
              <th>Total Results</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentSearches.map((search) => {
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
      )}
    </div>
  );
};

export default RecentSearches;