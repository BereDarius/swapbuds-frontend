/**
 * Admin Layout
 *
 * Role-protected layout for admin pages with navigation
 */

"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/types/admin";
import {
  BarChart3,
  FileText,
  Flag,
  Home,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Flagged Items",
    href: "/admin/items",
    icon: Flag,
  },
  {
    label: "Problematic Trades",
    href: "/admin/trades",
    icon: ShieldAlert,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Protect admin routes
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
      router.push("/");
    }
  }, [user, router]);

  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)
  ) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">
          Manage users, content, and monitor platform health
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0">
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <Separator className="my-4" />
          <div className="text-sm text-muted-foreground px-3">
            <p>
              Role: <span className="font-medium">{user.role}</span>
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
