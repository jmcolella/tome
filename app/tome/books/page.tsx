"use client";

import { useState } from "react";
import { Tabs, Empty, Spin, Alert, Typography, theme } from "antd";
import { redirect } from "next/navigation";
import { BookApiEntity } from "@/app/api/books/types";
import { BookStatus } from "@/app/server/books/types";
import useGetUser from "@/app/tome/hooks/user/useGetUser";
import useGetBooks from "@/app/tome/hooks/books/useGetBooks";
import BookCard from "@/app/tome/components/BookCard";
import BookViewModal from "@/app/tome/components/BookViewModal";
import StartBookModal from "@/app/tome/components/StartBookModal";
import UpdateProgressModal from "@/app/tome/components/UpdateProgressModal";
import EditBookModal from "@/app/tome/components/EditBookModal";
import ArchiveBookModal from "@/app/tome/components/ArchiveBookModal";
import { ROUTE_WELCOME } from "@/app/tome/routes";

const { Title } = Typography;

enum ModalType {
  BOOK_VIEW = "BOOK_VIEW",
  START = "START",
  UPDATE_PROGRESS = "UPDATE_PROGRESS",
  EDIT = "EDIT",
  ARCHIVE = "ARCHIVE",
}

interface ModalState {
  type: ModalType | null;
  book: BookApiEntity | null;
}

export default function BooksPage() {
  const { user, isLoading: userLoading } = useGetUser();
  const { books, isLoading: booksLoading, error } = useGetBooks({
    includeArchived: true,
  });
  const { token } = theme.useToken();

  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    book: null,
  });

  if (userLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return redirect(ROUTE_WELCOME);
  }

  const openModal = (type: ModalType, book: BookApiEntity) => {
    setModalState({ type, book });
  };

  const closeModal = () => {
    setModalState({ type: null, book: null });
  };

  const handleBookClick = (book: BookApiEntity) => {
    openModal(ModalType.BOOK_VIEW, book);
  };

  const handleModalAction = (actionType: ModalType) => {
    if (modalState.book) {
      // Close current modal and open action modal
      setModalState({ type: actionType, book: modalState.book });
    }
  };

  if (booksLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error || !books) {
    return (
      <div
        style={{
          padding: token.paddingLG,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Alert
          message="Error loading books"
          description={error?.message || "An error occurred"}
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Filter books by status
  const wantToReadBooks = books.filter(
    (book) => book.status === BookStatus.WANT_TO_READ
  );
  const readingBooks = books.filter(
    (book) => book.status === BookStatus.READING
  );
  const finishedBooks = books.filter((book) => book.status === BookStatus.READ);
  const archivedBooks = books.filter(
    (book) => book.status === BookStatus.ARCHIVED
  );

  const renderBookGrid = (bookList: BookApiEntity[]) => {
    if (bookList.length === 0) {
      return <Empty description="No books in this category" />;
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {bookList.map((book) => (
          <BookCard
            key={book.sid}
            book={book}
            onClick={() => handleBookClick(book)}
            showActions={true}
          />
        ))}
      </div>
    );
  };

  const tabItems = [
    {
      key: "want-to-read",
      label: `Want to Read (${wantToReadBooks.length})`,
      children: renderBookGrid(wantToReadBooks),
    },
    {
      key: "reading",
      label: `Reading (${readingBooks.length})`,
      children: renderBookGrid(readingBooks),
    },
    {
      key: "finished",
      label: `Finished (${finishedBooks.length})`,
      children: renderBookGrid(finishedBooks),
    },
    {
      key: "archived",
      label: `Archived (${archivedBooks.length})`,
      children: renderBookGrid(archivedBooks),
    },
  ];

  return (
    <div
      style={{
        padding: token.paddingLG,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <Title level={2} style={{ marginBottom: token.marginLG }}>
        All Books
      </Title>

      <Tabs defaultActiveKey="reading" items={tabItems} />

      {/* Modals */}
      {modalState.book && (
        <>
          <BookViewModal
            open={modalState.type === ModalType.BOOK_VIEW}
            book={modalState.book}
            onClose={closeModal}
          />
          <StartBookModal
            open={modalState.type === ModalType.START}
            book={modalState.book}
            onClose={closeModal}
            onSuccess={closeModal}
          />
          <UpdateProgressModal
            open={modalState.type === ModalType.UPDATE_PROGRESS}
            book={modalState.book}
            onClose={closeModal}
            onSuccess={closeModal}
          />
          <EditBookModal
            open={modalState.type === ModalType.EDIT}
            book={modalState.book}
            onClose={closeModal}
            onSuccess={closeModal}
          />
          <ArchiveBookModal
            open={modalState.type === ModalType.ARCHIVE}
            book={modalState.book}
            onClose={closeModal}
            onSuccess={closeModal}
          />
        </>
      )}
    </div>
  );
}
