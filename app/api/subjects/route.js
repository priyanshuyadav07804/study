import { NextResponse } from "next/server";
import { getSubjectsCollection, serializeSubject } from "@/lib/mongodb";

export async function GET() {
  try {
    const subjectsCollection = await getSubjectsCollection();
    const subjects = await subjectsCollection
      .find({})
      .project({ name: 1, videos: 1, playlists: 1, createdAt: 1, updatedAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: subjects.map(serializeSubject),
    });
  } catch (error) {
    console.error("[GET /api/subjects]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const subjectsCollection = await getSubjectsCollection();
    const body = await request.json();
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Subject name is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const subject = {
      name,
      videos: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await subjectsCollection.insertOne(subject);

    return NextResponse.json(
      {
        success: true,
        data: serializeSubject({ ...subject, _id: result.insertedId }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/subjects]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
