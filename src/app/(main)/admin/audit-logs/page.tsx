/**
 * Admin Audit Logs Page
 *
 * View admin action history and audit trail
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAdminLogs } from "@/lib/api/admin";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Loader2 } from "lucide-react";

export default function AdminAuditLogsPage() {
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["admin", "logs"],
    queryFn: () => getAdminLogs({ limit: 50 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Audit Logs</h2>
        <p className="text-muted-foreground">
          Track all admin actions and system events
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !logsData || logsData.logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Logs Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Admin actions will appear here once they are performed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logsData.logs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{log.action}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(log.createdAt), "PPp")}
                  </span>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin ID:</span>
                    <span className="font-mono">{log.adminId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-mono">
                      {log.targetType} #{log.targetId.substring(0, 8)}
                    </span>
                  </div>
                  {log.reason && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reason:</span>
                      <span className="text-right max-w-md">{log.reason}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
