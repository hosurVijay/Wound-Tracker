import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "*",
  }),
);
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

// user api import
import userRoute from "./routes/user.route.js";
app.use("/api/v1/users", userRoute);

// wound api import
import woundRoute from "./routes/wound.route.js";
app.use("/api/v1/wounds", woundRoute);

// notification api import
import notificationRoute from "./routes/notification.route.js";
app.use("/api/v1/notification", notificationRoute);

export { app };
