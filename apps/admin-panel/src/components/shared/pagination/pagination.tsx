import { Paging } from "@/lib/response";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationServerProps {
  paging: Paging;
  currentPage: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export function Pagination({
  paging,
  currentPage,
  onPageChange,
  maxVisible = 3,
}: PaginationServerProps) {
  const total_page = paging?.total_page;
  const page = currentPage;

  if (total_page <= 1) return null;

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(total_page, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const baseBtn =
    "min-w-[36px] h-9 px-3 flex items-center justify-center rounded-full text-sm transition";

  return (
    <div className="flex items-center justify-center gap-2 ">
      {/* PREV */}
      <button
        onClick={() => page > 1 && onPageChange(page - 1)}
        className={clsx(
          baseBtn,
          "text-gray-500 hover:bg-gray-100",
          page === 1 && "opacity-40 pointer-events-none",
        )}
      >
        <ChevronLeft strokeWidth={1.5} size={20} />
      </button>

      {/* FIRST */}
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={clsx(baseBtn, "hover:bg-gray-100 text-gray-700")}
          >
            1
          </button>
          <span className="px-1 text-gray-400">...</span>
        </>
      )}

      {/* PAGES */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={clsx(
            baseBtn,
            p === page
              ? "bg-gray-900 text-white"
              : "text-gray-700 hover:bg-gray-100",
          )}
        >
          {p}
        </button>
      ))}

      {/* LAST */}
      {end < total_page && (
        <>
          <span className="px-1 text-gray-400">...</span>
          <button
            onClick={() => onPageChange(total_page)}
            className={clsx(baseBtn, "hover:bg-gray-100 text-gray-700")}
          >
            {total_page}
          </button>
        </>
      )}

      {/* NEXT */}
      <button
        onClick={() => page < total_page && onPageChange(page + 1)}
        className={clsx(
          baseBtn,
          "text-gray-500 hover:bg-gray-100",
          page === total_page && "opacity-40 pointer-events-none",
        )}
      >
        <ChevronRight strokeWidth={1.5} size={20} />
      </button>
    </div>
  );
}
