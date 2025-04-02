import React, { useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axiosInterceptors from "../components/app/axiosInterceptors";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

function ForgotPassword() {
  const { authUser } = useSelector((store) => store.user);
  const navigate = useNavigate();
  const token = Cookies.get("AccessToken");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
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

  const sendOtp = async () => {
    try {
      const response = await axiosInterceptors.post("/user/sendOtp", {
        phoneNumber,
      });
      if (response.data.success) {
        toast.success("OTP sent successfully!");
        setOtpSent(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error sending OTP. Try again.");
      console.error("Error:", error);
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axiosInterceptors.post("/user/verifyOtp", {
        phoneNumber,
        otp,
      });
      if (response.data.success) {
        toast.success("OTP verified!");
        setOtpVerified(true);
      } else {
        toast.error("Invalid OTP. Try again.");
      }
    } catch (error) {
      toast.error("Error verifying OTP.");
      console.error("Error:", error);
    }
  };

  const onSubmit = async (values, { resetForm }) => {
    if (!token && !otpVerified) {
      toast.error("Please verify OTP first.");
      return;
    }

    const { password, confirmPassword } = values;

    const payload = authUser?._id
      ? { userId: authUser._id, newPassword: password, confirmPassword }
      : { phoneNumber, otp, newPassword: password, confirmPassword };

    try {
      const response = await axiosInterceptors.put(
        "/user/resetPassword",
        payload
      );

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
    <div className="min-w-96 mx-auto">
      <div className="w-full p-6 rounded-lg shadow-md bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-10 border border-gray-100">
        <h1 className="text-3xl font-bold text-center">Forgot Password</h1>

        {!token ? (
          // If no token, show phone number and OTP fields
          <div>
            {!otpSent ? (
              <>
                <label className="label p-2">
                  <span className="text-base label-text">Phone Number</span>
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full input input-bordered h-10"
                  placeholder="Enter phone number"
                />
                <button
                  onClick={sendOtp}
                  className="btn btn-block btn-sm mt-4 border border-slate-700"
                >
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <label className="label p-2">
                  <span className="text-base label-text">Verify OTP</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full input input-bordered h-10"
                  placeholder="Enter OTP"
                />
                <button
                  onClick={verifyOtp}
                  className="btn btn-block btn-sm mt-4 border border-slate-700"
                >
                  Verify OTP
                </button>
              </>
            )}
          </div>
        ) : null}

        {(token || otpVerified) && (
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
              <button
                type="submit"
                className="btn btn-block btn-sm mt-4 border border-slate-700"
              >
                Reset Password
              </button>
            </Form>
          </Formik>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
