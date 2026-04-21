import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET ?? "brutal-burger-secret-key";

export interface TokenPayload {
  adminId: number;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
