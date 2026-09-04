import { useAnnouncements } from "@/hooks/announcement/use-announcements";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import AnnouncementItem from "./announcement-item";

export default function AnnouncementList() {
  const router = useRouter();
  const { data, isLoading } = useAnnouncements({ page: 1, size: 4 });
  const items = data?.data ?? [];

  return (
    <View className="mt-1">
      <View className="mt-3 gap-2 bg-white p-3 rounded-2xl mb-14">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-sm font-poppins-semibold">Pengumuman</Text>
          <Pressable
            onPress={() => router.push("/announcements")}
            className="shrink-0"
          >
            <Text
              className="text-xs font-poppins-medium text-primary"
              numberOfLines={1}
            >
              Lihat Semua
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#3f9aae" style={{ marginVertical: 12 }} />
        ) : items.length === 0 ? (
          <Text className="text-xs font-poppins-regular text-gray-400 text-center py-4">
            Belum ada pengumuman
          </Text>
        ) : (
          items.map((item) => (
            <AnnouncementItem
              key={item.id}
              announcement={item}
              onPress={() => router.push(`/announcements/${item.id}`)}
            />
          ))
        )}
      </View>
    </View>
  );
}
