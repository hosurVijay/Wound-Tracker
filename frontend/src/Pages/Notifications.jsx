import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import api from "../Api/axios";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get(
                    `/notifications`
                );

                setNotifications(response.data.data || []);
            } catch (error) {
                setErr(
                    error.response?.data?.message ||
                    "Unable to fetch your notifications."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
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

    const upcomingNotifications = notifications.filter((notification) => {
        if (!notification.scheduledAt) return false;

        return new Date(notification.scheduledAt) > new Date();
    });

    const notificationHistory = notifications.filter((notification) => {
        if (!notification.scheduledAt) return true;

        return new Date(notification.scheduledAt) <= new Date();
    });

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(
                `${import.meta.env.VITE_BASE_URL}/notifications/${notificationId}/read`
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (error) {
            console.log("Unable to mark notification as read", error);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="max-w-5xl mx-auto px-6 pt-12 pb-12">

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Notifications
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View your upcoming follow-ups and notification history.
                    </p>
                </div>

                {loading && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                        <p className="text-gray-500">
                            Loading your notifications...
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

                {!loading && !err && (
                    <>
                        <section className="mb-10">
                            <div className="mb-5">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Upcoming
                                </h2>

                                <p className="text-gray-500 mt-1">
                                    Scheduled follow-ups for your wounds.
                                </p>
                            </div>

                            {upcomingNotifications.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                                    <p className="text-gray-500">
                                        No upcoming notifications.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingNotifications.map(
                                        (notification) => {
                                            const remainingDays =
                                                getRemainingDays(
                                                    notification.scheduledAt
                                                );

                                            return (
                                                <div
                                                    key={notification.id}
                                                    className={`bg-white rounded-2xl border shadow-sm p-6 ${
                                                        notification.is_read
                                                            ? "border-gray-200"
                                                            : "border-blue-200"
                                                    }`}
                                                >
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-lg font-semibold text-gray-800">
                                                                    {
                                                                        notification.notification_type
                                                                    }
                                                                </h3>

                                                                {!notification.is_read && (
                                                                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                                                                )}
                                                            </div>

                                                            <p className="text-gray-600 mt-2">
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>

                                                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                                                                <span>
                                                                    Wound{" "}
                                                                    {
                                                                        notification.wound_id
                                                                    }
                                                                </span>

                                                                <span>
                                                                    Scheduled{" "}
                                                                    {formatDate(
                                                                        notification.scheduledAt
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 text-center min-w-[130px]">
                                                                <p className="text-sm text-gray-500">
                                                                    Remaining
                                                                </p>

                                                                <p className="text-blue-600 font-semibold mt-1">
                                                                    {remainingDays ===
                                                                    0
                                                                        ? "Due today"
                                                                        : `${remainingDays} ${
                                                                              remainingDays ===
                                                                              1
                                                                                  ? "day"
                                                                                  : "days"
                                                                          }`}
                                                                </p>
                                                            </div>

                                                            <Link
                                                                to={`/wounds/${notification.wound_id}`}
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification.id
                                                                    )
                                                                }
                                                                className="text-blue-600 font-medium hover:underline"
                                                            >
                                                                View Wound
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="mb-5">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Notification History
                                </h2>

                                <p className="text-gray-500 mt-1">
                                    Your previous wound-related notifications.
                                </p>
                            </div>

                            {notificationHistory.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                                    <p className="text-gray-500">
                                        No notification history yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notificationHistory.map(
                                        (notification) => (
                                            <div
                                                key={notification.id}
                                                className={`bg-white rounded-2xl border shadow-sm p-6 ${
                                                    notification.is_read
                                                        ? "border-gray-200"
                                                        : "border-blue-200"
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-lg font-semibold text-gray-800">
                                                                {
                                                                    notification.notification_type
                                                                }
                                                            </h3>

                                                            {!notification.is_read && (
                                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                                                    New
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-gray-600 mt-2">
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                                                            <span>
                                                                Wound{" "}
                                                                {
                                                                    notification.wound_id
                                                                }
                                                            </span>

                                                            <span>
                                                                {formatDateTime(
                                                                    notification.createdAt
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <Link
                                                            to={`/wounds/${notification.wound_id}`}
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification.id
                                                                )
                                                            }
                                                            className="text-blue-600 font-medium hover:underline"
                                                        >
                                                            View Wound
                                                        </Link>

                                                        {!notification.is_read && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification.id
                                                                    )
                                                                }
                                                                className="text-sm text-gray-500 hover:text-gray-800"
                                                            >
                                                                Mark as read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </section>
        </main>
    );
}

export default Notifications;