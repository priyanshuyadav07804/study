import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/middleware/authMiddleware.js";
import User from "@/lib/models/User.js";

// Example of a protected route that requires authentication
export async function GET(request) {
  try {
    // Get authenticated user
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user details
    const userDetails = await User.findById(user.userId);
    if (!userDetails) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile fetched successfully",
        user: {
          id: userDetails._id.toString(),
          email: userDetails.email,
          mobile: userDetails.mobile,
          isVerified: userDetails.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
