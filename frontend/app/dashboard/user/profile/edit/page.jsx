"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { updateUser } from "@/lib/firestore";
import { deleteProfilePhoto } from "@/lib/storage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import ConfirmDialog from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

export default function UserProfileEditPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <UserProfileEdit />
    </ProtectedRoute>
  );
}

function UserProfileEdit() {
  const router = useRouter();
  const { user, userData, refreshUserData } = useAuth();
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (!userData) return;
    setName(userData.name || "");
    setPhotoURL(userData.photoURL || "");
    setPhotoPath(userData.photoPath || "");
  }, [userData]);

  const handlePhotoUpload = (result) => {
    setPhotoURL(result.photoURL);
    setPhotoPath(result.photoPath);
  };

  const handlePhotoRemove = () => {
    setConfirmRemove(true);
  };

  const confirmPhotoRemove = async () => {
    setConfirmRemove(false);
    if (!user) return;
    try {
      await updateUser(user.uid, { photoURL: "", photoPath: "" });
      if (photoPath) {
        try {
          await deleteProfilePhoto(photoPath);
        } catch (err) {
          console.warn("Failed to delete profile photo:", err);
        }
      }
      setPhotoURL("");
      setPhotoPath("");
      await refreshUserData();
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err?.message || "Failed to remove photo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      await updateUser(user.uid, {
        name: name.trim(),
        photoURL,
        photoPath,
      });
      await refreshUserData();
      toast.success("Profile updated");
      router.push("/dashboard/user");
    } catch (err) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-sunlo-background">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold text-sunlo-text">Edit Profile</h1>
          <p className="mt-1 text-sm text-sunlo-muted">Update your basic information</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="flex justify-center">
              <ProfilePhotoUploader
                uid={user?.uid}
                currentPhotoURL={photoURL}
                currentPhotoPath={photoPath}
                fallbackName={name}
                onUploadComplete={handlePhotoUpload}
                onRemove={handlePhotoRemove}
                size={120}
              />
            </div>

            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dashboard/user")}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />

      <ConfirmDialog
        isOpen={confirmRemove}
        title="Remove profile photo?"
        message="This will delete your profile photo. You can upload a new one anytime."
        confirmText="Remove"
        confirmVariant="primary"
        onConfirm={confirmPhotoRemove}
        onCancel={() => setConfirmRemove(false)}
      />
    </div>
  );
}
