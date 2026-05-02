import jwt from "jsonwebtoken";

// SECURITY: JWT_SECRET must be set in environment variables
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET environment variable is required and must be at least 32 characters long. Set it in your .env file",
  );
}

const JWT_SECRET: string = jwtSecret;

export interface TokenPayload {
  adminId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  // SECURITY: Reduced expiration to 1 hour for better security
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
