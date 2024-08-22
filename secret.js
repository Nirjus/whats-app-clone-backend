import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export const port = process.env.PORT || 6000;

export const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

export const nodeEnv = process.env.NODE_ENV || "development";

export const backendUrl = process.env.BACKEND_URL || "";
