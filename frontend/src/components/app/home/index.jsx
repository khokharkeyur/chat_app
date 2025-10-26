import React from "react";
import Sidebar from "./sidebar/Sidebar";
import Message from "./message";
import { useWindowSize } from "../../../config/WindowSizeContext";

const Index = () => {
  const { width } = useWindowSize();
  console.log("width", width);

  return (
    <div className="flex w-full max-h-[500px] rounded-lg">
      <Sidebar />
      <Message />
    </div>
  );
};

export default Index;
