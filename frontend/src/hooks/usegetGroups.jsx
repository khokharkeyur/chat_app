import { useEffect } from "react";
import axiosInterceptors from "../components/app/axiosInterceptors";
import { useDispatch } from "react-redux";
import { setGroups } from "../redux/userSlice";

function useGetGroups() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axiosInterceptors.get("/group/");
        dispatch(setGroups(res?.data?.groups));
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);
}

export default useGetGroups;
