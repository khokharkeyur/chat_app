import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInterceptors from "../components/app/axiosInterceptors";

function ForgotPassword() {
  const initialValues = {
    username: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const onSubmit = async (values, { resetForm }) => {
    const { username, password, confirmPassword } = values;

    try {
      const response = await axiosInterceptors.put(
        "http://localhost:8080/api/user/resetPassword",
        {
          username,
          newPassword: password,
          confirmPassword,
        }
      );

      if (response.data.success) {
        resetForm();
      }
    } catch (error) {
      console.error("Error occurred during password reset:", error);
      // resetForm();
    }
  };

  return (
    <div>
      <div className="min-w-96 mx-auto">
        <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
          <h1 className="text-3xl font-bold text-center">Forget Password</h1>
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
                  <span className="text-base label-text">New Password</span>
                </label>
                <Field
                  type="password"
                  name="password"
                  className="w-full input input-bordered h-10"
                  placeholder="Enter new password"
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
                  placeholder="Confirm new password"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-600"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="btn btn-block btn-sm mt-4 border border-slate-700"
                >
                  Reset Password
                </button>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
