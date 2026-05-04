import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSubjectsCollection, serializeSubject } from "@/lib/mongodb";

function getObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function getYoutubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0];
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2];
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2];
      }
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

function getPlaylistId(url) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("list");
  } catch {
    return null;
  }
}

function decodeXml(text) {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

async function getPlaylistVideos(playlistUrl) {
  const playlistId = getPlaylistId(playlistUrl);
  if (!playlistId) return null;

  const response = await fetch(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`,
    { cache: "no-store" }
  );

  if (!response.ok) return null;

  const xml = await response.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
  const feedTitle = xml.match(/<title>([\s\S]*?)<\/title>/)?.[1];

  const videos = entries
    .map((entry) => {
      const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];

      if (!videoId) return null;

      return {
        _id: new ObjectId(),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        videoId,
        title: title ? decodeXml(title.trim()) : "",
        createdAt: new Date(),
      };
    })
    .filter(Boolean);

  return {
    _id: new ObjectId(),
    playlistId,
    url: playlistUrl,
    title: feedTitle ? decodeXml(feedTitle.trim()) : "YouTube Playlist",
    videos,
    createdAt: new Date(),
  };
}

export async function GET(_request, { params }) {
  try {
    const subjectId = getObjectId(params.id);
    if (!subjectId) {
      return NextResponse.json(
        { success: false, error: "Invalid subject id" },
        { status: 400 }
      );
    }

    const subjectsCollection = await getSubjectsCollection();
    const subject = await subjectsCollection.findOne({ _id: subjectId });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: serializeSubject(subject) });
  } catch (error) {
    console.error(`[GET /api/subjects/${params.id}]`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const subjectId = getObjectId(params.id);
    if (!subjectId) {
      return NextResponse.json(
        { success: false, error: "Invalid subject id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const subjectsCollection = await getSubjectsCollection();

    if (body.playlistUrl) {
      const playlist = await getPlaylistVideos(body.playlistUrl.trim());

      if (!playlist || playlist.videos.length === 0) {
        return NextResponse.json(
          { success: false, error: "Could not import videos from this playlist" },
          { status: 400 }
        );
      }

      const subject = await subjectsCollection.findOne({ _id: subjectId });
      if (!subject) {
        return NextResponse.json(
          { success: false, error: "Subject not found" },
          { status: 404 }
        );
      }

      const alreadyImported = (subject.playlists || []).some(
        (savedPlaylist) => savedPlaylist.playlistId === playlist.playlistId
      );

      if (alreadyImported) {
        return NextResponse.json(
          { success: false, error: "This playlist is already imported" },
          { status: 400 }
        );
      }

      const result = await subjectsCollection.findOneAndUpdate(
        { _id: subjectId },
        {
          $push: { playlists: { $each: [playlist], $position: 0 } },
          $set: { updatedAt: new Date() },
        },
        { returnDocument: "after" }
      );

      return NextResponse.json(
        { success: true, data: serializeSubject(result.value || result) },
        { status: 201 }
      );
    }

    const url = body.url?.trim();
    const videoId = url ? getYoutubeId(url) : null;

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Enter a valid YouTube link" },
        { status: 400 }
      );
    }

    const now = new Date();
    const video = {
      _id: new ObjectId(),
      url,
      videoId,
      title: body.title?.trim() || "",
      createdAt: now,
    };

    if (body.playlistId) {
      const playlistObjectId = getObjectId(body.playlistId);
      if (!playlistObjectId) {
        return NextResponse.json(
          { success: false, error: "Invalid playlist id" },
          { status: 400 }
        );
      }

      const result = await subjectsCollection.findOneAndUpdate(
        { _id: subjectId, "playlists._id": playlistObjectId },
        {
          $push: {
            "playlists.$.videos": { $each: [video], $position: 0 },
          },
          $set: {
            "playlists.$.updatedAt": now,
            updatedAt: now,
          },
        },
        { returnDocument: "after" }
      );

      const subject = result.value || result;
      if (!subject) {
        return NextResponse.json(
          { success: false, error: "Playlist not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: serializeSubject(subject) },
        { status: 201 }
      );
    }

    const result = await subjectsCollection.findOneAndUpdate(
      { _id: subjectId },
      {
        $push: { videos: { $each: [video], $position: 0 } },
        $set: { updatedAt: now },
      },
      { returnDocument: "after" }
    );

    const subject = result.value || result;
    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: serializeSubject(subject) },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST /api/subjects/${params.id}]`, error);
    return NextResponse.json(
      { success: false, error: "Failed to add YouTube content" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const subjectId = getObjectId(params.id);
    if (!subjectId) {
      return NextResponse.json(
        { success: false, error: "Invalid subject id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const subjectsCollection = await getSubjectsCollection();
    const now = new Date();

    // Edit subject title (rename subject)
    if (!body.playlistId && !body.videoId && body.subjectTitle !== undefined) {
      const newTitle = body.subjectTitle?.trim() || "";
      const result = await subjectsCollection.findOneAndUpdate(
        { _id: subjectId },
        { $set: { name: newTitle, updatedAt: now } },
        { returnDocument: "after" }
      );

      const subject = result.value || result;
      if (!subject) {
        return NextResponse.json(
          { success: false, error: "Subject not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: serializeSubject(subject) });
    }

    // Edit playlist title (playlist-level update)
    if (body.playlistId && !body.videoId && body.playlistTitle !== undefined) {
      const playlistObjectId = getObjectId(body.playlistId);
      if (!playlistObjectId) {
        return NextResponse.json(
          { success: false, error: "Invalid playlist id" },
          { status: 400 }
        );
      }

      const result = await subjectsCollection.findOneAndUpdate(
        { _id: subjectId, "playlists._id": playlistObjectId },
        {
          $set: {
            "playlists.$.title": body.playlistTitle?.trim() || "",
            "playlists.$.updatedAt": now,
            updatedAt: now,
          },
        },
        { returnDocument: "after" }
      );

      const subject = result.value || result;
      if (!subject) {
        return NextResponse.json(
          { success: false, error: "Playlist not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: serializeSubject(subject) });
    }

    // If updating a video (either root or inside a playlist)
    const videoObjectId = getObjectId(body.videoId);
    if (!videoObjectId) {
      return NextResponse.json(
        { success: false, error: "Invalid video id" },
        { status: 400 }
      );
    }

    const updateData = { updatedAt: now };

    if (body.watched !== undefined) {
      updateData["videos.$.watched"] = Boolean(body.watched);
      updateData["videos.$.updatedAt"] = now;
    } else {
      updateData["videos.$.title"] = body.title?.trim() || "";
      updateData["videos.$.updatedAt"] = now;
    }

    if (body.url !== undefined) {
      const url = body.url?.trim();
      const youtubeId = url ? getYoutubeId(url) : null;

      if (!youtubeId) {
        return NextResponse.json(
          { success: false, error: "Enter a valid YouTube link" },
          { status: 400 }
        );
      }

      updateData["videos.$.url"] = url;
      updateData["videos.$.videoId"] = youtubeId;
    }

    if (body.playlistId) {
      const playlistObjectId = getObjectId(body.playlistId);
      if (!playlistObjectId) {
        return NextResponse.json(
          { success: false, error: "Invalid playlist id" },
          { status: 400 }
        );
      }

      const playlistUpdateData = { updatedAt: now };

      if (body.watched !== undefined) {
        playlistUpdateData["playlists.$[playlist].videos.$[video].watched"] =
          Boolean(body.watched);
        playlistUpdateData["playlists.$[playlist].videos.$[video].updatedAt"] = now;
      } else {
        playlistUpdateData["playlists.$[playlist].videos.$[video].title"] =
          body.title?.trim() || "";
        playlistUpdateData["playlists.$[playlist].videos.$[video].updatedAt"] = now;

        if (body.url !== undefined) {
          const url = body.url?.trim();
          const youtubeId = url ? getYoutubeId(url) : null;

          if (!youtubeId) {
            return NextResponse.json(
              { success: false, error: "Enter a valid YouTube link" },
              { status: 400 }
            );
          }

          playlistUpdateData["playlists.$[playlist].videos.$[video].url"] = url;
          playlistUpdateData["playlists.$[playlist].videos.$[video].videoId"] = youtubeId;
        }
      }

      const result = await subjectsCollection.findOneAndUpdate(
        { _id: subjectId },
        { $set: playlistUpdateData },
        {
          arrayFilters: [
            { "playlist._id": playlistObjectId },
            { "video._id": videoObjectId },
          ],
          returnDocument: "after",
        }
      );

      const subject = result.value || result;
      if (!subject) {
        return NextResponse.json(
          { success: false, error: "Video not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: serializeSubject(subject) });
    }

    const result = await subjectsCollection.findOneAndUpdate(
      { _id: subjectId, "videos._id": videoObjectId },
      { $set: updateData },
      { returnDocument: "after" }
    );

    const subject = result.value || result;
    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: serializeSubject(subject) });
  } catch (error) {
    console.error(`[PUT /api/subjects/${params.id}]`, error);
    return NextResponse.json(
      { success: false, error: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const subjectId = getObjectId(params.id);
    if (!subjectId) {
      return NextResponse.json(
        { success: false, error: "Invalid subject id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const subjectsCollection = await getSubjectsCollection();
    // Delete entire subject
    if (body.deleteSubject) {
      const result = await subjectsCollection.findOneAndDelete({ _id: subjectId });
      const deletedSubject = result?.value || result;
      if (!deletedSubject) {
        return NextResponse.json(
          { success: false, error: "Subject not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: null });
    }

    // Delete an entire playlist
    if (body.playlistId && !body.videoId && body.deletePlaylist) {
      const playlistObjectId = getObjectId(body.playlistId);
      if (!playlistObjectId) {
        return NextResponse.json(
          { success: false, error: "Invalid playlist id" },
          { status: 400 }
        );
      }

      const result = await subjectsCollection.findOneAndUpdate(
        { _id: subjectId },
        { $pull: { playlists: { _id: playlistObjectId } }, $set: { updatedAt: new Date() } },
        { returnDocument: "after" }
      );

      const subject = result.value || result;
      if (!subject) {
        return NextResponse.json(
          { success: false, error: "Subject not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: serializeSubject(subject) });
    }

    // Delete a video inside a playlist
    if (body.playlistId && body.videoId) {
      const playlistObjectId = getObjectId(body.playlistId);
      const videoObjectId = getObjectId(body.videoId);
      if (!playlistObjectId) {
        return NextResponse.json(
          { success: false, error: "Invalid playlist id" },
          { status: 400 }
        );
      }
      if (!videoObjectId) {
        return NextResponse.json(
          { success: false, error: "Invalid video id" },
          { status: 400 }
        );
      }

      const result = await subjectsCollection.findOneAndUpdate(
        { _id: subjectId },
        {
          $pull: { "playlists.$[playlist].videos": { _id: videoObjectId } },
          $set: { updatedAt: new Date() },
        },
        { arrayFilters: [{ "playlist._id": playlistObjectId }], returnDocument: "after" }
      );

      const subject = result.value || result;
      if (!subject) {
        return NextResponse.json(
          { success: false, error: "Subject not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: serializeSubject(subject) });
    }

    // Delete a root-level video
    const videoObjectId = getObjectId(body.videoId);
    if (!videoObjectId) {
      return NextResponse.json(
        { success: false, error: "Invalid video id" },
        { status: 400 }
      );
    }

    const result = await subjectsCollection.findOneAndUpdate(
      { _id: subjectId },
      {
        $pull: { videos: { _id: videoObjectId } },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    const subject = result.value || result;
    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: serializeSubject(subject) });
  } catch (error) {
    console.error(`[DELETE /api/subjects/${params.id}]`, error);
    return NextResponse.json(
      { success: false, error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
