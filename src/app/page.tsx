"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMessageUnreadCount } from "@/lib/api/messages";
import { getNotificationUnreadCount } from "@/lib/api/notifications";
import { joinWaitlist } from "@/lib/api/waitlist";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Package,
  Repeat2,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: unreadMessagesCount = 0 } = useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: getMessageUnreadCount,
    enabled: !!user,
  });

  const { data: unreadNotificationsCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getNotificationUnreadCount,
    enabled: !!user,
  });

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await joinWaitlist({
        email: email.trim(),
        source: "landing_page",
      });

      toast.success("Thanks for joining! We'll notify you when we launch.");
      setEmail("");
    } catch {
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - Show Navbar if logged in, otherwise show landing header */}
      {user ? (
        <Navbar
          unreadMessagesCount={unreadMessagesCount}
          unreadNotificationsCount={unreadNotificationsCount}
          onLogout={handleLogout}
        />
      ) : (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SwapBuds</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="flex-1 px-4 py-20 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 flex justify-center">
            <Sparkles className="h-16 w-16 text-primary" />
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Trade Items with Your Community
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            SwapBuds is a peer-to-peer trading platform where you can safely
            exchange items with verified users in your community.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Browse Items</Link>
            </Button>
          </div>

          {/* Waitlist Form */}
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Join the Waitlist</CardTitle>
              <CardDescription>
                Be the first to know when we launch new features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWaitlistSignup} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Join"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            Why Choose SwapBuds?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <Shield className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Safe & Secure</h3>
                <p className="text-muted-foreground">
                  ID verification, user ratings, and secure messaging ensure
                  safe trades.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Users className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Community First</h3>
                <p className="text-muted-foreground">
                  Build trust with your trading community through verified
                  profiles.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Repeat2 className="mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Easy Trading</h3>
                <p className="text-muted-foreground">
                  Simple trade proposals, real-time chat, and smooth
                  transactions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">List Your Items</h3>
              <p className="text-muted-foreground">
                Upload photos and describe what you want to trade. Takes less
                than 2 minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  2
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Find & Propose</h3>
              <p className="text-muted-foreground">
                Browse items, message traders, and propose swaps that work for
                both parties.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Complete Trade</h3>
              <p className="text-muted-foreground">
                Agree on terms, exchange contact info, and complete your trade
                safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t bg-muted/50 px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-12 text-3xl font-bold md:text-4xl">
            Trusted by Traders Everywhere
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">1000+</div>
              <p className="text-muted-foreground">Active Traders</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">5000+</div>
              <p className="text-muted-foreground">Items Listed</p>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">3000+</div>
              <p className="text-muted-foreground">Successful Trades</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
