import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import api from "../Api/axios";

function Wounds() {
    const [wounds, setWounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const fetchWounds = async () => {
            try {
                const response = await api.get(
                    `/wounds`
                );

                setWounds(response.data.data);
            } catch (error) {
                setErr(
                    error.response?.data?.message ||
                    "Unable to fetch your wound history."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchWounds();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="max-w-7xl mx-auto px-6 pt-12 pb-12">

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Your Wound History
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View your previous wound analyses and track your progress.
                    </p>
                </div>

                {loading && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                        <p className="text-gray-500">
                            Loading your wound history...
                        </p>
                    </div>
                )}

                {!loading && err && (
                    <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
                        <p className="text-red-600">
                            {err}
                        </p>
                    </div>
                )}

                {!loading && !err && wounds.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-10 md:p-14 text-center shadow-sm">
                        <div className="w-14 h-14 mx-auto rounded-xl bg-blue-50 flex items-center justify-center">
                            <svg
                                className="w-7 h-7 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                    d="M12 4v16M4 12h16"
                                />
                            </svg>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-800 mt-5">
                            No wound analyses yet
                        </h2>

                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            Upload your first wound image to start tracking
                            your wound progress.
                        </p>

                        <Link
                            to="/upload"
                            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                        >
                            Upload Your First Wound
                        </Link>
                    </div>
                )}

                {!loading && !err && wounds.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wounds.map((wound, index) => {
                            const latestImage = wound.images?.[0];

                            return (
                                <Link
                                    key={wound.woundId}
                                    to={`/wounds/${wound.woundId}`}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition"
                                >
                                    <div className="h-56 bg-gray-100">
                                        {latestImage?.imageUrl ? (
                                            <img
                                                src={latestImage.imageUrl}
                                                alt={`Wound ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No image available
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-semibold text-gray-800">
                                                Wound {index + 1}
                                            </h2>

                                            <span className="text-blue-600 text-sm font-medium">
                                                View
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Date Created
                                                </p>

                                                <p className="text-gray-800 font-medium mt-1">
                                                    {wound.createdAt
                                                        ? new Date(
                                                              wound.createdAt
                                                          ).toLocaleDateString(
                                                              "en-IN",
                                                              {
                                                                  day: "2-digit",
                                                                  month: "short",
                                                                  year: "numeric"
                                                              }
                                                          )
                                                        : "N/A"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Wound Type
                                                </p>

                                                <p className="text-gray-800 font-medium mt-1 capitalize">
                                                    {wound.woundType || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Wounds;