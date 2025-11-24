import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ReactNode } from "react";

interface SettingsLayoutProps {
  children: ReactNode;
}

/**
 * Settings Layout
 *
 * Shared layout for all settings pages with navigation sidebar.
 *
 * Features:
 * - Responsive sidebar navigation
 * - Active link highlighting
 * - Mobile-friendly collapsible menu
 * - Consistent spacing and layout
 */
export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const navigation = [
    {
      title: "Privacy",
      href: "/settings/privacy",
      description: "Cookie preferences and tracking",
    },
    {
      title: "Data Management",
      href: "/settings/data",
      description: "Export or delete your data",
    },
  ];

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and privacy preferences.
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="lg:w-1/5">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Card className="p-6">{children}</Card>
          </main>
        </div>
      </div>
    </div>
  );
}
