"use client";

import { useState } from "react";
import { Typography, Alert, Button, Spin, theme } from "antd";
import { BookApiEntity } from "@/app/api/books/types";
import { BookStatus } from "@/app/server/books/types";
import AddBookModal from "@/app/tome/components/AddBookModal";
import BookCard from "@/app/tome/components/BookCard";
import BookViewModal from "@/app/tome/components/BookViewModal";
import useGetBooks from "@/app/tome/hooks/books/useGetBooks";

const { Title, Text } = Typography;

enum ModalType {
  ADD = "ADD",
  BOOK_VIEW = "BOOK_VIEW",
}

export default function BookList() {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookApiEntity | null>(null);
  const { books, isLoading, error } = useGetBooks();
  const { token } = theme.useToken();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error || !books) {
    return (
      <Alert
        title="Error loading books"
        description={error?.message || "An error occurred"}
        type="error"
        showIcon
      />
    );
  }

  const openModal = (modalName: ModalType) => {
    setActiveModal(modalName);
  };

  const closeModal = (modalName: ModalType) => {
    if (activeModal === modalName) {
      setActiveModal(null);
      if (modalName === ModalType.BOOK_VIEW) {
        setSelectedBook(null);
      }
    }
  };

  const handleBookClick = (book: BookApiEntity) => {
    setSelectedBook(book);
    setActiveModal(ModalType.BOOK_VIEW);
  };

  const readingBooks = books.filter(
    (book) => book.status === BookStatus.READING
  );
  const displayedBooks = readingBooks.slice(0, 6);

  return (
    <div
      style={{
        backgroundColor: "white",
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
        padding: token.paddingLG,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: token.marginMD,
        }}
      >
        <Title level={3} style={{ margin: 0, color: token.colorPrimary }}>
          Currently Reading
        </Title>
        <Button type="primary" onClick={() => openModal(ModalType.ADD)}>
          Add Book
        </Button>
      </div>

      {displayedBooks.length === 0 ? (
        <Text type="secondary">No books in progress</Text>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: token.marginMD,
            marginBottom: token.marginMD,
          }}
        >
          {displayedBooks.map((book) => (
            <BookCard
              key={book.sid}
              book={book}
              onClick={() => handleBookClick(book)}
            />
          ))}
        </div>
      )}

      {readingBooks.length > 6 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          <a href="#">See more books</a>
        </Text>
      )}

      <AddBookModal
        open={activeModal === ModalType.ADD}
        onClose={() => closeModal(ModalType.ADD)}
        onSuccess={() => closeModal(ModalType.ADD)}
      />
      {selectedBook && (
        <BookViewModal
          open={activeModal === ModalType.BOOK_VIEW}
          book={selectedBook}
          onClose={() => closeModal(ModalType.BOOK_VIEW)}
        />
      )}
    </div>
  );
}
