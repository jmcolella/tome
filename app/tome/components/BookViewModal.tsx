"use client";

import { useState } from "react";
import {
  Modal,
  Table,
  Tag,
  Alert,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Card,
  Progress,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import {
  BookApiEntity,
  BookEventApiEntity,
  BookEventApiOrderBy,
} from "@/app/api/books/types";
import { BookEventType } from "@/app/server/books/types";
import useGetBookEvents from "@/app/tome/hooks/books/useGetBookEvents";
import { useBookMetrics } from "@/app/tome/hooks/books/useBookMetrics";
import { formatDate } from "@/app/tome/utils/dateUtils";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement
);

interface BookViewModalProps {
  open: boolean;
  book: BookApiEntity;
  onClose: () => void;
}

function getEventTypeColor(eventType: BookEventType): string {
  switch (eventType) {
    case BookEventType.ADD_TO_LIBRARY:
      return "blue";
    case BookEventType.STARTED:
      return "green";
    case BookEventType.PROGRESS:
      return "orange";
    case BookEventType.COMPLETED:
      return "purple";
    case BookEventType.ARCHIVED:
      return "red";
    default:
      return "default";
  }
}

export default function BookViewModal({
  open,
  book,
  onClose,
}: BookViewModalProps) {
  const [sortOrder, setSortOrder] = useState<BookEventApiOrderBy>("desc");
  const [showHistory, setShowHistory] = useState(false);
  const { events, isLoading, error } = useGetBookEvents(book.sid, sortOrder);
  const metrics = useBookMetrics(events, book);
  const { token } = theme.useToken();

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const columns: ColumnsType<BookEventApiEntity> = [
    {
      title: (
        <Space>
          Date Effective
          <Button
            type="text"
            size="small"
            icon={sortOrder === "asc" ? <UpOutlined /> : <DownOutlined />}
            onClick={toggleSort}
            style={{ padding: 0, height: "auto" }}
          />
        </Space>
      ),
      dataIndex: "dateEffective",
      key: "dateEffective",
      render: (date: Date) => formatDate(date, "MMM DD, YYYY"),
    },
    {
      title: "Event Type",
      dataIndex: "eventType",
      key: "eventType",
      render: (eventType: BookEventType) => (
        <Tag color={getEventTypeColor(eventType)}>{eventType}</Tag>
      ),
    },
    {
      title: "Current Page",
      dataIndex: "pageNumber",
      key: "pageNumber",
      render: (pageNumber: number | null) => pageNumber ?? "N/A",
    },
  ];

  return (
    <Modal
      title={book.title}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {error && (
        <Alert
          title={error.message}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card style={{ marginBottom: token.marginLG }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic title="Author" value={book.authorName ?? "N/A"} />
          </Col>
          <Col span={12}>
            <Statistic
              title="Total Pages"
              value={book.totalPages || "N/A"}
            />
          </Col>
        </Row>
      </Card>

      {metrics && (
        <>
          <Card title="Progress" style={{ marginBottom: token.marginLG }}>
            <Row gutter={[16, 16]} style={{ marginBottom: token.marginLG }}>
              <Col span={8}>
                <Progress
                  type="circle"
                  percent={metrics.percentComplete}
                  size={100}
                  strokeColor={token.colorSuccess}
                  railColor={
                    metrics.isCompleted
                      ? token.colorSuccess
                      : token.colorTextDescription
                  }
                  format={(percent) => `${percent}%`}
                />
              </Col>
              <Col span={8}>
                <Statistic title="Current Page" value={metrics.currentPage} />
              </Col>
              <Col span={8}>
                {metrics.isCompleted ? (
                  <Statistic title="Status" value="Completed" />
                ) : metrics.estimatedCompletion ? (
                  <Statistic
                    title="Est. Completion"
                    value={metrics.estimatedCompletion.format("MMM DD, YYYY")}
                  />
                ) : (
                  <Statistic title="Est. Completion" value="N/A" />
                )}
              </Col>
            </Row>

          </Card>
          <Card
            style={{ marginBottom: token.marginLG }}
            size="small"
            title="Reading Metrics"
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Total Days"
                  value={metrics.totalDays}
                  suffix="days"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Avg Pages/Day"
                  value={metrics.avgPagesPerDay}
                  precision={1}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Best Period Avg"
                  value={metrics.bestPeriod.avg}
                  precision={1}
                />
                {metrics.bestPeriod.start && metrics.bestPeriod.end && (
                  <div
                    style={{
                      fontSize: token.fontSizeSM,
                      color: token.colorTextSecondary,
                    }}
                  >
                    {formatDate(metrics.bestPeriod.start, "MMM DD")} -{" "}
                    {formatDate(metrics.bestPeriod.end, "MMM DD")}
                  </div>
                )}
              </Col>
            </Row>
          </Card>

          <Line
              data={{
                labels: metrics.progressEvents.map((event) =>
                  formatDate(event.dateEffective, "MMM DD")
                ),
                datasets: [
                  {
                    label: "Pages Read",
                    data: metrics.progressEvents.map((event) => event.pageNumber),
                    borderColor: token.colorPrimary,
                    backgroundColor: `${token.colorPrimary}20`,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: token.colorPrimary,
                  },
                ],
              }}
              options={{
                responsive: true,
                interaction: {
                  mode: "index",
                  intersect: false,
                },
                plugins: {
                  legend: {
                    display: true,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Current page: ${context.parsed.y}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: book.totalPages || undefined,
                  },
                },
              }}
              plugins={[
                {
                  id: "targetLine",
                  afterDatasetsDraw(chart) {
                    const { ctx, chartArea, scales } = chart;
                    const totalPages = book.totalPages;

                    if (!totalPages || !chartArea) return;

                    const yScale = scales.y;
                    const yPixel = yScale.getPixelForValue(totalPages);

                    // Draw line
                    ctx.save();
                    ctx.strokeStyle = token.colorSuccess;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    ctx.moveTo(chartArea.left, yPixel);
                    ctx.lineTo(chartArea.right, yPixel);
                    ctx.stroke();
                    ctx.restore();

                    // Draw label
                    ctx.save();
                    ctx.fillStyle = token.colorSuccess;
                    ctx.font = `bold 12px ${
                      window.getComputedStyle(document.body).fontFamily
                    }`;
                    ctx.textAlign = "right";
                    ctx.fillText(
                      "Total Pages",
                      chartArea.left + 70,
                      yPixel + 20
                    );
                    ctx.restore();
                  },
                },
              ]}
            />
        </>
      )}

      <div style={{ marginBottom: 16 }}>
        <Button
          type="link"
          onClick={() => setShowHistory(!showHistory)}
          icon={showHistory ? <UpOutlined /> : <DownOutlined />}
          style={{ padding: 0 }}
        >
          {showHistory ? "Hide Event History" : "Show Event History"}
        </Button>
      </div>

      {showHistory && (
        <Table
          columns={columns}
          dataSource={events || []}
          rowKey={(record) => record.sid}
          loading={isLoading}
          pagination={false}
        />
      )}
    </Modal>
  );
}
