"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsers } from "@/lib/api/admin";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState<"ALL" | "YES" | "NO">(
    "ALL"
  );
  const [bannedFilter, setBannedFilter] = useState<"ALL" | "YES" | "NO">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, roleFilter, verifiedFilter, bannedFilter],
    queryFn: () =>
      getUsers({
        page,
        limit: 20,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        isVerified:
          verifiedFilter === "YES"
            ? true
            : verifiedFilter === "NO"
              ? false
              : undefined,
        isBanned:
          bannedFilter === "YES"
            ? true
            : bannedFilter === "NO"
              ? false
              : undefined,
      }),
    enabled: user?.role === "ADMIN",
  });

  if (user?.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  const totalPages = data?.pagination?.totalPages || 0;
  const total = data?.pagination?.total || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users on the platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {total} total users • Page {page} of {totalPages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value as UserRole | "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Verified</label>
              <Select
                value={verifiedFilter}
                onValueChange={(value) => {
                  setVerifiedFilter(value as "ALL" | "YES" | "NO");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="YES">Verified</SelectItem>
                  <SelectItem value="NO">Not Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Banned</label>
              <Select
                value={bannedFilter}
                onValueChange={(value) => {
                  setBannedFilter(value as "ALL" | "YES" | "NO");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="YES">Banned</SelectItem>
                  <SelectItem value="NO">Not Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : data?.users && data.users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{u.username}</p>
                            {u.firstName && u.lastName && (
                              <p className="text-sm text-muted-foreground">
                                {u.firstName} {u.lastName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              u.role === "ADMIN"
                                ? "destructive"
                                : u.role === "MODERATOR"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {u.isVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            {u.isBanned && (
                              <Badge variant="destructive">Banned</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/profile/${u.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)}{" "}
                  of {total} users
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No users found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
