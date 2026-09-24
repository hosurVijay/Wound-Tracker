import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

function WoundResult() {
    const location = useLocation();
    const result = location.state?.result;

    if (!result) {
        return <Navigate to="/upload" replace />;
    }

    const analysis = result.analysis;

    const formatNumber = (value) => {
        if (value === null || value === undefined) {
            return "N/A";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return value;
        }

        return number.toFixed(2);
    };

    const formatPercentage = (value) => {
        if (value === null || value === undefined) {
            return "N/A";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return value;
        }

        return `${number.toFixed(2)}%`;
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="max-w-7xl mx-auto px-6 pt-10 pb-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <p className="text-sm text-blue-600 font-medium mb-2">
                            Wound Analysis
                        </p>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                            Analysis Complete
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Here are the results from your latest wound analysis.
                        </p>
                    </div>

                    <Link
                        to="/wounds"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        View Wound History
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Original Wound
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Uploaded wound image
                            </p>
                        </div>

                        <div className="h-80 bg-gray-100">
                            <img
                                src={result.imageUrl}
                                alt="Original wound"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Segmentation Result
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Wound area identified by the model
                            </p>
                        </div>

                        <div className="h-80 bg-gray-100">
                            <img
                                src={analysis.maskUrl}
                                alt="Wound segmentation mask"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>

                <section className="mb-8">
                    <div className="mb-5">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Analysis Results
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Measurements generated from the wound analysis.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <p className="text-sm text-gray-500">
                                Wound Area
                            </p>

                            <p className="text-2xl font-semibold text-gray-800 mt-2">
                                {formatNumber(analysis.woundArea)}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <p className="text-sm text-gray-500">
                                Healthy Area
                            </p>

                            <p className="text-2xl font-semibold text-gray-800 mt-2">
                                {formatNumber(analysis.healthyArea)}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <p className="text-sm text-gray-500">
                                Confidence
                            </p>

                            <p className="text-2xl font-semibold text-gray-800 mt-2">
                                {formatPercentage(
                                    Number(analysis.confidence) * 100
                                )}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <p className="text-sm text-gray-500">
                                Change in Area
                            </p>

                            <p className="text-2xl font-semibold text-gray-800 mt-2">
                                {formatNumber(analysis.changeArea)}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        Progress Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">
                                Previous Wound Area
                            </p>

                            <p className="text-lg font-semibold text-gray-800 mt-1">
                                {formatNumber(
                                    analysis.previousWoundArea
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Previous Healthy Area
                            </p>

                            <p className="text-lg font-semibold text-gray-800 mt-1">
                                {formatNumber(
                                    analysis.previousHealthyArea
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Change Percentage
                            </p>

                            <p className="text-lg font-semibold text-gray-800 mt-1">
                                {formatPercentage(
                                    analysis.changePercentage
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Wound Status
                            </p>

                            <p
                                className={`inline-block mt-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                                    analysis.isWorsening
                                        ? "bg-red-50 text-red-600"
                                        : "bg-green-50 text-green-600"
                                }`}
                            >
                                {analysis.isWorsening
                                    ? "Wound is worsening"
                                    : "Wound is improving"}
                            </p>
                        </div>
                    </div>
                </section>

                {result.notification && (
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Follow-up Notification
                        </h2>

                        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-5">
                            <p className="text-sm text-blue-600 font-medium">
                                {result.notification.type}
                            </p>

                            <p className="text-gray-700 mt-2">
                                {result.notification.message}
                            </p>

                            {result.notification.scheduledDays !== null && (
                                <p className="text-sm text-gray-500 mt-3">
                                    Follow-up scheduled in{" "}
                                    {result.notification.scheduledDays} days.
                                </p>
                            )}
                        </div>
                    </section>
                )}

                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        Analysis Information
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">
                                Wound ID
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                                {result.woundId}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Image ID
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                                {result.imageId}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Analysis ID
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                                {result.analysisId}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    <Link
                        to={`/wounds/${result.woundId}`}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-center hover:bg-blue-700 transition"
                    >
                        View Wound Details
                    </Link>

                    <Link
                        to="/upload"
                        className="border border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-semibold text-center hover:bg-blue-50 transition"
                    >
                        Analyze Another Image
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default WoundResult;