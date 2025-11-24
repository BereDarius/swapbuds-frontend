/**
 * ImageUpload Component
 *
 * Drag-and-drop image upload with Cloudinary integration.
 * Features:
 * - Drag and drop or click to upload
 * - Multiple file support (up to 5 images)
 * - Image preview with remove option
 * - File size validation (5MB max)
 * - Format validation (jpg, png, webp)
 * - Upload progress indication
 * - Reorder images
 */

"use client";

import { uploadImage } from "@/lib/api/items";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[]; // Array of Cloudinary URLs
  onChange: (urls: string[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
}

const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp"];

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  maxSizeInMB = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!ALLOWED_FORMATS.includes(file.type)) {
        return "Only JPG, PNG, and WebP images are allowed";
      }

      // Check file size
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return `File size must be less than ${maxSizeInMB}MB`;
      }

      return null;
    },
    [maxSizeInMB],
  );

  const handleUpload = useCallback(
    async (files: File[]) => {
      // Check max images limit
      if (value.length + files.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Validate all files first
      for (const file of files) {
        const error = validateFile(file);
        if (error) {
          toast.error(error);
          return;
        }
      }

      setUploadingCount(files.length);

      try {
        // Upload all files
        const uploadPromises = files.map((file) => uploadImage(file));
        const results = await Promise.all(uploadPromises);

        // Add URLs to value
        const newUrls = results.map((result) => result.url);
        onChange([...value, ...newUrls]);

        toast.success(
          `${files.length} image${
            files.length > 1 ? "s" : ""
          } uploaded successfully`,
        );
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload images. Please try again.");
      } finally {
        setUploadingCount(0);
      }
    },
    [value, maxImages, onChange, validateFile],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleUpload(files);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleUpload(files);
      }
    },
    [handleUpload],
  );

  const handleRemove = (index: number) => {
    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);
    toast.success("Image removed");
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newUrls = [...value];
    const [removed] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, removed);
    onChange(newUrls);
  };

  const canAddMore = value.length + uploadingCount < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <input
            type="file"
            multiple
            accept={ALLOWED_FORMATS.join(",")}
            onChange={handleFileSelect}
            disabled={uploadingCount > 0}
            className="absolute inset-0 cursor-pointer opacity-0"
          />

          <div className="flex flex-col items-center justify-center p-8 text-center">
            {uploadingCount > 0 ? (
              <>
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Uploading {uploadingCount} image
                  {uploadingCount > 1 ? "s" : ""}
                  ...
                </p>
              </>
            ) : (
              <>
                <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-1 text-sm font-medium">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or WebP • Max {maxSizeInMB}MB • Up to {maxImages}{" "}
                  images
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(
                  e.dataTransfer.getData("text/plain"),
                  10,
                );
                if (fromIndex !== index) {
                  handleReorder(fromIndex, index);
                }
              }}
            >
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />

              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                  Primary
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => handleRemove(index)}
                className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Drag indicator */}
              <div className="absolute bottom-2 left-2 right-2 rounded bg-black/50 px-2 py-1 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                Drag to reorder
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {value.length} of {maxImages} images • First image is primary
          {canAddMore && " • Drag images to reorder"}
        </p>
      )}

      {/* Empty state */}
      {value.length === 0 && uploadingCount === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No images uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}
