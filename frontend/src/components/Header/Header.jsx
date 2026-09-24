import React from "react";
import LogoutBtn from "./LogoutBtn";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Header() {
    const authStatus = useSelector((state) => state.auth.status);

    const navItems = [
        { name: "Home", slug: "/", active: true },
        { name: "Login", slug: "/login", active: !authStatus },
        { name: "Register", slug: "/register", active: !authStatus },
        { name: "Wounds", slug: "/wounds", active: authStatus },
        { name: "New Upload", slug: "/upload", active: authStatus },
        { name: "Notifications", slug: "/notifications", active: authStatus },
        { name: "Profile", slug: "/profile", active: authStatus },
    ];

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link
                    to="/"
                    className="text-2xl font-bold text-blue-600 tracking-tight"
                >
                    Wound Tracker
                </Link>

                <ul className="flex items-center gap-2">
                    {navItems.map((item) =>
                        item.active ? (
                            <li key={item.slug}>
                                <Link
                                    to={item.slug}
                                    className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ) : null
                    )}

                    {authStatus && (
                        <li className="ml-2">
                            <LogoutBtn />
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;