"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { FOCUS_CLASS } from "./types";

interface UserQueryBoundaryProps {
  children: React.ReactNode;
}

interface UserQueryBoundaryState {
  message: string;
}

/**
 * Catches the errors adminGet throws (e.g. "User not found.") so the detail page
 * can show the message instead of the global error screen.
 */
export class UserQueryBoundary extends React.Component<
  UserQueryBoundaryProps,
  UserQueryBoundaryState
> {
  state: UserQueryBoundaryState = { message: "" };

  static getDerivedStateFromError(error: unknown): UserQueryBoundaryState {
    return { message: error instanceof Error ? error.message : "This user could not be loaded." };
  }

  render() {
    if (this.state.message) {
      return (
        <div className="p-12 bg-surface border border-line rounded-lg text-center space-y-3">
          <AlertCircle
            className="w-10 h-10 text-danger mx-auto stroke-[1.25]"
            aria-hidden="true"
          />
          <h2 className="font-heading font-bold text-lg text-ink">User not available</h2>
          <p className="text-xs text-ink-muted">{this.state.message}</p>
          <Link
            href="/admin/users"
            className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors ${FOCUS_CLASS}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to users</span>
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
