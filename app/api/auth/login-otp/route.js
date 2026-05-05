import { NextResponse } from "next/server";
import User from "@/lib/models/User.js";
import OTP from "@/lib/models/OTP.js";
import { isValidEmail } from "@/lib/utils/validators.js";
import { generateOTP } from "@/lib/utils/validators.js";
import { sendLoginOTPEmail } from "@/lib/utils/emailUtils.js";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user exists
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

    // Generate OTP
    const otp = generateOTP();

    // Send OTP to email
    const emailResult = await sendLoginOTPEmail(email, otp);
    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    // Store OTP in database
    await OTP.create(email, otp, 10);

    return NextResponse.json(
      {
        message: "Login OTP sent to email successfully",
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login OTP generation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
