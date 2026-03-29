"use server";

import { Book, BookEvent, BookFilters } from "@/app/server/books/types";
import {
  queryBooks,
  getBookById as getBookByIdReader,
} from "@/app/server/books/internals/bookReader";
import {
  createBook,
  updateBook,
  archiveBook,
  startBook,
  updateBookProgress,
  updateBookProgressBackdated,
  completeBook,
  uncompleteBook,
  CreateBookParams,
  UpdateBookParams,
  ArchiveBookParams,
  StartBookParams,
  UpdateBookProgressParams,
  UpdateBookProgressBackdatedParams,
  CompleteBookParams,
  UncompleteBookParams,
} from "@/app/server/books/internals/bookWriter";
import { queryBookEventsAtLatestVersion } from "@/app/server/books/internals/bookEventReader";

export async function getBooks(filters?: BookFilters): Promise<Book[]> {
  return queryBooks(filters);
}

export async function getBookById(bookId: string): Promise<Book> {
  return getBookByIdReader(bookId);
}

export async function createBookService(params: CreateBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  return createBook(params);
}

export async function updateBookService(params: UpdateBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  return updateBook(params);
}

export async function archiveBookService(params: ArchiveBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  return archiveBook(params);
}

export async function startBookService(params: StartBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  return startBook(params);
}

export async function updateBookProgressService(
  params: UpdateBookProgressParams
): Promise<{
  book: Book | null;
  error: string | null;
}> {
  return updateBookProgress(params);
}

export async function getBookEvents(
  bookId: string,
  dateEffectiveOrder: "asc" | "desc" = "desc"
): Promise<BookEvent[]> {
  return queryBookEventsAtLatestVersion(bookId, dateEffectiveOrder);
}

export async function updateBookProgressBackdatedService(
  params: UpdateBookProgressBackdatedParams
): Promise<{
  book: Book | null;
  error: string | null;
}> {
  return updateBookProgressBackdated(params);
}

export async function completeBookService(params: CompleteBookParams): Promise<{
  book: Book | null;
  error: string | null;
}> {
  return completeBook(params);
}

export async function uncompleteBookService(
  params: UncompleteBookParams
): Promise<{
  book: Book | null;
  error: string | null;
}> {
  return uncompleteBook(params);
}