"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LibraryBig, Menu, X, Video, ListPlus, LogOut, User } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function Header() {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSubjects = async () => {
    if (subjects.length > 0) return;
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
    if (!sidebarOpen) return;
    fetchSubjects();
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen]);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 200,
          height: "60px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.22)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#ef444422",
              border: "1px solid #ef444466",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LibraryBig size={20} color="#f87171" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18 }}>Memanshi</span>
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          title="Subjects"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: `1px solid ${sidebarOpen ? "#ef444466" : "var(--border)"}`,
            background: sidebarOpen ? "#ef444422" : "var(--surface-2)",
            color: sidebarOpen ? "#f87171" : "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
        >
          <Menu size={18} />
        </button>

        {/* Auth Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!authLoading && !isAuthenticated ? (
            <>
              <Link
                href="/auth/login"
                style={{
                  padding: "8px 16px",
                  color: "var(--text)",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "#ef444422",
                  border: "1px solid #ef444466",
                  color: "#f87171",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign Up
              </Link>
            </>
          ) : !authLoading && isAuthenticated ? (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: `1px solid ${userDropdownOpen ? "#ef444466" : "var(--border)"}`,
                  background: userDropdownOpen ? "#ef444422" : "var(--surface-2)",
                  color: userDropdownOpen ? "#f87171" : "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <User size={18} />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 8,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    minWidth: 200,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    zIndex: 300,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      fontSize: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    {user?.email}
                  </div>
                  <Link
                    href="/auth/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      color: "var(--text)",
                      textDecoration: "none",
                      fontSize: 14,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/auth/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      color: "var(--text)",
                      textDecoration: "none",
                      fontSize: 14,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      color: "#ef4444",
                      background: "none",
                      border: "none",
                      fontSize: 14,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </header>

      {sidebarOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 199,
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
              borderLeft: "1px solid var(--border)",
              padding: "16px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                All Subjects
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
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

            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ef444466",
                  background: "#ef444422",
                  color: "#fca5a5",
                  marginBottom: 12,
                }}
              >
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ padding: 8 }}>
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="skeleton"
                    style={{ height: 52, borderRadius: 10, marginBottom: 10 }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {subjects.map((s) => (
                  <Link
                    key={s._id}
                    href={`/subjects/${s._id}`}
                    onClick={() => setSidebarOpen(false)}
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
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          color: "var(--text-muted)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Video size={11} />
                        {(s.videos || []).length} videos
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          color: "var(--text-muted)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <ListPlus size={11} />
                        {(s.playlists || []).length} playlists
                      </span>
                    </div>
                  </Link>
                ))}

                {subjects.length === 0 && (
                  <div
                    style={{
                      padding: "18px 12px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      border: "1px dashed var(--border)",
                      borderRadius: 10,
                    }}
                  >
                    No subjects yet.
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
