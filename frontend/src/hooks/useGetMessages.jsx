import { useEffect } from "react";
import axiosInterceptors from "../components/app/axiosInterceptors";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/messageSlice";
const useGetMessages = () => {
  const { selectedUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInterceptors.get(
          `/message/${selectedUser?._id}`
        );
        dispatch(setMessages(res.data));
      } catch (error) {}
    };
    fetchMessages();
  }, [selectedUser?._id, setMessages]);
};

export default useGetMessages;
