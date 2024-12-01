import { useEffect } from "react";
import axiosInterceptors from "../components/app/axiosInterceptors";
import { useDispatch } from "react-redux";
import { setOtherUsers } from "../redux/userSlice";

function useGetOtherUsers() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const res = await axiosInterceptors.get(`/user`);
        dispatch(setOtherUsers(res.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchOtherUser();
  }, []);
}

export default useGetOtherUsers;
