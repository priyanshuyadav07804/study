import { NextResponse } from "next/server";
import {
  createToken,
  hashPassword,
  normalizeEmail,
  normalizeMobile,
  setAuthCookie,
} from "@/lib/auth";
import { getUsersCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body.name?.trim() || "";
    const email = normalizeEmail(body.email || "");
    const mobile = normalizeMobile(body.mobile || "");
    const password = body.password || "";

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

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const usersCollection = await getUsersCollection();
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex(
      { mobile: 1 },
      { unique: true, partialFilterExpression: { mobile: { $type: "string" } } }
    );

    const existingUser = await usersCollection.findOne({
      $or: mobile ? [{ email }, { mobile }] : [{ email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account already exists with this email or mobile" },
        { status: 409 }
      );
    }

    const { salt, hash } = await hashPassword(password);
    const now = new Date();
    const user = {
      name,
      email,
      mobile: mobile || null,
      passwordSalt: salt,
      passwordHash: hash,
      createdAt: now,
      updatedAt: now,
    };

    const result = await usersCollection.insertOne(user);
    const token = createToken(result.insertedId);
    const response = NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId.toString(),
          name,
          email,
          mobile: mobile || "",
          image: "",
        },
      },
      { status: 201 }
    );
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
