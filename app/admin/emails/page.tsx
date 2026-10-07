"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Info, CheckCircle2, XCircle, Clock, Mail } from "lucide-react";

export default function AdminEmailsPage() {
  const emailStatus = useQuery(api.emails.admin.getEmailStatus, { limit: 100 });

  if (!emailStatus) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 animate-pulse bg-gray-200 rounded"></div>
      </div>
    );
  }

  const { mode, dailyLimit, todaySent, logs } = emailStatus;

  const statusColor = {
    sent: "bg-green-100 text-green-800",
    skipped_dry_run: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
    queued: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",
    bounced: "bg-red-100 text-red-800",
    complained: "bg-red-100 text-red-800",
  };

  const statusIcon = {
    sent: CheckCircle2,
    skipped_dry_run: Info,
    failed: XCircle,
    queued: Clock,
    delivered: CheckCircle2,
    bounced: XCircle,
    complained: XCircle,
  };

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Email Logs</h1>
        <p className="text-sm text-ink-muted mt-1">
          Monitor email delivery and system status
        </p>
      </div>

      {/* Mode Banner */}
      {mode === "dry-run" && (
        <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Dry-run mode</p>
              <p className="text-sm text-blue-700 mt-1">
                Emails are being recorded but not sent. Set <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">RESEND_API_KEY</code> and{" "}
                <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">EMAIL_FROM</code> environment variables to go live.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Mode</p>
              <p className="text-lg font-semibold text-ink capitalize">{mode}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Today</p>
              <p className="text-lg font-semibold text-ink">
                {todaySent} / {dailyLimit}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-ink-muted">Total logs</p>
              <p className="text-lg font-semibold text-ink">{logs.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-canvas border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted">To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted">Template</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                    No email logs yet. Emails will appear here as they are sent.
                  </td>
                </tr>
              ) : (
                logs.map((log: { _id: string; to: string; subject: string; template: string; status: string; error?: string; createdAt: number }) => {
                  const StatusIconComponent = statusIcon[log.status as keyof typeof statusIcon] || Info;
                  return (
                    <tr key={log._id} className="hover:bg-canvas/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-ink-muted whitespace-nowrap">
                        {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">{log.to}</td>
                      <td className="px-4 py-3 text-sm text-ink">{log.subject}</td>
                      <td className="px-4 py-3 text-sm">
                        <code className="text-xs px-2 py-1 bg-canvas rounded">{log.template}</code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusIconComponent className="w-4 h-4" />
                          <Badge className={statusColor[log.status as keyof typeof statusColor]}>
                            {log.status.replace(/_/g, " ")}
                          </Badge>
                          {log.error && (
                            <span className="text-xs text-red-600" title={log.error}>
                              (error)
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {mode === "dry-run" && (
        <div className="mt-6">
          <Card className="p-4 bg-gray-50">
            <h3 className="font-medium text-ink mb-2">Going live</h3>
            <ol className="text-sm text-ink-muted space-y-1 list-decimal list-inside">
              <li>Create a Resend account at resend.com</li>
              <li>Verify your sending domain (add DNS records)</li>
              <li>Create an API key in Resend dashboard</li>
              <li>Set environment variables on your Convex deployment</li>
              <li>Deploy and test with a real order</li>
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}
