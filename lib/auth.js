import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import { getUsersCollection } from "@/lib/mongodb";

const AUTH_COOKIE = "memanshi_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable in .env.local");
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function sign(value) {
  return base64Url(
    crypto.createHmac("sha256", SECRET).update(value).digest()
  );
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function createToken(userId) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      sub: userId.toString(),
      exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE,
    })
  );
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function verifyToken(token) {
  if (!token) return null;

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const expectedSignature = sign(`${header}.${payload}`);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded.sub || !ObjectId.isValid(decoded.sub)) return null;
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: decoded.sub };
  } catch {
    return null;
  }
}

export function setAuthCookie(response, token) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
}

export function clearAuthCookie(response) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthUser() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  const session = verifyToken(token);
  if (!session) return null;

  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne(
    { _id: new ObjectId(session.userId) },
    { projection: { passwordHash: 0, passwordSalt: 0 } }
  );

  if (!user) return null;

  return {
    _id: user._id.toString(),
    name: user.name || "",
    email: user.email,
    mobile: user.mobile || "",
    image: user.image || "",
  };
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export async function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 310000, 32, "sha256", (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey.toString("hex"));
    });
  });

  return { salt, hash };
}

export async function verifyPassword(password, salt, hash) {
  const passwordHash = await hashPassword(password, salt);
  return timingSafeEqual(passwordHash.hash, hash);
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function normalizeMobile(mobile) {
  return mobile.trim().replace(/[^\d+]/g, "");
}

export function getAuthCookieName() {
  return AUTH_COOKIE;
}
