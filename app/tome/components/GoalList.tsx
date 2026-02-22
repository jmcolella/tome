"use client";

import { useState } from "react";
import { Typography, Alert, Button, Spin, theme } from "antd";
import AddGoalModal from "@/app/tome/components/AddGoalModal";
import GoalCard from "@/app/tome/components/GoalCard";
import useGetGoals from "@/app/tome/hooks/goals/useGetGoals";
import dayjs from "dayjs";

const { Title, Text } = Typography;

enum ModalType {
  ADD = "ADD",
}

function isGoalActive(startDate: Date, endDate: Date): boolean {
  const now = dayjs();
  const localStartDate = dayjs(startDate);
  const localEndDate = dayjs(endDate);
  return now.isAfter(localStartDate) && now.isBefore(localEndDate);
}

export default function GoalList() {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const { goals, isLoading, error } = useGetGoals();
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

  const activeGoals = goals.filter((goal) =>
    isGoalActive(goal.startDate, goal.endDate)
  );
  const displayedGoals = activeGoals.slice(0, 4);

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
          Goals
        </Title>
        <Button type="primary" onClick={() => openModal(ModalType.ADD)}>
          Add Goal
        </Button>
      </div>

      {displayedGoals.length === 0 ? (
        <Text type="secondary">No active goals yet</Text>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: token.marginMD,
            marginBottom: token.marginMD,
          }}
        >
          {displayedGoals.map((goal) => (
            <GoalCard key={goal.sid} goal={goal} />
          ))}
        </div>
      )}

      {goals.length > 4 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          <a href="#">See more goals</a>
        </Text>
      )}

      <AddGoalModal
        open={activeModal === ModalType.ADD}
        onClose={() => closeModal(ModalType.ADD)}
        onSuccess={() => closeModal(ModalType.ADD)}
      />
    </div>
  );
}
