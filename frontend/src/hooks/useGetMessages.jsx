import { useEffect } from "react";
import axiosInterceptors from "../components/app/axiosInterceptors";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/messageSlice";

const useGetMessages = () => {
  const { selectedUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const selectedUserId = selectedUser?._id;
  const selectedUserIsGroup = !!selectedUser?.members;

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUserId) return;

      try {
        const endpoint = selectedUserIsGroup
          ? `/message/group/${selectedUserId}`
          : `/message/${selectedUserId}`;

        const res = await axiosInterceptors.get(endpoint);
        dispatch(setMessages(res.data));
      } catch (error) {
        console.error("Error fetching messages:", error);
        dispatch(setMessages([]));
      }
    };

    fetchMessages();
  }, [selectedUserId, selectedUserIsGroup, dispatch]);
};

export default useGetMessages;
