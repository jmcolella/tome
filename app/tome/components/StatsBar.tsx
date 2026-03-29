"use client";

import { Row, Col, Card, Typography, theme } from "antd";
import { BookStatus } from "@/app/server/books/types";
import useGetBooks from "@/app/tome/hooks/books/useGetBooks";
import dayjs from "dayjs";

const { Text } = Typography;

interface StatCardProps {
  emoji: string;
  value: number;
  label: string;
}

function StatCard({ emoji, value, label }: StatCardProps) {
  const { token } = theme.useToken();

  return (
    <Card
      style={{
        flex: 1,
        height: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        borderRadius: token.borderRadius,
        padding: token.paddingSM,
      }}
      bodyStyle={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{emoji}</span>
        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 24 }}>
          {label}
        </Text>
      </div>
      <Text strong style={{ color: "white", fontSize: 28, textAlign: "center" }}>
        {value}
      </Text>
    </Card>
  );
}

export default function StatsBar() {
  const { books } = useGetBooks();
  const { token } = theme.useToken();

  if (!books) return null;

  const booksReading = books.filter(
    (book) => book.status === BookStatus.READING
  ).length;

  const booksCompletedThisMonth = books.filter((book) => {
    if (book.status !== BookStatus.READ) return false;
    const bookDate = dayjs(book.datetimeCreated);
    const now = dayjs();
    return bookDate.isSame(now, "month");
  }).length;

  const pagesThisWeek = books
    .reduce((total, book) => {
      return total + (book.currentPage || 0);
    }, 0);

  return (
    <Row
      gutter={[24, 0]}
      justify="center"
      style={{ marginBottom: token.marginXL }}
    >
      <Col>
        <StatCard emoji="📖" value={booksReading} label="Reading" />
      </Col>
      <Col>
        <StatCard emoji="✅" value={booksCompletedThisMonth} label="Finished" />
      </Col>
      <Col>
        <StatCard emoji="📄" value={pagesThisWeek} label="Pages" />
      </Col>
    </Row>
  );
}
