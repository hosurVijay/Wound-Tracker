import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import api from "../Api/axios";

function Register() {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const [err, setErr] = useState("");

    const registerUser = async (data) => {
        setErr("");

        try {
            await api.post("/users/register", data);

            navigate("/login");
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                "Unable to create your account. Please try again."
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
                            Start tracking your wound.
                        </h1>

                        <p className="text-blue-100 text-base leading-relaxed max-w-md">
                            Create your Wound Tracker account and keep your
                            wound analysis organized in one place.
                        </p>
                    </div>
                </div>

                <div className="p-8 sm:p-10 md:p-12">
                    <div className="max-w-md mx-auto">

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Create your account
                            </h2>

                            <p className="text-gray-500 mt-2">
                                Enter your details to get started.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(registerUser)}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    {...register("name", {
                                        required: true
                                    })}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    {...register("email", {
                                        required: true
                                    })}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    {...register("phoneNumber", {
                                        required: true
                                    })}
                                    placeholder="Enter your phone number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    {...register("dob", {
                                        required: true
                                    })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    {...register("password", {
                                        required: true
                                    })}
                                    placeholder="Create a password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                                />
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
                                Create Account
                            </button>
                        </form>

                        <div className="mt-7 text-center">
                            <p className="text-gray-500 text-sm">
                                Already have an account?{" "}
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

export default Register;