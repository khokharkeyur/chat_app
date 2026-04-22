import { useEffect } from "react";
import axiosInterceptors from "../components/app/axiosInterceptors";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/messageSlice";

const useGetMessages = () => {
  const { selectedUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) return;

      try {
        const isGroup = !!selectedUser.members;

        const endpoint = isGroup
          ? `/message/group/${selectedUser._id}`
          : `/message/${selectedUser._id}`;

        const res = await axiosInterceptors.get(endpoint);
        dispatch(setMessages(res.data));
      } catch (error) {
        dispatch(setMessages([]));
      }
    };

    fetchMessages();
  }, [selectedUser?._id, dispatch]);
};

export default useGetMessages;
