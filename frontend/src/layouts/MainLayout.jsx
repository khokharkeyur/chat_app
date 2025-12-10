import React from "react";
import { Outlet, useLocation } from "react-router-dom";
export default function MainLayout() {
  const location = useLocation();

  return (
    <div
      className={`p-4 flex items-center justify-center ${location.pathname === "/signup" ? "" : "h-screen"}`}
    >
      <Outlet />
    </div>
  );
}
