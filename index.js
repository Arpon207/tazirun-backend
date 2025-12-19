import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import {
  DATABASE,
  MAX_JSON_SIZE,
  PORT,
  REQUEST_NUMBER,
  REQUEST_TIME,
  URL_ENCODE,
  WEB_CACHE,
} from "./app/config/config.js";

import router from "./routes/api.js";
import { createDBIndexes } from "./app/config/dbIndexes.js";

const app = express();

// ---------------------------------------------
// Basic Setup
// ---------------------------------------------

// Improve security & tiny performance boost
app.disable("x-powered-by");

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------
// CORS Setup (Your Logic – Unchanged)
// ---------------------------------------------

const allowedOrigins = [
  "https://www.tazirun.com",
  "https://tazirun.com",
  "https://tazirun-frontend.vercel.app",
  "https://tazirun-frontend-git-main-md-atikur-rahmans-projects.vercel.app",
  "https://tazirun-frontend-fyavbtgxt-md-atikur-rahmans-projects.vercel.app",
  "http://localhost:5173",
  "https://tazirun.netlify.app/",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile/postman

      if (
        origin.includes("vercel.app") ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".tazirun.com")
      ) {
        return callback(null, true);
      }

      console.log("CORS blocked for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "token",
      "guestid",
      "user_id",
      "guest_id",
    ],
  })
);

app.options("*", cors());

// ---------------------------------------------
// Middlewares
// ---------------------------------------------

// Static file serving
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, path, stat) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Request body parsing
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: URL_ENCODE }));

// Security headers
app.use(helmet());

// Response Compression (Improves speed)
app.use(compression());

// Enhanced Logging with performance tracking
if (process.env.NODE_ENV !== "production") {
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );
} else {
  // Production performance monitoring
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      // Log slow requests (> 1 second)
      if (duration > 1000) {
        console.log(
          `SLOW REQUEST: ${req.method} ${req.originalUrl} - ${duration}ms`
        );
      }
    });
    next();
  });
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: REQUEST_TIME,
  max: REQUEST_NUMBER,
});
app.use(limiter);

// Disable unnecessary ETag if WEB_CACHE=false
if (WEB_CACHE === "false" || WEB_CACHE === false) {
  app.set("etag", false);
}

// ---------------------------------------------
// Database Connection with Index Setup
// ---------------------------------------------

mongoose
  .connect(DATABASE, {
    autoIndex: true,
    maxPoolSize: 10, // Better connection management
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log("MongoDB connected!");

    // Call index builder (clean separation)
    await createDBIndexes(mongoose.connection.db);
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.toString());
  });

// ---------------------------------------------
// API Routes
// ---------------------------------------------

app.use("/api/v1", router);

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({ status: "fail", data: "Not Found!" });
});

// ---------------------------------------------
// Server Start
// ---------------------------------------------
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
