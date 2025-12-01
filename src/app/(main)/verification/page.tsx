"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMyVerification, submitVerification } from "@/lib/api/verification";
import { DocumentType } from "@/types/verification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, Upload, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function VerificationPage() {
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState<DocumentType>(
    DocumentType.ID_CARD
  );
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [backPreview, setBackPreview] = useState<string>("");
  const [selfiePreview, setSelfiePreview] = useState<string>("");

  const { data: verification, isLoading } = useQuery({
    queryKey: ["my-verification"],
    queryFn: getMyVerification,
  });

  const submitMutation = useMutation({
    mutationFn: submitVerification,
    onSuccess: () => {
      toast.success("Verification submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-verification"] });
      setFrontImage(null);
      setBackImage(null);
      setSelfieImage(null);
      setFrontPreview("");
      setBackPreview("");
      setSelfiePreview("");
    },
    onError: () => {
      toast.error("Failed to submit verification");
    },
  });

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if image is too large (max 1920px width)
          const maxWidth = 1920;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 85% quality
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressed);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back" | "selfie"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      const compressed = await compressImage(file);

      // Check compressed size (base64 strings are ~33% larger than binary)
      const sizeInBytes = (compressed.length * 3) / 4;
      if (sizeInBytes > 8 * 1024 * 1024) {
        toast.error(
          "Compressed image is still too large. Please use a smaller image."
        );
        return;
      }

      if (side === "front") {
        setFrontImage(file);
        setFrontPreview(compressed);
      } else if (side === "back") {
        setBackImage(file);
        setBackPreview(compressed);
      } else {
        setSelfieImage(file);
        setSelfiePreview(compressed);
      }
    } catch {
      toast.error("Failed to process image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage) {
      toast.error("Please upload front image of your document");
      return;
    }
    if (!backImage && documentType === "ID_CARD") {
      toast.error("Please upload back image of your ID card");
      return;
    }
    if (!selfieImage) {
      toast.error("Please upload a live selfie photo");
      return;
    }

    // TODO: Upload images to Cloudinary first and get URLs
    // For now, use preview URLs as placeholders
    submitMutation.mutate({
      documentType,
      documentUrlFront: frontPreview, // This should be Cloudinary URL
      documentUrlBack: backPreview || undefined, // This should be Cloudinary URL
      selfieUrl: selfiePreview, // This should be Cloudinary URL
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show verification status if exists
  if (verification) {
    // Only show status card for PENDING, REJECTED, or UNDERAGE
    // APPROVED users don't see this page (they get notification instead)
    if (verification.status === "APPROVED") {
      return null; // User is verified, no need to show this page
    }

    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            {verification.status === "PENDING" && (
              <>
                <Clock className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
                <h2 className="mb-2 text-2xl font-bold">
                  Verification Pending
                </h2>
                <p className="mb-4 text-muted-foreground">
                  Your ID verification is being reviewed. This usually takes 1-2
                  business days.
                </p>
                <Badge variant="secondary">
                  Submitted:{" "}
                  {new Date(verification.submittedAt).toLocaleDateString()}
                </Badge>
              </>
            )}
            {verification.status === "REJECTED" && (
              <>
                <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                <h2 className="mb-2 text-2xl font-bold">
                  Verification Rejected
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {verification.rejectionReason ||
                    "Your verification request was rejected. Please try again with clearer images."}
                </p>
                <Button
                  onClick={() =>
                    queryClient.setQueryData(["my-verification"], null)
                  }
                >
                  Submit Again
                </Button>
              </>
            )}
            {verification.status === "REJECTED" &&
              verification.rejectionReason === "Underage" && (
                <>
                  <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                  <h2 className="mb-2 text-2xl font-bold">
                    Account Restricted
                  </h2>
                  <p className="mb-4 text-muted-foreground">
                    You must be at least 18 years old to use SwapBuds.
                  </p>
                </>
              )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ID Verification</h1>
        <p className="text-muted-foreground">
          Verify your identity to gain a trusted badge and increase your
          reputation on SwapBuds
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="docType">Document Type</Label>
              <Select
                value={documentType}
                onValueChange={(v) => setDocumentType(v as DocumentType)}
              >
                <SelectTrigger id="docType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ID_CARD">ID Card</SelectItem>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="DRIVERS_LICENSE">
                    Driver&apos;s License
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Front of Document</Label>
              <div className="mt-2">
                {frontPreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={frontPreview}
                      alt="Front"
                      className="w-full rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFrontImage(null);
                        setFrontPreview("");
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary">
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload front image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "front")}
                    />
                  </label>
                )}
              </div>
            </div>

            {documentType === "ID_CARD" && (
              <div>
                <Label>Back of Document</Label>
                <div className="mt-2">
                  {backPreview ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={backPreview}
                        alt="Back"
                        className="w-full rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setBackImage(null);
                          setBackPreview("");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary">
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload back image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "back")}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label>Live Selfie Photo</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Take a live selfie holding your ID document next to your face
              </p>
              <div className="mt-2">
                {selfiePreview ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selfiePreview}
                      alt="Selfie"
                      className="w-full rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelfieImage(null);
                        setSelfiePreview("");
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary">
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload selfie photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "selfie")}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p className="mb-2 font-medium">Important:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Ensure all document details are clearly visible</li>
                <li>Photo should be well-lit without glare</li>
                <li>Document must be valid (not expired)</li>
                <li>You must be at least 18 years old</li>
                <li>Your data is encrypted and securely stored</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit for Verification
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
