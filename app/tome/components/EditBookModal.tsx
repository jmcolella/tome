"use client";

import { Modal } from "antd";
import { BookApiEntity } from "@/app/api/books/types";
import EditBookForm from "@/app/tome/components/EditBookForm";

interface EditBookModalProps {
  open: boolean;
  book: BookApiEntity;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBookModal({
  open,
  book,
  onClose,
  onSuccess,
}: EditBookModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Modal
      title="Edit Book"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <EditBookForm book={book} onSuccess={handleSuccess} />
    </Modal>
  );
}
