"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FOCUS_RING } from "@/lib/focus";
import {
  ArrowLeft,
  Clock,
  Mail,
  MailOpen,
  MessageSquare,
  Phone,
  Reply,
  Trash2,
  User,
} from "lucide-react";

interface MessageDetailProps {
  messageId: Id<"contactMessages">;
}

export function MessageDetail({ messageId }: MessageDetailProps) {
  const router = useRouter();
  const message = useQuery(api.contactAdmin.get, { messageId });
  const settings = useQuery(api.siteSettings.getPublicSettings, {});
  const setRead = useMutation(api.contactAdmin.setRead);
  const remove = useMutation(api.contactAdmin.remove);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (message === undefined) {
    return (
      <div className="p-8 bg-surface border border-line rounded-lg text-center text-xs font-mono text-ink-muted">
        Loading message...
      </div>
    );
  }

  const receivedLabel = new Date(message.createdAt).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleToggleRead = async () => {
    try {
      await setRead({ messageId, isRead: !message.isRead });
      toast.success(message.isRead ? "Message marked as unread." : "Message marked as read.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not update this message.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remove({ messageId });
      toast.success("Message deleted.");
      router.push("/admin/messages");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not delete this message.");
      setDeleting(false);
    }
  };

  const replyHref = settings
    ? `mailto:${message.email}?subject=${encodeURIComponent(
        `Re: your message to ${settings.shopName}`
      )}`
    : "";

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`Message from ${message.name}`}
        description={`Received on ${receivedLabel}`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleRead}
              className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-md border border-line-strong bg-surface text-ink text-xs font-semibold hover:bg-canvas transition-colors ${FOCUS_RING}`}
            >
              {message.isRead ? (
                <MailOpen className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              )}
              <span>{message.isRead ? "Mark unread" : "Mark read"}</span>
            </button>

            {settings ? (
              <a
                href={replyHref}
                className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors ${FOCUS_RING}`}
              >
                <Reply className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>Reply</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-md bg-brand text-white text-xs font-semibold opacity-50 cursor-not-allowed ${FOCUS_RING}`}
              >
                <Reply className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>Reply</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-md border border-danger/40 bg-surface text-danger text-xs font-semibold hover:bg-danger-soft transition-colors ${FOCUS_RING}`}
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        }
      />

      <Link
        href="/admin/messages"
        className={`inline-flex items-center gap-1.5 min-h-11 rounded text-xs font-semibold text-link hover:text-focus transition-colors ${FOCUS_RING}`}
      >
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
        <span>Back to messages</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Message body */}
        <div className="lg:col-span-8 bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <h2 className="font-heading font-bold text-base text-ink flex items-center gap-2">
              <MessageSquare
                className="w-4 h-4 text-ink-muted"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>Message</span>
            </h2>
            <span
              className={`text-xs font-mono font-semibold uppercase tracking-[0.06em] px-2 py-1 rounded ${
                message.isRead ? "bg-canvas text-ink-muted" : "bg-brand-soft text-brand"
              }`}
            >
              {message.isRead ? "Read" : "Unread"}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">{message.message}</p>
        </div>

        {/* Sender details */}
        <div className="lg:col-span-4 bg-surface border border-line rounded-lg p-5 space-y-4 text-xs">
          <h2 className="font-heading font-bold text-sm text-ink border-b border-line pb-2.5">
            Sender
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-ink">
              <User
                className="w-4 h-4 text-ink-muted shrink-0 mt-0.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="font-semibold text-sm">{message.name}</span>
            </div>

            <div className="flex items-center gap-2.5 text-ink-muted">
              <Mail className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <a
                href={`mailto:${message.email}`}
                className={`inline-flex items-center min-h-11 break-all hover:text-ink rounded ${FOCUS_RING}`}
              >
                {message.email}
              </a>
            </div>

            {message.phone && (
              <div className="flex items-center gap-2.5 text-ink-muted">
                <Phone className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <a
                  href={`tel:${message.phone.replace(/[^0-9+]/g, "")}`}
                  className={`inline-flex items-center min-h-11 font-mono hover:text-ink rounded ${FOCUS_RING}`}
                >
                  {message.phone}
                </a>
              </div>
            )}

            <div className="flex items-start gap-2.5 text-ink-muted">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
              <span>{receivedLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteOpen(false);
        }}
        title="Delete this message?"
        description="The message will be removed from the inbox. This action is permanent."
        confirmLabel="Delete message"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
