"use client";

import { Card, Progress, Typography, theme, Divider } from "antd";
import { BookApiEntity } from "@/app/api/books/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

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

  const createdAt = dayjs(book.datetimeCreated).fromNow();

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
        <Text type="secondary" ellipsis style={{ display: "block", fontSize: 12, marginBottom: token.marginSM }}>
          {book.authorName || "Unknown Author"}
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Added {createdAt}
        </Text>
      </div>

      <Divider style={{ margin: `${token.marginSM}px 0` }} />

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
          <Text strong style={{ fontSize: 12 }}>
            {book.currentPage || 0} / {book.totalPages || "?"} pages
          </Text>
        </div>
        <Progress
          percent={progress}
          size={["100%", 6]}
          showInfo={false}
        />
        <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 4 }}>
          {progress}% complete
        </Text>
      </div>
    </Card>
  );
}
