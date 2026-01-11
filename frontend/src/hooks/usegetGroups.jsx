import { useEffect, useState } from "react";
import axiosInterceptors from "../components/app/axiosInterceptors";
import { useDispatch } from "react-redux";
import { setGroups } from "../redux/userSlice";

function useGetGroups() {
  const [data, setData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axiosInterceptors.get("/group/");
        dispatch(setGroups(res?.data?.groups));
        setData(res.data?.groups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);
  return { data };
}

export default useGetGroups;
