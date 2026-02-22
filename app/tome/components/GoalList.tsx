"use client";

import { useState } from "react";
import { Table, Typography, Tag, Alert, Button, Spin } from "antd";
import type { ColumnsType } from "antd/es/table";
import { GoalApiEntity } from "@/app/api/goals/types";
import { GoalType } from "@/app/server/goals/types";
import AddGoalModal from "@/app/tome/components/AddGoalModal";
import useGetGoals from "@/app/tome/hooks/goals/useGetGoals";
import { formatDate } from "@/app/tome/utils/dateUtils";
import dayjs from "dayjs";

const { Title } = Typography;

enum ModalType {
  ADD = "ADD",
}

function getGoalTypeLabel(type: GoalType): string {
  return type === GoalType.PAGES ? "Pages" : "Books";
}

function isGoalActive(startDate: Date, endDate: Date): boolean {
  const now = dayjs();
  const localStartDate = dayjs(startDate);
  const localEndDate = dayjs(endDate);
  return now.isAfter(localStartDate) && now.isBefore(localEndDate);
}

const columns: ColumnsType<GoalApiEntity> = [
  {
    title: "Goal Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Type",
    dataIndex: "goalType",
    key: "goalType",
    render: (type: GoalType) => getGoalTypeLabel(type),
  },
  {
    title: "Target",
    dataIndex: "targetValue",
    key: "targetValue",
    render: (value: number, record: GoalApiEntity) =>
      `${value} ${getGoalTypeLabel(record.goalType)}`,
  },
  {
    title: "Start Date",
    dataIndex: "startDate",
    key: "startDate",
    render: (date: Date) => formatDate(date),
  },
  {
    title: "End Date",
    dataIndex: "endDate",
    key: "endDate",
    render: (date: Date) => formatDate(date),
  },
  {
    title: "Status",
    key: "status",
    render: (_: unknown, record: GoalApiEntity) => {
      const active = isGoalActive(record.startDate, record.endDate);
      return (
        <Tag color={active ? "success" : "default"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      );
    },
  },
];

export default function GoalList() {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const { goals, isLoading, error } = useGetGoals();

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

  if (error || !goals) {
    return (
      <Alert
        title="Error loading goals"
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
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Your Goals
        </Title>
        <Button type="primary" onClick={() => openModal(ModalType.ADD)}>
          Add Goal
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={goals}
        rowKey="sid"
        loading={isLoading}
      />
      <AddGoalModal
        open={activeModal === ModalType.ADD}
        onClose={() => closeModal(ModalType.ADD)}
        onSuccess={() => closeModal(ModalType.ADD)}
      />
    </div>
  );
}
