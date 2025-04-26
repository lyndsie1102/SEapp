import React from 'react';

const SearchResultsGrid = ({ items, mediaType, loading, error }) => {
  if (loading) return <div className="loading-overlay"><div className="loading-spinner"></div></div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (items.length === 0) return <p>No results found for your search.</p>;

  return (
    <div className={`${mediaType}-grid`}>
      {items.map((item, index) => (
        <div key={index} className={`${mediaType}-box`}>
          {mediaType === 'image' ? (
            <>
              <img
                src={item.url}
                alt={item.title}
                className={mediaType}
                onError={(e) => {
                  e.target.src = 'fallback-image-url.jpg';
                  console.error("Failed to load media:", item.url);
                }}
              />
              <p className={`${mediaType}-title`}>{item.title}</p>
            </>
          ) : (
            <div className="audio-result">
              <h4>{item.title || 'Untitled Audio'}</h4>
              <audio controls src={item.url} style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchResultsGrid;