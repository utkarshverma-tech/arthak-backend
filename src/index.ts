import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateSupabaseJWT } from "./middleware/auth";
import { getMyProfile, saveProfile } from "./controllers/profile";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS with support for Authorization headers
app.use(
  cors({
    origin: "*", // Adjust in production to match your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Protected Profile Routes
app.get("/api/profiles/me", authenticateSupabaseJWT as any, getMyProfile as any);
app.post("/api/profiles", authenticateSupabaseJWT as any, saveProfile as any);

// Start server
app.listen(port, () => {
  console.log(`Arthak backend listening at http://localhost:${port}`);
});
