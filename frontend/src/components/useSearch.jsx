import React, {useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const useSearch = (initialFilters, endpoint) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState(initialFilters);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const queryParams = new URLSearchParams({
      q: searchQuery,
      page,
      page_size: pageSize
    });

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "Any") queryParams.append(key, value);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 30;
          throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const items = data.results || [];
      
      setResults(items);
      setTotalResults(data.result_count || items.length);
      setTotalPages(Math.ceil((data.result_count || items.length) / pageSize));
      setError(null);
    } catch (e) {
      setError(e.message.includes("Rate limit") ? e.message : "Error fetching results. Please try again.");
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveSearch = async (name, mediaType) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to save searches");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/save_search", {
        name,
        query,
        media_type: mediaType,
        results: results.map(item => ({ url: item.url })),
        filters
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
        throw error.response;
      }
      throw new Error('Failed to save search. Please try again.');
    }
  };

  // Initialize from URL
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    const initialParams = {};
    Object.keys(filters).forEach(key => {
      initialParams[key] = searchParams.get(key) || "";
    });

    setFilters(initialParams);
    setQuery(urlQuery || "");

    if (urlQuery) {
      performSearch(urlQuery);
    }
  }, []);

  // Handle filter/page changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [page, pageSize, filters]);

  return {
    query,
    setQuery,
    results,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    isSearching,
    totalResults,
    filters,
    setFilters,
    performSearch,
    handleSaveSearch
  };
};

export default useSearch;