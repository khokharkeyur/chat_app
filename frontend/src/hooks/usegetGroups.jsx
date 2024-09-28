import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setGroups } from '../redux/userSlice'; 

function useGetGroups() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get('http://localhost:8080/api/group/');
        dispatch(setGroups(res?.data?.groups)); 
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);
}

export default useGetGroups;
