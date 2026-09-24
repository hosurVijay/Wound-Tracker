import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";

function UploadWound() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm();

    const [wounds, setWounds] = useState([]);
    const [selectedWound, setSelectedWound] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const uploadType = watch("uploadType");
    const woundType = watch("woundType");
    const search = watch("search");

    useEffect(() => {
        if (uploadType !== "existing") {
            return;
        }

        const fetchWounds = async () => {
            try {
                const response = await api.get(
                    `/wounds`
                );

                setWounds(response.data.data || []);
            } catch (error) {
                setErr(
                    error.response?.data?.message ||
                    "Unable to fetch your wounds."
                );
            }
        };

        fetchWounds();
    }, [uploadType]);

    const filteredWounds = wounds.filter((wound) => {
        const searchValue = search?.toLowerCase() || "";

        return (
            wound.woundType?.toLowerCase().includes(searchValue) ||
            `wound ${wound.woundId}`.includes(searchValue)
        );
    });

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setErr("");
    };

    const selectWound = (wound) => {
        setSelectedWound(wound);
        setValue("search", `Wound ${wound.woundId}`);
    };

    const submitUpload = async () => {
        setErr("");

        if (!imageFile) {
            setErr("Please select a wound image.");
            return;
        }

        if (uploadType === "existing" && !selectedWound) {
            setErr("Please select a wound.");
            return;
        }

        if (uploadType === "new" && !woundType) {
            setErr("Please select a wound type.");
            return;
        }

        const formData = new FormData();

        formData.append("woundImage", imageFile);

        if (uploadType === "existing") {
            formData.append("woundId", selectedWound.woundId);
        }

        if (uploadType === "new") {
            formData.append("woundType", woundType);
        }

        try {
            setLoading(true);

            const response = await api.post(
                `/wounds/upload`,
                formData
            );

            navigate("/wounds/result", {
                state: {
                    result: response.data.data
                }
            });
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                "Failed to upload the image. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="max-w-4xl mx-auto px-6 pt-12 pb-12">

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        New Wound Analysis
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Upload a wound image to analyze and track its progress.
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800">
                            What would you like to analyze?
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Choose whether this image belongs to an existing
                            wound or starts a new wound record.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <label
                            className={`cursor-pointer rounded-2xl border p-6 transition ${
                                uploadType === "existing"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300"
                            }`}
                        >
                            <input
                                type="radio"
                                value="existing"
                                {...register("uploadType", {
                                    required: "Please select an option"
                                })}
                                className="sr-only"
                            />

                            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
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
                                        d="M21 21l-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                                    />
                                </svg>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800">
                                Existing Wound
                            </h3>

                            <p className="text-sm text-gray-500 mt-2">
                                Continue tracking a wound you have already
                                created.
                            </p>
                        </label>

                        <label
                            className={`cursor-pointer rounded-2xl border p-6 transition ${
                                uploadType === "new"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300"
                            }`}
                        >
                            <input
                                type="radio"
                                value="new"
                                {...register("uploadType", {
                                    required: "Please select an option"
                                })}
                                className="sr-only"
                            />

                            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
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

                            <h3 className="text-lg font-semibold text-gray-800">
                                New Wound
                            </h3>

                            <p className="text-sm text-gray-500 mt-2">
                                Create a new wound record and start tracking it.
                            </p>
                        </label>

                    </div>

                    {errors.uploadType && (
                        <p className="text-sm text-red-600 mt-2">
                            {errors.uploadType.message}
                        </p>
                    )}

                    {uploadType === "existing" && (
                        <div className="mt-8">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Your Wounds
                            </label>

                            <input
                                type="text"
                                {...register("search")}
                                placeholder="Search by wound type or wound number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                            />

                            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">

                                {filteredWounds.length > 0 ? (
                                    filteredWounds.map((wound) => {
                                        const latestImage =
                                            wound.images?.[0];

                                        const isSelected =
                                            selectedWound?.woundId ===
                                            wound.woundId;

                                        return (
                                            <button
                                                type="button"
                                                key={wound.woundId}
                                                onClick={() =>
                                                    selectWound(wound)
                                                }
                                                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition ${
                                                    isSelected
                                                        ? "border-blue-600 bg-blue-50"
                                                        : "border-gray-200 hover:border-blue-300"
                                                }`}
                                            >
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                    {latestImage?.imageUrl && (
                                                        <img
                                                            src={
                                                                latestImage.imageUrl
                                                            }
                                                            alt={`Wound ${wound.woundId}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">
                                                        Wound {wound.woundId}
                                                    </p>

                                                    <p className="text-sm text-gray-500 mt-1 capitalize">
                                                        {wound.woundType}
                                                    </p>

                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(
                                                            wound.createdAt
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }
                                                        )}
                                                    </p>
                                                </div>

                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                        <svg
                                                            className="w-3.5 h-3.5 text-white"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="border border-gray-200 rounded-xl p-6 text-center">
                                        <p className="text-gray-500 text-sm">
                                            No wounds found.
                                        </p>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                    {uploadType === "new" && (
                        <div className="mt-8">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Wound Type
                            </label>

                            <select
                                {...register("woundType", {
                                    required: "Please select a wound type"
                                })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
                            >
                                <option value="">
                                    Select wound type
                                </option>
                                <option value="cut">Cut</option>
                                <option value="burn">Burn</option>
                                <option value="diabetic">Diabetic Wound</option>
                                <option value="other">Other</option>
                            </select>

                            {errors.woundType && (
                                <p className="text-sm text-red-600 mt-1">
                                    {errors.woundType.message}
                                </p>
                            )}

                        </div>
                    )}

                    {uploadType && (
                        <div className="mt-8">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Wound Image
                            </label>

                            <label
                                htmlFor="woundImage"
                                className="block cursor-pointer"
                            >
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition">

                                    {imagePreview ? (
                                        <div>
                                            <img
                                                src={imagePreview}
                                                alt="Wound preview"
                                                className="w-full max-h-80 object-contain rounded-xl"
                                            />

                                            <p className="text-blue-600 font-medium mt-4">
                                                Choose a different image
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center">
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
                                                        d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
                                                    />
                                                </svg>
                                            </div>

                                            <p className="text-gray-700 font-medium mt-4">
                                                Choose wound image
                                            </p>

                                            <p className="text-sm text-gray-400 mt-1">
                                                PNG, JPG or WEBP
                                            </p>
                                        </>
                                    )}

                                </div>
                            </label>

                            <input
                                id="woundImage"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    )}

                    {err && (
                        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <p className="text-sm text-red-600">
                                {err}
                            </p>
                        </div>
                    )}

                    {uploadType && (
                        <button
                            type="button"
                            onClick={handleSubmit(submitUpload)}
                            disabled={loading}
                            className="w-full mt-8 bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Analyzing Wound..."
                                : "Upload & Analyze"}
                        </button>
                    )}

                </div>
            </section>
        </main>
    );
}

export default UploadWound;