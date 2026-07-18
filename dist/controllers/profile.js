"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProfile = getMyProfile;
exports.saveProfile = saveProfile;
const db_1 = require("../db");
// GET /api/profiles/me
async function getMyProfile(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const result = await db_1.db.query("SELECT * FROM profiles WHERE id = $1", [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Profile not found" });
        }
        const row = result.rows[0];
        // Map DB underscore fields back to camelCase frontend fields
        return res.json({
            id: row.id,
            email: row.email,
            fullName: row.full_name,
            userType: row.user_type,
            education: row.education,
            currentYear: row.current_year,
            skills: row.skills || [],
            careerGoal: row.career_goal,
            experience: row.experience,
            goal: row.goal,
            studyTime: row.study_time,
        });
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ error: "Internal database error" });
    }
}
// POST /api/profiles
async function saveProfile(req, res) {
    try {
        const userId = req.user?.id;
        const email = req.user?.email;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { fullName, userType, education, currentYear, skills, careerGoal, experience, goal, studyTime, } = req.body;
        const query = `
      INSERT INTO profiles (
        id, email, full_name, user_type, education, current_year, skills, career_goal, experience, goal, study_time, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        user_type = COALESCE(EXCLUDED.user_type, profiles.user_type),
        education = COALESCE(EXCLUDED.education, profiles.education),
        current_year = COALESCE(EXCLUDED.current_year, profiles.current_year),
        skills = COALESCE(EXCLUDED.skills, profiles.skills),
        career_goal = COALESCE(EXCLUDED.career_goal, profiles.career_goal),
        experience = COALESCE(EXCLUDED.experience, profiles.experience),
        goal = COALESCE(EXCLUDED.goal, profiles.goal),
        study_time = COALESCE(EXCLUDED.study_time, profiles.study_time),
        updated_at = NOW()
      RETURNING *;
    `;
        const result = await db_1.db.query(query, [
            userId,
            email || req.body.email || "",
            fullName || "",
            userType || null,
            education || null,
            currentYear || null,
            skills || [],
            careerGoal || null,
            experience || null,
            goal || null,
            studyTime || null,
        ]);
        const row = result.rows[0];
        return res.status(201).json({
            id: row.id,
            email: row.email,
            fullName: row.full_name,
            userType: row.user_type,
            education: row.education,
            currentYear: row.current_year,
            skills: row.skills || [],
            careerGoal: row.career_goal,
            experience: row.experience,
            goal: row.goal,
            studyTime: row.study_time,
        });
    }
    catch (error) {
        console.error("Error saving user profile:", error);
        return res.status(500).json({ error: "Internal database error during profile creation" });
    }
}
