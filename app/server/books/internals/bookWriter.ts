"use server";

import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";
import { Book, BookStatus, BookEventType, BookEvent } from "@/app/server/books/types";
import { getBookById } from "@/app/server/books/internals/bookReader";
import { queryBookEventsAtLatestVersion } from "@/app/server/books/internals/bookEventReader";
import { getLatestBookEventVersion } from "@/app/server/books/internals/bookEventVersionReader";
import { createBookEventVersion } from "@/app/server/books/internals/bookEventVersionWriter";

export interface CreateBookParams {
  userId: string;
  title: string;
  authorName: string;
  totalPages: number;
  currentPage?: number;
}

export async function createBook(params: CreateBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  try {
    // Idempotent check: check if book with same title already exists for this user
    const existingBook = await prisma.book.findFirst({
      where: {
        user_id: params.userId,
        title: params.title,
      },
    });

    if (existingBook) {
      return {
        book: new Book(existingBook),
        error: null,
      };
    }

    const bookSid = uuidv4();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for date_effective

    const bookEventSid = uuidv4();
    const bookEventVersionSid = uuidv4();
    const pageNumber = params.currentPage ?? 0;

    // Create book, book event, and book event version in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create book
      const book = await tx.book.create({
        data: {
          sid: bookSid,
          title: params.title,
          author_name: params.authorName,
          total_pages: params.totalPages,
          status: BookStatus.WANT_TO_READ,
          user_id: params.userId,
          current_page: pageNumber,
        },
      });

      // Create book event
      await tx.bookEvent.create({
        data: {
          sid: bookEventSid,
          book_sid: bookSid,
          event_type: BookEventType.ADD_TO_LIBRARY,
          date_effective: today,
          page_number: pageNumber,
          version: 1,
        },
      });

      // Create book event version
      await tx.bookEventVersion.create({
        data: {
          sid: bookEventVersionSid,
          book_sid: bookSid,
          version: 1,
          description: "Initial version",
        },
      });

      return book;
    });

    return {
      book: new Book(result),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error creating book:", error);
    return {
      book: null,
      error: "An unexpected error occurred while creating book",
    };
  }
}

export interface UpdateBookParams {
  bookId: string;
  userId: string;
  title?: string;
  authorName?: string;
  totalPages?: number;
}

