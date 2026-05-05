import { NextResponse } from "next/server";
import User from "@/lib/models/User.js";
import { comparePassword } from "@/lib/utils/passwordUtils.js";
import { generateToken } from "@/lib/utils/jwtUtils.js";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email first" },
        { status: 403 }
      );
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const tokenResult = generateToken(user._id.toString(), user.email);
    if (!tokenResult.success) {
      return NextResponse.json(
        { message: "Failed to generate token" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Login successful",
        token: tokenResult.token,
        user: {
          id: user._id.toString(),
          email: user.email,
          isVerified: user.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
