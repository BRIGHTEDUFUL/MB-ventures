import type { Metadata } from "next";
import { AccountShell } from "./AccountShell";

// Private account area — kept out of search indexes.
export const metadata: Metadata = { robots: "noindex" };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
