"use client";

import { ItemCard } from "@/components/items/item-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getItems } from "@/lib/api/items";
import { getConversations } from "@/lib/api/messages";
import { getUserProfile, getUserStatistics } from "@/lib/api/users";
import { useAuthStore } from "@/stores/authStore";
import { ItemStatus } from "@/types/item";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Edit,
  MapPin,
  MessageSquare,
  Package,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();

  // Fetch user profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => getUserProfile(username),
  });

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === profile?.id;

  // Fetch user statistics
  const { data: stats } = useQuery({
    queryKey: ["userStats", profile?.id],
    queryFn: () => getUserStatistics(profile!.id),
    enabled: !!profile?.id,
  });

  // Fetch conversations to check if one exists with this user
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: !!profile && !isOwnProfile,
  });

  // Fetch user's items
  const { data: itemsData } = useQuery({
    queryKey: ["userItems", profile?.id],
    queryFn: () =>
      getItems({
        userId: profile!.id,
        status: ItemStatus.AVAILABLE,
        page: 1,
        limit: 12,
      }),
    enabled: !!profile?.id,
  });

  // Handle messaging this user
  const handleMessageUser = () => {
    if (!profile) return;

    // Check if conversation exists
    const existingConv = conversations?.find(
      (conv) =>
        (conv.user1Id === currentUser?.id && conv.user2Id === profile.id) ||
        (conv.user2Id === currentUser?.id && conv.user1Id === profile.id),
    );

    if (existingConv) {
      router.push(`/messages/${existingConv.id}`);
    } else {
      // Navigate to messages page with recipient info to compose new message
      router.push(
        `/messages?compose=true&recipientId=${profile.id}&recipientUsername=${profile.username}`,
      );
    }
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-full max-w-md" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">User not found</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                {profile.isVerified && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                {isOwnProfile ? (
                  <Button asChild variant="outline">
                    <Link href="/settings/profile">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                ) : (
                  <Button onClick={handleMessageUser} variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message User
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.reputationScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Listed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.itemsCount}</div>
            <p className="text-xs text-muted-foreground">
              {profile.itemsCount === 1 ? "Active item" : "Active items"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trades Completed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.tradesCount}</div>
            {stats && stats.totalTrades > 0 && (
              <p className="text-xs text-muted-foreground">
                {stats.successRate.toFixed(0)}% success rate
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats (if available) */}
      {stats && stats.totalTrades > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Trade Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Trades:</span>
                  <span className="font-medium">{stats.totalTrades}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium text-green-600">
                    {stats.completedTrades}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cancelled:</span>
                  <span className="font-medium text-red-600">
                    {stats.cancelledTrades}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">
                    {stats.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Avg Response Time:
                  </span>
                  <span className="font-medium">
                    {(stats.averageResponseTime / 3600).toFixed(1)}h
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-medium">
                    {stats.pendingAsProposer + stats.pendingAsResponder}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      {/* Tabs */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">Items ({profile.itemsCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {itemsData && itemsData.items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {itemsData.items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {isOwnProfile
                    ? "You haven't listed any items yet"
                    : "This user hasn't listed any items yet"}
                </p>
                {isOwnProfile && (
                  <Button asChild>
                    <Link href="/items/new">List Your First Item</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
