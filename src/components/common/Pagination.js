import React from 'react';

const Pagination = ({
  page = 0,
  size = 10,
  totalElements = 0,
  totalPages = 0,
  onPageChange,
  onSizeChange,
}) => {
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== page) {
      onPageChange?.(newPage);
    }
  };

  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
      <div className="d-flex align-items-center gap-2">
        <button className="btn btn-outline-secondary" disabled={!canPrev} onClick={() => handlePageChange(0)}>
          « First
        </button>
        <button className="btn btn-outline-secondary" disabled={!canPrev} onClick={() => handlePageChange(page - 1)}>
          ‹ Prev
        </button>
        <span>
          Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
        </span>
        <button className="btn btn-outline-secondary" disabled={!canNext} onClick={() => handlePageChange(page + 1)}>
          Next ›
        </button>
        <button className="btn btn-outline-secondary" disabled={!canNext} onClick={() => handlePageChange(totalPages - 1)}>
          Last »
        </button>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span>
          Showing {start}-{end} of {totalElements}
        </span>
        <select
          className="form-select"
          style={{ width: 100 }}
          value={size}
          onChange={(e) => onSizeChange?.(parseInt(e.target.value, 10))}
        >
          {[10, 20, 50, 100].map((s) => (
            <option key={s} value={s}>
              {s} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
