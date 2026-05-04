"use client";

import { Check, Pencil, Video, X } from "lucide-react";

export default function SubjectHeaderCard({
  loading,
  subject,
  isEditing,
  editingSubjectName,
  subjectAction,
  deleteUnlocked,
  onStartEdit,
  onCancelEdit,
  onChangeName,
  onSubmit,
}) {
  return (
    <header
      style={{
        display: "grid",
        gap: "14px",
        marginBottom: "22px",
        padding: "16px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
      }}
    >
      {!isEditing ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                flexShrink: 0,
              }}
            >
              <Video size={22} color="#f87171" />
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Subject
              </p>
              <h1 style={{ fontSize: "26px", margin: 0 }}>
                {loading ? "Loading..." : subject?.name || "Subject"}
              </h1>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            {!loading && subject && (
              <button
                type="button"
                onClick={onStartEdit}
                title="Edit subject"
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
                <Pencil size={16} />
              </button>
            )}
          </div>
        </div>
      ) : null}

      {!loading && subject && isEditing && (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: "10px" }}>
          <textarea
            value={editingSubjectName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="Subject name"
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
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={subjectAction === "save"}
              title="Save subject"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                border: "none",
                background: "#22c55e",
                color: "white",
                cursor: subjectAction === "save" ? "wait" : "pointer",
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
      )}
    </header>
  );
}
