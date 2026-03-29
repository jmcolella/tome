"use client";

import { theme, Layout, Typography } from "antd";
import UserAvatar from "@/app/tome/components/UserAvatar";
import Link from "next/link";
import useGetUser from "@/app/tome/hooks/user/useGetUser";
import { ROUTE_HOME } from "@/app/tome/routes";

const { Text } = Typography;

export default function TombLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { token } = theme.useToken();
  const { user, isLoading } = useGetUser();

  return (
    <Layout style={{ height: "100vh", backgroundColor: "transparent", display: "flex", flexDirection: "column" }}>
      <Layout.Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
      >
        <Link href={ROUTE_HOME}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            tome
          </Typography.Title>
        </Link>
        {!isLoading && user && <UserAvatar />}
      </Layout.Header>
      <Layout.Content style={{ padding: token.paddingLG, flex: 1 }}>
        {children}
      </Layout.Content>
      <Layout.Footer
        style={{
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorder}`,
          padding: token.paddingLG,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          height: 64,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          Made by John Colella
        </Text>
      </Layout.Footer>
    </Layout>
  );
}
