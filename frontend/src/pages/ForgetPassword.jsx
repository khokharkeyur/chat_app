import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axiosInterceptors from "../components/app/axiosInterceptors";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

const LoaderButton = ({
  isLoading,
  text,
  onClick,
  type = "button",
  className = "",
  ...props
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={isLoading}
    className={`relative flex items-center justify-center gap-2 btn btn-block btn-sm mt-4 border border-slate-700 
      ${isLoading ? "opacity-60 cursor-not-allowed grayscale" : ""}
      ${className}`}
    {...props}
  >
    {isLoading ? `${text}...` : text}
  </button>
);

function ForgotPassword() {
  const { authUser } = useSelector((store) => store.user);
  const navigate = useNavigate();
  const token = Cookies.get("AccessToken");

  const [formState, setFormState] = useState({
    otpSent: false,
    otpVerified: false,
    email: "",
    otp: "",
  });

  const [loading, setLoading] = useState({
    sendOtp: false,
    verifyOtp: false,
    resetPassword: false,
  });

  const setLoadingState = (key, value) =>
    setLoading((prev) => ({ ...prev, [key]: value }));

  const setForm = (key, value) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  const sendOtp = async () => {
    if (!formState.email) return toast.error("Please enter your email.");
    setLoadingState("sendOtp", true);
    try {
      const { data } = await axiosInterceptors.post("/user/sendOtp", {
        email: formState.email,
      });

      if (data.success) {
        toast.success("OTP sent successfully!");
        setForm("otpSent", true);
      } else {
        toast.error(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      toast.error("Error sending OTP.");
      console.error("Send OTP error:", error);
    } finally {
      setLoadingState("sendOtp", false);
    }
  };

  const verifyOtp = async () => {
    if (!formState.otp) return toast.error("Please enter the OTP.");
    setLoadingState("verifyOtp", true);
    try {
      const { data } = await axiosInterceptors.post("/user/verifyOtp", {
        email: formState.email,
        otp: formState.otp,
      });

      if (data.success) {
        toast.success("OTP verified!");
        setForm("otpVerified", true);
      } else {
        toast.error("Invalid OTP. Try again.");
      }
    } catch (error) {
      toast.error("Error verifying OTP.");
      console.error("Verify OTP error:", error);
    } finally {
      setLoadingState("verifyOtp", false);
    }
  };

  const handleResetPassword = async (values, { resetForm }) => {
    if (!token && !formState.otpVerified) {
      return toast.error("Please verify OTP first.");
    }

    setLoadingState("resetPassword", true);

    const payload = authUser?._id
      ? {
          userId: authUser._id,
          newPassword: values.password,
          confirmPassword: values.confirmPassword,
        }
      : {
          email: formState.email,
          otp: formState.otp,
          newPassword: values.password,
          confirmPassword: values.confirmPassword,
        };

    try {
      const { data } = await axiosInterceptors.put(
        "/user/resetPassword",
        payload
      );
      if (data.success) {
        toast.success(data.message);
        resetForm();
        navigate("/");
      } else {
        toast.error(data.message || "Password reset failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password reset failed.");
      console.error("Reset Password error:", error);
    } finally {
      setLoadingState("resetPassword", false);
    }
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  return (
    <div className="min-w-96 mx-auto">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-4">Forgot Password</h1>

        {!token && !formState.otpVerified && (
          <>
            <label className="label p-2">
              <span className="text-base label-text">Email</span>
            </label>
            <input
              type="email"
              value={formState.email}
              onChange={(e) => setForm("email", e.target.value)}
              className="w-full input input-bordered h-10"
              placeholder="Enter Email"
              disabled={formState.otpSent}
            />
            {formState.otpSent ? (
              <>
                <label className="label p-2 mt-2">
                  <span className="text-base label-text">Verify OTP</span>
                </label>
                <input
                  type="text"
                  value={formState.otp}
                  onChange={(e) => setForm("otp", e.target.value)}
                  className="w-full input input-bordered h-10"
                  placeholder="Enter OTP"
                />
                <LoaderButton
                  isLoading={loading.verifyOtp}
                  text="Verify OTP"
                  onClick={verifyOtp}
                />
              </>
            ) : (
              <LoaderButton
                isLoading={loading.sendOtp}
                text="Send OTP"
                onClick={sendOtp}
              />
            )}
          </>
        )}

        {(token || formState.otpVerified) && (
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={handleResetPassword}
          >
            <Form>
              <div className="mt-4">
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

              <LoaderButton
                isLoading={loading.resetPassword}
                text="Reset Password"
                type="submit"
              />
            </Form>
          </Formik>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
