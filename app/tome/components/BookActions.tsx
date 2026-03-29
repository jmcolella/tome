"use client";

import { useState } from "react";
import { Button, Dropdown, MenuProps, message } from "antd";
import {
  DeleteOutlined,
  PlayCircleOutlined,
  BookOutlined,
  EyeOutlined,
  DownOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { BookApiEntity } from "@/app/api/books/types";
import ArchiveBookModal from "@/app/tome/components/ArchiveBookModal";
import StartBookModal from "@/app/tome/components/StartBookModal";
import UpdateProgressModal from "@/app/tome/components/UpdateProgressModal";
import CompleteBookModal from "@/app/tome/components/CompleteBookModal";
import useUncompleteBook from "@/app/tome/hooks/books/useUncompleteBook";

enum ModalType {
  ARCHIVE = "ARCHIVE",
  START = "START",
  PROGRESS = "PROGRESS",
  COMPLETE = "COMPLETE",
}

interface BookActionsProps {
  book: BookApiEntity;
  onViewDetails?: () => void;
}

export default function BookActions({ book, onViewDetails }: BookActionsProps) {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const uncompleteBook = useUncompleteBook();

  const openModal = (modalName: ModalType) => {
    setActiveModal(modalName);
  };

  const closeModal = (modalName: ModalType) => {
    if (activeModal === modalName) {
      setActiveModal(null);
    }
  };

  const handleUncomplete = async () => {
    try {
      await uncompleteBook.mutateAsync({ bookId: book.sid });
      message.success("Book moved back to reading");
    } catch {
      message.error("Failed to resume reading");
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "view",
      label: "View Details",
      icon: <EyeOutlined />,
      onClick: onViewDetails,
    },
    ...(book.status === "WANT_TO_READ"
      ? [
          {
            key: "start",
            label: "Start Reading",
            icon: <PlayCircleOutlined />,
            onClick: () => openModal(ModalType.START),
          },
        ]
      : []),
    ...(book.status === "READING"
      ? [
          {
            key: "progress",
            label: "Update Progress",
            icon: <BookOutlined />,
            onClick: () => openModal(ModalType.PROGRESS),
          },
          {
            key: "complete",
            label: "Mark as Complete",
            icon: <CheckCircleOutlined />,
            onClick: () => openModal(ModalType.COMPLETE),
          },
        ]
      : []),
    ...(book.status === "READ"
      ? [
          {
            key: "uncomplete",
            label: "Resume Reading",
            icon: <ReloadOutlined />,
            onClick: handleUncomplete,
          },
        ]
      : []),
    {
      type: "divider",
    },
    {
      key: "archive",
      label: "Archive",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => openModal(ModalType.ARCHIVE),
    },
  ];

  return (
    <>
      <Dropdown menu={{ items }} trigger={["click"]}>
        <Button type="text">
          Manage <DownOutlined />
        </Button>
      </Dropdown>
      <ArchiveBookModal
        open={activeModal === ModalType.ARCHIVE}
        book={book}
        onClose={() => closeModal(ModalType.ARCHIVE)}
        onSuccess={() => closeModal(ModalType.ARCHIVE)}
      />
      <StartBookModal
        open={activeModal === ModalType.START}
        book={book}
        onClose={() => closeModal(ModalType.START)}
        onSuccess={() => closeModal(ModalType.START)}
      />
      <UpdateProgressModal
        open={activeModal === ModalType.PROGRESS}
        book={book}
        onClose={() => closeModal(ModalType.PROGRESS)}
        onSuccess={() => closeModal(ModalType.PROGRESS)}
      />
      <CompleteBookModal
        open={activeModal === ModalType.COMPLETE}
        book={book}
        onClose={() => closeModal(ModalType.COMPLETE)}
        onSuccess={() => closeModal(ModalType.COMPLETE)}
      />
    </>
  );
}
