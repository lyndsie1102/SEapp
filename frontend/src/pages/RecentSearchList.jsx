import React, { useState, useEffect } from "react";
import axios from "axios";

const RecentSearches = () => {
  const token = localStorage.getItem("token");
  const [searches, setSearches] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1); // Track total pages

  useEffect(() => {
    if (!token) return;

    const fetchRecentSearches = async () => {
      try {
        const response = await axios.get("/recent_searches", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            page_size: pageSize,
          },
        });
        setSearches(response.data);
        setLoading(false);
        setTotalPages(Math.ceil(response.data.length / pageSize)); // Update total pages
      } catch (err) {
        setError("Failed to load recent searches.");
        setLoading(false);
      }
    };

    fetchRecentSearches();
  }, [token, page, pageSize]);

  const handleDelete = async (searchId) => {
    try {
      await axios.delete(`/recent_search/${searchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSearches((prev) => prev.filter((search) => search.id !== searchId));
    } catch (err) {
      setError("Failed to delete search.");
    }
  };

  const handlePaginationChange = (newPage) => {
    setPage(newPage);
    setLoading(true);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to the first page on page size change
    setLoading(true);
  };

  if (!token) {
    return (
      <div>
        <h2>You must be logged in to view recent searches.</h2>
      </div>
    );
  }

  return (
    <div className="header-bar">
      <h2>Recent Searches</h2>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && searches.length === 0 && <p>No recent searches found.</p>}

      <div className="space-y-4">
        {searches.map((search) => (
          <div key={search.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <div className="flex flex-col">
              <span className="font-semibold">Query:</span>
              <span>{search.query}</span>
              <span className="text-sm text-gray-500">Media Type: {search.media_type}</span>
              <span className="text-sm text-gray-500">Timestamp: {new Date(search.timestamp).toLocaleString()}</span>
            </div>
            <button
              onClick={() => handleDelete(search.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center">
          <span>Page Size:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="ml-2 border border-gray-300 rounded-md p-2"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePaginationChange(page - 1)}
            disabled={page <= 1}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => handlePaginationChange(page + 1)}
            disabled={page >= totalPages} // Disable if last page
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentSearches;
