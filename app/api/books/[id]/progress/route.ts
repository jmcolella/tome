import { headers } from "next/headers";
import { updateBookProgressService } from "@/app/server/books/booksService";
import { BookApiEntity } from "@/app/api/books/types";
import { parseDateLocal } from "@/app/server/utils/dateUtils";

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
    const body = await request.json();
    const { dateEffective, currentPage } = body;

    if (!dateEffective) {
      return new Response(
        JSON.stringify({ error: "dateEffective is required", data: null }),
        { status: 400 }
      );
    }

    if (currentPage === undefined || currentPage === null) {
      return new Response(
        JSON.stringify({ error: "currentPage is required", data: null }),
        { status: 400 }
      );
    }

    if (typeof currentPage !== "number" || currentPage < 0) {
      return new Response(
        JSON.stringify({
          error: "currentPage must be a number >= 0",
          data: null,
        }),
        { status: 400 }
      );
    }

    let dateEffectiveDate: Date;
    try {
      dateEffectiveDate = parseDateLocal(dateEffective);
      if (isNaN(dateEffectiveDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid dateEffective format", data: null }),
        { status: 400 }
      );
    }

    const { book, error } = await updateBookProgressService({
      bookId,
      userId,
      dateEffective: dateEffectiveDate,
      currentPage,
    });

    if (error || !book) {
      return new Response(
        JSON.stringify({
          error: error || "Failed to update book progress",
          data: null,
        }),
        { status: 500 }
      );
    }

    const bookApiEntity = new BookApiEntity(book);

    return new Response(JSON.stringify({ data: bookApiEntity, error: null }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error processing PATCH /api/books/[id]/progress:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        data: null,
      }),
      { status: 500 }
    );
  }
}
