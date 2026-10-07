"use client";

import { useParams } from "next/navigation";
import { MessageDetail } from "@/components/admin/messages/MessageDetail";
import { MessageErrorBoundary } from "@/components/admin/messages/MessageErrorBoundary";
import type { Id } from "@/convex/_generated/dataModel";

export default function AdminMessagePage() {
  const params = useParams();
  const messageId = params.id as Id<"contactMessages">;

  // The key remounts the boundary when the id changes so a previous
  // "Message not found." error does not stick on the next message.
  return (
    <MessageErrorBoundary key={messageId}>
      <MessageDetail messageId={messageId} />
    </MessageErrorBoundary>
  );
}
