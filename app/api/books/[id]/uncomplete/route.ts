import { headers } from "next/headers";
import { uncompleteBookService } from "@/app/server/books/booksService";
import { BookApiEntity } from "@/app/api/books/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "User not authenticated", data: null }),
      { status: 401 }
    );
  }

  const { id: bookId } = await params;

  if (!bookId) {
    return new Response(
      JSON.stringify({ error: "Book ID is required", data: null }),
      { status: 400 }
    );
  }

  try {
    const { book, error } = await uncompleteBookService({
      bookId,
      userId,
    });

    if (error || !book) {
      return new Response(
        JSON.stringify({ error: error || "Failed to uncomplete book", data: null }),
        { status: 500 }
      );
    }

    const bookApiEntity = new BookApiEntity(book);

    return new Response(JSON.stringify({ data: bookApiEntity, error: null }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing PATCH /api/books/[id]/uncomplete:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        data: null,
      }),
      { status: 500 }
    );
  }
}
