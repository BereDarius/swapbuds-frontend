"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import {
  Bell,
  Heart,
  HelpCircle,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
  onLogout: () => void;
}

export function Navbar({
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
  onLogout,
}: NavbarProps) {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SwapBuds</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/items"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Browse Items
            </Link>
            <Link
              href="/trades"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              My Trades
            </Link>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Admin
              </Link>
            )}
            <Button size="sm" className="gap-2" asChild>
              <Link href="/items/new">
                <Plus className="h-4 w-4" />
                List Item
              </Link>
            </Button>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden items-center gap-4 md:flex">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/messages">
                <MessageSquare className="h-5 w-5" />
                {unreadMessagesCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                  >
                    {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                  >
                    {unreadNotificationsCount > 9
                      ? "9+"
                      : unreadNotificationsCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/support">
                <HelpCircle className="h-5 w-5" />
              </Link>
            </Button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.avatarUrl || undefined}
                      alt={user.username}
                    />
                    <AvatarFallback>
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.username}`}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/items?userId=me">
                    <Package className="mr-2 h-4 w-4" />
                    My Items
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/support">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {(user.role === "ADMIN" ||
                  user.role === "MODERATOR" ||
                  user.role === "SUPPORT") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link
                href="/items"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Items
              </Link>
              <Link
                href="/trades"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Trades
              </Link>
              <Link
                href="/items/new"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                List Item
              </Link>
              <hr className="my-2" />
              <Link
                href={`/profile/${user.username}`}
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/messages"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
                {unreadMessagesCount > 0 && ` (${unreadMessagesCount})`}
              </Link>
              <Link
                href="/notifications"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Notifications
                {unreadNotificationsCount > 0 &&
                  ` (${unreadNotificationsCount})`}
              </Link>
              <Link
                href="/favorites"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favorites
              </Link>
              <Link
                href="/support"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
              <hr className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              {(user.role === "ADMIN" ||
                user.role === "MODERATOR" ||
                user.role === "SUPPORT") && (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                </>
              )}
              <hr className="my-2" />
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
              >
                Log out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
