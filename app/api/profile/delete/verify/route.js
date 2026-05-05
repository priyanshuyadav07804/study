import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuth, verifyPassword } from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function PATCH(request) {
  try {
    const { user, response } = await requireAuth();
    if (response) return response;

    const body = await request.json();
    const password = body.password || "";

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();
    const savedUser = await usersCollection.findOne({ _id: new ObjectId(user._id) });

    if (!savedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const passwordMatches = await verifyPassword(
      password,
      savedUser.passwordSalt,
      savedUser.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, error: "Password is incorrect" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/profile/delete/verify]", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify password" },
      { status: 500 }
    );
  }
}
