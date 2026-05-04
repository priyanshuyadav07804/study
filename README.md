# Subject Videos

A Next.js 14 app for organizing YouTube videos by subject.

## Features

- First page lists subject names.
- Click a subject to open its video page.
- Subject pages show YouTube videos one below another.
- Add new YouTube links directly from the subject page.

## Tech

- Next.js 14 App Router
- MongoDB
- Lucide React
- Tailwind CSS and CSS variables

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Configure `.env.local` with:

```env
MONGODB_URI=mongodb://localhost:27017/folder-crud
DB_NAME=folder-crud
```

Playlist import uses YouTube's free public playlist feed. That feed may return only a limited recent slice of very large playlists.

## API

`GET /api/subjects`

Returns all subjects.

`POST /api/subjects`

Creates a subject.

```json
{ "name": "Math" }
```

`GET /api/subjects/:id`

Returns one subject with its videos.

`POST /api/subjects/:id`

Adds a YouTube video to a subject.

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Optional title"
}
```

Imports a public YouTube playlist into a subject.

```json
{
  "playlistUrl": "https://www.youtube.com/playlist?list=PLAYLIST_ID"
}
```

`PUT /api/subjects/:id`

Updates a YouTube video title or URL.

```json
{
  "videoId": "video-object-id",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Updated title"
}
```

`DELETE /api/subjects/:id`

Deletes a YouTube video from a subject.

```json
{ "videoId": "video-object-id" }
```
