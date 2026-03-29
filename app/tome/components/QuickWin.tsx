"use client";

import { Card, Typography, theme, Space } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { BookStatus } from "@/app/server/books/types";
import useGetBooks from "@/app/tome/hooks/books/useGetBooks";
import useGetGoals from "@/app/tome/hooks/goals/useGetGoals";
import dayjs from "dayjs";

const { Text } = Typography;

function isGoalActive(startDate: Date, endDate: Date): boolean {
  const now = dayjs();
  const localStartDate = dayjs(startDate);
  const localEndDate = dayjs(endDate);
  return now.isAfter(localStartDate) && now.isBefore(localEndDate);
}

export default function QuickWin() {
  const { books } = useGetBooks();
  const { goals } = useGetGoals();
  const { token } = theme.useToken();

  if (!books || !goals) return null;

  const activeGoals = goals.filter((goal) =>
    isGoalActive(goal.startDate, goal.endDate)
  );

  const hasActiveGoals = activeGoals.length > 0;
  const hasReadingBooks = books.some(
    (book) => book.status === BookStatus.READING
  );

  return (
    <Card
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: token.borderRadius,
        marginBottom: token.marginXL,
      }}
      bodyStyle={{ padding: token.paddingMD }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {hasActiveGoals && (
          <Space>
            <CheckCircleOutlined style={{ color: "#2FBF71" }} />
            <Text style={{ color: "white" }}>
              You have {activeGoals.length} active{" "}
              {activeGoals.length === 1 ? "goal" : "goals"} • On track!
            </Text>
          </Space>
        )}
        {hasReadingBooks && (
          <Space>
            <CheckCircleOutlined style={{ color: "#2FBF71" }} />
            <Text style={{ color: "white" }}>
              {books.filter((b) => b.status === BookStatus.READING).length}{" "}
              {books.filter((b) => b.status === BookStatus.READING).length === 1
                ? "book"
                : "books"}{" "}
              in progress • Keep reading!
            </Text>
          </Space>
        )}
      </Space>
    </Card>
  );
}
