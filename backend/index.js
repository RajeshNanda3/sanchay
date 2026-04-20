import express from "express";
import dotenv from "dotenv";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

/* ---------------- REDIS ---------------- */

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({
  url: redisUrl,
});

redisClient
  .connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch((err) => console.error(" Failed to connect to Redis", err));

/* ---------------- TRUST PROXY (for deployment) ---------------- */

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

/* ---------------- CORS CONFIG ---------------- */

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : ["https://jan26-admin.vercel.app", "http://localhost:5173", "http://localhost:5174"];

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(cookieParser());

/* ---------------- ROUTES ---------------- */

import userRoute from "./routes/userRoute.js";
import transactinRoutes from "./routes/transactionRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/v1/users", userRoute);
app.use("/api/v1", transactinRoutes);
app.use("/api/v1/vendor", vendorRoutes);
app.use("/api/v1/admin", adminRoutes);

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("API is running ");

});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});

/* ---------------- EXPORT FOR VERCEL ---------------- */

// export default app; 