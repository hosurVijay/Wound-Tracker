import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Api/axios";

const Home = () => {
    const [user, setUser] = useState(null);
    const [recentWound, setRecentWound] = useState(null);

    useEffect(() => {
        const fetchAllUserDetailsAndWoundLatest = async () => {
            try {
                const [profileResponse, woundsResponse] = await Promise.all([
                    api.get("/users/profile"),
                    api.get("/wounds"),
                ]);

                setUser(profileResponse.data.data);

                const wounds = woundsResponse.data.data;

                if (wounds.length > 0) {
                    const latestWound = wounds[0];
                    const latestImage = latestWound.images?.[0];
                    const analysis = latestImage?.analysis;

                    setRecentWound({
                        id: latestWound.woundId,
                        woundType: latestWound.woundType,
                        createdAt:
                            latestImage?.uploadedAt ||
                            latestWound.createdAt,
                        imageUrl: latestImage?.imageUrl,
                        confidence: analysis?.confidence,
                        woundArea: analysis?.woundArea,
                        healthyArea: analysis?.healthyArea,
                        maskUrl: analysis?.maskUrl,
                    });
                }
            } catch (error) {
                console.log("Failed to fetch dashboard data", error);
            }
        };

        fetchAllUserDetailsAndWoundLatest();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
                <div className="bg-blue-600 rounded-3xl overflow-hidden">
                    <div className="px-8 py-10 md:px-12 md:py-14">
                        <p className="text-blue-100 text-sm font-medium mb-3">
                            Wound Tracker
                        </p>

                        <h1 className="text-3xl md:text-4xl font-bold text-white">
                            Hi, {user?.name || "User"}
                        </h1>

                        <p className="text-blue-100 text-lg mt-3 max-w-xl">
                            Have a wound? Let's track it with us.
                        </p>

                        <Link
                            to="/upload"
                            className="inline-block mt-7 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
                        >
                            Start New Analysis
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Your Details
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Basic information
                                </p>
                            </div>

                            <Link
                                to="/profile"
                                className="text-blue-600 text-sm font-medium hover:underline"
                            >
                                View Profile
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-5">
                                <p className="text-sm text-gray-500 mb-2">
                                    Name
                                </p>

                                <p className="text-lg font-semibold text-gray-800">
                                    {user?.name || "N/A"}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5">
                                <p className="text-sm text-gray-500 mb-2">
                                    Age
                                </p>

                                <p className="text-lg font-semibold text-gray-800">
                                    {user?.age ?? "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                            <svg
                                className="w-6 h-6 text-blue-600"
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

                        <h2 className="text-xl font-semibold text-gray-800">
                            Have a wound?
                        </h2>

                        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                            Upload an image and let us help you track its
                            progress.
                        </p>

                        <Link
                            to="/upload"
                            className="inline-block mt-6 w-full text-center bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                        >
                            Upload Wound
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 pb-12">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Recent Analysis
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Keep an eye on your wound progress.
                        </p>
                    </div>

                    <Link
                        to="/wounds"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        View All History
                    </Link>
                </div>

                {recentWound ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-5">
                            <div className="md:col-span-2 h-72 md:h-auto bg-gray-100">
                                {recentWound.imageUrl ? (
                                    <img
                                        src={recentWound.imageUrl}
                                        alt="Recent wound"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No image available
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-3 p-6 md:p-8">
                                <div className="flex items-start justify-between gap-4 mb-7">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium mb-2">
                                            Latest Analysis
                                        </p>

                                        <h3 className="text-2xl font-semibold text-gray-800">
                                            {recentWound.woundType ||
                                                "Wound Analysis"}
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-2">
                                            {recentWound.createdAt &&
                                                new Date(
                                                    recentWound.createdAt
                                                ).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <span className="shrink-0 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                                        Completed
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
                                    <div className="border border-gray-200 rounded-xl p-4">
                                        <p className="text-sm text-gray-500">
                                            Confidence
                                        </p>

                                        <p className="text-xl font-semibold text-gray-800 mt-1">
                                            {recentWound.confidence ?? "N/A"}
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 rounded-xl p-4">
                                        <p className="text-sm text-gray-500">
                                            Wound Area
                                        </p>

                                        <p className="text-xl font-semibold text-gray-800 mt-1">
                                            {recentWound.woundArea ?? "N/A"}
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 rounded-xl p-4">
                                        <p className="text-sm text-gray-500">
                                            Healthy Area
                                        </p>

                                        <p className="text-xl font-semibold text-gray-800 mt-1">
                                            {recentWound.healthyArea ?? "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    to={`/wounds/${recentWound.id}`}
                                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                                >
                                    View Full Analysis
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
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

                        <h3 className="text-xl font-semibold text-gray-800 mt-5">
                            No wound analyses yet
                        </h3>

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
            </section>
        </main>
    );
};

export default Home;