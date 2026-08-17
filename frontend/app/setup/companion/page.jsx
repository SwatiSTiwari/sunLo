"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { createCompanion } from "@/lib/firestore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import toast from "react-hot-toast";

const LANGUAGES = ["Hindi", "English", "Marathi", "Bengali", "Tamil", "Telugu", "Gujarati"];
const TOPICS = ["Loneliness", "Relationship issues", "Work stress", "Friendship", "General talk", "Studies"];

export default function CompanionSetupPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState([]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (userData?.role !== "companion") {
      router.replace("/dashboard/user");
      return;
    }
    if (userData?.profileComplete) {
      router.replace("/dashboard/companion");
      return;
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sunlo-background">
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-sunlo-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || userData?.role !== "companion" || userData?.profileComplete) {
    return null;
  }

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

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim() || !age.trim() || !city.trim()) {
        toast.error("Please fill all fields");
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!bio.trim() || languages.length === 0 || topics.length === 0) {
      toast.error("Please fill all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await createCompanion(user.uid, {
        name,
        age: Number(age),
        city,
        photoURL,
        photoPath,
        bio,
        languages,
        topics,
      });
      toast.success("Profile created!");
      setStep(3);
    } catch (err) {
      toast.error(err?.message || "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="min-h-screen bg-sunlo-background px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <div className="h-2.5 w-full rounded-full bg-orange-100">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-sunlo-primary to-sunlo-accent transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-sunlo-muted">Step {step} of 3</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-sunlo-text">Basic Info</h2>
              <Input
                label="Full Name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Age"
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <Input
                label="City"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <ProfilePhotoUploader
                uid={user.uid}
                currentPhotoURL={photoURL}
                currentPhotoPath={photoPath}
                fallbackName={name}
                onUploadComplete={({ photoURL: url, photoPath: path }) => {
                  setPhotoURL(url);
                  setPhotoPath(path);
                }}
                onRemove={() => {
                  setPhotoURL("");
                  setPhotoPath("");
                }}
              />
              <Button onClick={handleNext} className="w-full">Next</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-sunlo-text">About You</h2>

              <div>
                <label className="mb-2 block text-sm font-semibold text-sunlo-text">
                  Bio <span className="text-sunlo-muted">({bio.length}/200)</span>
                </label>
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
                <label className="mb-2 block text-sm font-semibold text-sunlo-text">Languages</label>
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
                <label className="mb-2 block text-sm font-semibold text-sunlo-text">Topics you are comfortable with</label>
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
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleSubmit} className="flex-1" isLoading={isSubmitting}>Submit</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sunlo-success/10">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-sunlo-text">Profile setup complete!</h2>
              <p className="mt-2 text-sunlo-muted">People can now talk to you 🎉</p>
              <Button onClick={() => router.push("/dashboard/companion")} className="mt-6">Go to Dashboard</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
