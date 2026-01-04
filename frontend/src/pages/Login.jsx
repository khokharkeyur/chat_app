import axiosInterceptors from "../components/app/axiosInterceptors";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setAuthUser } from "../redux/userSlice";
import { Formik, Field, Form, ErrorMessage } from "formik";
import Cookies from "js-cookie";
import * as Yup from "yup";
import { getMobileWidth } from "../helper/widthCondition";
import { useWindowSize } from "../config/WindowSizeContext";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const mobileWidth = getMobileWidth(width);
  const [loading, setLoading] = useState(false);

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const onSubmit = async (values, { resetForm }) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axiosInterceptors.post("/user/login", values);
      const { token, refreshToken, ...userData } = res.data;
      Cookies.set("AccessToken", token, { expires: 1, path: "/" });
      Cookies.set("RefreshToken", refreshToken, { expires: 7, path: "/" });
      dispatch(setAuthUser(userData));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.log(error);
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  return (
    <div className={`${mobileWidth ? "" : "min-w-96"} mx-auto`}>
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-center">Login</h1>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form>
            <div>
              <label className="label p-2">
                <span className="text-base label-text">Username</span>
              </label>
              <Field
                type="text"
                name="username"
                className="w-full input input-bordered h-10"
                placeholder="Username"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="text-red-600"
              />
            </div>
            <div>
              <label className="label p-2">
                <span className="text-base label-text">Password</span>
              </label>
              <Field
                type="password"
                name="password"
                className="w-full input input-bordered h-10"
                placeholder="Password"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-600"
              />
              <p className="text-right text-base mt-1">
                <Link to="/forgetPassword" className="">
                  Forgot Password?
                </Link>
              </p>
            </div>
            <p className="text-center my-2">
              Don't have an account? <Link to="/signup"> signup </Link>
            </p>
            <div>
              <button
                type="submit"
                className="btn btn-block btn-sm mt-2 border border-slate-700"
              >
                Login
              </button>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default Login;
