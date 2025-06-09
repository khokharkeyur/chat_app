import { useEffect, useState } from "react";
import axiosInterceptors from "../components/app/axiosInterceptors";
import { useDispatch } from "react-redux";
import { setOtherUsers } from "../redux/userSlice";

function useGetOtherUsers() {
  const [data, setData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const res = await axiosInterceptors.get(`/user`);
        dispatch(setOtherUsers(res.data));
        setData(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchOtherUser();
  }, []);

  return { data };
}

export default useGetOtherUsers;