export async function updateBook(params: UpdateBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  try {
    // First, verify the book exists and belongs to the user
    const existingBook = await prisma.book.findFirst({
      where: {
        sid: params.bookId,
        user_id: params.userId,
      },
    });

    if (!existingBook) {
      return {
        book: null,
        error: "Book not found or access denied",
      };
    }

    // Build update data object with only provided fields
    const updateData: {
      title?: string;
      author_name?: string;
      total_pages?: number;
    } = {};

    if (params.title !== undefined) {
      updateData.title = params.title;
    }
    if (params.authorName !== undefined) {
      updateData.author_name = params.authorName;
    }
    if (params.totalPages !== undefined) {
      updateData.total_pages = params.totalPages;
    }

    // Update book with provided fields
    const book = await prisma.book.update({
      where: {
        sid: params.bookId,
      },
      data: updateData,
    });

    return {
      book: new Book(book),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error updating book:", error);
    return {
      book: null,
      error: "An unexpected error occurred while updating book",
    };
  }
}

export interface ArchiveBookParams {
  bookId: string;
  userId: string;
}

export async function archiveBook(params: ArchiveBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  try {
    // First, verify the book exists and belongs to the user
    const existingBook = await prisma.book.findFirst({
      where: {
        sid: params.bookId,
        user_id: params.userId,
      },
    });

    if (!existingBook) {
      return {
        book: null,
        error: "Book not found or access denied",
      };
    }

    // Get the latest book_event_versions version for this book
    const latestVersion = await prisma.bookEventVersion.findFirst({
      where: {
        book_sid: params.bookId,
      },
      orderBy: {
        version: "desc",
      },
    });

    if (!latestVersion) {
      return {
        book: null,
        error: "No version found for book",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for date_effective

    const bookEventSid = uuidv4();

    // Update book status and create book event in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update book status to ARCHIVED
      const book = await tx.book.update({
        where: {
          sid: params.bookId,
        },
        data: {
          status: BookStatus.ARCHIVED,
        },
      });

      // Create book event with ARCHIVED type
      await tx.bookEvent.create({
        data: {
          sid: bookEventSid,
          book_sid: params.bookId,
          event_type: BookEventType.ARCHIVED,
          date_effective: today,
          page_number: existingBook.current_page,
          version: latestVersion.version,
        },
      });

      return book;
    });

    return {
      book: new Book(result),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error archiving book:", error);
    return {
      book: null,
      error: "An unexpected error occurred while archiving book",
    };
  }
}

export interface StartBookParams {
  bookId: string;
  userId: string;
  dateEffective: Date;
  currentPage: number;
}

export async function startBook(params: StartBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  try {
    // First, verify the book exists and belongs to the user
    const existingBook = await prisma.book.findFirst({
      where: {
        sid: params.bookId,
        user_id: params.userId,
      },
    });

    if (!existingBook) {
      return {
        book: null,
        error: "Book not found or access denied",
      };
    }

    // Get the latest book_event_versions version for this book
    const latestVersion = await prisma.bookEventVersion.findFirst({
      where: {
        book_sid: params.bookId,
      },
      orderBy: {
        version: "desc",
      },
    });

    if (!latestVersion) {
      return {
        book: null,
        error: "No version found for book",
      };
    }

    const bookEventSid = uuidv4();

    // Update book status and create book event in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update book status to READING and current_page
      const book = await tx.book.update({
        where: {
          sid: params.bookId,
        },
        data: {
          status: BookStatus.READING,
          current_page: params.currentPage,
        },
      });

      // Create book event with STARTED type
      await tx.bookEvent.create({
        data: {
          sid: bookEventSid,
          book_sid: params.bookId,
          event_type: BookEventType.STARTED,
          date_effective: params.dateEffective,
          page_number: params.currentPage,
          version: latestVersion.version,
        },
      });

      return book;
    });

    return {
      book: new Book(result),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error starting book:", error);
    return {
      book: null,
      error: "An unexpected error occurred while starting book",
    };
  }
}

export interface CompleteBookParams {
  bookId: string;
  userId: string;
  dateEffective: Date;
  finalPage?: number; // Optional final page override
}

export async function completeBook(params: CompleteBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  try {
    // First, verify the book exists and belongs to the user
    const existingBook = await prisma.book.findFirst({
      where: {
        sid: params.bookId,
        user_id: params.userId,
      },
    });

    if (!existingBook) {
      return {
        book: null,
        error: "Book not found or access denied",
      };
    }

    // Get the latest book_event_versions version for this book
    const latestVersion = await prisma.bookEventVersion.findFirst({
      where: {
        book_sid: params.bookId,
      },
      orderBy: {
        version: "desc",
      },
    });

    if (!latestVersion) {
      return {
        book: null,
        error: "No version found for book",
      };
    }

    // Determine finalPage
    let finalPage: number;
    if (params.finalPage !== undefined) {
      finalPage = params.finalPage;
    } else if (existingBook.total_pages !== null) {
      finalPage = existingBook.total_pages;
    } else {
      finalPage = existingBook.current_page;
    }

    // Validation: If totalPages exists and finalPage provided, ensure finalPage <= totalPages
    if (
      existingBook.total_pages !== null &&
      finalPage > existingBook.total_pages
    ) {
      return {
        book: null,
        error: "Final page cannot exceed total pages",
      };
    }

    const bookEventSid = uuidv4();

    // Update book status and create book event in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update book status to READ and current_page
      const book = await tx.book.update({
        where: {
          sid: params.bookId,
        },
        data: {
          status: BookStatus.READ,
          current_page: finalPage,
        },
      });

      // Create book event with COMPLETED type
      await tx.bookEvent.create({
        data: {
          sid: bookEventSid,
          book_sid: params.bookId,
          event_type: BookEventType.COMPLETED,
          date_effective: params.dateEffective,
          page_number: finalPage,
          version: latestVersion.version,
        },
      });

      return book;
    });

    return {
      book: new Book(result),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error completing book:", error);
    return {
      book: null,
      error: "An unexpected error occurred while completing book",
    };
  }
}

export interface UncompleteBookParams {
  bookId: string;
  userId: string;
}

