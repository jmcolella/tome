"use client";

import { Spin, theme, Typography } from "antd";
import { redirect } from "next/navigation";
import BookList from "@/app/tome/components/BookList";
import GoalList from "@/app/tome/components/GoalList";
import StatsBar from "@/app/tome/components/StatsBar";
import useGetUser from "@/app/tome/hooks/user/useGetUser";
import { ROUTE_WELCOME } from "@/app/tome/routes";
import dayjs from "dayjs";

const { Title } = Typography;

function getTimeBasedGreeting(): string {
  const hour = dayjs().hour();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeClient() {
  const { user, isLoading } = useGetUser();
  const { token } = theme.useToken();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return redirect(ROUTE_WELCOME);
  }

  const greeting = getTimeBasedGreeting();
  const userName = user.email.split("@")[0];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        backgroundColor: "transparent",
        flexGrow: 1,
      }}
    >
      <div style={{ marginBottom: token.marginXL, textAlign: "center" }}>
        <Title level={3} style={{ margin: 0, color: "rgba(255, 255, 255, 0.85)" }}>
          {greeting}, {userName}
        </Title>
      </div>

      <div style={{ width: "100%", maxWidth: 1200, paddingLeft: token.paddingLG, paddingRight: token.paddingLG, marginBottom: token.marginXL }}>
        <StatsBar />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          width: "100%",
          paddingLeft: token.paddingLG,
          paddingRight: token.paddingLG,
        }}
      >
        <GoalList />
        <BookList />
      </div>
    </div>
  );
}
