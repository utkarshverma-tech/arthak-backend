"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./middleware/auth");
const profile_1 = require("./controllers/profile");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Enable CORS with support for Authorization headers
app.use((0, cors_1.default)({
    origin: "*", // Adjust in production to match your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date() });
});
// Protected Profile Routes
app.get("/api/profiles/me", auth_1.authenticateSupabaseJWT, profile_1.getMyProfile);
app.post("/api/profiles", auth_1.authenticateSupabaseJWT, profile_1.saveProfile);
// Start server
app.listen(port, () => {
    console.log(`Arthak backend listening at http://localhost:${port}`);
});
