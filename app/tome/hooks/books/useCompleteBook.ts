import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookApiEntity } from "@/app/api/books/types";
import { ApiResponse } from "@/app/api/types";

interface CompleteBookInput {
  bookId: string;
  dateEffective: string;
  finalPage?: number;
}

export default function useCompleteBook() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<BookApiEntity>, Error, CompleteBookInput>({
    mutationFn: async (input) => {
      const response = await fetch(`/api/books/${input.bookId}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateEffective: input.dateEffective,
          finalPage: input.finalPage,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to complete book");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
