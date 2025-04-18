import React from "react";
import Sidebar from "./sidebar/Sidebar";
import Message from "./message";

function index() {
  return (
    <div>
      <div className="flex sm:h-[450px] md:h-[550px] rounded-lg overflow-hidden bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0">
        <Sidebar />
        <Message />
      </div>
    </div>
  );
}

export default index;
