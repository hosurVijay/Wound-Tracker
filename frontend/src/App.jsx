import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "./Store/authSlice";
import  Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx"
import { Outlet } from "react-router-dom";
import axios from "axios";
import "./App.css";
import api from "./Api/axios.js";

function App() {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        api
            .get(`/users/profile`)
            .then((response) => {
                dispatch(login({ userData: response.data.data }));
            })
            .catch(() => {
                dispatch(logout());
            })
            .finally(() => {
                setLoading(false);
            });
    }, [dispatch]);

    return !loading ? (
        <div className="min-h-screen flex flex-wrap content-between">
            <div className="w-full block">
                <Header />

                <main>
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    ) : null;
}

export default App;