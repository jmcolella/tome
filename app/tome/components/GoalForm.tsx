"use client";

import { Input, Button, Select, DatePicker, Typography } from "antd";
import { useForm } from "@tanstack/react-form";
import { AddGoalApiInput } from "@/app/api/goals/types";
import { GoalType } from "@/app/server/goals/types";
import useAddGoal from "@/app/tome/hooks/goals/useAddGoal";
import type { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface GoalFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface GoalFormValues {
  name: string;
  goalType: GoalType | undefined;
  targetValue: string;
  dateRange: [Dayjs, Dayjs] | undefined;
}

const defaultFormValues: GoalFormValues = {
  name: "",
  goalType: undefined,
  targetValue: "",
  dateRange: undefined,
};

export default function GoalForm({ onSuccess, onError }: GoalFormProps) {
  const addGoalMutation = useAddGoal();

  const form = useForm({
    defaultValues: defaultFormValues,
    onSubmit: async ({ value }) => {
      if (!value.goalType || !value.dateRange) {
        onError?.("All fields are required");
        return;
      }

      const payload: AddGoalApiInput = {
        name: value.name,
        goalType: value.goalType,
        targetValue: Number(value.targetValue),
        startDate: value.dateRange[0].format("YYYY-MM-DD"),
        endDate: value.dateRange[1].format("YYYY-MM-DD"),
      };

      try {
        const result = await addGoalMutation.mutateAsync(payload);

        if (result.error) {
          onError?.(result.error);
        } else {
          form.reset();
          onSuccess?.();
        }
      } catch (error) {
        onError?.(
          error instanceof Error ? error.message : "Failed to add goal"
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
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) =>
            !value ? "Please enter a goal name" : undefined,
        }}
      >
        {(field) => (
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor={field.name}
              style={{ display: "block", marginBottom: 8 }}
            >
              Goal Name
            </label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="e.g., Read 1000 pages this month"
              status={field.state.meta.errors.length > 0 ? "error" : undefined}
            />
            {field.state.meta.errors.length > 0 && (
              <Text type="danger" style={{ marginTop: 4 }}>
                {field.state.meta.errors[0]}
              </Text>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="goalType"
        validators={{
          onChange: ({ value }) =>
            !value ? "Please select a goal type" : undefined,
        }}
      >
        {(field) => (
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor={field.name}
              style={{ display: "block", marginBottom: 8 }}
            >
              Goal Type
            </label>
            <Select
              id={field.name}
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              onBlur={field.handleBlur}
              placeholder="Select goal type"
              style={{ width: "100%" }}
              status={field.state.meta.errors.length > 0 ? "error" : undefined}
              options={[
                { label: "Pages Read", value: GoalType.PAGES },
                { label: "Books Completed", value: GoalType.BOOKS },
              ]}
            />
            {field.state.meta.errors.length > 0 && (
              <Text type="danger" style={{ marginTop: 4 }}>
                {field.state.meta.errors[0]}
              </Text>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="targetValue"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return "Please enter a target value";
            }
            const numValue = Number(value);
            if (isNaN(numValue) || numValue <= 0) {
              return "Target value must be greater than 0";
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
              Target Value
            </label>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Enter target value"
              status={field.state.meta.errors.length > 0 ? "error" : undefined}
            />
            {field.state.meta.errors.length > 0 && (
              <Text type="danger" style={{ marginTop: 4 }}>
                {field.state.meta.errors[0]}
              </Text>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="dateRange"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return "Please select a date range";
            }
            if (value[1].isBefore(value[0]) || value[1].isSame(value[0])) {
              return "End date must be after start date";
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
              Date Range
            </label>
            <RangePicker
              id={field.name}
              value={field.state.value}
              onChange={(dates) => field.handleChange(dates as [Dayjs, Dayjs])}
              onBlur={field.handleBlur}
              style={{ width: "100%" }}
              status={field.state.meta.errors.length > 0 ? "error" : undefined}
            />
            {field.state.meta.errors.length > 0 && (
              <Text type="danger" style={{ marginTop: 4 }}>
                {field.state.meta.errors[0]}
              </Text>
            )}
          </div>
        )}
      </form.Field>

      <Button
        type="primary"
        htmlType="submit"
        block
        loading={form.state.isSubmitting || addGoalMutation.isPending}
      >
        Create Goal
      </Button>
    </form>
  );
}
