import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

export function generateToken(userId, email) {
  try {
    const token = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
    return { success: true, token };
  } catch (error) {
    console.error("Error generating JWT token:", error);
    return { success: false, message: "Failed to generate token" };
  }
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { success: true, decoded };
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    return { success: false, message: "Invalid or expired token" };
  }
}

export function decodeToken(token) {
  try {
    const decoded = jwt.decode(token);
    return { success: true, decoded };
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return { success: false, message: "Failed to decode token" };
  }
}
