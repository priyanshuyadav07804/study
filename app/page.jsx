"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LibraryBig, Lock, LockOpen, Plus, RefreshCw } from "lucide-react";
import SubjectCard from "@/app/components/SubjectCard";

export default function Home() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteUnlocked, setDeleteUnlocked] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState("");
  const [editingSubjectName, setEditingSubjectName] = useState("");
  const [pendingDeleteSubjectId, setPendingDeleteSubjectId] = useState("");
  const [deletingSubjectId, setDeletingSubjectId] = useState("");
  const [subjectAction, setSubjectAction] = useState("");
  const [error, setError] = useState("");

  const fetchSubjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subjects");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubjects(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const addSubject = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubjects((current) => [json.data, ...current]);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add subject");
    } finally {
      setSaving(false);
    }
  };

  const startEditSubject = (subject) => {
    setEditingSubjectId(subject._id);
    setEditingSubjectName(subject.name || "");
    setError("");
  };

  const cancelEditSubject = () => {
    setEditingSubjectId("");
    setEditingSubjectName("");
  };

  const cancelDeleteSubject = () => {
    setPendingDeleteSubjectId("");
  };

  const updateSubject = async (e, subjectId) => {
    e.preventDefault();
    setSubjectAction("save");
    setError("");
    try {
      const res = await fetch(`/api/subjects/${subjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectTitle: editingSubjectName }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubjects((current) => current.map((item) => (item._id === subjectId ? json.data : item)));
      cancelEditSubject();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update subject");
    } finally {
      setSubjectAction("");
    }
  };

  const deleteSubject = async (subject) => {
    if (!deleteUnlocked) return;

    setSubjectAction("delete");
    setDeletingSubjectId(subject._id);
    setError("");
    try {
      const res = await fetch(`/api/subjects/${subject._id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteSubject: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setTimeout(() => {
        setSubjects((current) => current.filter((item) => item._id !== subject._id));
        setPendingDeleteSubjectId("");
        setDeletingSubjectId("");
      }, 260);
      if (editingSubjectId === subject._id) cancelEditSubject();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete subject");
      setDeletingSubjectId("");
    } finally {
      setSubjectAction("");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="mx-auto max-w-6xl px-5 py-10">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-400/40 bg-red-500/15">
              <LibraryBig size={22} className="text-red-400" />
            </div>
            <h1 className="m-0 text-[26px] font-bold">Subjects</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDeleteUnlocked((current) => !current)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-[var(--surface)] transition ${
                deleteUnlocked
                  ? "border-amber-400/40 text-amber-300"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              title={deleteUnlocked ? "Unlock delete enabled" : "Delete locked"}
            >
              {deleteUnlocked ? <LockOpen size={16} /> : <Lock size={16} />}
            </button>
            <button
              onClick={fetchSubjects}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)]"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        <form onSubmit={addSubject} className="mb-7 flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add subject name"
            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-[inherit] text-[var(--text)] outline-none transition focus:border-red-400/70"
          />
          <button
            disabled={saving}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white transition hover:bg-red-400 disabled:cursor-wait disabled:bg-red-500/60"
            title="Add subject"
          >
            <Plus size={19} />
          </button>
        </form>

        {error && (
          <div className="mb-5 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="skeleton min-h-48 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                isEditing={editingSubjectId === subject._id}
                isConfirmingDelete={pendingDeleteSubjectId === subject._id}
                isDeleting={deletingSubjectId === subject._id}
                editingName={editingSubjectName}
                actionState={subjectAction}
                deleteUnlocked={deleteUnlocked}
                onOpen={() => router.push(`/subjects/${subject._id}`)}
                onStartEdit={() => startEditSubject(subject)}
                onNameChange={setEditingSubjectName}
                onSave={(e) => updateSubject(e, subject._id)}
                onCancel={cancelEditSubject}
                onRequestDelete={() => setPendingDeleteSubjectId(subject._id)}
                onConfirmDelete={() => deleteSubject(subject)}
                onCancelDelete={cancelDeleteSubject}
              />
            ))}

            {subjects.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-[var(--border)] px-5 py-12 text-center text-[var(--text-muted)]">
                No subjects yet.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
