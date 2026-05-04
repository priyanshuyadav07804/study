"use client";

import { Check, CheckCircle2, ListPlus, Pencil, Play, Trash2, X } from "lucide-react";

function PlaylistEditForm({ value, onChange, onSubmit, onCancel, disabled }) {
  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: "10px" }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Playlist title"
        rows={3}
        style={{
          width: "100%",
          minHeight: "88px",
          padding: "12px 14px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          color: "var(--text)",
          font: "inherit",
          outline: "none",
          resize: "vertical",
          lineHeight: 1.5,
        }}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          disabled={disabled}
          title="Save playlist"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            border: "none",
            background: "#22c55e",
            color: "white",
            cursor: disabled ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={17} />
        </button>
        <button
          type="button"
          onClick={onCancel}
          title="Cancel edit"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={17} />
        </button>
      </div>
    </form>
  );
}

function VideoCard({
  video,
  editingVideo,
  videoActionId,
  watchedPulseVideoId,
  playlistId = null,
  onOpen,
  onStartEdit,
  onEditingVideoChange,
  onUpdateVideo,
  onCancelEdit,
  onDelete,
  onToggleWatched,
  isPlaylistVideo = false,
}) {
  return (
    <article
      className="video-preview-card"
      style={{
        position: "relative",
        display: "grid",
        gap: "14px",
        padding: "14px 14px",
        background: "var(--surface)",
        border: `1px solid ${video.watched ? "rgba(134, 239, 172, 0.38)" : "var(--border)"}`,
        borderRadius: "8px",
        alignItems: "stretch",
        transition: "all 0.3s ease",
        boxShadow: video.watched ? "0 0 0 1px rgba(34, 197, 94, 0.08)" : "none",
      }}
    >
      <button
        type="button"
        onClick={() => onOpen(video)}
        style={{
          position: "relative",
          minHeight: "146px",
          aspectRatio: "16 / 9",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden",
          background: "black",
          cursor: "pointer",
          padding: 0,
        }}
        title="Open video"
      >
        <img
          src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: 0.88,
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          <span
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#ef4444",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
            }}
          >
            <Play size={22} fill="currentColor" />
          </span>
        </span>
      </button>

      <div style={{ display: "grid", alignContent: "space-between", gap: "14px", minWidth: 0 }}>
        {editingVideo?._id === video._id ? (
          <form onSubmit={onUpdateVideo} style={{ display: "grid", gap: "10px" }}>
            <textarea
              value={editingVideo.title}
              onChange={(e) => onEditingVideoChange({ ...editingVideo, title: e.target.value })}
              placeholder="Video title"
              rows={3}
              style={{
                width: "100%",
                minHeight: "88px",
                padding: "12px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text)",
                font: "inherit",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
              <button
                disabled={videoActionId === video._id}
                title="Save video"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#22c55e",
                  color: "white",
                  cursor: videoActionId === video._id ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={17} />
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                title="Cancel edit"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={17} />
              </button>
            </div>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onOpen(video)}
              style={{
                padding: 0,
                background: "none",
                border: "none",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "18px",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  wordBreak: "break-word",
                }}
              >
                {video.title || "Untitled video"}
              </h2>
            </button>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-start",
                alignItems: isPlaylistVideo ? "center" : undefined,
              }}
            >
              {!isPlaylistVideo && (
                <button
                  onClick={() => onStartEdit(video, playlistId)}
                  title="Edit video"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Pencil size={15} />
                </button>
              )}
              <button
                onClick={() => onDelete(video._id, playlistId)}
                disabled={videoActionId === video._id}
                title={isPlaylistVideo ? "Delete video from playlist" : "Delete video"}
                id="delete_button"
                style={{
                  cursor: videoActionId === video._id ? "wait" : "pointer",
                }}
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => onToggleWatched(video, playlistId)}
                disabled={videoActionId === video._id}
                title={video.watched ? "Mark as unwatched" : "Mark as watched"}
                className={watchedPulseVideoId === video._id ? "watched-border-pulse" : ""}
                style={{
                  marginLeft: "auto",
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  border: `1px solid ${video.watched ? "#22c55e66" : "var(--border)"}`,
                  background: video.watched ? "#22c55e22" : "var(--surface-2)",
                  color: video.watched ? "#86efac" : "var(--text-muted)",
                  cursor: videoActionId === video._id ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function PlaylistListCard({
  playlist,
  editingPlaylist,
  playlistActionId,
  onSelect,
  onStartEdit,
  onEditPlaylistChange,
  onUpdatePlaylist,
  onCancelPlaylistEdit,
  onDeletePlaylist,
}) {
  const isEditing = editingPlaylist?._id === playlist._id;

  return (
    <article
      className="video-preview-card"
      role="button"
      tabIndex={0}
      onClick={() => {
        if (isEditing) return;
        onSelect(playlist);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isEditing) {
          onSelect(playlist);
        }
      }}
      style={{
        position: "relative",
        display: "grid",
        gap: "14px",
        padding: "14px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        alignItems: "stretch",
        transition: "all 0.3s ease",
        color: "var(--text)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (!isEditing) onSelect(playlist);
        }}
        style={{
          position: "relative",
          minHeight: "146px",
          aspectRatio: "16 / 9",
          border: "1px solid #ef444466",
          borderRadius: "8px",
          background: "#ef444422",
          overflow: "hidden",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#f87171",
        }}
        title="Open playlist"
      >
        {playlist.videos && playlist.videos.length > 0 ? (
          <img
            src={`https://img.youtube.com/vi/${playlist.videos[0].videoId}/mqdefault.jpg`}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <ListPlus size={30} />
        )}
      </button>
      <div style={{ minWidth: 0, display: "grid", alignContent: "space-between", gap: "14px" }}>
        <div style={{ minWidth: 0, display: "grid", gap: "10px" }}>
          {isEditing ? (
            <div onClick={(e) => e.stopPropagation()}>
              <PlaylistEditForm
                value={editingPlaylist.title}
                onChange={onEditPlaylistChange}
                onSubmit={onUpdatePlaylist}
                onCancel={onCancelPlaylistEdit}
                disabled={playlistActionId === playlist._id}
              />
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSelect(playlist)}
                style={{
                  padding: 0,
                  background: "none",
                  border: "none",
                  color: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: "18px",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    wordBreak: "break-word",
                  }}
                >
                  {playlist.title || "YouTube Playlist"}
                </h2>
              </button>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
                {(playlist.videos || []).length} Videos
              </p>
            </>
          )}
        </div>
        {!isEditing && (
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start", alignItems: "center" }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(playlist);
              }}
              title="Edit playlist"
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeletePlaylist(playlist._id);
              }}
              disabled={playlistActionId === playlist._id}
              title="Delete playlist"
              id="delete_button"
              style={{
                cursor: playlistActionId === playlist._id ? "wait" : "pointer",
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function SubjectContentPanel({
  loading,
  subject,
  activeView,
  selectedPlaylist,
  editingVideo,
  editingPlaylist,
  videoActionId,
  playlistActionId,
  watchedPulseVideoId,
  onSetActiveView,
  onClearSelectedPlaylist,
  onSelectPlaylist,
  onOpenVideo,
  onStartEditVideo,
  onEditingVideoChange,
  onUpdateVideo,
  onCancelEditVideo,
  onDeleteVideo,
  onToggleWatched,
  onStartEditPlaylist,
  onEditPlaylistChange,
  onUpdatePlaylist,
  onCancelEditPlaylist,
  onDeletePlaylist,
}) {
  const items = [
    { id: "videos", label: "Videos", count: subject?.videos?.length || 0 },
    { id: "playlists", label: "Playlists", count: subject?.playlists?.length || 0 },
  ];

  return (
    <div className="video-list-panel">
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          padding: "6px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSetActiveView(item.id);
              onClearSelectedPlaylist();
            }}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "8px",
              border: "none",
              background: activeView === item.id ? "#ef4444" : "transparent",
              color: activeView === item.id ? "white" : "var(--text-muted)",
              cursor: "pointer",
              font: "inherit",
              fontWeight: 700,
            }}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: "280px", borderRadius: "8px" }} />
      ) : activeView === "videos" ? (
        <div style={{ display: "grid", gap: "18px" }}>
          {(subject?.videos || []).map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              editingVideo={editingVideo}
              videoActionId={videoActionId}
              watchedPulseVideoId={watchedPulseVideoId}
              onOpen={onOpenVideo}
              onStartEdit={onStartEditVideo}
              onEditingVideoChange={onEditingVideoChange}
              onUpdateVideo={onUpdateVideo}
              onCancelEdit={onCancelEditVideo}
              onDelete={onDeleteVideo}
              onToggleWatched={onToggleWatched}
            />
          ))}

          {(subject?.videos || []).length === 0 && (
            <div
              style={{
                padding: "46px 18px",
                textAlign: "center",
                color: "var(--text-muted)",
                border: "1px dashed var(--border)",
                borderRadius: "8px",
              }}
            >
              No YouTube videos yet.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "18px" }}>
          {selectedPlaylist && (
            <button
              type="button"
              onClick={onClearSelectedPlaylist}
              style={{
                justifySelf: "start",
                padding: "9px 12px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-muted)",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              Back to playlists
            </button>
          )}

          {!selectedPlaylist ? (
            <>
              {(subject?.playlists || []).map((playlist) => (
                <PlaylistListCard
                  key={playlist._id}
                  playlist={playlist}
                  editingPlaylist={editingPlaylist}
                  playlistActionId={playlistActionId}
                  onSelect={onSelectPlaylist}
                  onStartEdit={onStartEditPlaylist}
                  onEditPlaylistChange={onEditPlaylistChange}
                  onUpdatePlaylist={onUpdatePlaylist}
                  onCancelPlaylistEdit={onCancelEditPlaylist}
                  onDeletePlaylist={onDeletePlaylist}
                />
              ))}

              {(subject?.playlists || []).length === 0 && (
                <div
                  style={{
                    padding: "46px 18px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    border: "1px dashed var(--border)",
                    borderRadius: "8px",
                  }}
                >
                  No playlists imported yet.
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
                {editingPlaylist?._id === selectedPlaylist._id ? (
                  <div style={{ flex: 1 }}>
                    <PlaylistEditForm
                      value={editingPlaylist.title}
                      onChange={onEditPlaylistChange}
                      onSubmit={onUpdatePlaylist}
                      onCancel={onCancelEditPlaylist}
                      disabled={playlistActionId === selectedPlaylist._id}
                    />
                  </div>
                ) : (
                  <>
                    <h2 style={{ margin: 0, fontSize: "20px" }}>
                      {selectedPlaylist.title || "YouTube Playlist"}
                    </h2>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => onStartEditPlaylist(selectedPlaylist)}
                        title="Edit playlist"
                        style={{
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {(selectedPlaylist.videos || []).map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  editingVideo={editingVideo}
                  videoActionId={videoActionId}
                  watchedPulseVideoId={watchedPulseVideoId}
                  playlistId={selectedPlaylist._id}
                  onOpen={onOpenVideo}
                  onStartEdit={onStartEditVideo}
                  onEditingVideoChange={onEditingVideoChange}
                  onUpdateVideo={onUpdateVideo}
                  onCancelEdit={onCancelEditVideo}
                  onDelete={onDeleteVideo}
                  onToggleWatched={onToggleWatched}
                  isPlaylistVideo
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
