import React, { useState } from "react";
import { login as authLogin } from "../Store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import axios from "axios";
import api from "../Api/axios";

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const [err, setErr] = useState("");

    const login = async (data) => {
        setErr("");

        try {
            await api.post(
                `/users/login`,
                data
            );

            const userData = await api.get(
                `/users/profile`
            );

            dispatch(
                authLogin({
                    userData: userData.data.data
                })
            );

            navigate("/");
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                "Unable to login. Please check your credentials."
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
                            Track your wound.
                        </h1>

                        <p className="text-blue-100 text-base leading-relaxed max-w-md">
                            Keep your wound analysis organized and monitor
                            your progress with Wound Tracker.
                        </p>
                    </div>
                </div>

                <div className="p-8 sm:p-10 md:p-12">
                    <div className="max-w-md mx-auto">

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Welcome back
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Login to continue tracking your wound.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(login)}
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
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />

                                {errors.email && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-blue-600 font-medium hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <input
                                    type="password"
                                    {...register("password", {
                                        required: "Password is required"
                                    })}
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />

                                {errors.password && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.password.message}
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
                                Login
                            </button>
                        </form>

                        <div className="mt-7 text-center">
                            <p className="text-gray-500 text-sm">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    Create one
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}

export default Login;