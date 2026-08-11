import { Avatar } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import AppModal from "@/components/ui/modal";
import { useActionTimeOffApproval } from "@/hooks/time-off-approval/use-action-time-off-approval";
import { TimeOffApproval } from "@/schema/time-off-approval-schema";
import { CalendarDays, MessageSquareText } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

interface Props {
  approval: TimeOffApproval;
}

type BadgeVariant = "success" | "warning" | "danger" | "default";

const STATUS_STYLE: Record<string, { label: string; badge: BadgeVariant }> = {
  PENDING: { label: "Menunggu", badge: "warning" },
  APPROVED: { label: "Disetujui", badge: "success" },
  REJECTED: { label: "Ditolak", badge: "danger" },
};

function formatDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function TimeOffApprovalItem({ approval }: Props) {
  const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reason, setReason] = useState("");
  const { mutate: takeAction, isPending } = useActionTimeOffApproval();

  const request = approval.time_off_request;
  const status = STATUS_STYLE[approval.status] ?? {
    label: approval.status,
    badge: "default" as const,
  };

  if (!request) return null;

  const closeModal = () => {
    setAction(null);
    setReason("");
  };

  const handleConfirm = () => {
    if (!action) return;
    takeAction(
      { id: approval.id, payload: { action, action_reason: reason } },
      { onSuccess: closeModal },
    );
  };

  return (
    <>
      <View className="bg-white rounded-2xl p-4 gap-3 border border-gray-100 shadow-sm shadow-gray-200/50">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 pr-2">
            <Avatar name={request.employee.fullname} size={36} />
            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="font-poppins-semibold text-secondary text-xs"
              >
                {request.employee.fullname}
              </Text>
              <Text className="font-poppins-regular text-[10px] text-gray-400">
                {request.time_off_type.name}
              </Text>
            </View>
          </View>
          <Badge variant={status.badge}>{status.label}</Badge>
        </View>

        <View className="flex-row items-center gap-2 border-t border-dashed border-gray-200 pt-3">
          <CalendarDays size={14} color="#9ca3af" />
          <Text className="font-poppins-regular text-xs text-gray-500">
            {formatDate(request.start_date)}
            {request.end_date ? ` - ${formatDate(request.end_date)}` : ""} (
            {request.requested_days} hari)
          </Text>
        </View>

        {!!request.request_reason && (
          <View className="flex-row items-start gap-2">
            <MessageSquareText size={14} color="#9ca3af" />
            <Text
              className="flex-1 font-poppins-regular text-xs text-gray-500"
              numberOfLines={3}
            >
              {request.request_reason}
            </Text>
          </View>
        )}

        {approval.status === "PENDING" && (
          <View className="flex-row gap-2 pt-1">
            <Button
              variant="danger"
              className="flex-1"
              onPress={() => setAction("REJECT")}
            >
              Tolak
            </Button>
            <Button
              variant="success"
              className="flex-1"
              onPress={() => setAction("APPROVE")}
            >
              Setujui
            </Button>
          </View>
        )}
      </View>

      <AppModal
        visible={!!action}
        title={action === "APPROVE" ? "Setujui Cuti" : "Tolak Cuti"}
        onClose={closeModal}
      >
        <Text className="font-poppins-regular text-sm text-gray-500 mb-3">
          {action === "APPROVE"
            ? "Berikan catatan (opsional) sebelum menyetujui pengajuan cuti ini."
            : "Berikan alasan penolakan pengajuan cuti ini."}
        </Text>
        <Input
          placeholder="Tulis catatan..."
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          className="min-h-[100px] mb-4"
          textAlignVertical="top"
        />
        <Button
          variant={action === "APPROVE" ? "success" : "danger"}
          fullWidth
          loading={isPending}
          disabled={action === "REJECT" && reason.trim().length === 0}
          onPress={handleConfirm}
        >
          {action === "APPROVE" ? "Setujui" : "Tolak"}
        </Button>
      </AppModal>
    </>
  );
}
