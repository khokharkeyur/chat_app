import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setOtherUsers } from "../redux/userSlice";

function useGetOtherUsers() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(`http://localhost:8080/api/user/`);
        dispatch(setOtherUsers(res.data))
      } catch (error) {
        console.log(error);
      }
    };
    fetchOtherUser();
  },[]);
}

export default useGetOtherUsers;
