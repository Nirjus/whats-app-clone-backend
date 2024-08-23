import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import createError from "http-errors";
import cors from "cors";
import { errorMiddleware } from "./utils/error.js";
import { frontendUrl } from "./secret.js";
import authRouter from "./routes/AuthRoutes.js";
import messageRouter from "./routes/MessageRoutes.js";
export const app = express();

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [frontendUrl],
    credentials: true,
  })
);

app.use("/uploads/recordings", express.static("uploads/recordings"));
app.use("/uploads/images", express.static("uploads/images"));
app.use("/uploads/videos", express.static("uploads/videos"));
// routers
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

app.get("/test", (req, res) => {
  res.status(201).json({
    success: true,
    message: "API is ready",
  });
});

app.use((req, res, next) => {
  next(createError(404, `Route ${req.originalUrl} not fount`));
});

app.use(errorMiddleware);