export async function uncompleteBook(params: UncompleteBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  try {
    // First, verify the book exists and belongs to the user
    const existingBook = await prisma.book.findFirst({
      where: {
        sid: params.bookId,
        user_id: params.userId,
      },
    });

    if (!existingBook) {
      return {
        book: null,
        error: "Book not found or access denied",
      };
    }

    // Verify book status is currently READ
    if (existingBook.status !== BookStatus.READ) {
      return {
        book: null,
        error: "Book must be in READ status to uncomplete",
      };
    }

    // Get the latest book_event_versions version for this book
    const latestVersion = await prisma.bookEventVersion.findFirst({
      where: {
        book_sid: params.bookId,
      },
      orderBy: {
        version: "desc",
      },
    });

    if (!latestVersion) {
      return {
        book: null,
        error: "No version found for book",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for date_effective

    const bookEventSid = uuidv4();

    // Update book status and create book event in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update book status to READING (current_page stays the same)
      const book = await tx.book.update({
        where: {
          sid: params.bookId,
        },
        data: {
          status: BookStatus.READING,
        },
      });

      // Create book event with STARTED type (indicating resuming reading)
      await tx.bookEvent.create({
        data: {
          sid: bookEventSid,
          book_sid: params.bookId,
          event_type: BookEventType.STARTED,
          date_effective: today,
          page_number: existingBook.current_page,
          version: latestVersion.version,
        },
      });

      return book;
    });

    return {
      book: new Book(result),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error uncompleting book:", error);
    return {
      book: null,
      error: "An unexpected error occurred while uncompleting book",
    };
  }
}

export interface UpdateBookProgressParams {
  bookId: string;
  userId: string;
  dateEffective: Date;
  currentPage: number;
}

export async function updateBookProgress(
  params: UpdateBookProgressParams
): Promise<{
  book: Book | null;
  error: string | null;
}> {
  try {
    // First, verify the book exists and belongs to the user
    const existingBook = await getBookById(params.bookId);

    // Validate currentPage doesn't exceed totalPages if totalPages exists
    if (
      existingBook.totalPages !== null &&
      params.currentPage > existingBook.totalPages
    ) {
      return {
        book: null,
        error: `currentPage cannot exceed total pages (${existingBook.totalPages})`,
      };
    }

    // Get all events at latest version to check if backdating is needed
    const allEvents = await queryBookEventsAtLatestVersion(params.bookId, "asc");

    // Check if this is a backdated event
    if (allEvents.length > 0) {
      const latestEventDate = allEvents[allEvents.length - 1].dateEffective;
      if (params.dateEffective < latestEventDate) {
        // Backdating detected - use backdated update logic
        return updateBookProgressBackdated(params);
      }
    }

    // Get the latest book_event_versions version for this book
    const latestVersion = await prisma.bookEventVersion.findFirst({
      where: {
        book_sid: params.bookId,
      },
      orderBy: {
        version: "desc",
      },
    });

    if (!latestVersion) {
      return {
        book: null,
        error: "No version found for book",
      };
    }

    const bookEventSid = uuidv4();

    // Update book current_page and create book event in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update book current_page (status remains READING)
      const book = await tx.book.update({
        where: {
          sid: params.bookId,
        },
        data: {
          current_page: params.currentPage,
        },
      });

      // Create book event with PROGRESS type
      await tx.bookEvent.create({
        data: {
          sid: bookEventSid,
          book_sid: params.bookId,
          event_type: BookEventType.PROGRESS,
          date_effective: params.dateEffective,
          page_number: params.currentPage,
          version: latestVersion.version,
        },
      });

      return book;
    });

    // Check for autocomplete condition
    const shouldAutoComplete =
      existingBook.totalPages !== null &&
      params.currentPage === existingBook.totalPages;

    if (shouldAutoComplete) {
      // Auto-complete the book
      return completeBook({
        bookId: params.bookId,
        userId: params.userId,
        dateEffective: params.dateEffective,
        finalPage: params.currentPage,
      });
    }

    return {
      book: new Book(result),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error updating book progress:", error);
    return {
      book: null,
      error: "An unexpected error occurred while updating book progress",
    };
  }
}

// Helper functions for backdated progress updates

function correctPageNumber(
  prevEventPage: number,
  currentEventPage: number | null
): number {
  // If current event is null, use previous page
  if (currentEventPage === null) {
    return prevEventPage;
  }
  // If current event already ahead, keep it
  if (currentEventPage > prevEventPage) {
    return currentEventPage;
  }
  // Otherwise, update to previous event's page (can't go backwards)
  return prevEventPage;
}

function partitionEvents(
  events: BookEvent[],
  backdatedEventDate: Date
): { beforeEvents: BookEvent[]; afterEvents: BookEvent[] } {
  const backdatedDateTime = backdatedEventDate.getTime();

  const beforeEvents = events.filter(
    (e) => e.dateEffective.getTime() < backdatedDateTime
  );

  const afterEvents = events.filter(
    (e) => e.dateEffective.getTime() >= backdatedDateTime
  );

  return { beforeEvents, afterEvents };
}

