import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { hashPassword, requireAuth, verifyPassword } from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

async function getSavedUser(userId) {
  const usersCollection = await getUsersCollection();
  const savedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
  return { usersCollection, savedUser };
}

export async function PATCH(request) {
  try {
    const { user, response } = await requireAuth();
    if (response) return response;

    const body = await request.json();
    const currentPassword = body.currentPassword || "";

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: "Current password is required" },
        { status: 400 }
      );
    }

    const { savedUser } = await getSavedUser(user._id);

    if (!savedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const passwordMatches = await verifyPassword(
      currentPassword,
      savedUser.passwordSalt,
      savedUser.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/profile/password]", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify current password" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { user, response } = await requireAuth();
    if (response) return response;

    const body = await request.json();
    const currentPassword = body.currentPassword || "";
    const newPassword = body.newPassword || "";

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: "Current password is required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const { usersCollection, savedUser } = await getSavedUser(user._id);

    if (!savedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const passwordMatches = await verifyPassword(
      currentPassword,
      savedUser.passwordSalt,
      savedUser.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const { salt, hash } = await hashPassword(newPassword);
    await usersCollection.updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          passwordSalt: salt,
          passwordHash: hash,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/profile/password]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update password" },
      { status: 500 }
    );
  }
}
