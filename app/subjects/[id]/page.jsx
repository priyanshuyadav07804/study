"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AddYoutubePanel from "@/app/components/subject-detail/AddYoutubePanel";
import SubjectContentPanel from "@/app/components/subject-detail/SubjectContentPanel";
import SubjectHeaderCard from "@/app/components/subject-detail/SubjectHeaderCard";
import SubjectsDrawer from "@/app/components/subject-detail/SubjectsDrawer";
import VideoModal from "@/app/components/subject-detail/VideoModal";

export default function SubjectPage({ params }) {
  const router = useRouter();
  const [subject, setSubject] = useState(null);
  const [url, setUrl] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistMode, setPlaylistMode] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingApiKey, setCheckingApiKey] = useState(false);
  const [apiKeyMessage, setApiKeyMessage] = useState("");
  const [apiKeyMessageType, setApiKeyMessageType] = useState("success");
  const [editingVideo, setEditingVideo] = useState(null);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editingSubjectName, setEditingSubjectName] = useState("");
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [activeView, setActiveView] = useState("videos");
  const [videoActionId, setVideoActionId] = useState("");
  const [subjectAction, setSubjectAction] = useState("");
  const [playlistActionId, setPlaylistActionId] = useState("");
  const [watchedPulseVideoId, setWatchedPulseVideoId] = useState("");
  const watchedPulseTimeoutRef = useRef(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteUnlocked, setDeleteUnlocked] = useState(false);

  const [subjectsDrawerOpen, setSubjectsDrawerOpen] = useState(false);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");
  const isAddingToSelectedPlaylist = Boolean(selectedPlaylist) && !playlistMode;

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
      setEditingSubjectName(json.data?.name || "");
      setIsEditingSubject(false);
      setEditingPlaylist(null);
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
          playlistMode
            ? { playlistUrl }
            : {
                url,
                title: videoTitle,
                playlistId: selectedPlaylist?._id,
              }
        ),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
      syncSelectedPlaylist(json.data, selectedPlaylist?._id);
      if (playlistMode) {
        showToast("Playlist imported successfully!");
      } else if (selectedPlaylist?._id) {
        showToast("Video added to playlist successfully!");
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

  const startEdit = (video, playlistId = null) => {
    setEditingVideo({
      _id: video._id,
      title: video.title || "",
      url: video.url || "",
      _playlistId: playlistId,
    });
    setError("");
  };

  const updateSubjectName = async (e) => {
    e.preventDefault();
    setSubjectAction("save");
    setError("");
    try {
      const res = await fetch(`/api/subjects/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectTitle: editingSubjectName }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
      setEditingSubjectName(json.data.name || "");
      setIsEditingSubject(false);
      setAllSubjects((current) => current.map((item) => (item._id === json.data._id ? json.data : item)));
      showToast("Subject updated");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to update subject";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setSubjectAction("");
    }
  };

  const deleteSubjectById = async (subjectId, subjectName) => {
    if (!subjectId) return;
    if (!confirm(`Delete subject "${subjectName}"? This cannot be undone.`)) return;

    setSubjectAction("delete");
    setError("");
    try {
      const res = await fetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteSubject: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setAllSubjects((current) => current.filter((item) => item._id !== subjectId));
      showToast("Subject deleted");
      if (params.id === subjectId) {
        router.push("/");
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to delete subject";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setSubjectAction("");
    }
  };

  const navigateToSubject = (subjectId) => {
    setSubjectsDrawerOpen(false);
    router.push(`/subjects/${subjectId}`);
  };

  const startPlaylistEdit = (playlist) => {
    setEditingPlaylist({
      _id: playlist._id,
      title: playlist.title || "",
    });
    setError("");
  };

  const updateVideo = async (e) => {
    e.preventDefault();
    if (!editingVideo?._id || !editingVideo.url.trim()) return;

    setVideoActionId(editingVideo._id);
    setError("");
    try {
      const payload = {
        videoId: editingVideo._id,
        title: editingVideo.title,
        url: editingVideo.url,
      };
      if (editingVideo._playlistId) payload.playlistId = editingVideo._playlistId;

      const res = await fetch(`/api/subjects/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const deleteVideo = async (videoId, playlistId = null) => {
    setVideoActionId(videoId);
    setError("");
    try {
      const body = playlistId ? { videoId, playlistId } : { videoId };
      const res = await fetch(`/api/subjects/${params.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
      if (editingVideo?._id === videoId) setEditingVideo(null);
      if (selectedVideo?._id === videoId) setSelectedVideo(null);
      // If a playlist was affected, sync selected playlist
      if (playlistId) syncSelectedPlaylist(json.data, playlistId);
      showToast("Video deleted successfully!");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to delete video";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setVideoActionId("");
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!playlistId) return;
    setPlaylistActionId(playlistId);
    setError("");
    try {
      const res = await fetch(`/api/subjects/${params.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId, deletePlaylist: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
      if (editingPlaylist?._id === playlistId) setEditingPlaylist(null);
      setSelectedPlaylist(null);
      showToast("Playlist deleted successfully!");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to delete playlist";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setPlaylistActionId("");
    }
  };

  const updatePlaylist = async (e) => {
    e.preventDefault();
    if (!editingPlaylist?._id) return;

    const playlistId = editingPlaylist._id;
    setPlaylistActionId(playlistId);
    setError("");
    try {
      const res = await fetch(`/api/subjects/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId, playlistTitle: editingPlaylist.title }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubject(json.data);
      syncSelectedPlaylist(json.data, playlistId);
      setEditingPlaylist(null);
      showToast("Playlist updated");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to update playlist";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setPlaylistActionId("");
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <SubjectsDrawer
        isOpen={subjectsDrawerOpen}
        subjects={allSubjects}
        loading={subjectsLoading}
        error={subjectsError}
        currentSubjectId={params.id}
        deleteUnlocked={deleteUnlocked}
        onToggle={() => setSubjectsDrawerOpen((current) => !current)}
        onClose={() => setSubjectsDrawerOpen(false)}
        onNavigate={navigateToSubject}
        onDelete={(drawerSubject) => deleteSubjectById(drawerSubject._id, drawerSubject.name)}
      />

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

        <SubjectHeaderCard
          loading={loading}
          subject={subject}
          isEditing={isEditingSubject}
          editingSubjectName={editingSubjectName}
          subjectAction={subjectAction}
          deleteUnlocked={deleteUnlocked}
          onStartEdit={() => setIsEditingSubject(true)}
          onCancelEdit={() => {
            setIsEditingSubject(false);
            setEditingSubjectName(subject?.name || "");
          }}
          onChangeName={setEditingSubjectName}
          onSubmit={updateSubjectName}
          onToggleDeleteLock={() => setDeleteUnlocked((current) => !current)}
        />

        <div className="subject-detail-shell">
          <AddYoutubePanel
            playlistMode={playlistMode}
            selectedPlaylist={selectedPlaylist}
            isAddingToSelectedPlaylist={isAddingToSelectedPlaylist}
            playlistUrl={playlistUrl}
            url={url}
            title={title}
            saving={saving}
            checkingApiKey={checkingApiKey}
            apiKeyMessage={apiKeyMessage}
            apiKeyMessageType={apiKeyMessageType}
            error={error}
            onToggleMode={() => {
              setPlaylistMode((current) => !current);
              setError("");
            }}
            onPlaylistUrlChange={setPlaylistUrl}
            onUrlChange={setUrl}
            onTitleChange={setTitle}
            onSubmit={addVideo}
          />

          <SubjectContentPanel
            loading={loading}
            subject={subject}
            activeView={activeView}
            selectedPlaylist={selectedPlaylist}
            editingVideo={editingVideo}
            editingPlaylist={editingPlaylist}
            videoActionId={videoActionId}
            playlistActionId={playlistActionId}
            watchedPulseVideoId={watchedPulseVideoId}
            onSetActiveView={setActiveView}
            onClearSelectedPlaylist={() => setSelectedPlaylist(null)}
            onSelectPlaylist={setSelectedPlaylist}
            onOpenVideo={setSelectedVideo}
            onStartEditVideo={startEdit}
            onEditingVideoChange={setEditingVideo}
            onUpdateVideo={updateVideo}
            onCancelEditVideo={() => setEditingVideo(null)}
            onDeleteVideo={deleteVideo}
            onToggleWatched={toggleWatched}
            onStartEditPlaylist={startPlaylistEdit}
            onEditPlaylistChange={(value) =>
              setEditingPlaylist((current) => (current ? { ...current, title: value } : current))
            }
            onUpdatePlaylist={updatePlaylist}
            onCancelEditPlaylist={() => setEditingPlaylist(null)}
            onDeletePlaylist={deletePlaylist}
          />
        </div>
      </section>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "70px",
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
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </main>
  );
}
