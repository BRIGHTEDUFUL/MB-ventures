"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

interface MessageErrorBoundaryProps {
  children: React.ReactNode;
}

interface MessageErrorBoundaryState {
  hasError: boolean;
}

/**
 * `contactAdmin.get` throws "Message not found." instead of returning null,
 * so the detail view needs an error boundary rather than a null check.
 */
export class MessageErrorBoundary extends React.Component<
  MessageErrorBoundaryProps,
  MessageErrorBoundaryState
> {
  state: MessageErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MessageErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error("Could not open contact message:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 bg-surface border border-line rounded-lg text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-danger mx-auto stroke-[1.25]" aria-hidden="true" />
          <h1 className="font-heading font-bold text-lg text-ink">Message not found</h1>
          <p className="text-xs text-ink-muted max-w-sm mx-auto">
            It may have been deleted. Return to the inbox and open another message.
          </p>
          <Link
            href="/admin/messages"
            className="inline-flex items-center min-h-11 px-4 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Back to messages
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
