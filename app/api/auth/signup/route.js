import { NextResponse } from "next/server";
import User from "@/lib/models/User.js";
import OTP from "@/lib/models/OTP.js";
import { hashPassword } from "@/lib/utils/passwordUtils.js";
import { generateOTP, isValidEmail, isValidPassword } from "@/lib/utils/validators.js";
import { sendOTPEmail } from "@/lib/utils/emailUtils.js";

export async function POST(request) {
  try {
    const { email, password, mobile } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters with uppercase, lowercase, and numbers",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Send OTP to email
    const emailResult = await sendOTPEmail(email, otp);
    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    // Store OTP in database
    await OTP.create(email, otp, 10);

    // Store temporary user data (with unverified status)
    const hashedPassword = await hashPassword(password);
    const userResult = await User.create({
      email,
      password: hashedPassword,
      mobile: mobile || null,
      isVerified: false,
    });

    return NextResponse.json(
      {
        message: "User registered successfully. OTP sent to email.",
        userId: userResult.insertedId,
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
