import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../Api/axios";

function WoundDetails() {
    const { woundId } = useParams();

    const [wound, setWound] = useState(null);
    const [notification, setNotification] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const fetchWoundDetails = async () => {
            try {
                const [woundResponse, notificationResponse] =
                    await Promise.all([
                        api.get(`/wounds/${woundId}`),
                        api.get(`/notifications/wound/${woundId}`),
                    ]);

                setWound(woundResponse.data.data);
                setNotification(notificationResponse.data.data);
            } catch (error) {
                if (
                    error.response?.config?.url?.includes(
                        "/notifications/wound/"
                    )
                ) {
                    try {
                        const woundResponse = await api.get(
                            `/wounds/${woundId}`
                        );

                        setWound(woundResponse.data.data);
                        setNotification(null);
                    } catch (woundError) {
                        setErr(
                            woundError.response?.data?.message ||
                                "Unable to fetch wound details."
                        );
                    }
                } else {
                    setErr(
                        error.response?.data?.message ||
                            "Unable to fetch wound details."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWoundDetails();
    }, [woundId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <p className="text-gray-500">
                    Loading wound details...
                </p>
            </main>
        );
    }

    if (err) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center max-w-md w-full">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Unable to load wound
                    </h2>

                    <p className="text-red-600 text-sm mt-2">
                        {err}
                    </p>

                    <Link
                        to="/wounds"
                        className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        Back to Wounds
                    </Link>
                </div>
            </main>
        );
    }

    if (!wound) {
        return null;
    }

    const latestImage = wound.images?.[0];
    const latestAnalysis = latestImage?.analysis;

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRemainingDays = (date) => {
        if (!date) return null;

        const scheduledDate = new Date(date);
        const currentDate = new Date();

        const difference =
            scheduledDate.getTime() - currentDate.getTime();

        if (difference <= 0) {
            return 0;
        }

        return Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );
    };

    const remainingDays = notification?.scheduledAt
        ? getRemainingDays(notification.scheduledAt)
        : null;

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="max-w-7xl mx-auto px-6 pt-10 pb-12">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <Link
                            to="/wounds"
                            className="text-blue-600 text-sm font-medium hover:underline"
                        >
                            ← Back to Wounds
                        </Link>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-3">
                            Wound Details
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Complete analysis and history for this wound.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl px-5 py-3">
                        <p className="text-sm text-gray-500">
                            Wound Type
                        </p>

                        <p className="text-lg font-semibold text-gray-800 capitalize mt-1">
                            {wound.woundType}
                        </p>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Created On
                        </p>

                        <p className="text-lg font-semibold text-gray-800 mt-1">
                            {formatDate(wound.createdAt)}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Last Updated
                        </p>

                        <p className="text-lg font-semibold text-gray-800 mt-1">
                            {formatDate(wound.updatedAt)}
                        </p>
                    </div>
                </div>

                {/* Follow-up */}
                {notification?.scheduledAt && (
                    <section className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6 md:p-8 mb-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">
                                    Follow-up
                                </p>

                                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                                    Next Upload
                                </h2>

                                <p className="text-gray-500 mt-2">
                                    {notification.message}
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 text-center">
                                <p className="text-sm text-gray-500">
                                    Scheduled Date
                                </p>

                                <p className="text-lg font-semibold text-gray-800 mt-1">
                                    {formatDate(notification.scheduledAt)}
                                </p>

                                <p className="text-sm text-blue-600 font-medium mt-2">
                                    {remainingDays === 0
                                        ? "Due today"
                                        : `${remainingDays} ${
                                              remainingDays === 1
                                                  ? "day"
                                                  : "days"
                                          } remaining`}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Latest Analysis */}
                {latestImage && (
                    <section className="mb-10">
                        <div className="mb-5">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Latest Analysis
                            </h2>

                            <p className="text-gray-500 mt-1">
                                Most recent wound image and analysis results.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-2">

                                {/* Original Image */}
                                <div className="h-80 lg:h-[420px] bg-gray-100">
                                    <img
                                        src={latestImage.imageUrl}
                                        alt="Latest wound"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="p-6 md:p-8">
                                    <div className="flex items-center justify-between mb-7">
                                        <div>
                                            <p className="text-sm text-blue-600 font-medium">
                                                Latest Image
                                            </p>

                                            <p className="text-gray-500 text-sm mt-1">
                                                Uploaded{" "}
                                                {formatDateTime(
                                                    latestImage.uploadedAt
                                                )}
                                            </p>
                                        </div>

                                        <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                                            Analyzed
                                        </span>
                                    </div>

                                    {latestAnalysis ? (
                                        <>
                                            {/* Latest Mask */}
                                            {latestAnalysis.maskUrl && (
                                                <div className="mb-6">
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        Segmentation Mask
                                                    </p>

                                                    <div className="h-48 bg-black rounded-xl overflow-hidden border border-gray-200">
                                                        <img
                                                            src={
                                                                latestAnalysis.maskUrl
                                                            }
                                                            alt="Latest wound segmentation mask"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="border border-gray-200 rounded-xl p-5">
                                                    <p className="text-sm text-gray-500">
                                                        Wound Area
                                                    </p>

                                                    <p className="text-2xl font-semibold text-gray-800 mt-2">
                                                        {
                                                            latestAnalysis.woundArea
                                                        }
                                                    </p>
                                                </div>

                                                <div className="border border-gray-200 rounded-xl p-5">
                                                    <p className="text-sm text-gray-500">
                                                        Previous Wound Area
                                                    </p>

                                                    <p className="text-2xl font-semibold text-gray-800 mt-2">
                                                        {latestAnalysis.previousWoundArea ??
                                                            "N/A"}
                                                    </p>
                                                </div>

                                                <div className="border border-gray-200 rounded-xl p-5">
                                                    <p className="text-sm text-gray-500">
                                                        Previous Healthy Area
                                                    </p>

                                                    <p className="text-2xl font-semibold text-gray-800 mt-2">
                                                        {latestAnalysis.previousHealthyArea ??
                                                            "N/A"}
                                                    </p>
                                                </div>

                                                <div className="border border-gray-200 rounded-xl p-5">
                                                    <p className="text-sm text-gray-500">
                                                        Change in Area
                                                    </p>

                                                    <p className="text-2xl font-semibold text-gray-800 mt-2">
                                                        {latestAnalysis.changeArea ??
                                                            "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-5 border-t border-gray-200">
                                                <p className="text-sm text-gray-500">
                                                    Analyzed On
                                                </p>

                                                <p className="text-gray-800 font-medium mt-1">
                                                    {formatDateTime(
                                                        latestAnalysis.analyzedAt
                                                    )}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl p-6 text-center">
                                            <p className="text-gray-500">
                                                No analysis available for this
                                                image.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Analysis History */}
                <section>
                    <div className="mb-5">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Analysis History
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Previous images and their analysis results.
                        </p>
                    </div>

                    <div className="space-y-5">
                        {wound.images?.map((image, index) => (
                            <div
                                key={image.imageId}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4">

                                    {/* Clickable Image */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedImage(image)
                                        }
                                        className="h-56 md:h-48 bg-gray-100 text-left cursor-pointer overflow-hidden"
                                    >
                                        <img
                                            src={image.imageUrl}
                                            alt={`Wound analysis ${
                                                index + 1
                                            }`}
                                            className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                        />
                                    </button>

                                    <div className="md:col-span-3 p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    Analysis{" "}
                                                    {wound.images.length -
                                                        index}
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatDateTime(
                                                        image.uploadedAt
                                                    )}
                                                </p>
                                            </div>

                                            {index === 0 && (
                                                <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                                    Latest
                                                </span>
                                            )}
                                        </div>

                                        {image.analysis ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Wound Area
                                                    </p>

                                                    <p className="font-semibold text-gray-800 mt-1">
                                                        {
                                                            image.analysis
                                                                .woundArea
                                                        }
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Previous Area
                                                    </p>

                                                    <p className="font-semibold text-gray-800 mt-1">
                                                        {image.analysis
                                                            .previousWoundArea ??
                                                            "N/A"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Change
                                                    </p>

                                                    <p className="font-semibold text-gray-800 mt-1">
                                                        {image.analysis
                                                            .changeArea ??
                                                            "N/A"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Analyzed
                                                    </p>

                                                    <p className="font-semibold text-gray-800 mt-1">
                                                        {formatDate(
                                                            image.analysis
                                                                .analyzedAt
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">
                                                No analysis available.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </section>

            {/* Image Analysis Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4 py-6"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Wound Analysis
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Uploaded{" "}
                                    {formatDateTime(
                                        selectedImage.uploadedAt
                                    )}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="text-gray-500 hover:text-gray-800 text-2xl font-semibold px-2"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 md:p-8">

                            {/* Images */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                        Original Wound
                                    </p>

                                    <div className="h-72 md:h-96 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                        <img
                                            src={selectedImage.imageUrl}
                                            alt="Original wound"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                        Segmentation Mask
                                    </p>

                                    <div className="h-72 md:h-96 bg-black rounded-xl overflow-hidden border border-gray-200">
                                        {selectedImage.analysis?.maskUrl ? (
                                            <img
                                                src={
                                                    selectedImage.analysis
                                                        .maskUrl
                                                }
                                                alt="Wound segmentation mask"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <p className="text-gray-400">
                                                    No segmentation mask
                                                    available.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Information */}
                            {selectedImage.analysis ? (
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                                        Analysis Results
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="border border-gray-200 rounded-xl p-5">
                                            <p className="text-sm text-gray-500">
                                                Wound Area
                                            </p>

                                            <p className="text-2xl font-semibold text-gray-800 mt-2">
                                                {
                                                    selectedImage.analysis
                                                        .woundArea
                                                }
                                            </p>
                                        </div>

                                        <div className="border border-gray-200 rounded-xl p-5">
                                            <p className="text-sm text-gray-500">
                                                Previous Area
                                            </p>

                                            <p className="text-2xl font-semibold text-gray-800 mt-2">
                                                {selectedImage.analysis
                                                    .previousWoundArea ??
                                                    "N/A"}
                                            </p>
                                        </div>

                                        <div className="border border-gray-200 rounded-xl p-5">
                                            <p className="text-sm text-gray-500">
                                                Change
                                            </p>

                                            <p className="text-2xl font-semibold text-gray-800 mt-2">
                                                {selectedImage.analysis
                                                    .changeArea ?? "N/A"}
                                            </p>
                                        </div>

                                        <div className="border border-gray-200 rounded-xl p-5">
                                            <p className="text-sm text-gray-500">
                                                Analyzed On
                                            </p>

                                            <p className="text-lg font-semibold text-gray-800 mt-2">
                                                {formatDateTime(
                                                    selectedImage.analysis
                                                        .analyzedAt
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-8 bg-gray-50 rounded-xl p-6 text-center">
                                    <p className="text-gray-500">
                                        No analysis available for this image.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-5 border-t border-gray-200 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default WoundDetails;