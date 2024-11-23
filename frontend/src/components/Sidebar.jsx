    import React, { useState } from 'react'
    import { BiSearchAlt2 } from "react-icons/bi";
    import OtherUsers from './OtherUsers';
    import axios from 'axios';
    import toast from 'react-hot-toast';
    import { useNavigate } from 'react-router-dom';
    import { useDispatch, useSelector } from 'react-redux';
    import { setAuthUser, setOtherUsers,setSelectedUser } from '../redux/userSlice';
    import Cookies from 'js-cookie';


    function Sidebar() {

        const [search, setSearch] = useState("")
        const {otherUsers,searchUser} = useSelector(store=>store.user);
        const dispatch = useDispatch();
        const naviget = useNavigate()

        const searchSubmitHandler = (e) => {
            e.preventDefault();
            const conversationUser = otherUsers?.find((user)=> user.fullName.toLowerCase().includes(search.toLowerCase()));
            if(conversationUser){
                dispatch(setOtherUsers([conversationUser]));
            }else{
                dispatch(setOtherUsers(otherUsers));
                toast.error("User not found!");
            }
        }

        const logoutHandler = async ()=>{
            try {
                const res = await axios.get(`http://localhost:8080/api/user/logout`);
                toast.success(res.data.message);
                Cookies.remove("AccessToken", { path: "/" });
                Cookies.remove("RefreshToken", { path: "/" });
                naviget('/login')
                dispatch(setSelectedUser(null));
                dispatch(setAuthUser(null))
            } catch (error) {
                console.log(error);
            }
        }

    return (
        <div className=' border-r border-slate-500 p-4 flex flex-col'>
        <form onSubmit={searchSubmitHandler} action="" className='flex items-center gap-2'>
            <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className='input input-bordered rounded-md' type="text"
                placeholder='Search...'
            />
            <button type='submit' className='btn bg-zinc-700 text-white'>
                <BiSearchAlt2 className='w-6 h-6 outline-none'/>
            </button>
        </form>
        <div className="divider px-3"></div> 
        <OtherUsers/> 
        <div className='mt-2'>
            <button onClick={logoutHandler} className='btn btn-sm'>Logout</button>
        </div>
    </div>
    )
    }

    export default Sidebar