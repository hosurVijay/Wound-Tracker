import React, { useEffect, useState } from "react";
import api from "../Api/axios";

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [editingProfile, setEditingProfile] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        name: "",
        phoneNumber: "",
        dob: "",
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/users/profile");

                const userData = response.data.data;

                setUser(userData);

                setProfileData({
                    name: userData.name || "",
                    phoneNumber: userData.phoneNumber || "",
                    dob: userData.date_of_birth
                        ? userData.date_of_birth.split("T")[0]
                        : "",
                });
            } catch (error) {
                setErr(
                    error.response?.data?.message ||
                    "Unable to fetch profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditProfile = () => {
        setProfileData({
            name: user?.name || "",
            phoneNumber: user?.phoneNumber || "",
            dob: user?.date_of_birth
                ? user.date_of_birth.split("T")[0]
                : "",
        });

        setErr("");
        setEditingProfile(true);
    };

    const handleCancelProfile = () => {
        setProfileData({
            name: user?.name || "",
            phoneNumber: user?.phoneNumber || "",
            dob: user?.date_of_birth
                ? user.date_of_birth.split("T")[0]
                : "",
        });

        setErr("");
        setEditingProfile(false);
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setErr("");

        try {
            const response = await api.patch("/users/update-profile", {
                name: profileData.name,
                phoneNumber: profileData.phoneNumber,
                dob: profileData.dob,
            });

            setUser(response.data.data);
            setEditingProfile(false);
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                "Unable to update profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handleEditPassword = () => {
        setPasswordData({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setErr("");
        setEditingPassword(true);
    };

    const handleCancelPassword = () => {
        setPasswordData({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setErr("");
        setEditingPassword(false);
    };

    const handleSavePassword = async () => {
        setErr("");

        if (
            !passwordData.oldPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
        ) {
            setErr("All password fields are required.");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErr("New password and confirm password do not match.");
            return;
        }

        setSavingPassword(true);

        try {
            await api.patch("/users/password", {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            });

            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setEditingPassword(false);
        } catch (error) {
            setErr(
                error.response?.data?.message ||
                "Unable to update password."
            );
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <p className="text-gray-500">
                    Loading profile...
                </p>
            </main>
        );
    }

    if (err && !user) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
                <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center max-w-md w-full">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Unable to load profile
                    </h2>

                    <p className="text-red-600 text-sm mt-2">
                        {err}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <section className="max-w-5xl mx-auto px-6 pt-12 pb-12">

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Your Profile
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage your account information and security.
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    <div className="bg-blue-600 px-6 md:px-8 py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden">
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-blue-600">
                                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {user?.name || "User"}
                                </h2>

                                <p className="text-blue-100 mt-1">
                                    {user?.email || "N/A"}
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="p-6 md:p-8">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Personal Information
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    {editingProfile
                                        ? "Update your personal information."
                                        : "Your account information"}
                                </p>
                            </div>

                            {!editingProfile && (
                                <button
                                    type="button"
                                    onClick={handleEditProfile}
                                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {err && (
                            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-5">
                                {err}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="bg-gray-50 rounded-xl p-5">
                                <p className="text-sm text-gray-500">
                                    Name
                                </p>

                                {editingProfile ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleProfileChange}
                                        className="w-full mt-2 px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="text-lg font-semibold text-gray-800 mt-1">
                                        {user?.name || "N/A"}
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5">
                                <p className="text-sm text-gray-500">
                                    Email
                                </p>

                                <p className="text-lg font-semibold text-gray-800 mt-1">
                                    {user?.email || "N/A"}
                                </p>

                                <p className="text-xs text-gray-400 mt-2">
                                    Email cannot be changed.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5">
                                <p className="text-sm text-gray-500">
                                    Phone Number
                                </p>

                                {editingProfile ? (
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={profileData.phoneNumber}
                                        onChange={handleProfileChange}
                                        className="w-full mt-2 px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="text-lg font-semibold text-gray-800 mt-1">
                                        {user?.phoneNumber || "N/A"}
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-5">
                                <p className="text-sm text-gray-500">
                                    Date of Birth
                                </p>

                                {editingProfile ? (
                                    <input
                                        type="date"
                                        name="dob"
                                        value={profileData.dob}
                                        onChange={handleProfileChange}
                                        className="w-full mt-2 px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="text-lg font-semibold text-gray-800 mt-1">
                                        {user?.age ?? "N/A"} years
                                    </p>
                                )}
                            </div>

                        </div>

                        {editingProfile && (
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCancelProfile}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSaveProfile}
                                    disabled={savingProfile}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                >
                                    {savingProfile
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        )}

                        <div className="border-t border-gray-200 mt-8 pt-8">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Account Security
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Update your password to keep your account secure.
                                    </p>
                                </div>

                                {!editingPassword && (
                                    <button
                                        type="button"
                                        onClick={handleEditPassword}
                                        className="border border-blue-600 text-blue-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition text-center"
                                    >
                                        Edit Password
                                    </button>
                                )}

                            </div>

                            {editingPassword && (
                                <div className="mt-6 bg-gray-50 rounded-2xl p-6">

                                    <div className="grid grid-cols-1 gap-5">

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>

                                            <input
                                                type="password"
                                                name="oldPassword"
                                                value={passwordData.oldPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>

                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>

                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                                            />
                                        </div>

                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={handleCancelPassword}
                                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSavePassword}
                                            disabled={savingPassword}
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                        >
                                            {savingPassword
                                                ? "Updating..."
                                                : "Update Password"}
                                        </button>
                                    </div>

                                </div>
                            )}

                        </div>

                    </div>
                </div>

            </section>
        </main>
    );
}

export default Profile;