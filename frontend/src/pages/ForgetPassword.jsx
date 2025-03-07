import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axiosInterceptors from "../components/app/axiosInterceptors";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function ForgotPassword() {
  const { authUser } = useSelector((store) => store.user);
  const navigate = useNavigate();
  const initialValues = {
    password: "",
    confirmPassword: "",
  };
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  const onSubmit = async (values, { resetForm }) => {
    const { password, confirmPassword } = values;

    try {
      const response = await axiosInterceptors.put("/user/resetPassword", {
        // username,
        userId: authUser._id,
        newPassword: password,
        confirmPassword,
      });

      if (response.data.success) {
        resetForm();
        toast.success(response.data.message);
        navigate("/");
      }
    } catch (error) {
      console.error("Error occurred during password reset:", error);
      resetForm();
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
                <p className="text-center my-2"></p>
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
