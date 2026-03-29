"use client";

import { Avatar, Popover, theme, Typography } from "antd";
import useGetUser from "@/app/tome/hooks/user/useGetUser";
import LogoutButton from "@/app/tome/components/LogoutButton";

export default function UserAvatar() {
  const { user } = useGetUser();
  const { token } = theme.useToken();

  if (!user || !user.email) {
    return null;
  }

  const userInitial = user.email.charAt(0).toUpperCase();

  const popoverContent = (
    <div style={{ width: 200 }}>
      <Typography.Text
        style={{ display: "block", marginBottom: token.marginMD }}
        ellipsis
      >
        {user.email}
      </Typography.Text>
      <LogoutButton />
    </div>
  );

  return (
    <Popover content={popoverContent} trigger="click" placement="bottomRight">
      <Avatar
        style={{
          backgroundColor: token.colorPrimary,
          cursor: "pointer",
        }}
        size={40}
      >
        {userInitial}
      </Avatar>
    </Popover>
  );
}
