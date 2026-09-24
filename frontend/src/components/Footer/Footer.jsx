import React from "react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-10">

                <div className="flex flex-col md:flex-row md:justify-between gap-8">
                    <div className="max-w-sm">
                        <Link
                            to="/"
                            className="text-2xl font-bold text-blue-600"
                        >
                            Wound Tracker
                        </Link>

                        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                            A simple wound tracking and analysis platform
                            designed to help you monitor your wound history
                            over time.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Navigation
                        </h3>

                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/"
                                    className="text-sm text-gray-500 hover:text-blue-600 transition"
                                >
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/wounds"
                                    className="text-sm text-gray-500 hover:text-blue-600 transition"
                                >
                                    Wounds
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/upload"
                                    className="text-sm text-gray-500 hover:text-blue-600 transition"
                                >
                                    New Upload
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Account
                        </h3>

                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/profile"
                                    className="text-sm text-gray-500 hover:text-blue-600 transition"
                                >
                                    Profile
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/login"
                                    className="text-sm text-gray-500 hover:text-blue-600 transition"
                                >
                                    Login
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/register"
                                    className="text-sm text-gray-500 hover:text-blue-600 transition"
                                >
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>
                <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3">

                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Wound Tracker. All rights reserved.
                    </p>

                    <p className="text-sm text-gray-400">
                        Wound analysis & tracking
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;