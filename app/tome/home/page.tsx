"use client";

import { Spin, Typography, theme } from "antd";
import { redirect } from "next/navigation";
import BookList from "@/app/tome/components/BookList";
import GoalList from "@/app/tome/components/GoalList";
import useGetUser from "@/app/tome/hooks/user/useGetUser";
import { ROUTE_WELCOME } from "@/app/tome/routes";

const { Title, Text } = Typography;

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
        <Title level={2} style={{ margin: 0, color: "white" }}>
          Your reading journey, one <Text style={{ fontSize: "inherit", fontStyle: "italic", color: token.colorLinkHover }}>metric</Text> at a time
        </Title>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          width: "100%",
        }}
      >
        <GoalList />
        <BookList />
      </div>
    </div>
  );
}
