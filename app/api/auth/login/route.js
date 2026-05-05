import { NextResponse } from "next/server";
import {
  createToken,
  normalizeEmail,
  normalizeMobile,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = body.identifier?.trim() || "";
    const password = body.password || "";

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Email/mobile and password are required" },
        { status: 400 }
      );
    }

    const loginQuery = identifier.includes("@")
      ? { email: normalizeEmail(identifier) }
      : { mobile: normalizeMobile(identifier) };

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne(loginQuery);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid login details" },
        { status: 401 }
      );
    }

    const passwordMatches = await verifyPassword(
      password,
      user.passwordSalt,
      user.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, error: "Invalid login details" },
        { status: 401 }
      );
    }

    const token = createToken(user._id);
    const response = NextResponse.json({
      success: true,
      data: {
        _id: user._id.toString(),
        name: user.name || "",
        email: user.email,
        mobile: user.mobile || "",
        image: user.image || "",
      },
    });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { success: false, error: "Failed to log in" },
      { status: 500 }
    );
  }
}
