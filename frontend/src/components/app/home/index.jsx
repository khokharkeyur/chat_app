import React from "react";
import Sidebar from "./sidebar/Sidebar";
import Message from "./message";

const Index = () => {

  return (
    <div className="flex w-full max-h-[500px] rounded-lg">
      <Sidebar />
      <Message />
    </div>
  );
};

export default Index;
