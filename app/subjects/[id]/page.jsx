"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, ListPlus, Menu, Pencil, Play, Plus, Trash2, Video, X } from "lucide-react";

export default function SubjectPage({ params }) {
  const [subject, setSubject] = useState(null);
  const [url, setUrl] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistMode, setPlaylistMode] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [activeView, setActiveView] = useState("videos");
  const [videoActionId, setVideoActionId] = useState("");
  const [watchedPulseVideoId, setWatchedPulseVideoId] = useState("");
  const watchedPulseTimeoutRef = useRef(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [subjectsDrawerOpen, setSubjectsDrawerOpen] = useState(false);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSubject = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/subjects/${params.id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subject");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubjects = async () => {
    // Avoid refetching if we already have data
    if (allSubjects.length > 0) return;

    setSubjectsLoading(true);
    setSubjectsError("");
    try {
      const res = await fetch("/api/subjects");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setAllSubjects(json.data);
    } catch (e) {
      setSubjectsError(e instanceof Error ? e.message : "Failed to load subjects");
    } finally {
      setSubjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubject();
  }, [params.id]);

  useEffect(() => {
    if (!subjectsDrawerOpen) return;

    fetchAllSubjects();

    const onKeyDown = (e) => {
      if (e.key === "Escape") setSubjectsDrawerOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectsDrawerOpen]);

  const fetchYoutubeTitle = async (videoUrl) => {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
        { cache: "no-store" }
      );
      if (response.ok) {
        const data = await response.json();
        return data.title || "";
      }
    } catch (error) {
      console.error("Failed to fetch YouTube title", error);
    }
    return "";
  };

  const addVideo = async (e) => {
    e.preventDefault();
    if (playlistMode && !playlistUrl.trim()) return;
    if (!playlistMode && !url.trim()) return;

    setSaving(true);
    setError("");
    try {
      let videoTitle = title;
      if (!playlistMode && !videoTitle.trim()) {
        videoTitle = await fetchYoutubeTitle(url.trim());
      }

      const res = await fetch(`/api/subjects/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          playlistMode ? { playlistUrl } : { url, title: videoTitle }
        ),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
      if (playlistMode) {
        showToast("Playlist imported successfully!");
      } else {
        showToast("Video added successfully!");
      }
      setUrl("");
      setPlaylistUrl("");
      setTitle("");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to add YouTube content";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (video) => {
    setEditingVideo({
      _id: video._id,
      title: video.title || "",
      url: video.url || "",
    });
    setError("");
  };

  const updateVideo = async (e) => {
    e.preventDefault();
    if (!editingVideo?._id || !editingVideo.url.trim()) return;

    setVideoActionId(editingVideo._id);
    setError("");
    try {
      const res = await fetch(`/api/subjects/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: editingVideo._id,
          title: editingVideo.title,
          url: editingVideo.url,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
      setEditingVideo(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update video");
    } finally {
      setVideoActionId("");
    }
  };

  const syncSelectedPlaylist = (updatedSubject, playlistId) => {
    if (!playlistId) return;
    const updatedPlaylist = (updatedSubject.playlists || []).find(
      (playlist) => playlist._id === playlistId
    );
    if (updatedPlaylist) setSelectedPlaylist(updatedPlaylist);
  };

  const toggleWatched = async (video, playlistId = null) => {
    setVideoActionId(video._id);
    setWatchedPulseVideoId(video._id);
    if (watchedPulseTimeoutRef.current) {
      clearTimeout(watchedPulseTimeoutRef.current);
    }
    watchedPulseTimeoutRef.current = setTimeout(() => {
      setWatchedPulseVideoId("");
    }, 380);

    setError("");
    try {
      const res = await fetch(`/api/subjects/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video._id,
          playlistId,
          watched: !video.watched,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
      syncSelectedPlaylist(json.data, playlistId);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to update watched status";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setVideoActionId("");
    }
  };

  const deleteVideo = async (videoId) => {
    setVideoActionId(videoId);
    setError("");
    try {
      const res = await fetch(`/api/subjects/${params.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
      if (editingVideo?._id === videoId) setEditingVideo(null);
      if (selectedVideo?._id === videoId) setSelectedVideo(null);
      showToast("Video deleted successfully!");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to delete video";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setVideoActionId("");
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      {/* Top-right subjects drawer */}
      <button
        type="button"
        onClick={() => setSubjectsDrawerOpen((current) => !current)}
        title="Subjects"
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 115,
          width: 44,
          height: 44,
          borderRadius: 10,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Menu size={18} />
      </button>

      {subjectsDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setSubjectsDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 114,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
          }}
        >
          <aside
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(360px, 92vw)",
              background: "var(--surface)",
              borderRight: "1px solid var(--border)",
              padding: "16px",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setSubjectsDrawerOpen(false)}
                title="Close"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {subjectsError && (
              <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ef444466", background: "#ef444422", color: "#fca5a5" }}>
                {subjectsError}
              </div>
            )}

            {subjectsLoading ? (
              <div style={{ padding: 8 }}>
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="skeleton" style={{ height: 52, borderRadius: 10, marginBottom: 10 }} />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {allSubjects.map((s) => (
                  <Link
                    key={s._id}
                    href={`/subjects/${s._id}`}
                    onClick={() => setSubjectsDrawerOpen(false)}
                    style={{
                      textDecoration: "none",
                      color: "var(--text)",
                      padding: "12px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      display: "grid",
                      gap: 6,
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.name}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)" }}>
                        {(s.videos || []).length} videos
                      </span>
                      <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)" }}>
                        {(s.playlists || []).length} playlists
                      </span>
                    </div>
                  </Link>
                ))}

                {allSubjects.length === 0 && (
                  <div style={{ padding: "18px 12px", textAlign: "center", color: "var(--text-muted)", border: "1px dashed var(--border)", borderRadius: 10 }}>
                    No subjects yet.
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "32px 20px 48px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-muted)",
            textDecoration: "none",
            marginBottom: "22px",
            fontSize: "14px",
          }}
        >
          <ArrowLeft size={16} />
          Subjects
        </Link>

        <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "8px",
              background: "#ef444422",
              border: "1px solid #ef444466",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Video size={22} color="#f87171" />
          </div>
          <h1 style={{ fontSize: "26px", margin: 0 }}>
            {loading ? "Loading..." : subject?.name || "Subject"}
          </h1>
        </header>

        <div className="subject-detail-shell">
          <aside className="video-form-panel">
            <form
              onSubmit={addVideo}
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
                    {playlistMode ? "Import Playlist" : "Add Video"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaylistMode((current) => !current);
                      setError("");
                    }}
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
                    : "Save a YouTube link under this subject."}
                </p>
              </div>
              {playlistMode ? (
                <input
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
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
                    onChange={(e) => setUrl(e.target.value)}
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
                    onChange={(e) => setTitle(e.target.value)}
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
              {[
                { id: "videos", label: "Videos", count: subject?.videos?.length || 0 },
                { id: "playlists", label: "Playlists", count: subject?.playlists?.length || 0 },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id);
                    setSelectedPlaylist(null);
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
                      <article
                    key={video._id}
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
                      onClick={() => setSelectedVideo(video)}
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
                        <form onSubmit={updateVideo} style={{ display: "grid", gap: "10px" }}>
                          <input
                            value={editingVideo.title}
                            onChange={(e) =>
                              setEditingVideo((current) => ({ ...current, title: e.target.value }))
                            }
                            placeholder="Video title"
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              color: "var(--text)",
                              font: "inherit",
                              outline: "none",
                            }}
                          />
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              value={editingVideo.url}
                              onChange={(e) =>
                                setEditingVideo((current) => ({ ...current, url: e.target.value }))
                              }
                              placeholder="YouTube link"
                              style={{
                                flex: 1,
                                minWidth: 0,
                                padding: "10px 12px",
                                background: "var(--surface-2)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                color: "var(--text)",
                                font: "inherit",
                                outline: "none",
                              }}
                            />
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
                              onClick={() => setEditingVideo(null)}
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
                            onClick={() => setSelectedVideo(video)}
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
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
                            <button
                              onClick={() => startEdit(video)}
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
                            <button
                              onClick={() => deleteVideo(video._id)}
                              disabled={videoActionId === video._id}
                              title="Delete video"
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                border: "1px solid #ef444466",
                                background: "#ef444422",
                                color: "#f87171",
                                cursor: videoActionId === video._id ? "wait" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              onClick={() => toggleWatched(video)}
                              disabled={videoActionId === video._id}
                              title={video.watched ? "Mark as unwatched" : "Mark as watched"}
                              className={watchedPulseVideoId === video._id ? "watched-border-pulse" : ""}
                              style={{
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
                    onClick={() => setSelectedPlaylist(null)}
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
                      <button
                        key={playlist._id}
                        type="button"
                        onClick={() => setSelectedPlaylist(playlist)}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "120px minmax(0, 1fr)",
                          gap: "14px",
                          padding: "14px",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--text)",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            minHeight: "78px",
                            borderRadius: "8px",
                            background: "#ef444422",
                            border: "1px solid #ef444466",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#f87171",
                            overflow: "hidden",
                          }}
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
                            <ListPlus size={28} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h2
                            style={{
                              margin: "0 0 8px",
                              fontSize: "18px",
                              fontWeight: 700,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {playlist.title || "YouTube Playlist"}
                          </h2>
                          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
                            {(playlist.videos || []).length} videos imported
                          </p>
                        </div>
                      </button>
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
                    <h2 style={{ margin: 0, fontSize: "20px" }}>
                      {selectedPlaylist.title || "YouTube Playlist"}
                    </h2>
                    {(selectedPlaylist.videos || []).map((video) => {
                      const isDeleting = videoActionId === video._id;
                      return (
                        <article
                        key={video._id}
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
                          onClick={() => setSelectedVideo(video)}
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
                        <div style={{ display: "grid", gap: "14px", minWidth: 0 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedVideo(video)}
                            style={{
                              padding: 0,
                              background: "none",
                              border: "none",
                              color: "inherit",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            <h3
                              style={{
                                margin: "0 0 8px",
                                fontSize: "18px",
                                fontWeight: 700,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                wordBreak: "break-word",
                              }}
                            >
                              {video.title || "Untitled video"}
                            </h3>
                          </button>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
                            <button
                              onClick={() => toggleWatched(video, selectedPlaylist._id)}
                              disabled={videoActionId === video._id}
                              title={video.watched ? "Mark as unwatched" : "Mark as watched"}
                              className={watchedPulseVideoId === video._id ? "watched-border-pulse" : ""}
                              style={{
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
                        </div>
                      </article>
                    );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 110,
            padding: "12px 16px",
            borderRadius: "8px",
            background: toast.type === "error" ? "#ef4444" : "#22c55e",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {toast.message}
        </div>
      )}

      {selectedVideo && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(6px)",
          }}
          onClick={(e) => e.target === e.currentTarget && setSelectedVideo(null)}
        >
          <div
            className="scale-in"
            style={{
              width: "min(980px, 100%)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 28px 80px rgba(0,0,0,0.55)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                  overflowWrap: "anywhere",
                }}
              >
                {selectedVideo.title || "Untitled video"}
              </h2>
              <button
                onClick={() => setSelectedVideo(null)}
                title="Close video"
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
                  flexShrink: 0,
                }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "black" }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                title={selectedVideo.title || "YouTube video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
