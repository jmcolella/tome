import { headers } from "next/headers";
import { updateBookService } from "@/app/server/books/booksService";
import { BookApiEntity, EditBookApiInput } from "@/app/api/books/types";

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

  let body: EditBookApiInput;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body", data: null }),
      { status: 400 }
    );
  }

  // Validate that at least one field is provided
  if (!body.title && !body.author && !body.totalPages) {
    return new Response(
      JSON.stringify({
        error: "At least one field (title, author, totalPages) must be provided",
        data: null,
      }),
      { status: 400 }
    );
  }

  // Validate totalPages if provided
  if (body.totalPages !== undefined && body.totalPages <= 0) {
    return new Response(
      JSON.stringify({
        error: "Total pages must be greater than 0",
        data: null,
      }),
      { status: 400 }
    );
  }

  const { book, error } = await updateBookService({
    bookId,
    userId,
    title: body.title,
    authorName: body.author,
    totalPages: body.totalPages,
  });

  if (error || !book) {
    return new Response(
      JSON.stringify({ error: error || "Failed to update book", data: null }),
      { status: 500 }
    );
  }

  const bookApiEntity = new BookApiEntity(book);

  return new Response(JSON.stringify({ data: bookApiEntity, error: null }), {
    status: 200,
  });
}
