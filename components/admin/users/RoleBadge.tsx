import { Badge } from "@/components/ui/badge";
import type { UserRole } from "./types";

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return role === "admin" ? (
    <Badge variant="default" className="font-semibold text-[11px]">
      Admin
    </Badge>
  ) : (
    <Badge variant="secondary" className="font-semibold text-[11px]">
      Customer
    </Badge>
  );
}
