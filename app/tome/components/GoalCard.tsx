"use client";

import { Card, Tag, Progress, Typography, theme } from "antd";
import { GoalApiEntity } from "@/app/api/goals/types";
import { GoalType } from "@/app/server/goals/types";
import { formatDate } from "@/app/tome/utils/dateUtils";
import dayjs from "dayjs";

const { Text } = Typography;

interface GoalCardProps {
  goal: GoalApiEntity;
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

export default function GoalCard({ goal }: GoalCardProps) {
  const { token } = theme.useToken();
  const active = isGoalActive(goal.startDate, goal.endDate);

  const dateRangeLabel = `${formatDate(goal.startDate, "MM/DD/YYYY")} - ${formatDate(goal.endDate, "MM/DD/YYYY")}`;

  return (
    <Card
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
      }}
      bodyStyle={{ padding: token.paddingMD }}
    >
      <div style={{ marginBottom: token.marginMD }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: token.marginSM,
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            {goal.name}
          </Text>
          <Tag color={active ? "success" : "default"}>
            {active ? "Active" : "Inactive"}
          </Tag>
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {dateRangeLabel}
        </Text>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: token.marginMD,
        }}
      >
        <Text>Target:</Text>
        <Tag color="default">
          {goal.targetValue} {getGoalTypeLabel(goal.goalType)}
        </Tag>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Progress
          </Text>
          <Progress percent={0} size={["200px", 8]} style={{ marginTop: 4 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            On track
          </Text>
        </div>
        <Progress type="circle" percent={0} width={60} strokeColor={token.colorPrimary} />
      </div>
    </Card>
  );
}
