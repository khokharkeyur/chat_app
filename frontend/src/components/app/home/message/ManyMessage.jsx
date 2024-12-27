import React from "react";
import InnerMessage from "./InnerMessage";
import useGetMessages from "../../../../hooks/useGetMessages";
import { useSelector } from "react-redux";
import useGetRealTimeMessage from "../../../../hooks/useGetRealTimeMessage";

function ManyMessage() {
  useGetMessages();
  useGetRealTimeMessage();
  const { messages } = useSelector((store) => store.message);
  return (
    <div className="px-4 flex-1 overflow-auto">
      {messages &&
        messages?.map((message) => {
          return <InnerMessage key={message._id} message={message} />;
        })}
    </div>
  );
}

export default ManyMessage;
