import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux';


function InnerMessage({ message }) {
  const chatRef = useRef();
  const {authUser,selectedUser} = useSelector(store=>store.user);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  // const handleDeleteMessage =()=>{
  //   console.log("click");
  //   console.log(message?._id);
  // }


  return (
    <div ref={chatRef} className={`chat ${authUser?._id ===message?.senderId ?"chat-end" :"chat-start"}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            alt="Avatar"
            src={message?.senderId===authUser?._id ?authUser?.profilePhoto :selectedUser?.profilePhoto}
          />
        </div>
      </div>
      <div className="chat-header">
        <time className="text-xs opacity-50">12:45</time>
      </div>
      <div  className={`chat-bubble ${message?.senderId !== authUser?._id ? 'bg-gray-200 text-black' : ''} `}>{message?.message} </div>
    </div>
  );
}

export default InnerMessage