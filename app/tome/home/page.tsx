"use client";

import { Spin, theme, Typography } from "antd";
import { redirect } from "next/navigation";
import BookList from "@/app/tome/components/BookList";
import GoalList from "@/app/tome/components/GoalList";
import useGetUser from "@/app/tome/hooks/user/useGetUser";
import { ROUTE_WELCOME } from "@/app/tome/routes";

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
    <div style={{ padding: token.paddingXL }}>
      <div style={{ textAlign: "center", marginBottom: token.marginXL }}>
        <Typography.Title level={2}>Welcome back!</Typography.Title>
        <Typography.Title level={4} type="secondary">
          Logged in as: {user.email}
        </Typography.Title>
      </div>
      <BookList />
      <div style={{ marginTop: token.marginXXL }}>
        <GoalList />
      </div>
    </div>
  );
}
