"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/api/notifications";
import type { NotificationPreferences } from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Mail,
  MessageSquare,
  Save,
  Star,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function NotificationPreferencesPage() {
  const queryClient = useQueryClient();

  // Fetch preferences
  const { data, isLoading } = useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: getNotificationPreferences,
  });

  // Use query data directly, with fallback defaults
  const preferences = data ?? {
    emailNotifications: false,
    pushNotifications: false,
    newMessage: false,
    tradeUpdate: false,
    newReview: false,
    systemAlert: true,
  };

  // Track local changes
  const [localChanges, setLocalChanges] = useState<
    Partial<NotificationPreferences>
  >({});

  // Merge preferences with local changes
  const currentPreferences = { ...preferences, ...localChanges };

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
      setLocalChanges({});
      toast.success("Notification preferences updated");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    setLocalChanges((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate({ ...preferences, ...localChanges });
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading preferences...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
        </div>
        <p className="text-muted-foreground">
          Manage how you receive notifications about your activity
        </p>
      </div>

      {/* Notification Channels */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-trade-updates" className="text-base">
                Email Notifications for Trades
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive trade updates via email
              </p>
            </div>
            <Switch
              id="email-trade-updates"
              checked={currentPreferences.emailTradeUpdates}
              onCheckedChange={(checked) =>
                handleToggle("emailTradeUpdates", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-trade-updates" className="text-base">
                Push Notifications for Trades
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive trade updates in your browser
              </p>
            </div>
            <Switch
              id="push-trade-updates"
              checked={currentPreferences.pushTradeUpdates}
              onCheckedChange={(checked) =>
                handleToggle("pushTradeUpdates", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="new-message"
                className="text-base flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                New Messages
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone sends you a message
              </p>
            </div>
            <Switch
              id="new-message"
              checked={currentPreferences.emailMessages}
              onCheckedChange={(checked) =>
                handleToggle("emailMessages", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="trade-update"
                className="text-base flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Trade Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified about trade status changes and offers
              </p>
            </div>
            <Switch
              id="trade-update"
              checked={currentPreferences.pushTradeUpdates}
              onCheckedChange={(checked) =>
                handleToggle("pushTradeUpdates", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="new-review"
                className="text-base flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                New Reviews
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone leaves you a review
              </p>
            </div>
            <Switch
              id="new-review"
              checked={currentPreferences.emailReviews}
              onCheckedChange={(checked) =>
                handleToggle("emailReviews", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="system-alert"
                className="text-base flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                System Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Important updates about your account and security (recommended)
              </p>
            </div>
            <Switch
              id="system-alert"
              checked={currentPreferences.emailSystemUpdates}
              onCheckedChange={(checked) =>
                handleToggle("emailSystemUpdates", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
