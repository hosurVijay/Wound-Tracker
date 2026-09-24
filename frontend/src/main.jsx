import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import "./index.css";

import App from "./App.jsx";
import store from "./Store/store.js";

import Protected from "./components/AuthLayout.jsx";

import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import UploadWound from "./Pages/UploadWound.jsx";
import Wounds from "./Pages/Wounds.jsx";
import WoundDetails from "./Pages/WoundDetails.jsx";
import WoundResult from "./Pages/WoundResult.jsx";
import Notifications from "./Pages/Notifications.jsx";
import Profile from "./Pages/Profile.jsx";
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import VerifyOtp from "./Pages/VerifyOtp.jsx";
import ResetPassword from "./Pages/ResetPassword.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: (
                    <Protected authentication>
                        <Home />
                    </Protected>
                ),
            },

            {
                path: "/login",
                element: (
                    <Protected authentication={false}>
                        <Login />
                    </Protected>
                ),
            },

            {
                path: "/register",
                element: (
                    <Protected authentication={false}>
                        <Register />
                    </Protected>
                ),
            },

            {
                path: "/forgot-password",
                element: (
                    <Protected authentication={false}>
                        <ForgotPassword />
                    </Protected>
                ),
            },

            {
                path: "/verify-otp",
                element: (
                    <Protected authentication={false}>
                        <VerifyOtp />
                    </Protected>
                ),
            },

            {
                path: "/reset-password",
                element: (
                    <Protected authentication={false}>
                        <ResetPassword />
                    </Protected>
                ),
            },

            {
                path: "/wounds",
                element: (
                    <Protected authentication>
                        <Wounds />
                    </Protected>
                ),
            },

            {
                path: "/wounds/:woundId",
                element: (
                    <Protected authentication>
                        <WoundDetails />
                    </Protected>
                ),
            },

            {
                path: "/wounds/result",
                element: (
                    <Protected authentication>
                        <WoundResult />
                    </Protected>
                ),
            },

            {
                path: "/upload",
                element: (
                    <Protected authentication>
                        <UploadWound />
                    </Protected>
                ),
            },

            {
                path: "/notifications",
                element: (
                    <Protected authentication>
                        <Notifications />
                    </Protected>
                ),
            },

            {
                path: "/profile",
                element: (
                    <Protected authentication>
                        <Profile />
                    </Protected>
                ),
            },
        ],
    },
]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>
);