"use client";

import { useEffect, useState } from "react";

function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Avatar({
  src,
  name,
  size = 64,
  isOnline = false,
  className = "",
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const showImage = src && !hasError;
  const initials = getInitials(name);

  return (
    <div
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-sunlo-secondary-light font-bold text-sunlo-text"
        style={{ fontSize: size * 0.36 }}
      >
        {showImage ? (
          <img
            src={src}
            alt={name || "Avatar"}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span aria-label={name || "Avatar"}>{initials}</span>
        )}
      </div>
      {isOnline && (
        <span
          className="absolute bottom-0 right-0 block rounded-full bg-sunlo-success ring-2 ring-sunlo-background"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}
