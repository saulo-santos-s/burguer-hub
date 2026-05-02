import { Router } from "express";
import { AdminModel } from "@workspace/db";
import { AdminLoginBody } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import { signToken } from "../lib/auth";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/login", async (req, res): Promise<void> => {
  try {
    console.log(`[LOGIN ATTEMPT] Email: ${req.body?.email}`);
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) {
      console.warn(`[LOGIN FAILED] Validation error: ${parsed.error.message}`);
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    console.log(`[AUTH DEBUG] Searching for email: "${normalizedEmail}"`);
    const admin = await AdminModel.findOne({ email: normalizedEmail });

    if (!admin) {
      console.warn(`[LOGIN FAILED] Admin not found for email: "${normalizedEmail}"`);
      // List all admins for debugging (only in dev)
      const allAdmins = await AdminModel.find({}, { email: 1 });
      console.log(`[AUTH DEBUG] Available admins in DB: ${JSON.stringify(allAdmins)}`);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    console.log(`[AUTH DEBUG] Admin found! Comparing password...`);
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      console.warn(`[LOGIN FAILED] Invalid password for email: "${normalizedEmail}"`);
      // Let's also check if it's the default password
      const isDefaultPassword = password === process.env.ADMIN_PASSWORD;
      console.log(`[AUTH DEBUG] Is provided password equal to ADMIN_PASSWORD env? ${isDefaultPassword}`);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    console.log(`[LOGIN SUCCESS] Admin logged in: ${normalizedEmail}`);
    const token = signToken({ adminId: admin._id.toString(), email: admin.email });

    // SECURITY: Set HttpOnly cookie instead of returning token in response
    // On localhost (development), we should not use secure: true if not using HTTPS
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to false for localhost/HTTP development
      sameSite: 'lax', // Use 'lax' for better compatibility in local dev
      maxAge: 3600000, // 1 hour
      path: '/',
    });

    res.json({
      user: { id: admin._id.toString(), email: admin.email, name: admin.name },
    });
  } catch (error) {
    console.error(`[LOGIN ERROR] Internal server error:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (_req, res): void => {
  // SECURITY: Clear the HttpOnly cookie on logout
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: "Logged out successfully" });
});

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  try {
    const adminReq = req as any;
    if (!adminReq.admin) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await AdminModel.findById(adminReq.admin.adminId);
    if (!user) {
      res.status(401).json({ error: "Admin not found" });
      return;
    }

    res.json({ id: user._id.toString(), email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
