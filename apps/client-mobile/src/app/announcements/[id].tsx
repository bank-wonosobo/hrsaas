import Badge from "@/components/ui/badge";
import { useAnnouncementDetail } from "@/hooks/announcement/use-announcement-detail";
import { useLocalSearchParams } from "expo-router";
import { Calendar, FileText, User } from "lucide-react-native";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

function formatDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function AnnouncementDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: announcement, isLoading } = useAnnouncementDetail(id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#3f9aae" />
      </View>
    );
  }

  if (!announcement) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="font-poppins-medium text-gray-400">
          Pengumuman tidak ditemukan
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="p-4">
      <View className="bg-white rounded-2xl p-4 gap-3 border border-gray-100">
        <Badge variant="primary">{announcement.category}</Badge>
        <Text className="font-poppins-semibold text-lg text-secondary">
          {announcement.title}
        </Text>
        <View className="flex-row items-center gap-4 border-b border-gray-100 pb-3">
          <View className="flex-row items-center gap-1.5">
            <User size={13} color="#9ca3af" />
            <Text className="font-poppins-regular text-xs text-gray-400">
              {announcement.employee_name}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Calendar size={13} color="#9ca3af" />
            <Text className="font-poppins-regular text-xs text-gray-400">
              {formatDate(announcement.created_at)}
            </Text>
          </View>
        </View>
        <Text className="font-poppins-regular text-sm text-text leading-6">
          {announcement.content}
        </Text>
        {!!announcement.file_url && (
          <Pressable
            onPress={() => Linking.openURL(announcement.file_url!)}
            className="flex-row items-center gap-2 border-t border-dashed border-gray-200 pt-3"
          >
            <FileText size={14} color="#3f9aae" />
            <Text className="font-poppins-medium text-xs text-primary">
              Lihat Dokumen
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
