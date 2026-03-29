import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookApiEntity, EditBookApiInput } from "@/app/api/books/types";
import { ApiResponse } from "@/app/api/types";

interface UseEditBookParams {
  bookId: string;
  updates: EditBookApiInput;
}

function useEditBook() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<BookApiEntity>, Error, UseEditBookParams>({
    mutationFn: async ({ bookId, updates }: UseEditBookParams) => {
      const response = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to edit book");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export default useEditBook;
