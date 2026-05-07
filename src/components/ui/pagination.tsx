import { useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  limit: number;
  /** Name of the query param used for the page number. Defaults to "page". */
  pageParam?: string;
}

export const Pagination = ({
  total,
  limit,
  pageParam = "page",
}: PaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get(pageParam) ?? 1));
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const goToPage = (page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page === 1) {
        next.delete(pageParam);
      } else {
        next.set(pageParam, String(page));
      }
      return next;
    });
  };

  if (totalPages <= 1) return null;

  // Build the page window: always show first, last, current ±1, and ellipsis
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis-start");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis-end");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages} &middot; {total} resultado
        {total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, idx) =>
          p === "ellipsis-start" || p === "ellipsis-end" ? (
            <span key={p + String(idx)} className="px-2 text-muted-foreground">
              &hellip;
            </span>
          ) : (
            <Button
              key={p}
              variant={p === currentPage ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(p)}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
