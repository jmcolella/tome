"use client";

import { Input, Button, Alert } from "antd";
import { useForm } from "@tanstack/react-form";
import { EditBookApiInput, BookApiEntity } from "@/app/api/books/types";
import useEditBook from "@/app/tome/hooks/books/useEditBook";
import { useState } from "react";

interface EditBookFormProps {
  book: BookApiEntity;
  onSuccess?: () => void;
}

export default function EditBookForm({ book, onSuccess }: EditBookFormProps) {
  const editBookMutation = useEditBook();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      title: book.title,
      author: book.authorName || "",
      totalPages: book.totalPages?.toString() || "",
    },
    onSubmit: async ({ value }) => {
      setError(null);

      const payload: EditBookApiInput = {};

      // Only include fields that have changed
      if (value.title !== book.title) {
        payload.title = value.title;
      }
      if (value.author !== (book.authorName || "")) {
        payload.author = value.author;
      }
      if (value.totalPages !== book.totalPages?.toString()) {
        payload.totalPages = Number(value.totalPages);
      }

      // Check if any fields changed
      if (Object.keys(payload).length === 0) {
        setError("No changes detected");
        return;
      }

      try {
        const result = await editBookMutation.mutateAsync({
          bookId: book.sid,
          updates: payload,
        });

        if (result.error) {
          setError(result.error);
        } else {
          onSuccess?.();
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to edit book"
        );
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <form.Field
        name="title"
        validators={{
          onChange: ({ value }) =>
            !value ? "Please enter a book title" : undefined,
        }}
      >
        {(field) => (
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor={field.name}
              style={{ display: "block", marginBottom: 8 }}
            >
              Book Title
            </label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Enter book title"
              status={field.state.meta.errors.length > 0 ? "error" : undefined}
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
        name="author"
        validators={{
          onChange: ({ value }) => {
            return !value ? "Please enter an author name" : undefined;
          },
        }}
      >
        {(field) => (
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor={field.name}
              style={{ display: "block", marginBottom: 8 }}
            >
              Author Name
            </label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Enter author name"
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
        name="totalPages"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return "Please enter total pages";
            }
            const numValue = Number(value);
            if (isNaN(numValue) || numValue <= 0) {
              return "Total pages must be greater than 0";
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
              Total Pages
            </label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Enter total pages"
              status={field.state.meta.errors.length > 0 ? "error" : undefined}
            />
            {field.state.meta.errors.length > 0 && (
              <div style={{ color: "#ff4d4f", marginTop: 4, fontSize: 14 }}>
                {field.state.meta.errors[0]}
              </div>
            )}
          </div>
        )}
      </form.Field>

      <Button
        type="primary"
        htmlType="submit"
        block
        loading={form.state.isSubmitting || editBookMutation.isPending}
      >
        Save Changes
      </Button>
    </form>
  );
}
