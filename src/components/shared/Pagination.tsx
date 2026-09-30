import { useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_PARAM, parsePage } from "@/hooks/useListSearchParams";

interface PaginationProps {
  total: number;
  limit: number;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

/** Always shows first, last, current ±1 and ellipsis in between. */
const buildPageItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [1];
  if (currentPage > 3) items.push("ellipsis-start");
  for (
    let page = Math.max(2, currentPage - 1);
    page <= Math.min(totalPages - 1, currentPage + 1);
    page++
  ) {
    items.push(page);
  }
  if (currentPage < totalPages - 2) items.push("ellipsis-end");
  items.push(totalPages);
  return items;
};

export const Pagination = ({ total, limit }: PaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(
    parsePage(searchParams.get(PAGE_PARAM)),
    totalPages,
  );

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (page === 1) next.delete(PAGE_PARAM);
      else next.set(PAGE_PARAM, String(page));
      return next;
    });
  };

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages} &middot; {total} resultado
        {total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>

        {buildPageItems(currentPage, totalPages).map((item) =>
          typeof item === "number" ? (
            <Button
              key={item}
              variant={item === currentPage ? "default" : "outline"}
              size="icon-sm"
              onClick={() => goToPage(item)}
              aria-current={item === currentPage ? "page" : undefined}
            >
              {item}
            </Button>
          ) : (
            <span key={item} className="px-2 text-muted-foreground">
              &hellip;
            </span>
          ),
        )}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
};
