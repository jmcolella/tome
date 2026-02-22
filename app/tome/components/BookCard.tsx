"use client";

import { Card, Progress, Typography, theme } from "antd";
import { BookApiEntity } from "@/app/api/books/types";

const { Text } = Typography;

interface BookCardProps {
  book: BookApiEntity;
  onClick?: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  const { token } = theme.useToken();

  const progress =
    book.totalPages && book.currentPage !== null
      ? Math.round((book.currentPage / book.totalPages) * 100)
      : 0;

  return (
    <Card
      style={{
        cursor: onClick ? "pointer" : "default",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgContainer,
      }}
      hoverable={!!onClick}
      onClick={onClick}
      bodyStyle={{ padding: token.paddingMD, flex: 1, display: "flex", flexDirection: "column" }}
    >
      <div style={{ flex: 1, marginBottom: token.marginMD }}>
        <Text strong ellipsis style={{ display: "block", marginBottom: token.marginSM, fontSize: 14 }}>
          {book.title}
        </Text>
        <Text type="secondary" ellipsis style={{ display: "block", fontSize: 12 }}>
          {book.authorName || "Unknown Author"}
        </Text>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: token.marginSM,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Progress
          </Text>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
            {progress}%
          </Text>
        </div>
        <Progress
          percent={progress}
          size={["100%", 6]}
          showInfo={false}
        />
      </div>
    </Card>
  );
}
