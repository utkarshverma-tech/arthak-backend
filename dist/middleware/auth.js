"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSupabaseJWT = authenticateSupabaseJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticateSupabaseJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }
    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
        console.error("Critical: SUPABASE_JWT_SECRET is not configured on the backend");
        return res.status(500).json({ error: "Internal server configuration error" });
    }
    try {
        // Verify the token statelessly using the Supabase JWT Secret
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Map claims: sub is the Supabase auth.users.id UUID
        req.user = {
            id: decoded.sub,
            email: decoded.email || "",
        };
        next();
    }
    catch (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({ error: "Invalid or expired authentication token" });
    }
}
