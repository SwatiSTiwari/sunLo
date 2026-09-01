"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { getCompanion, updateCompanion } from "@/lib/firestore";
import { deleteProfilePhoto } from "@/lib/storage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import ConfirmDialog from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

const LANGUAGES = ["Hindi", "English", "Marathi", "Bengali", "Tamil", "Telugu", "Gujarati"];
const TOPICS = ["Loneliness", "Relationship issues", "Work stress", "Friendship", "General talk", "Studies"];

export default function CompanionProfileEditPage() {
  return (
    <ProtectedRoute allowedRoles={["companion"]}>
      <CompanionProfileEdit />
    </ProtectedRoute>
  );
}

function CompanionProfileEdit() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [photoURL, setPhotoURL] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmClear, setConfirmClear] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await getCompanion(user.uid);
        if (data) {
          setName(data.name || "");
          setAge(data.age ? String(data.age) : "");
          setCity(data.city || "");
          setBio(data.bio || "");
          setLanguages(data.languages || []);
          setTopics(data.topics || []);
          setPhotoURL(data.photoURL || "");
          setPhotoPath(data.photoPath || "");
        }
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const toggleLanguage = (lang) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleTopic = (topic) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

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
      await updateCompanion(user.uid, { photoURL: "", photoPath: "" });
      if (photoPath) {
        try {
          await deleteProfilePhoto(photoPath);
        } catch (err) {
          console.warn("Failed to delete profile photo:", err);
        }
      }
      setPhotoURL("");
      setPhotoPath("");
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err?.message || "Failed to remove photo");
    }
  };

  const clearField = (field) => {
    if (field === "bio") setBio("");
    if (field === "languages") setLanguages([]);
    if (field === "topics") setTopics([]);
    setConfirmClear("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !age.trim() || !city.trim()) {
      toast.error("Please fill required fields");
      return;
    }
    if (!bio.trim() || languages.length === 0 || topics.length === 0) {
      toast.error("Please fill all profile fields");
      return;
    }
    setIsSaving(true);
    try {
      await updateCompanion(user.uid, {
        name: name.trim(),
        age: Number(age),
        city: city.trim(),
        bio: bio.trim(),
        languages,
        topics,
        photoURL,
        photoPath,
      });
      toast.success("Profile updated");
      router.push("/dashboard/companion");
    } catch (err) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sunlo-background">
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-sunlo-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sunlo-background">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold text-sunlo-text">Edit Profile</h1>
          <p className="mt-1 text-sm text-sunlo-muted">Update your companion profile</p>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Age"
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>

            <Input
              label="City"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-sunlo-text">
                  Bio <span className="text-sunlo-muted">({bio.length}/200)</span>
                </label>
                {bio && (
                  <button
                    type="button"
                    onClick={() => setConfirmClear("bio")}
                    className="text-xs font-medium text-sunlo-error hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                className="w-full rounded-xl border border-orange-100 bg-sunlo-background px-4 py-3 text-sunlo-text placeholder-sunlo-muted/60 shadow-sm transition-all focus:border-sunlo-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-sunlo-secondary/50"
                rows={4}
                maxLength={200}
                placeholder="Tell us a little about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-sunlo-text">Languages</label>
                {languages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setConfirmClear("languages")}
                    className="text-xs font-medium text-sunlo-error hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      languages.includes(lang)
                        ? "bg-gradient-to-r from-sunlo-primary to-sunlo-accent text-white shadow-button"
                        : "bg-sunlo-secondary-light text-sunlo-text hover:bg-orange-100"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-sunlo-text">Topics</label>
                {topics.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setConfirmClear("topics")}
                    className="text-xs font-medium text-sunlo-error hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      topics.includes(topic)
                        ? "bg-gradient-to-r from-sunlo-primary to-sunlo-accent text-white shadow-button"
                        : "bg-sunlo-secondary-light text-sunlo-text hover:bg-orange-100"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dashboard/companion")}
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
        onConfirm={confirmPhotoRemove}
        onCancel={() => setConfirmRemove(false)}
      />

      <ConfirmDialog
        isOpen={!!confirmClear}
        title={`Clear ${confirmClear}?`}
        message={`Are you sure you want to remove your ${confirmClear}?`}
        confirmText="Clear"
        confirmVariant="primary"
        onConfirm={() => clearField(confirmClear)}
        onCancel={() => setConfirmClear("")}
      />
    </div>
  );
}
