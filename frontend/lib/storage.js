const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_TIMEOUT_MS = 30000;

function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out. Check network or server.`)),
        UPLOAD_TIMEOUT_MS
      )
    ),
  ]);
}

export function validateImageFile(file) {
  if (!file) {
    return "No file selected.";
  }

  if (!file.type || !file.type.startsWith("image/")) {
    return "Please select a valid image file.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}

export async function uploadProfilePhoto(uid, file, existingPublicId = null) {
  if (!uid) {
    throw new Error("A user ID is required to upload a profile photo.");
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", `profilePhotos/${uid}`);

  const uploadPromise = fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData,
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Upload failed");
    }
    return data;
  });

  const result = await withTimeout(uploadPromise, "Upload");

  if (existingPublicId && existingPublicId !== result.photoPath) {
    try {
      await deleteProfilePhoto(existingPublicId);
    } catch (err) {
      console.warn("Failed to delete previous profile photo:", err);
    }
  }

  return { photoURL: result.photoURL, photoPath: result.photoPath };
}

export async function deleteProfilePhoto(publicId) {
  if (!publicId) {
    throw new Error("A photo public_id is required to delete a profile photo.");
  }

  const deletePromise = fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Delete failed");
    }
    return data;
  });

  await withTimeout(deletePromise, "Delete");
}
