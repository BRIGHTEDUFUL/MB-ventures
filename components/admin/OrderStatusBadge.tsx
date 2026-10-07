import React from "react";
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className={`font-mono text-[11px] ${className}`}>
          Pending
        </Badge>
      );
    case "awaiting_momo":
      return (
        <Badge
          variant="warning"
          className={`font-semibold text-[11px] bg-warning-soft text-warning border-warning/30 ${className}`}
        >
          Awaiting MoMo
        </Badge>
      );
    case "pending_verification":
      return (
        <Badge
          variant="secondary"
          className={`font-semibold text-[11px] bg-accent-soft text-accent border-accent/30 ${className}`}
        >
          Verify MoMo
        </Badge>
      );
    case "processing":
      return (
        <Badge
          variant="outline"
          className={`font-medium text-[11px] bg-surface text-ink border-line-strong ${className}`}
        >
          Processing
        </Badge>
      );
    case "ready_for_pickup":
      return (
        <Badge
          variant="success"
          className={`font-semibold text-[11px] bg-success-soft text-success border-success/30 ${className}`}
        >
          Ready for Pickup
        </Badge>
      );
    case "out_for_delivery":
      return (
        <Badge
          variant="outline"
          className={`font-medium text-[11px] bg-canvas text-ink border-line-strong ${className}`}
        >
          Out for Delivery
        </Badge>
      );
    case "completed":
      return (
        <Badge
          variant="success"
          className={`font-semibold text-[11px] bg-success-soft text-success border-success/30 ${className}`}
        >
          Completed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="destructive" className={`font-semibold text-[11px] ${className}`}>
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={`font-mono text-[11px] ${className}`}>
          {status}
        </Badge>
      );
  }
}
