import { NextResponse } from "next/server";
import OTP from "@/lib/models/OTP.js";
import { generateToken } from "@/lib/utils/jwtUtils.js";
import User from "@/lib/models/User.js";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpResult = await OTP.verifyOTP(email, otp);
    if (!otpResult.valid) {
      return NextResponse.json(
        { message: otpResult.message },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
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

    // Delete OTP from database
    await OTP.deleteByEmail(email);

    return NextResponse.json(
      {
        message: "Login successful via OTP",
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
    console.error("OTP login verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
