import jwt from "jsonwebtoken";

type AuthPayload = {
  id: string;
  email?: string;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return secret;
};

export const getAuthPayload = (req: Request): AuthPayload | null => {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;

  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch (error) {
    return null;
  }
};
