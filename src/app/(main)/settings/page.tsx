"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Lock, Settings, User } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const sections = [
    {
      title: "Profile",
      description: "Manage your profile information and avatar",
      href: "/settings/profile",
      icon: User,
    },
    {
      title: "Privacy & Security",
      description: "Control your privacy settings and data",
      href: "/settings/privacy",
      icon: Lock,
    },
    {
      title: "Notifications",
      description: "Configure your notification preferences",
      href: "/settings/notifications",
      icon: Bell,
    },
    {
      title: "Account",
      description: "Manage your account and data",
      href: "/settings/account",
      icon: Settings,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{section.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
