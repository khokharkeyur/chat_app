import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInterceptors from "../components/app/axiosInterceptors";
import toast from "react-hot-toast";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const adminDetails = location.state?.adminDetails;

  const initialValues = {
    fullName: adminDetails?.fullName || "",
    username: adminDetails?.username || "",
    password: "",
    confirmPassword: "",
    gender: adminDetails?.gender || "",
    email: adminDetails?.email || "",

    image: null,
  };
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .trim()
      .min(3, "Full Name must be at least 3 characters")
      .max(50, "Full Name must not exceed 50 characters")
      .matches(
        /^[A-Za-z\s]+$/,
        "Full Name must contain only letters and spaces"
      )
      .required("Full Name is required"),

    username: Yup.string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .matches(
        /^[a-zA-Z0-9._]+$/,
        "Username can only contain letters, numbers, dots, and underscores"
      )
      .required("Username is required"),
    ...(adminDetails
      ? {}
      : {
          password: Yup.string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters"),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Confirm Password is required"),
        }),
    gender: Yup.string().required("Gender is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const onSubmit = async (values, { resetForm }) => {
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", values.fullName);
      formData.append("username", values.username);
      if (adminDetails) {
        formData.append("adminId", adminDetails?._id);
      }
      if (!adminDetails) {
        formData.append("password", values.password);
        formData.append("confirmPassword", values.confirmPassword);
      }
      formData.append("gender", values.gender);
      formData.append("email", values.email);
      if (values.image) formData.append("image", values.image);

      const apiUrl = adminDetails ? "/user/profile/update" : "/user/register";
      const method = adminDetails
        ? axiosInterceptors.put
        : axiosInterceptors.post;

      const res = await method(apiUrl, formData);

      if (res.data.success) {
        toast.success(res.data.message);
        if (adminDetails) {
          navigate("/");
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.log(error);
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen my-4">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-center">Signup</h1>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ setFieldValue }) => (
            <Form>
              <div>
                <label className="label p-2">
                  <span className="text-base label-text">Full Name</span>
                </label>
                <Field
                  type="text"
                  name="fullName"
                  className="w-full input input-bordered h-10"
                  placeholder="Full Name"
                />
                <ErrorMessage
                  name="fullName"
                  component="div"
                  className="text-red-600"
                />
              </div>
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
                  <span className="text-base label-text">Profile Image</span>
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(event) => {
                    setFieldValue("image", event.currentTarget.files[0]);
                  }}
                  className="w-full input input-bordered pt-2"
                />
              </div>
              <ErrorMessage
                name="image"
                component="div"
                className="text-red-600"
              />

              <div>
                <label className="label p-2">
                  <span className="text-base label-text">Email</span>
                </label>
                <Field
                  type="text"
                  name="email"
                  className="w-full input input-bordered h-10"
                  placeholder="email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-600"
                />
              </div>

              {!adminDetails && (
                <>
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
                  <div>
                    <label className="label p-2">
                      <span className="text-base label-text">
                        Confirm Password
                      </span>
                    </label>
                    <Field
                      type="password"
                      name="confirmPassword"
                      className="w-full input input-bordered h-10"
                      placeholder="Confirm Password"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-red-600"
                    />
                  </div>
                </>
              )}
              <div className="my-4">
                <div className="flex items-center">
                  <label className="flex items-center">
                    <Field
                      type="radio"
                      name="gender"
                      value="male"
                      className="radio mx-2 w-5 h-5"
                    />
                    Male
                  </label>
                  <label className="flex items-center">
                    <Field
                      type="radio"
                      name="gender"
                      value="female"
                      className="radio mx-2 w-5 h-5"
                    />
                    Female
                  </label>
                </div>
                <ErrorMessage
                  name="gender"
                  component="div"
                  className="text-red-600 pl-1"
                />
              </div>
              <p className="text-center my-2">
                Already have an account? <Link to="/login"> login </Link>
              </p>
              <div>
                <button
                  type="submit"
                  className="btn btn-block btn-sm mt-2 border border-slate-700"
                >
                  Signup
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default SignupForm;
