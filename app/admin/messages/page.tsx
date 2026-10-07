"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ArrowRight, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

const PAGE_SIZE = 20;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export default function AdminMessagesPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [offset, setOffset] = useState(0);

  const inbox = useQuery(api.contactAdmin.list, { unreadOnly, offset, limit: PAGE_SIZE });

  const handleFilterChange = (nextUnreadOnly: boolean) => {
    setUnreadOnly(nextUnreadOnly);
    setOffset(0);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Messages"
        description="Read and reply to messages customers send through the contact form."
      />

      {/* Filter */}
      <div className="bg-surface border border-line rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <label
          className={`flex items-center gap-2.5 min-h-11 px-1 rounded-md text-xs font-semibold text-ink cursor-pointer ${FOCUS_RING}`}
        >
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(event) => handleFilterChange(event.target.checked)}
            className="w-4 h-4 rounded text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
          <span>Unread only</span>
        </label>

        {inbox && (
          <p className="text-xs font-mono text-ink-muted">
            {inbox.total} {inbox.total === 1 ? "message" : "messages"}
            {unreadOnly ? " unread" : ""}
          </p>
        )}
      </div>

      {/* Inbox */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {inbox === undefined ? (
          <div className="p-8 text-center text-xs font-mono text-ink-muted">
            Loading messages...
          </div>
        ) : inbox.items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Inbox className="w-10 h-10 text-ink-muted mx-auto stroke-[1.25]" aria-hidden="true" />
            <h3 className="font-heading font-semibold text-sm text-ink">
              {unreadOnly ? "No unread messages" : "No messages yet"}
            </h3>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              {unreadOnly
                ? "Every message in the inbox has been read."
                : "Messages sent through the contact form will appear here."}
            </p>
            {unreadOnly && (
              <button
                type="button"
                onClick={() => handleFilterChange(false)}
                className={`inline-flex items-center h-11 px-4 rounded-md border border-line text-xs font-semibold text-ink hover:bg-canvas transition-colors ${FOCUS_RING}`}
              >
                Show all messages
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-xs">
              <thead className="bg-canvas border-b border-line text-ink-muted font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inbox.items.map((message) => (
                  <tr key={message._id} className="hover:bg-canvas/50 transition-colors">
                    {/* Sender */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/admin/messages/${message._id}`}
                        className={`flex items-start gap-2 min-h-11 rounded text-ink ${FOCUS_RING}`}
                      >
                        {!message.isRead && (
                          <span
                            className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5"
                            aria-hidden="true"
                          />
                        )}
                        <span className="min-w-0">
                          <span className={`block ${message.isRead ? "font-medium" : "font-bold"}`}>
                            {message.name}
                          </span>
                          <span className="block text-[11px] font-mono text-ink-muted break-all mt-0.5">
                            {message.email}
                          </span>
                          {!message.isRead && <span className="sr-only">(unread)</span>}
                        </span>
                      </Link>
                    </td>

                    {/* Message preview */}
                    <td className="py-3.5 px-4 text-ink-muted">
                      <p className={`line-clamp-2 ${message.isRead ? "" : "text-ink font-medium"}`}>
                        {message.message}
                      </p>
                    </td>

                    {/* Received */}
                    <td className="py-3.5 px-4 text-ink-muted font-mono text-[11px] whitespace-nowrap">
                      {new Date(message.createdAt).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <span className="block text-ink-subtle">
                        {new Date(message.createdAt).toLocaleTimeString("en-GH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/messages/${message._id}`}
                        className={`inline-flex items-center gap-1 px-3 min-h-11 rounded-md border border-line hover:border-line-strong hover:bg-surface text-ink text-xs font-semibold transition-colors ${FOCUS_RING}`}
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Offset pagination */}
      {inbox && inbox.items.length > 0 && (
        <div className="bg-surface border border-line rounded-lg px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          <p className="font-mono">
            Showing {offset + 1}-{offset + inbox.items.length} of {inbox.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className={`inline-flex items-center gap-1 h-11 px-4 rounded-md border border-line text-xs font-semibold text-ink hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${FOCUS_RING}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={!inbox.hasMore}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className={`inline-flex items-center gap-1 h-11 px-4 rounded-md border border-line text-xs font-semibold text-ink hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${FOCUS_RING}`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
