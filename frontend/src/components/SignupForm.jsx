import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

function SignupForm() {
  const navigate = useNavigate();

  const initialValues = {
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
    image: null,
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().required("Full Name is required"),
    username: Yup.string().required("Username is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    gender: Yup.string().required("Gender is required"),
  });

  const onSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append("fullName", values.fullName);
      formData.append("username", values.username);
      formData.append("password", values.password);
      formData.append("confirmPassword", values.confirmPassword);
      formData.append("gender", values.gender);
      if (values.image) formData.append("image", values.image);

      const res = await axios.post(
        "http://localhost:8080/api/user/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.log(error);
    }
    resetForm();
  };

  return (
    <div className="min-w-96 mx-auto">
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
                  <span className="text-base label-text">Confirm Password</span>
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
              <div className="flex items-center my-4">
                <div className="flex items-center">
                  <label>
                    <Field
                      type="radio"
                      name="gender"
                      value="male"
                      className="radio mx-2"
                    />
                    Male
                  </label>
                </div>
                <div className="flex items-center">
                  <label>
                    <Field
                      type="radio"
                      name="gender"
                      value="female"
                      className="radio mx-2"
                    />
                    Female
                  </label>
                </div>
                <ErrorMessage
                  name="gender"
                  component="div"
                  className="text-red-600"
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
