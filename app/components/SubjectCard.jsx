"use client";

import { Check, ListPlus, Pencil, Trash2, Video, X } from "lucide-react";

export default function SubjectCard({
  subject,
  isEditing,
  isConfirmingDelete,
  isDeleting,
  editingName,
  actionState,
  deleteUnlocked,
  onOpen,
  onStartEdit,
  onNameChange,
  onSave,
  onCancel,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}) {
  return (
    <div
      role={isEditing ? undefined : "button"}
      tabIndex={isEditing ? undefined : 0}
      onClick={isEditing ? undefined : onOpen}
      onKeyDown={
        isEditing
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }
      }
      className={`group relative grid min-h-48 content-between gap-6 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-[0_18px_38px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-red-400/40 hover:bg-[#171724] ${
        isDeleting ? "subject-card-removing" : ""
      }`}
    >
      {deleteUnlocked && isConfirmingDelete && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute inset-0 z-20 flex items-center justify-center p-5 ${
            isDeleting ? "subject-delete-collapse" : "subject-delete-confirm"
          }`}
          style={{
            background: "rgba(13, 13, 18, 0.45)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="scale-in"
            style={{
              width: "100%",
              maxWidth: 220,
              borderRadius: 14,
              border: "1px solid rgba(248, 113, 113, 0.35)",
              background: "rgba(36, 16, 20, 0.94)",
              boxShadow: "0 18px 40px rgba(0,0,0,0.32)",
              padding: "16px 14px",
              display: "grid",
              gap: 12,
              textAlign: "center",
            }}
          >
            <span style={{ color: "#fecaca", fontSize: 14, fontWeight: 600 }}>
              Confirm delete?
            </span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirmDelete();
                }}
                disabled={isDeleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:bg-red-500/60"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelDelete();
                }}
                disabled={isDeleting}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] transition hover:text-[var(--text)] disabled:cursor-not-allowed"
                title="Cancel delete"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-sky-400/35 bg-sky-500/15"
          title="Open subject"
        >
          <Video size={22} className="text-sky-300" />
        </button>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] transition hover:text-[var(--text)]"
              title="Edit subject"
            >
              <Pencil size={15} />
            </button>
            {deleteUnlocked && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete();
                }}
                disabled={actionState === "delete"}
                id="delete_button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] transition hover:text-[var(--text)] disabled:cursor-wait"
                title="Delete subject"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        {isEditing ? (
          <form
            onSubmit={onSave}
            onClick={(e) => e.stopPropagation()}
            className="grid gap-3"
          >
            <textarea
              value={editingName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Subject name"
              rows={3}
              className="min-h-[88px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 font-[inherit] leading-6 text-[var(--text)] outline-none transition focus:border-red-400/70"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={actionState === "save"}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white transition hover:bg-green-400 disabled:cursor-wait disabled:bg-green-500/60"
                title="Save subject"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] transition hover:text-[var(--text)]"
                title="Cancel edit"
              >
                <X size={16} />
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="block text-[var(--text)] no-underline">
              <h2 className="mb-4 break-words text-2xl font-bold leading-tight">
                {subject.name}
              </h2>
            </div>
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
          </>
        )}
      </div>
    </div>
  );
}
