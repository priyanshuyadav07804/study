"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageUp, KeyRound, Save, Trash2, UserRound, X } from "lucide-react";

const emptyProfile = {
  name: "",
  email: "",
  mobile: "",
  image: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordStep, setPasswordStep] = useState("closed");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [verifyingDelete, setVerifyingDelete] = useState(false);
  const [deleteStep, setDeleteStep] = useState("closed");
  const [deletePassword, setDeletePassword] = useState("");
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [toast, setToast] = useState(null);

  const detailsChanged =
    profile.name !== savedProfile.name ||
    profile.email !== savedProfile.email ||
    profile.mobile !== savedProfile.mobile;
  const imageChanged = profile.image !== savedProfile.image;

  const handleAuthError = (res) => {
    if (res.status === 401) {
      router.push("/?auth=login");
      return true;
    }
    return false;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (handleAuthError(res)) return;
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const loadedProfile = {
          name: json.data.name || "",
          email: json.data.email || "",
          mobile: json.data.mobile || "",
          image: json.data.image || "",
        };
        setProfile(loadedProfile);
        setSavedProfile(loadedProfile);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  const selectImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose a valid image file");
      return;
    }

    if (file.size > 2000000) {
      setError("Choose an image smaller than 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfile("image", reader.result || "");
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!detailsChanged) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          mobile: profile.mobile,
        }),
      });
      if (handleAuthError(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const updatedProfile = {
        name: json.data.name || "",
        email: json.data.email || "",
        mobile: json.data.mobile || "",
        image: savedProfile.image,
      };
      setProfile((current) => ({ ...updatedProfile, image: current.image }));
      setSavedProfile(updatedProfile);
      showToast("Profile updated successfully");
      window.dispatchEvent(new Event("auth-changed"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const saveImage = async () => {
    if (!imageChanged) return;
    setSavingImage(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: profile.image }),
      });
      if (handleAuthError(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const updatedProfile = {
        name: json.data.name || "",
        email: json.data.email || "",
        mobile: json.data.mobile || "",
        image: json.data.image || "",
      };
      setProfile((current) => ({ ...current, image: updatedProfile.image }));
      setSavedProfile((current) => ({ ...current, image: updatedProfile.image }));
      showToast("Image saved successfully");
      window.dispatchEvent(new Event("auth-changed"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save image");
      showToast(e instanceof Error ? e.message : "Failed to save image", "error");
    } finally {
      setSavingImage(false);
    }
  };

  const updatePasswordForm = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordError("");
  };

  const verifyCurrentPassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      setPasswordError("Enter your current password");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setVerifyingPassword(true);
    setPasswordError("");

    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword }),
      });
      if (handleAuthError(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPasswordStep("confirm");
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : "Failed to verify password");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const resetPassword = async () => {
    setResettingPassword(true);
    setPasswordError("");

    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      if (handleAuthError(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setPasswordStep("closed");
      showToast("Password updated successfully");
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : "Failed to update password");
      setPasswordStep("password");
    } finally {
      setResettingPassword(false);
    }
  };

  const verifyDeletePassword = async (e) => {
    e.preventDefault();
    setVerifyingDelete(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/profile/delete/verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (handleAuthError(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDeleteStep("confirm");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to verify password");
    } finally {
      setVerifyingDelete(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold">Profile</h1>
          <p className="m-0 text-[var(--text-muted)]">
            Manage your account details and profile image.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="skeleton h-72 rounded-lg" />
            <div className="skeleton h-96 rounded-lg" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="mb-5 flex flex-col items-center text-center">
                <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-2)]">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={44} className="text-[var(--text-muted)]" />
                  )}
                </div>
                <h2 className="mb-1 text-xl font-bold">{profile.name || "Your profile"}</h2>
                <p className="m-0 max-w-full overflow-hidden text-ellipsis text-sm text-[var(--text-muted)]">
                  {profile.email}
                </p>
              </div>

              <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm font-bold text-[var(--text)] transition hover:border-red-400/60">
                <Camera size={16} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => selectImage(e.target.files?.[0])}
                />
              </label>

              {profile.image && (
                <button
                  type="button"
                  onClick={() => updateProfile("image", "")}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-transparent text-sm font-bold text-[var(--text-muted)] transition hover:text-[var(--text)]"
                >
                  <X size={15} />
                  Remove Image
                </button>
              )}

              {imageChanged && (
                <button
                  type="button"
                  onClick={saveImage}
                  disabled={savingImage}
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red-500 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:bg-red-500/60"
                >
                  <ImageUp size={16} />
                  {savingImage ? "Saving..." : "Save Change"}
                </button>
              )}
            </aside>

            <div className="grid gap-5">
              <form
                onSubmit={saveProfile}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <h2 className="mb-5 text-xl font-bold">Account Details</h2>

                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-bold">
                    Name
                    <input
                      value={profile.name}
                      onChange={(e) => updateProfile("name", e.target.value)}
                      className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 font-normal text-[var(--text)] outline-none transition focus:border-red-400/70"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-bold">
                    Email
                    <input
                      value={profile.email}
                      type="email"
                      onChange={(e) => updateProfile("email", e.target.value)}
                      className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 font-normal text-[var(--text)] outline-none transition focus:border-red-400/70"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-bold">
                    Mobile Number
                    <input
                      value={profile.mobile}
                      type="tel"
                      onChange={(e) => updateProfile("mobile", e.target.value)}
                      className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 font-normal text-[var(--text)] outline-none transition focus:border-red-400/70"
                    />
                  </label>
                </div>

                {error && (
                  <div className="mt-4 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {detailsChanged && (
                  <button
                    disabled={saving}
                    className="mt-5 flex h-12 items-center justify-center gap-2 rounded-lg bg-red-500 px-5 font-bold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:bg-red-500/60"
                  >
                    <Save size={17} />
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                )}
              </form>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="mb-2 text-xl font-bold">Reset Password</h2>
                <p className="mb-4 text-sm leading-6 text-[var(--text-muted)]">
                  Verify your current password before saving a new one.
                </p>

                {passwordStep === "closed" && (
                  <button
                    type="button"
                    onClick={() => setPasswordStep("password")}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-500 px-5 font-bold text-white transition hover:bg-red-400"
                  >
                    <KeyRound size={17} />
                    Reset Password
                  </button>
                )}

                {passwordStep === "password" && (
                  <form onSubmit={verifyCurrentPassword} className="grid gap-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-bold">
                        Current Password
                        <input
                          value={passwordForm.currentPassword}
                          type="password"
                          onChange={(e) => updatePasswordForm("currentPassword", e.target.value)}
                          className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 font-normal text-[var(--text)] outline-none transition focus:border-red-400/70"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-bold">
                        New Password
                        <input
                          value={passwordForm.newPassword}
                          type="password"
                          onChange={(e) => updatePasswordForm("newPassword", e.target.value)}
                          className="h-12 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 font-normal text-[var(--text)] outline-none transition focus:border-red-400/70"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        disabled={verifyingPassword}
                        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-red-500 px-5 font-bold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:bg-red-500/60"
                      >
                        <KeyRound size={16} />
                        {verifyingPassword ? "Checking..." : "Reset Password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordStep("closed");
                          setPasswordForm({ currentPassword: "", newPassword: "" });
                          setPasswordError("");
                        }}
                        className="h-11 rounded-lg border border-[var(--border)] bg-transparent px-5 font-bold text-[var(--text-muted)] transition hover:text-[var(--text)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {passwordStep === "confirm" && (
                  <div className="subject-delete-confirm grid gap-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
                    <p className="m-0 text-sm font-bold text-emerald-100">
                      Current password verified. Confirm password reset.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={resetPassword}
                        disabled={resettingPassword}
                        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-red-500 px-5 font-bold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:bg-red-500/60"
                      >
                        <KeyRound size={16} />
                        {resettingPassword ? "Saving..." : "Confirm Reset"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordStep("closed");
                          setPasswordForm({ currentPassword: "", newPassword: "" });
                          setPasswordError("");
                        }}
                        className="h-11 rounded-lg border border-[var(--border)] bg-transparent px-5 font-bold text-[var(--text-muted)] transition hover:text-[var(--text)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {passwordError && (
                  <div className="mt-4 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-300">
                    {passwordError}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-5">
                <h2 className="mb-2 text-xl font-bold text-red-100">Delete Account</h2>
                <p className="mb-4 text-sm leading-6 text-red-100/75">
                  This permanently deletes your account, subjects, videos, and playlists.
                </p>

                {deleteStep === "closed" && (
                  <button
                    type="button"
                    onClick={() => setDeleteStep("password")}
                    className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 font-bold text-white transition hover:bg-red-500 disabled:cursor-wait disabled:bg-red-600/60"
                  >
                    <Trash2 size={17} />
                    Delete Account
                  </button>
                )}

                {deleteStep === "password" && (
                  <form onSubmit={verifyDeletePassword} className="grid gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={deletePassword}
                        type="password"
                        onChange={(e) => {
                          setDeletePassword(e.target.value);
                          setDeleteError("");
                        }}
                        placeholder="Enter current password"
                        className="h-12 min-w-0 flex-1 rounded-lg border border-red-400/30 bg-[var(--surface)] px-4 text-[var(--text)] outline-none transition focus:border-red-400/70"
                      />
                      <button
                        disabled={verifyingDelete}
                        className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 font-bold text-white transition hover:bg-red-500 disabled:cursor-wait disabled:bg-red-600/60"
                      >
                        <Trash2 size={17} />
                        {verifyingDelete ? "Checking..." : "Delete"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteStep("closed");
                        setDeletePassword("");
                        setDeleteError("");
                      }}
                      className="h-10 justify-self-start rounded-lg border border-red-400/30 bg-transparent px-4 text-sm font-bold text-red-100/75 transition hover:text-red-100"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {deleteStep === "confirm" && (
                  <div className="subject-delete-confirm grid gap-3 rounded-lg border border-red-400/40 bg-red-500/15 p-4">
                    <p className="m-0 text-sm font-bold text-red-100">
                      Password verified. Confirm permanent account deletion.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={deleteAccount}
                        disabled={deleting}
                        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 font-bold text-white transition hover:bg-red-500 disabled:cursor-wait disabled:bg-red-600/60"
                      >
                        <Trash2 size={16} />
                        {deleting ? "Deleting..." : "Confirm Delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteStep("closed");
                          setDeletePassword("");
                          setDeleteError("");
                        }}
                        className="h-11 rounded-lg border border-red-400/30 bg-transparent px-5 font-bold text-red-100/75 transition hover:text-red-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {deleteError && (
                  <div className="mt-4 rounded-lg border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-200">
                    {deleteError}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {toast && (
        <div
          className={`fixed right-5 top-[76px] z-[220] rounded-lg px-4 py-3 text-sm font-bold text-white shadow-xl ${
            toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}
