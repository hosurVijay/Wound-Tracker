import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import api from "../Api/axios";

function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const [err, setErr] = useState("");

    const verifyOtp = async (data) => {
        setErr("");

        try {
            const response = await api.post(
                `/users/verify-otp`,
                {
                    email,
                    otp: data.otp
                }
            );

            const resetToken = response.data.data.resetToken;

            navigate("/reset-password", {
                state: {
                    email,
                    resetToken
                }
            });
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                "Invalid OTP. Please try again."
            );
        }
    };

    if (!email) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Invalid Request
                    </h2>

                    <p className="text-gray-500 mt-2 mb-6">
                        Please start the password reset process again.
                    </p>

                    <Link
                        to="/forgot-password"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        Forgot Password
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

                <div className="hidden md:block relative bg-blue-600">
                    <img
                        src="/images/login-wound.jpg"
                        alt="Wound care"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-blue-900/60" />

                    <div className="relative z-10 h-full flex flex-col justify-end p-10 text-white">
                        <h1 className="text-3xl font-bold mb-3">
                            Verify your account.
                        </h1>

                        <p className="text-blue-100 text-base leading-relaxed max-w-md">
                            Enter the OTP sent to your email to continue
                            resetting your Wound Tracker password.
                        </p>
                    </div>
                </div>

                <div className="p-8 sm:p-10 md:p-12 flex items-center">
                    <div className="max-w-md mx-auto w-full">

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Verify OTP
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Enter the OTP sent to
                            </p>

                            <p className="text-gray-800 font-medium mt-1">
                                {email}
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(verifyOtp)}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    OTP
                                </label>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    {...register("otp", {
                                        required: "OTP is required",
                                        pattern: {
                                            value: /^[0-9]{4}$/,
                                            message: "OTP must be 4 digits"
                                        }
                                    })}
                                    placeholder="Enter 6-digit OTP"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-center tracking-widest text-lg"
                                />

                                {errors.otp && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.otp.message}
                                    </p>
                                )}
                            </div>

                            {err && (
                                <p className="text-sm text-red-600">
                                    {err}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
                            >
                                Verify OTP
                            </button>
                        </form>

                        <div className="mt-7 text-center">
                            <p className="text-gray-500 text-sm">
                                Didn't receive the OTP?{" "}
                                <Link
                                    to="/forgot-password"
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    Send again
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}

export default VerifyOtp;