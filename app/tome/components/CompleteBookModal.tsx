"use client";

import { Modal, Button, Space, DatePicker, Input, Alert } from "antd";
import { useForm } from "@tanstack/react-form";
import dayjs, { Dayjs } from "dayjs";
import useCompleteBook from "@/app/tome/hooks/books/useCompleteBook";
import { BookApiEntity } from "@/app/api/books/types";

interface CompleteBookModalProps {
  open: boolean;
  book: BookApiEntity;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompleteBookModal({
  open,
  book,
  onClose,
  onSuccess,
}: CompleteBookModalProps) {
  const completeBook = useCompleteBook();

  // Default finalPage: use totalPages if available, otherwise currentPage
  const defaultFinalPage = book.totalPages?.toString() || book.currentPage?.toString() || "";

  const form = useForm({
    defaultValues: {
      dateEffective: dayjs().format("YYYY-MM-DD"),
      finalPage: defaultFinalPage,
    },
    onSubmit: async ({ value }) => {
      try {
        await completeBook.mutateAsync({
          bookId: book.sid,
          dateEffective: value.dateEffective,
          finalPage: value.finalPage ? Number(value.finalPage) : undefined,
        });
        onSuccess();
        onClose();
        form.reset();
      } catch (error) {
        console.error("Error completing book:", error);
      }
    },
  });

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal title="Mark Book as Complete" open={open} onCancel={handleCancel} footer={null}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {completeBook.error && (
          <Alert
            message={completeBook.error.message}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <form.Field
          name="dateEffective"
          validators={{
            onChange: ({ value }) =>
              !value ? "Please select a date" : undefined,
          }}
        >
          {(field) => (
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor={field.name}
                style={{ display: "block", marginBottom: 8 }}
              >
                Completion Date
              </label>
              <DatePicker
                id={field.name}
                style={{ width: "100%" }}
                value={field.state.value ? dayjs(field.state.value) : null}
                onChange={(date: Dayjs | null) => {
                  field.handleChange(date ? date.format("YYYY-MM-DD") : "");
                }}
                onBlur={field.handleBlur}
                status={
                  field.state.meta.errors.length > 0 ? "error" : undefined
                }
              />
              {field.state.meta.errors.length > 0 && (
                <div style={{ color: "#ff4d4f", marginTop: 4, fontSize: 14 }}>
                  {field.state.meta.errors[0]}
                </div>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="finalPage"
          validators={{
            onChange: ({ value }) => {
              if (!value) {
                return undefined; // Optional field
              }
              const numValue = Number(value);
              if (isNaN(numValue) || numValue < 0) {
                return "Final page must be 0 or greater";
              }
              if (book.totalPages && numValue > book.totalPages) {
                return `Final page cannot exceed total pages (${book.totalPages})`;
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor={field.name}
                style={{ display: "block", marginBottom: 8 }}
              >
                Final Page (optional)
              </label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Enter final page"
                status={
                  field.state.meta.errors.length > 0 ? "error" : undefined
                }
              />
              {field.state.meta.errors.length > 0 && (
                <div style={{ color: "#ff4d4f", marginTop: 4, fontSize: 14 }}>
                  {field.state.meta.errors[0]}
                </div>
              )}
            </div>
          )}
        </form.Field>

        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}
        >
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={form.state.isSubmitting || completeBook.isPending}
            >
              Mark as Complete
            </Button>
          </Space>
        </div>
      </form>
    </Modal>
  );
}
