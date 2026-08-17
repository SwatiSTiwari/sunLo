import Link from "next/link";
import { Star } from "lucide-react";
import Avatar from "@/components/Avatar";
import Button from "./ui/Button";

export default function CompanionCard({ companion }) {
  const bio = companion.bio
    ? companion.bio.length > 90
      ? companion.bio.slice(0, 90) + "..."
      : companion.bio
    : "A caring listener ready to talk.";

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="mb-4 flex items-center gap-4">
        <div className="relative">
          <Avatar
            src={companion.photoURL || companion.photo}
            name={companion.name}
            size={64}
            className="rounded-full border-2 border-sunlo-secondary"
          />
          <span
            className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
              companion.isAvailable ? "bg-sunlo-success" : "bg-gray-400"
            }`}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sunlo-text">
            {companion.name || "Companion"}
            {companion.age ? `, ${companion.age}` : ""}
          </h3>
          <div className="flex items-center gap-1 text-sm text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sunlo-text">{(companion.rating || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-sunlo-muted">{bio}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(companion.languages || []).slice(0, 3).map((lang) => (
          <span
            key={lang}
            className="rounded-full bg-sunlo-secondary-light px-2.5 py-1 text-xs font-medium text-sunlo-text"
          >
            {lang}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-sunlo-text">
          ₹{companion.pricePerSession || 99}
          <span className="text-xs font-normal text-sunlo-muted"> / 30 mins</span>
        </span>
        <Link href={`/companion/${companion.uid}`}>
          <Button className="px-4 py-2 text-sm">Start Chat</Button>
        </Link>
      </div>
    </div>
  );
}
