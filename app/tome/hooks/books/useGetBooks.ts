import { BookApiEntity, BookApiStatus } from "@/app/api/books/types";
import { ApiResponse } from "@/app/api/types";
import { useQuery } from "@tanstack/react-query";

interface UseGetBooksOptions {
  includeArchived?: boolean;
}

interface UseGetBooksResponse {
  books: BookApiEntity[] | null;
  isLoading: boolean;
  error: Error | null;
}

function useGetBooks(options?: UseGetBooksOptions): UseGetBooksResponse {
  const { data, isLoading, error } = useQuery<ApiResponse<BookApiEntity[]>>({
    queryKey: ["books", options?.includeArchived ? "all" : "active"],
    queryFn: async () => {
      let url = "/api/books";

      if (options?.includeArchived) {
        const filters = {
          include_statuses: ["WANT_TO_READ", "READING", "READ", "ARCHIVED"],
        };
        url += `?filters=${encodeURIComponent(JSON.stringify(filters))}`;
      }

      const res = await fetch(url);
      return await res.json();
    },
  });

  if (!data) {
    return {
      books: null,
      isLoading,
      error: new Error("Failed to fetch books"),
    };
  }

  return { books: data.data, isLoading, error };
}

export default useGetBooks;
