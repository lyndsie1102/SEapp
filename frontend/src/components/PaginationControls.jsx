import React from 'react';

const PaginationControls = ({ page, totalPages, onPageChange }) => {
  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        ⬅ Prev
      </button>
      <span style={{ margin: "0 10px" }}>Page {page}</span>
      <button 
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next ➡
      </button>
    </div>
  );
};

export default PaginationControls;