import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { prisma } from "../db";

// GET /api/profiles/me
export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const row = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!row) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Map database properties back to camelCase frontend response fields
    return res.json({
      id: row.id,
      email: row.email,
      fullName: row.fullName,
      userType: row.userType,
      education: row.education,
      currentYear: row.currentYear,
      skills: row.skills,
      careerGoal: row.careerGoal,
      experience: row.experience,
      goal: row.goal,
      studyTime: row.studyTime,
      location: row.location,
      gender: row.gender,
      dob: row.dob,
      phone: row.phone,
      languages: row.languages,
      aboutMe: row.aboutMe,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: "Internal database error" });
  }
}

// POST /api/profiles
export async function saveProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      fullName,
      userType,
      education,
      currentYear,
      skills,
      careerGoal,
      experience,
      goal,
      studyTime,
      location,
      gender,
      dob,
      phone,
      languages,
      aboutMe,
    } = req.body;

    const row = await prisma.profile.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: email || req.body.email || "",
        fullName: fullName || "",
        userType: userType || null,
        education: education || null,
        currentYear: currentYear || null,
        skills: skills || [],
        careerGoal: careerGoal || null,
        experience: experience || null,
        goal: goal || null,
        studyTime: studyTime || null,
        location: location || null,
        gender: gender || null,
        dob: dob || null,
        phone: phone || null,
        languages: languages || [],
        aboutMe: aboutMe || null,
      },
      update: {
        fullName: fullName !== undefined ? fullName : undefined,
        userType: userType !== undefined ? userType : undefined,
        education: education !== undefined ? education : undefined,
        currentYear: currentYear !== undefined ? currentYear : undefined,
        skills: skills !== undefined ? skills : undefined,
        careerGoal: careerGoal !== undefined ? careerGoal : undefined,
        experience: experience !== undefined ? experience : undefined,
        goal: goal !== undefined ? goal : undefined,
        studyTime: studyTime !== undefined ? studyTime : undefined,
        location: location !== undefined ? location : undefined,
        gender: gender !== undefined ? gender : undefined,
        dob: dob !== undefined ? dob : undefined,
        phone: phone !== undefined ? phone : undefined,
        languages: languages !== undefined ? languages : undefined,
        aboutMe: aboutMe !== undefined ? aboutMe : undefined,
      },
    });

    return res.status(201).json({
      id: row.id,
      email: row.email,
      fullName: row.fullName,
      userType: row.userType,
      education: row.education,
      currentYear: row.currentYear,
      skills: row.skills,
      careerGoal: row.careerGoal,
      experience: row.experience,
      goal: row.goal,
      studyTime: row.studyTime,
      location: row.location,
      gender: row.gender,
      dob: row.dob,
      phone: row.phone,
      languages: row.languages,
      aboutMe: row.aboutMe,
    });
  } catch (error) {
    console.error("Error saving user profile:", error);
    return res.status(500).json({ error: "Internal database error during profile creation" });
  }
}
