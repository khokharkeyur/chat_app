import React from "react";
import Sidebar from "./sidebar/Sidebar";
import Message from "./message";
import { useWindowSize } from "../../../config/WindowSizeContext";
import { useSelector } from "react-redux";
import { getMobileWidth } from "../../../helper/widthCondition";

const Index = () => {
  const { width } = useWindowSize();
  const mobileWidth = getMobileWidth(width);
  const { selectedUser } = useSelector((store) => store.user);
  return (
    <div className="flex w-full min-h-[90vh] max-h-[90vh] rounded-lg pt-1">
      {(!mobileWidth || (mobileWidth && !selectedUser)) && (
        <Sidebar mobileWidth={mobileWidth} />
      )}
      {(!mobileWidth || (mobileWidth && selectedUser)) && (
        <Message mobileWidth={mobileWidth} />
      )}
    </div>
  );
};

export default Index;
