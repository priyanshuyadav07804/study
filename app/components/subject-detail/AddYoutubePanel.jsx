"use client";

import { ListPlus, Plus, Video } from "lucide-react";

export default function AddYoutubePanel({
  playlistMode,
  selectedPlaylist,
  isAddingToSelectedPlaylist,
  playlistUrl,
  url,
  title,
  saving,
  error,
  onToggleMode,
  onPlaylistUrlChange,
  onUrlChange,
  onTitleChange,
  onSubmit,
}) {
  return (
    <aside className="video-form-panel">
      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "12px",
          padding: "16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "18px" }}>
              {playlistMode
                ? "Import Playlist"
                : isAddingToSelectedPlaylist
                  ? "Add Video to Playlist"
                  : "Add Video"}
            </h2>
            <button
              type="button"
              onClick={onToggleMode}
              title={playlistMode ? "Add single video" : "Import playlist"}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: `1px solid ${playlistMode ? "#ef444466" : "var(--border)"}`,
                background: playlistMode ? "#ef444422" : "var(--surface-2)",
                color: playlistMode ? "#f87171" : "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {playlistMode ? <Video size={17} /> : <ListPlus size={17} />}
            </button>
          </div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
            {playlistMode
              ? "Paste a public YouTube playlist link."
              : isAddingToSelectedPlaylist
                ? `Save a YouTube link into "${selectedPlaylist?.title || "this playlist"}".`
                : "Save a YouTube link under this subject."}
          </p>
        </div>

        {playlistMode ? (
          <input
            value={playlistUrl}
            onChange={(e) => onPlaylistUrlChange(e.target.value)}
            placeholder="Paste YouTube playlist link"
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
              font: "inherit",
              outline: "none",
            }}
          />
        ) : (
          <>
            <input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="Paste YouTube link"
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text)",
                font: "inherit",
                outline: "none",
              }}
            />
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Optional title"
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text)",
                font: "inherit",
                outline: "none",
              }}
            />
          </>
        )}

        <button
          disabled={saving}
          style={{
            width: "100%",
            height: "44px",
            borderRadius: "8px",
            border: "none",
            background: saving ? "#ef444499" : "#ef4444",
            color: "white",
            cursor: saving ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            font: "inherit",
            fontWeight: 700,
          }}
          title={playlistMode ? "Import playlist" : "Add video"}
        >
          {playlistMode ? <ListPlus size={18} /> : <Plus size={18} />}
          {saving ? "Saving..." : playlistMode ? "Import Playlist" : "Add Video"}
        </button>
      </form>

      {error && (
        <div
          style={{
            padding: "12px 14px",
            background: "#ef444422",
            border: "1px solid #ef444466",
            borderRadius: "8px",
            color: "#fca5a5",
            marginTop: "12px",
          }}
        >
          {error}
        </div>
      )}
    </aside>
  );
}
