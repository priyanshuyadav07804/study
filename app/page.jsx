"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LibraryBig, ListPlus, Plus, RefreshCw, Video } from "lucide-react";

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

          <button
            onClick={fetchSubjects}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)]"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
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
              <Link
                key={subject._id}
                href={`/subjects/${subject._id}`}
                className="group grid min-h-48 content-between gap-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] no-underline shadow-[0_18px_38px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-red-400/40 hover:bg-[#171724]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-sky-400/35 bg-sky-500/15">
                  <Video size={22} className="text-sky-300" />
                </div>

                <div>
                  <h2 className="mb-4 break-words text-2xl font-bold leading-tight">
                    {subject.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] transition group-hover:text-[var(--text)]">
                      <Video size={15} />
                      {(subject.videos || []).length} videos
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-[var(--text-muted)] transition group-hover:text-[var(--text)]">
                      <ListPlus size={15} />
                      {(subject.playlists || []).length} playlists
                    </div>
                  </div>
                </div>
              </Link>
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
