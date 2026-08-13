import Badge from "@/components/ui/badge";
import AppModal from "@/components/ui/modal";
import { TimeOffRequest } from "@/schema/time-off-schema";
import { CalendarDays, MessageSquareText, Users } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  request: TimeOffRequest;
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

export default function TimeOffItem({ request }: Props) {
  const [open, setOpen] = useState(false);
  const status = STATUS_STYLE[request.request_status ?? ""] ?? {
    label: request.request_status ?? "-",
    badge: "default" as const,
  };
  const approvals = request.approvals ?? [];

  return (
    <>
      <View className="bg-white rounded-2xl p-4 gap-3 border border-gray-100 shadow-sm shadow-gray-200/50">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 pr-2">
            <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
              <CalendarDays size={16} color="#3f9aae" />
            </View>
            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="font-poppins-semibold text-secondary text-xs"
              >
                {request.time_off_type.name}
              </Text>
              <Text className="font-poppins-regular text-[10px] text-gray-400">
                {formatDate(request.start_date)}
                {request.end_date ? ` - ${formatDate(request.end_date)}` : ""}
              </Text>
            </View>
          </View>
          <Badge variant={status.badge}>{status.label}</Badge>
        </View>

        {!!request.request_reason && (
          <View className="flex-row items-start gap-2 border-t border-dashed border-gray-200 pt-3">
            <MessageSquareText size={14} color="#9ca3af" />
            <Text
              className="flex-1 font-poppins-regular text-xs text-gray-500"
              numberOfLines={2}
            >
              {request.request_reason}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between border-t border-dashed border-gray-200 pt-3">
          <Text className="font-poppins-medium text-xs text-text">
            {request.requested_days} hari
          </Text>
          {approvals.length > 0 && (
            <Pressable
              onPress={() => setOpen(true)}
              className="flex-row items-center gap-1"
            >
              <Users size={14} color="#3f9aae" />
              <Text className="font-poppins-medium text-xs text-primary">
                {approvals.length} approver
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <AppModal
        visible={open}
        title="Status Persetujuan"
        onClose={() => setOpen(false)}
      >
        {approvals.map((approval, idx) => {
          const approvalStatus = STATUS_STYLE[approval.status] ?? {
            label: approval.status,
            badge: "default" as const,
          };
          return (
            <View
              key={`${approval.employee_name}-${idx}`}
              className="flex-row items-center justify-between gap-2 py-3 border-b border-gray-100"
            >
              <View className="flex-1">
                <Text className="font-poppins-medium text-sm text-text">
                  {approval.employee_name}
                </Text>
                {!!approval.action_reason && (
                  <Text className="font-poppins-regular text-xs text-gray-400 mt-0.5">
                    {approval.action_reason}
                  </Text>
                )}
              </View>
              <Badge variant={approvalStatus.badge}>
                {approvalStatus.label}
              </Badge>
            </View>
          );
        })}
      </AppModal>
    </>
  );
}
