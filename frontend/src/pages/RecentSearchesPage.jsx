import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const RecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentSearches = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch("http://localhost:5000/recent_searches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recent searches');
        }

        const data = await response.json();
        setRecentSearches(data);
      } catch (e) {
        setError(e.message);
      }
    };

    fetchRecentSearches();
  }, []);

  const handleDeleteSearch = async (id) => {
    const token = localStorage.getItem("token");

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

  const handleSearchClick = (search_query, mediaType) => {
    if (mediaType === "image") {
      navigate("/home/imagesearch?q=" + encodeURIComponent(search_query));
    } else if (mediaType === "audio") {
      navigate("/home/audiosearch?q=" + encodeURIComponent(search_query));
    }
  };

  return (
    <div className="recent-searches-container">
      <h2 className="recent-searches-header">Recent Searches</h2>
      {error && <p className="error-message">{error}</p>}

      {recentSearches.length === 0 ? (
        <p className="empty-state">No recent searches available.</p>
      ) : (
        <table className="searches-table">
          <thead>
            <tr>
              <th className="table-header">Query</th>
              <th className="table-header">Media Type</th>
              <th className="table-header">Total Results</th>
              <th className="table-header">Timestamp</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentSearches.map((search) => (
              <tr key={search.id} className="table-row">
                <td className="table-cell">{search.search_query}</td>
                <td className="table-cell">{search.media_type}</td>
                <td className="table-cell">{search.total_results}</td>
                <td className="table-cell timestamp-cell">{search.timestamp.replace('T', ' ')}</td>
                <td className="table-cell">
                  <button
                    className="action-button"
                    onClick={() => handleSearchClick(search.search_query, search.media_type)}
                  >
                    View Results
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDeleteSearch(search.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecentSearches;