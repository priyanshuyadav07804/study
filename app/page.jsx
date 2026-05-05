"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpenCheck,
  FolderKanban,
  ListVideo,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

const features = [
  {
    icon: FolderKanban,
    title: "Private subject folders",
    text: "Create subjects for every course, skill, or exam track.",
  },
  {
    icon: ListVideo,
    title: "YouTube playlists",
    text: "Import playlists or save single videos inside the right subject.",
  },
  {
    icon: BookOpenCheck,
    title: "Learning progress",
    text: "Mark videos watched and keep your study flow organized.",
  },
  {
    icon: ShieldCheck,
    title: "Your own workspace",
    text: "Subjects and playlists are scoped to your account only.",
  },
];

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState("register");
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    identifier: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.location.search.includes("auth=login")) {
      setMode("login");
    }

    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (json.success) setUser(json.data);
      } catch {
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };

    loadSession();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submitAuth = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { identifier: form.identifier, password: form.password }
          : {
              name: form.name,
              email: form.email,
              mobile: form.mobile,
              password: form.password,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setUser(json.data);
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/subjects");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="mx-auto grid min-h-[calc(100vh-60px)] max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200">
            <ShieldCheck size={16} />
            Personal YouTube learning library
          </div>

          <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Memanshi Keeps Every Subject and Playlist in its own Place.
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
            Build a private study dashboard, collect YouTube videos by subject,
            import playlists, and track what you have watched.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/10 text-red-300">
                    <Icon size={18} />
                  </div>
                  <h2 className="mb-2 text-base font-bold">{feature.title}</h2>
                  <p className="m-0 text-sm leading-6 text-[var(--text-muted)]">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
          {checkingSession ? (
            <div className="grid gap-4">
              <div className="skeleton h-9 rounded-lg" />
              <div className="skeleton h-12 rounded-lg" />
              <div className="skeleton h-12 rounded-lg" />
              <div className="skeleton h-12 rounded-lg" />
            </div>
          ) : user ? (
            <div className="grid gap-5">
              <div>
                <h2 className="mb-2 text-2xl font-bold">Welcome back</h2>
                <p className="m-0 text-sm leading-6 text-[var(--text-muted)]">
                  Signed in as {user.email}. Your subjects and playlists are ready.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/subjects")}
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 font-bold text-white transition hover:bg-red-400"
              >
                <FolderKanban size={18} />
                Open Subjects
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-bold transition ${
                    mode === "register"
                      ? "bg-red-500 text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <UserPlus size={15} />
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-bold transition ${
                    mode === "login"
                      ? "bg-red-500 text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <LogIn size={15} />
                  Log in
                </button>
              </div>

              <form onSubmit={submitAuth} className="grid gap-3">
                {mode === "register" ? (
                  <>
                    <input
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="Name"
                      className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 text-[var(--text)] outline-none transition focus:border-red-400/70"
                    />
                    <input
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="Email"
                      type="email"
                      className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 text-[var(--text)] outline-none transition focus:border-red-400/70"
                    />
                    <input
                      value={form.mobile}
                      onChange={(e) => updateForm("mobile", e.target.value)}
                      placeholder="Mobile number"
                      type="tel"
                      className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 text-[var(--text)] outline-none transition focus:border-red-400/70"
                    />
                  </>
                ) : (
                  <input
                    value={form.identifier}
                    onChange={(e) => updateForm("identifier", e.target.value)}
                    placeholder="Email or mobile number"
                    className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 text-[var(--text)] outline-none transition focus:border-red-400/70"
                  />
                )}

                <input
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  placeholder="Password"
                  type="password"
                  className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 text-[var(--text)] outline-none transition focus:border-red-400/70"
                />

                {error && (
                  <div className="rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  disabled={submitting}
                  className="mt-1 flex h-12 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 font-bold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:bg-red-500/60"
                >
                  {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
                </button>
              </form>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
