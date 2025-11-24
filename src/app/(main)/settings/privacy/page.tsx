"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getUserSettings, updateSettings } from "@/lib/api/users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PrivacySettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    tradeNotifications: true,
    messageNotifications: true,
    marketingEmails: false,
    profileVisibility: "PUBLIC" as "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY",
    showEmail: false,
    showLocation: true,
  });

  // Fetch current settings
  const { data, isLoading } = useQuery({
    queryKey: ["userSettings"],
    queryFn: getUserSettings,
  });

  // Update local state when data loads
  useEffect(() => {
    if (data) {
      setSettings({
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
        tradeNotifications: data.tradeNotifications,
        messageNotifications: data.messageNotifications,
        marketingEmails: data.marketingEmails,
        profileVisibility: data.profileVisibility,
        showEmail: data.showEmail,
        showLocation: data.showLocation,
      });
    }
  }, [data]);

  const handleSwitchChange = (field: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleVisibilityChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      profileVisibility: value as "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateSettings(settings);
      toast.success("Settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update settings");
      console.error("Update settings error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Privacy & Security</h1>
        <p className="text-muted-foreground">
          Control your privacy settings and data visibility
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Visibility</CardTitle>
            <CardDescription>
              Control who can see your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={handleVisibilityChange}
              >
                <SelectTrigger id="profile-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">
                    Public - Anyone can view
                  </SelectItem>
                  <SelectItem value="FRIENDS_ONLY">Friends Only</SelectItem>
                  <SelectItem value="PRIVATE">Private - Only you</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-email">Show Email</Label>
                <p className="text-sm text-muted-foreground">
                  Display your email on your public profile
                </p>
              </div>
              <Switch
                id="show-email"
                checked={settings.showEmail}
                onCheckedChange={() => handleSwitchChange("showEmail")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-location">Show Location</Label>
                <p className="text-sm text-muted-foreground">
                  Display your location on your public profile
                </p>
              </div>
              <Switch
                id="show-location"
                checked={settings.showLocation}
                onCheckedChange={() => handleSwitchChange("showLocation")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleSwitchChange("emailNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in browser
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={() => handleSwitchChange("pushNotifications")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trade-notifications">Trade Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about trade updates
                </p>
              </div>
              <Switch
                id="trade-notifications"
                checked={settings.tradeNotifications}
                onCheckedChange={() => handleSwitchChange("tradeNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="message-notifications">
                  Message Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about new messages
                </p>
              </div>
              <Switch
                id="message-notifications"
                checked={settings.messageNotifications}
                onCheckedChange={() =>
                  handleSwitchChange("messageNotifications")
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive news and updates about SwapBuds
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketingEmails}
                onCheckedChange={() => handleSwitchChange("marketingEmails")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
