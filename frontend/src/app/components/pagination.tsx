"use client";
import React from "react";

interface PaginationProps {
  pageIndex: number;
  totalPages: number;
  setPageIndex: (page: number) => void;
  pageSize?: number;
  totalCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  pageIndex,
  totalPages,
  setPageIndex,
  pageSize,
  totalCount,
}) => {
  return (
    <div className="flex justify-end mt-2 p-2">
      <div className="flex items-center gap-1 bg-primary1 px-2 py-1 rounded-md shadow-sm">

        <button
          onClick={() => setPageIndex(0)}
          disabled={pageIndex === 0}
          className="px-2 py-1 rounded text-calltoaction1 disabled:opacity-40"
        >
          «
        </button>

        <button
          onClick={() => setPageIndex(Math.max(pageIndex - 1, 0))}
          disabled={pageIndex === 0}
          className="px-2 py-1 rounded text-calltoaction1 disabled:opacity-40"
        >
          ‹
        </button>

        <button
          onClick={() => setPageIndex(0)}
          className={`px-2 py-1 rounded ${
            pageIndex === 0
              ? "bg-calltoaction1 text-primary1 font-semibold"
              : "bg-primary1 text-white"
          }`}
        >
          1
        </button>

        {pageIndex > 2 && (
          <span className="px-2 text-primary2 select-none">…</span>
        )}

        {pageIndex > 0 && pageIndex < totalPages - 1 && (
          <button className="px-2 py-1 rounded bg-calltoaction1 text-primary1 font-semibold">
            {pageIndex + 1}
          </button>
        )}

        {pageIndex < totalPages - 3 && (
          <span className="px-2 text-primary2 select-none">…</span>
        )}

        {totalPages > 1 && (
          <button
            onClick={() => setPageIndex(totalPages - 1)}
            className={`px-2 py-1 rounded ${
              pageIndex === totalPages - 1
                ? "bg-calltoaction1 text-primary1 font-semibold"
                : "bg-primary1 text-white"
            }`}
          >
            {totalPages}
          </button>
        )}

        <button
          onClick={() =>
            setPageIndex(
              pageSize && totalCount
                ? (pageIndex + 1) * pageSize < totalCount
                  ? pageIndex + 1
                  : pageIndex
                : Math.min(pageIndex + 1, totalPages - 1)
            )
          }
          disabled={pageIndex === totalPages - 1}
          className="px-2 py-1 rounded text-calltoaction1 disabled:opacity-40"
        >
          ›
        </button>

        <button
          onClick={() => setPageIndex(totalPages - 1)}
          disabled={pageIndex === totalPages - 1}
          className="px-2 py-1 rounded text-calltoaction1 disabled:opacity-40"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
