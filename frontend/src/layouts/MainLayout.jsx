import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useWindowSize } from "../config/WindowSizeContext";
import { getMobileWidth } from "../helper/widthCondition";
export default function MainLayout() {
  const { width } = useWindowSize();
  const mobileWidth = getMobileWidth(width);
  const location = useLocation();

  return (
    <div
      className={`${mobileWidth ? "p-1" : "p-4"} flex items-center justify-center ${location.pathname === "/signup" ? "" : "h-screen"}`}
    >
      <Outlet />
    </div>
  );
}
