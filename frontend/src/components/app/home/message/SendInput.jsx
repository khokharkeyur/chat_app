import React, { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import axiosInterceptors from "../../axiosInterceptors";
import { useDispatch, useSelector } from "react-redux";
import { setEditMessage, setMessages } from "../../../../redux/messageSlice";

function SendInput() {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.user);
  const { messages, editMessage } = useSelector((store) => store.message);
  const { socket } = useSelector((store) => store.socket);

  useEffect(() => {
    if (editMessage) {
      setMessage(editMessage.message);
    }
  }, [editMessage]);
  useEffect(() => {
    if (message === "") {
      dispatch(setEditMessage(null));
      setMessage("");
    }
  }, [message]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      if (editMessage) {
        socket.emit("editMessage", editMessage._id, message);

        await axiosInterceptors.put(`/message/edit/${editMessage._id}`, {
          message: message,
        });
        dispatch(setEditMessage(null));
      } else {
        const res = await axiosInterceptors.post(
          `/message/send/${selectedUser?._id}`,
          { message },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        dispatch(setMessages([...messages, res?.data?.newMessage]));
      }
    } catch (error) {
      console.log(error);
    }
    setMessage("");
  };

  return (
    <div>
      <form onSubmit={onSubmitHandler} className="px-4 my-3">
        <div className="w-full relative">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            placeholder="Send a message..."
            className="border text-sm rounded-lg block w-full p-3 border-zinc-500 bg-gray-600 text-white"
          />
          <button
            type="submit"
            className="absolute flex inset-y-0 end-0 items-center pr-4"
          >
            <IoSend />
          </button>
        </div>
      </form>
    </div>
  );
}

export default SendInput;
