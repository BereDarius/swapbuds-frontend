/**
 * Verification Page
 *
 * ID verification document upload and status
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { uploadImage } from "@/lib/api/items";
import {
  cancelVerification,
  getMyVerification,
  submitVerification,
} from "@/lib/api/verification";
import { getErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { DocumentType, VerificationStatus } from "@/types/verification";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Shield,
  Upload,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const verificationSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  documentImage: z.instanceof(File).optional(),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function VerificationPage() {
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Fetch verification status
  const { data: verification, isLoading } = useQuery({
    queryKey: ["verification", "me"],
    queryFn: getMyVerification,
  });

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      documentType: DocumentType.PASSPORT,
    },
  });

  // Image upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadImage(file),
    onSuccess: (response) => {
      setUploadedImageUrl(response.url);
      toast.success("Document uploaded successfully");
    },
    onError: (error) => {
      logger.apiError("POST", "/items/upload", error);
      const message = getErrorMessage(error, "Failed to upload document");
      toast.error("Upload failed", { description: message });
      setImagePreview(null);
      form.setValue("documentImage", undefined);
    },
  });

  // Submit verification mutation
  const submitMutation = useMutation({
    mutationFn: submitVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification", "me"] });
      toast.success("Verification submitted", {
        description: "Your documents are being reviewed.",
      });
      setImagePreview(null);
      setUploadedImageUrl(null);
      form.reset();
    },
    onError: (error) => {
      logger.apiError("POST", "/verification", error);
      const message = getErrorMessage(error, "Failed to submit verification");
      toast.error("Submission failed", { description: message });
    },
  });

  // Cancel verification mutation
  const cancelMutation = useMutation({
    mutationFn: cancelVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification", "me"] });
      toast.success("Verification cancelled");
    },
    onError: (error) => {
      logger.apiError("DELETE", "/verification/me", error);
      const message = getErrorMessage(error, "Failed to cancel verification");
      toast.error("Cancellation failed", { description: message });
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 10MB",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    form.setValue("documentImage", file);
    await uploadMutation.mutateAsync(file);
  };

  const onSubmit = async (data: VerificationFormValues) => {
    if (!uploadedImageUrl) {
      toast.error("Please upload a document image");
      return;
    }

    await submitMutation.mutateAsync({
      documentType: data.documentType,
      documentImageUrl: uploadedImageUrl,
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case VerificationStatus.APPROVED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case VerificationStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.PENDING:
        return <Clock className="h-5 w-5" />;
      case VerificationStatus.APPROVED:
        return <CheckCircle2 className="h-5 w-5" />;
      case VerificationStatus.REJECTED:
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Identity Verification</h1>
        </div>
        <p className="text-muted-foreground">
          Verify your identity to gain trust and unlock premium features
        </p>
      </div>

      {/* Current Status */}
      {verification && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(verification.status)}
                Verification Status
              </CardTitle>
              <Badge
                variant="outline"
                className={getStatusColor(verification.status)}
              >
                {verification.status}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document Type:</span>
                <span className="font-medium">
                  {verification.documentType.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">
                  {format(new Date(verification.submittedAt), "PPp")}
                </span>
              </div>
              {verification.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviewed:</span>
                  <span className="font-medium">
                    {format(new Date(verification.reviewedAt), "PPp")}
                  </span>
                </div>
              )}
              {verification.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-medium">
                    {format(new Date(verification.expiryDate), "PP")}
                  </span>
                </div>
              )}
            </div>

            {verification.status === VerificationStatus.PENDING && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-sm">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-yellow-900 dark:text-yellow-200">
                  Your verification is being reviewed. This typically takes
                  24-48 hours.
                </p>
              </div>
            )}

            {verification.status === VerificationStatus.APPROVED && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-green-900 dark:text-green-200">
                  Your identity has been verified! You now have a verified badge
                  on your profile.
                </p>
              </div>
            )}

            {verification.status === VerificationStatus.REJECTED && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg text-sm">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-900 dark:text-red-200 font-medium mb-1">
                      Verification rejected
                    </p>
                    {verification.rejectionReason && (
                      <p className="text-red-800 dark:text-red-300">
                        {verification.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="w-full"
                >
                  {cancelMutation.isPending
                    ? "Cancelling..."
                    : "Submit New Request"}
                </Button>
              </div>
            )}

            {verification.status === VerificationStatus.PENDING && (
              <Button
                variant="outline"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="w-full"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Request"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Verification Form */}
      {(!verification ||
        verification.status === VerificationStatus.REJECTED) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submit Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={submitMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DocumentType.PASSPORT}>
                            Passport
                          </SelectItem>
                          <SelectItem value={DocumentType.ID_CARD}>
                            ID Card
                          </SelectItem>
                          <SelectItem value={DocumentType.DRIVER_LICENSE}>
                            Driver&apos;s License
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a government-issued ID document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentImage"
                  render={() => (
                    <FormItem>
                      <FormLabel>Document Image *</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={
                              uploadMutation.isPending ||
                              submitMutation.isPending
                            }
                          />
                          {uploadMutation.isPending && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </div>
                          )}
                          {imagePreview && (
                            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                              <Image
                                src={imagePreview}
                                alt="Document preview"
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a clear photo of your ID document (max 10MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm space-y-2">
                  <p className="font-medium text-blue-900 dark:text-blue-200">
                    Important Notes:
                  </p>
                  <ul className="list-disc list-inside text-blue-800 dark:text-blue-300 space-y-1">
                    <li>Ensure your document is valid and not expired</li>
                    <li>Photo should be clear and all text readable</li>
                    <li>Make sure all corners of the document are visible</li>
                    <li>Avoid glare and shadows</li>
                    <li>Your documents are securely encrypted</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={
                    !uploadedImageUrl ||
                    uploadMutation.isPending ||
                    submitMutation.isPending
                  }
                  className="w-full"
                  size="lg"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Verification Benefits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Verified Badge</p>
              <p className="text-muted-foreground">
                Stand out with a verified badge on your profile
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Increased Trust</p>
              <p className="text-muted-foreground">
                Build trust with other users and complete more trades
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Priority Support</p>
              <p className="text-muted-foreground">
                Get faster responses from our support team
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
