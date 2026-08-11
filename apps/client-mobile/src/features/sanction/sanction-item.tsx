import Badge from "@/components/ui/badge";
import { isSanctionActive } from "@/lib/utils/sanction";
import { EmployeeSanction } from "@/schema/sanction-schema";
import { Calendar, FileText, MessageSquareText } from "lucide-react-native";
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";

interface Props {
  sanction: EmployeeSanction;
}

function formatDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function SanctionItem({ sanction }: Props) {
  const [now] = useState(() => Date.now());
  const isActive = isSanctionActive(sanction, now);

  return (
    <View className="bg-white rounded-2xl p-4 gap-3 border border-gray-100 shadow-sm shadow-gray-200/50">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text
            numberOfLines={1}
            className="font-poppins-semibold text-secondary text-sm"
          >
            {sanction.sanction.name}
          </Text>
          {!!sanction.sanction.level && (
            <Text className="font-poppins-regular text-[11px] text-gray-400 mt-0.5">
              Level {sanction.sanction.level}
            </Text>
          )}
        </View>
        <Badge variant={isActive ? "danger" : "default"}>
          {isActive ? "Aktif" : "Selesai"}
        </Badge>
      </View>

      {!!sanction.reason && (
        <View className="flex-row items-start gap-2 border-t border-dashed border-gray-200 pt-3">
          <MessageSquareText size={14} color="#9ca3af" />
          <Text
            className="flex-1 font-poppins-regular text-xs text-gray-500"
            numberOfLines={2}
          >
            {sanction.reason}
          </Text>
        </View>
      )}

      <View className="flex-row items-center gap-2">
        <Calendar size={13} color="#9ca3af" />
        <Text className="font-poppins-regular text-xs text-gray-500">
          {formatDate(sanction.start_date)}
          {sanction.end_date ? ` - ${formatDate(sanction.end_date)}` : ""}
        </Text>
      </View>

      {!!sanction.sanction.description && (
        <Text className="font-poppins-regular text-xs text-gray-400">
          {sanction.sanction.description}
        </Text>
      )}

      {!!sanction.document_url && (
        <Pressable
          onPress={() => Linking.openURL(sanction.document_url!)}
          className="flex-row items-center gap-2 border-t border-dashed border-gray-200 pt-3"
        >
          <FileText size={14} color="#3f9aae" />
          <Text className="font-poppins-medium text-xs text-primary">
            Lihat Dokumen
          </Text>
        </Pressable>
      )}
    </View>
  );
}
