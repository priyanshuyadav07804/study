"use client";

import { Menu, Trash2, X } from "lucide-react";

export default function SubjectsDrawer({
  isOpen,
  subjects,
  loading,
  error,
  currentSubjectId,
  deleteUnlocked,
  onToggle,
  onClose,
  onNavigate,
  onDelete,
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
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

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && onClose()}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                onClick={onClose}
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
                }}
              >
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ padding: 8 }}>
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="skeleton" style={{ height: 52, borderRadius: 10, marginBottom: 10 }} />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {subjects.map((subject) => (
                  <div
                    key={subject._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigate(subject._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        onNavigate(subject._id);
                      }
                    }}
                    style={{
                      textDecoration: "none",
                      color: "var(--text)",
                      padding: "12px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: currentSubjectId === subject._id ? "rgba(239,68,68,0.08)" : "var(--surface-2)",
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
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 16,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {subject.name}
                      </div>
                      {deleteUnlocked && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(subject);
                            }}
                            title="Delete subject"
                            style={{
                              padding: "6px 8px",
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
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
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
                        }}
                      >
                        {(subject.videos || []).length} videos
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {(subject.playlists || []).length} playlists
                      </span>
                    </div>
                  </div>
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
