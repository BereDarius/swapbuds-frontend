"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserItems } from "@/lib/api/items";
import { getUserProfile } from "@/lib/api/users";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const username = params.username as string;

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => getUserProfile(username),
    enabled: !!username,
  });

  const { data: itemsData } = useQuery({
    queryKey: ["user-items", user?.id],
    queryFn: () => getUserItems(user!.id),
    enabled: !!user?.id,
  });

  const isOwnProfile = currentUser?.username === username;

  if (userLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-2 text-2xl font-bold">User not found</h2>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  const items = itemsData?.items || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                {user.isVerified && <Badge variant="default">✓ Verified</Badge>}
              </div>
              {user.bio && (
                <p className="text-muted-foreground mb-3">{user.bio}</p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {format(new Date(user.createdAt), "MMM yyyy")}
                  </span>
                </div>
                {user.reputationScore !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{user.reputationScore.toFixed(1)} reputation</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button asChild>
                  <Link href="/settings">Edit Profile</Link>
                </Button>
              ) : (
                <>
                  <Button asChild>
                    <Link
                      href={`/messages/new?userId=${user.id}&username=${user.username}`}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Link>
                  </Button>
                  <Button variant="outline">Report</Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-2xl font-bold">{items.length}</p>
            <p className="text-sm text-muted-foreground">Items Listed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-2xl font-bold">{user.tradesCount || 0}</p>
            <p className="text-sm text-muted-foreground">Trades</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isOwnProfile
                  ? "You haven't listed any items yet"
                  : "No items listed"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">
                        {item.title}
                      </h3>
                      {item.estimatedValue && (
                        <p className="text-sm font-medium text-primary">
                          €{item.estimatedValue}
                        </p>
                      )}
                      <Badge variant="outline" className="mt-2">
                        {item.condition}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reviews yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
