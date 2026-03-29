import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookApiEntity } from "@/app/api/books/types";
import { ApiResponse } from "@/app/api/types";

interface UncompleteBookInput {
  bookId: string;
}

export default function useUncompleteBook() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<BookApiEntity>, Error, UncompleteBookInput>({
    mutationFn: async (input) => {
      const response = await fetch(`/api/books/${input.bookId}/uncomplete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to resume reading");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
