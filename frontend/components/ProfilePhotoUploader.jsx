"use client";

import { useState, useRef, useEffect } from "react";
import Avatar from "./Avatar";
import Button from "@/components/ui/Button";
import { validateImageFile, uploadProfilePhoto } from "@/lib/storage";
import toast from "react-hot-toast";

export default function ProfilePhotoUploader({
  uid,
  currentPhotoURL,
  currentPhotoPath,
  fallbackName,
  onUploadComplete,
  onRemove,
  size = 120,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [permissionError, setPermissionError] = useState("");
  const previewObjectUrlRef = useRef(null);

  const buttonBase =
    "inline-flex items-center justify-center px-6 py-3 rounded-sunlo font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border-2 border-sunlo-primary text-sunlo-primary hover:bg-sunlo-primary hover:text-white focus:ring-sunlo-primary cursor-pointer";
  const disabledClasses = "opacity-60 cursor-not-allowed pointer-events-none";

  useEffect(() => {
    if (currentPhotoURL && previewUrl) {
      clearPreview();
    }
  }, [currentPhotoURL, previewUrl]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const setPreview = (url) => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }
    previewObjectUrlRef.current = url;
    setPreviewUrl(url);
  };

  const clearPreview = () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }
    previewObjectUrlRef.current = null;
    setPreviewUrl(null);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    try {
      const result = await uploadProfilePhoto(uid, file, currentPhotoPath);
      toast.success("Profile photo updated");
      onUploadComplete?.(result);
    } catch (err) {
      toast.error(err?.message || "Upload failed");
      clearPreview();
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const displayUrl = previewUrl || currentPhotoURL;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar
          src={displayUrl}
          name={fallbackName}
          size={size}
          className={isUploading ? "opacity-60" : ""}
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sunlo-primary border-t-transparent" />
          </div>
        )}
      </div>

      {permissionError && (
        <p className="max-w-xs text-center text-sm text-sunlo-error">
          {permissionError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <label
          htmlFor="gallery-input"
          className={`${buttonBase} px-4 py-2 text-sm ${isUploading ? disabledClasses : ""}`}
        >
          Gallery
        </label>
      </div>

      {currentPhotoURL && (
        <Button
          type="button"
          variant="ghost"
          className="px-4 py-2 text-sm text-sunlo-error hover:bg-red-50"
          onClick={onRemove}
          disabled={isUploading}
        >
          Remove
        </Button>
      )}

      <input
        id="gallery-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
