import { NextResponse } from "next/server";
import User from "@/lib/models/User.js";
import OTP from "@/lib/models/OTP.js";

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

    // Update user verification status
    await User.updateVerificationStatus(email, true);

    // Delete OTP from database
    await OTP.deleteByEmail(email);

    return NextResponse.json(
      { message: "Email verified successfully. Account is now active." },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
