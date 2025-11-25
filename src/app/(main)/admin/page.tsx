"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminStats } from "@/lib/api/admin";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  CheckCircle,
  Loader2,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    enabled: user?.role === "ADMIN",
  });

  if (user?.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.users.active || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.items.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.items.available || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.trades.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.trades.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.verifications.pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Users</p>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                  </div>
                  <Badge>{stats?.users.newLast7Days || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Items Listed</p>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                  </div>
                  <Badge>{stats?.items.newLast7Days || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Trades</p>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                  </div>
                  <Badge>{stats?.trades.newLast7Days || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(stats?.verifications.pending ?? 0) > 0 && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        {stats?.verifications.pending} pending verifications
                      </p>
                      <Button
                        variant="link"
                        asChild
                        className="h-auto p-0 text-sm"
                      >
                        <Link href="/admin/verification">Review now</Link>
                      </Button>
                    </div>
                  </div>
                )}
                {(stats?.verifications.pending ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">
                    All caught up! No pending alerts.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/admin/users">View All Users</Link>
                </Button>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.users.active || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Inactive Users
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.users.inactive || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      New Last 7 Days
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.users.newLast7Days || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Items & Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/admin/moderation">View Moderation Queue</Link>
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Available Items
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.items.available || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Items in Trade
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.items.inTrade || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Active Trades
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.trades.active || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Completed Trades
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.trades.completed || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/admin/verification">Review Verifications</Link>
                </Button>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Total Verifications
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.verifications.total || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.verifications.pending || 0}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">
                      {stats?.verifications.approved || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
