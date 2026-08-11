"use client";

import { Fragment } from "react";

const URL_REGEX = /(https?:\/\/[^\s]+)/;

export default function LinkifyText({ text, className = "" }) {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        URL_REGEX.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </span>
  );
}