interface RebuildEventsParams {
  bookSid: string;
  backdatedEvent: {
    sid: string;
    dateEffective: Date;
    pageNumber: number;
  };
  existingEvents: BookEvent[];
  newVersion: number;
  tx: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

async function rebuildEventsAfterBackdate(
  params: RebuildEventsParams
): Promise<void> {
  const { backdatedEvent, existingEvents, newVersion, tx, bookSid } = params;

  let previousEventPage = backdatedEvent.pageNumber;

  const eventsToCreate = existingEvents.map((event) => {
    const correctedPage = correctPageNumber(previousEventPage, event.pageNumber);
    previousEventPage = correctedPage;

    return {
      sid: uuidv4(),
      book_sid: bookSid,
      event_type: event.eventType,
      date_effective: event.dateEffective,
      page_number: correctedPage,
      version: newVersion,
    };
  });

  if (eventsToCreate.length > 0) {
    await tx.bookEvent.createMany({
      data: eventsToCreate,
    });
  }
}

export interface UpdateBookProgressBackdatedParams {
  bookId: string;
  userId: string;
  dateEffective: Date;
  currentPage: number;
}

export async function updateBookProgressBackdated(
  params: UpdateBookProgressBackdatedParams
): Promise<{
  book: Book | null;
  error: string | null;
}> {
  try {
    // Verify the book exists and belongs to the user
    const existingBook = await getBookById(params.bookId);

    if (!existingBook) {
      return {
        book: null,
        error: "Book not found or access denied",
      };
    }

    // Validate currentPage doesn't exceed totalPages if totalPages exists
    if (
      existingBook.totalPages !== null &&
      params.currentPage > existingBook.totalPages
    ) {
      return {
        book: null,
        error: `currentPage cannot exceed total pages (${existingBook.totalPages})`,
      };
    }

    // Get the latest version
    const latestVersion = await getLatestBookEventVersion(params.bookId);

    // Get all events at current version, ordered by date ascending
    const allEvents = await queryBookEventsAtLatestVersion(params.bookId, "asc");

    // Partition events into before and after the backdated event
    const { beforeEvents, afterEvents } = partitionEvents(
      allEvents,
      params.dateEffective
    );

    const newBackdatedEventSid = uuidv4();
    const newVersion = latestVersion.version + 1;

    // Execute everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new version
      await createBookEventVersion(
        {
          bookSid: params.bookId,
          version: newVersion,
          description: `Rebuild out of order events from ${newBackdatedEventSid}`,
        },
        tx
      );

      // Copy events before the backdated event (unchanged)
      const beforeEventsToCreate = beforeEvents.map((event) => ({
        sid: uuidv4(),
        book_sid: params.bookId,
        event_type: event.eventType,
        date_effective: event.dateEffective,
        page_number: event.pageNumber,
        version: newVersion,
      }));

      if (beforeEventsToCreate.length > 0) {
        await tx.bookEvent.createMany({
          data: beforeEventsToCreate,
        });
      }

      // Create the new backdated event
      await tx.bookEvent.create({
        data: {
          sid: newBackdatedEventSid,
          book_sid: params.bookId,
          event_type: BookEventType.PROGRESS,
          date_effective: params.dateEffective,
          page_number: params.currentPage,
          version: newVersion,
        },
      });

      // Rebuild affected events with page correction
      if (afterEvents.length > 0) {
        await rebuildEventsAfterBackdate({
          bookSid: params.bookId,
          backdatedEvent: {
            sid: newBackdatedEventSid,
            dateEffective: params.dateEffective,
            pageNumber: params.currentPage,
          },
          existingEvents: afterEvents,
          newVersion,
          tx,
        });
      }

      // Calculate new current_page from latest event at new version
      let newCurrentPage = params.currentPage;

      if (afterEvents.length > 0) {
        // Simulate the correction to get final page
        let tempPrevPage = params.currentPage;
        for (const event of afterEvents) {
          tempPrevPage = correctPageNumber(tempPrevPage, event.pageNumber);
        }
        newCurrentPage = tempPrevPage;
      }

      // Update book current_page if it changed
      const book = await tx.book.update({
        where: {
          sid: params.bookId,
        },
        data: {
          current_page: newCurrentPage,
        },
      });

      return book;
    });

    return {
      book: new Book(result),
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error updating book progress (backdated):", error);
    return {
      book: null,
      error: "An unexpected error occurred while updating book progress",
    };
  }
}
