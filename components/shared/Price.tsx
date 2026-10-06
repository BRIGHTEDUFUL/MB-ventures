import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";

interface PriceProps {
  amount: number; // In pesewas
  currency?: string;
  className?: string;
  dropZeroCents?: boolean; // If true, whole cedis show without .00 on catalog cards
}

/**
 * Standard Price display component using tabular numerals and font-weight 600.
 */
export function Price({
  amount,
  currency = "GHS",
  className,
  dropZeroCents = false,
}: PriceProps) {
  let formatted = formatMoney(amount, currency);

  if (dropZeroCents && formatted.endsWith(".00")) {
    formatted = formatted.slice(0, -3);
  }

  return (
    <span className={cn("price text-ink", className)}>
      {formatted}
    </span>
  );
}
