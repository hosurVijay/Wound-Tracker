import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";

function ForgotPassword() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const [err, setErr] = useState("");

    const sendOtp = async (data) => {
        setErr("");

        try {
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/users/forgot-password`,
                data
            );

            navigate("/verify-otp", {
                state: {
                    email: data.email
                }
            });
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );
        }
    };

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
                            Keep your account secure.
                        </h1>

                        <p className="text-blue-100 text-base leading-relaxed max-w-md">
                            Reset your password securely and continue tracking
                            your wound progress with Wound Tracker.
                        </p>
                    </div>
                </div>

                <div className="p-8 sm:p-10 md:p-12 flex items-center">
                    <div className="max-w-md mx-auto w-full">

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Forgot Password
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Enter your registered email and we'll send you
                                an OTP to reset your password.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(sendOtp)}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    {...register("email", {
                                        required: "Email is required"
                                    })}
                                    placeholder="Enter your registered email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />

                                {errors.email && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.email.message}
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
                                Send OTP
                            </button>
                        </form>

                        <div className="mt-7 text-center">
                            <p className="text-gray-500 text-sm">
                                Remember your password?{" "}
                                <Link
                                    to="/login"
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    Login
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}

export default ForgotPassword;