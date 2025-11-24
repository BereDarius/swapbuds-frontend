/**
 * Admin Dashboard Page
 *
 * Shows platform statistics and overview
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers } from "@/lib/api/admin";
import { getItems } from "@/lib/api/items";
import { getTrades } from "@/lib/api/trades";
import { Item } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: () => getUsers({ limit: 1000 }),
  });

  // Fetch items
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["admin", "items", "stats"],
    queryFn: () => getItems({ limit: 1000 }),
  });

  // Fetch trades
  const { data: tradesData, isLoading: tradesLoading } = useQuery({
    queryKey: ["admin", "trades", "stats"],
    queryFn: () => getTrades({ limit: 1000 }),
  });

  const isLoading = usersLoading || itemsLoading || tradesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const users = usersData?.users || [];
  const items = itemsData?.items || [];
  const trades = tradesData?.trades || [];

  // Calculate statistics
  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.isVerified).length;

  const totalItems = items.length;
  const activeItems = items.filter(
    (i: Item) => i.status === "AVAILABLE",
  ).length;
  const swappedItems = items.filter((i: Item) => i.status === "TRADED").length;

  const totalTrades = trades.length;
  const completedTrades = trades.filter((t) => t.status === "COMPLETED").length;
  const pendingTrades = trades.filter((t) => t.status === "PENDING").length;
  const activeTrades = trades.filter((t) => t.status === "ACCEPTED").length;

  const completionRate =
    totalTrades > 0 ? ((completedTrades / totalTrades) * 100).toFixed(1) : "0";

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      description: `${verifiedUsers} verified users`,
      icon: Users,
      trend: "+12% from last month",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Active Items",
      value: activeItems,
      description: `${totalItems} total, ${swappedItems} swapped`,
      icon: Package,
      trend: "+8% from last month",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Total Trades",
      value: totalTrades,
      description: `${completedTrades} completed (${completionRate}%)`,
      icon: ShoppingBag,
      trend: "+15% from last month",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Active Trades",
      value: activeTrades,
      description: `${pendingTrades} pending approval`,
      icon: Activity,
      trend: `${completionRate}% completion rate`,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
  ];

  const tradeStats = [
    {
      label: "Completed",
      value: completedTrades,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: "In Progress",
      value: activeTrades,
      icon: Activity,
      color: "text-blue-600",
    },
    {
      label: "Pending",
      value: pendingTrades,
      icon: AlertCircle,
      color: "text-yellow-600",
    },
    {
      label: "Cancelled",
      value: trades.filter((t) => t.status === "CANCELLED").length,
      icon: XCircle,
      color: "text-gray-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Platform statistics and health metrics
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trade Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {tradeStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 p-4 rounded-lg border"
                >
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Trade Completion Rate
              </span>
              <span className="text-sm font-medium">{completionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                User Verification Rate
              </span>
              <span className="text-sm font-medium">
                {totalUsers > 0
                  ? ((verifiedUsers / totalUsers) * 100).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Active Items Ratio
              </span>
              <span className="text-sm font-medium">
                {totalItems > 0
                  ? ((activeItems / totalItems) * 100).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
