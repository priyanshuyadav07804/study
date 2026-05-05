import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  clearAuthCookie,
  normalizeEmail,
  normalizeMobile,
  requireAuth,
  verifyPassword,
} from "@/lib/auth";
import { getSubjectsCollection, getUsersCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function serializeUser(user) {
  return {
    _id: user._id.toString(),
    name: user.name || "",
    email: user.email,
    mobile: user.mobile || "",
    image: user.image || "",
  };
}

function isAllowedImage(image) {
  if (!image) return true;
  if (image.length > 2000000) return false;
  return image.startsWith("data:image/") || image.startsWith("https://") || image.startsWith("http://");
}

export async function GET() {
  try {
    const { user, response } = await requireAuth();
    if (response) return response;

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[GET /api/profile]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { user, response } = await requireAuth();
    if (response) return response;

    const body = await request.json();
    const image = body.image?.trim() || "";

    if (!isAllowedImage(image)) {
      return NextResponse.json(
        { success: false, error: "Use an image URL or upload an image under 900 KB" },
        { status: 400 }
      );
    }

    const userId = new ObjectId(user._id);
    const usersCollection = await getUsersCollection();

    const result = await usersCollection.findOneAndUpdate(
      { _id: userId },
      { $set: { image, updatedAt: new Date() } },
      { returnDocument: "after", projection: { passwordHash: 0, passwordSalt: 0 } }
    );

    return NextResponse.json({
      success: true,
      data: serializeUser(result.value || result),
    });
  } catch (error) {
    console.error("[PUT /api/profile]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { user, response } = await requireAuth();
    if (response) return response;

    const body = await request.json();
    const name = body.name?.trim() || "";
    const email = normalizeEmail(body.email || "");
    const mobile = normalizeMobile(body.mobile || "");

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid email address" },
        { status: 400 }
      );
    }

    if (mobile && mobile.length < 10) {
      return NextResponse.json(
        { success: false, error: "Enter a valid mobile number" },
        { status: 400 }
      );
    }

    const userId = new ObjectId(user._id);
    const usersCollection = await getUsersCollection();

    const existingUser = await usersCollection.findOne({
      _id: { $ne: userId },
      $or: mobile ? [{ email }, { mobile }] : [{ email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "This email or mobile is already used by another account" },
        { status: 409 }
      );
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          name,
          email,
          mobile: mobile || null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after", projection: { passwordHash: 0, passwordSalt: 0 } }
    );

    return NextResponse.json({
      success: true,
      data: serializeUser(result.value || result),
    });
  } catch (error) {
    console.error("[PATCH /api/profile]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { user, response } = await requireAuth();
    if (response) return response;

    const body = await request.json().catch(() => ({}));
    const password = body.password || "";

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required to delete your account" },
        { status: 400 }
      );
    }

    const userId = new ObjectId(user._id);
    const usersCollection = await getUsersCollection();
    const savedUser = await usersCollection.findOne({ _id: userId });

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

    const subjectsCollection = await getSubjectsCollection();
    await subjectsCollection.deleteMany({ userId });
    await usersCollection.deleteOne({ _id: userId });

    const deleteResponse = NextResponse.json({ success: true });
    clearAuthCookie(deleteResponse);
    return deleteResponse;
  } catch (error) {
    console.error("[DELETE /api/profile]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
