import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setAuthUser } from "../redux/userSlice";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const onSubmit = async (values, { resetForm }) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/user/login",
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const {token,refreshToken, ...userData} = res.data
      console.log("token",token);
      console.log(refreshToken,"refreshToken");
      localStorage.setItem("Token", token);
      localStorage.setItem("RefreshToken", refreshToken);
      dispatch(setAuthUser(userData));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.log(error);
    }
    resetForm();
  };

  return (
    <div className="min-w-96 mx-auto">
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