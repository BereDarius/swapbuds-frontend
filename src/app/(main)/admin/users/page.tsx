/**
 * Admin Users Management Page
 *
 * Manage users, roles, and account status
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { banUser, changeUserRole, getUsers, unbanUser } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { UserRole } from "@/types/admin";
import type { UserProfile } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Ban,
  CheckCircle2,
  Loader2,
  Search,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionDialog, setActionDialog] = useState<
    "ban" | "unban" | "role" | null
  >(null);
  const [reason, setReason] = useState("");
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin", "users", roleFilter],
    queryFn: () =>
      getUsers({
        role: roleFilter !== "ALL" ? (roleFilter as UserRole) : undefined,
        limit: 100,
      }),
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      banUser(userId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User banned successfully");
      closeDialog();
    },
    onError: (error) => {
      logger.apiError("POST", `/admin/users/${selectedUser?.id}/ban`, error);
      const message = getErrorMessage(error, "Failed to ban user");
      toast.error("Failed to ban user", { description: message });
    },
  });

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      unbanUser(userId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User unbanned successfully");
      closeDialog();
    },
    onError: (error) => {
      logger.apiError("POST", `/admin/users/${selectedUser?.id}/unban`, error);
      const message = getErrorMessage(error, "Failed to unban user");
      toast.error("Failed to unban user", { description: message });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
      reason,
    }: {
      userId: string;
      role: UserRole;
      reason: string;
    }) => changeUserRole(userId, { role, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User role updated successfully");
      closeDialog();
    },
    onError: (error) => {
      logger.apiError("PATCH", `/admin/users/${selectedUser?.id}/role`, error);
      const message = getErrorMessage(error, "Failed to update user role");
      toast.error("Failed to update role", { description: message });
    },
  });

  const closeDialog = () => {
    setActionDialog(null);
    setSelectedUser(null);
    setReason("");
    setNewRole(UserRole.USER);
  };

  const handleBan = () => {
    if (!selectedUser || !reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    banUserMutation.mutate({ userId: selectedUser.id, reason: reason.trim() });
  };

  const handleChangeRole = () => {
    if (!selectedUser || !reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    changeRoleMutation.mutate({
      userId: selectedUser.id,
      role: newRole,
      reason: reason.trim(),
    });
  };

  const users = usersData?.users || [];
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()),
  );

  const isPending =
    banUserMutation.isPending ||
    unbanUserMutation.isPending ||
    changeRoleMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role">Filter by Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value={UserRole.USER}>User</SelectItem>
                  <SelectItem value={UserRole.MODERATOR}>Moderator</SelectItem>
                  <SelectItem value={UserRole.SUPPORT}>Support</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{user.username}</h3>
                      {user.isVerified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Joined {format(new Date(user.createdAt), "MMM yyyy")}
                      </span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{user.reputationScore} reputation</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{user.tradesCount} trades</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setActionDialog("role");
                    }}
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Change Role
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setActionDialog("ban");
                    }}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ban Dialog */}
      <Dialog open={actionDialog === "ban"} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              Ban User
            </DialogTitle>
            <DialogDescription>
              This will prevent {selectedUser?.username} from accessing the
              platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ban-reason">Reason *</Label>
              <Textarea
                id="ban-reason"
                placeholder="Explain why this user is being banned..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={!reason.trim() || isPending}
            >
              {isPending ? "Banning..." : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={actionDialog === "role"} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Change User Role
            </DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-role">New Role *</Label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as UserRole)}
              >
                <SelectTrigger id="new-role" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.USER}>User</SelectItem>
                  <SelectItem value={UserRole.MODERATOR}>Moderator</SelectItem>
                  <SelectItem value={UserRole.SUPPORT}>Support</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role-reason">Reason *</Label>
              <Textarea
                id="role-reason"
                placeholder="Explain why this role change is necessary..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={!reason.trim() || isPending}
            >
              {isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
