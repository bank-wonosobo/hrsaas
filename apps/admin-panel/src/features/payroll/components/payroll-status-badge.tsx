import Badge from "@/components/ui/badge/badge";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  DRAFT: { label: "Draft", variant: "default" },
  CALCULATED: { label: "Terhitung", variant: "info" },
  SUBMITTED: { label: "Menunggu Persetujuan", variant: "warning" },
  APPROVED: { label: "Disetujui", variant: "success" },
  PAID: { label: "Terbayar", variant: "success" },
  CANCELLED: { label: "Dibatalkan", variant: "danger" },
};

export default function PayrollStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
