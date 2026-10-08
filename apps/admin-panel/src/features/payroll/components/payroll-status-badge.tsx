import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive"; className?: string }
> = {
  DRAFT: { label: "Draft", variant: "outline" },
  CALCULATED: {
    label: "Terhitung",
    variant: "secondary",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  SUBMITTED: {
    label: "Menunggu Persetujuan",
    variant: "secondary",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  APPROVED: {
    label: "Disetujui",
    variant: "secondary",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  PAID: {
    label: "Terbayar",
    variant: "secondary",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  CANCELLED: { label: "Dibatalkan", variant: "destructive" },
};

export default function PayrollStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    variant: "outline" as const,
  };
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
