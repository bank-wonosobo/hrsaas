import { Announcement } from "@/schema/announcement-schema";
import {
  BookOpen,
  CalendarFold,
  ChevronRight,
  Clock,
  GraduationCap,
  LucideIcon,
  Megaphone,
  ShieldAlert,
  SquareGanttChart,
  Wrench,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface Props {
  announcement: Announcement;
  onPress?: () => void;
}

const categoryIcons: Record<string, LucideIcon> = {
  Event: CalendarFold,
  Maintenance: Wrench,
  Pengumuman: Megaphone,
  HR: ShieldAlert,
  Informasi: SquareGanttChart,
  Kebijakan: BookOpen,
  Training: GraduationCap,
};

const categoryStyle: Record<string, { bg: string; text: string; icon: string }> = {
  Event: { bg: "bg-blue-50", text: "text-blue-600", icon: "#2563eb" },
  Maintenance: { bg: "bg-amber-50", text: "text-amber-600", icon: "#d97706" },
  Pengumuman: { bg: "bg-primary/10", text: "text-primary", icon: "#3f9aae" },
  HR: { bg: "bg-purple-50", text: "text-purple-600", icon: "#9333ea" },
  Informasi: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "#059669" },
  Kebijakan: { bg: "bg-rose-50", text: "text-rose-600", icon: "#e11d48" },
  Training: { bg: "bg-cyan-50", text: "text-cyan-600", icon: "#0891b2" },
};

const defaultCategoryStyle = {
  bg: "bg-gray-50",
  text: "text-gray-600",
  icon: "#4b5563",
};

function timeAgo(createdAtMs: number) {
  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - createdAtMs) / 1000),
  );
  const minutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(diffSeconds / 3600);
  const days = Math.floor(diffSeconds / 86400);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 7) return `${days} hari yang lalu`;
  return `${Math.floor(days / 7)} minggu yang lalu`;
}

export default function AnnouncementItem({ announcement, onPress }: Props) {
  const Icon = categoryIcons[announcement.category] ?? SquareGanttChart;
  const style = categoryStyle[announcement.category] ?? defaultCategoryStyle;

  return (
    <Pressable
      onPress={onPress}
      className="active:bg-gray-50 p-3 flex-row items-center gap-3 rounded-2xl border border-gray-100 bg-white shadow-sm shadow-black/5"
    >
      <View
        className={`h-14 w-14 items-center justify-center rounded-2xl ${style.bg}`}
      >
        <Icon size={26} strokeWidth={1.75} color={style.icon} />
      </View>

      <View className="flex-1 items-start gap-1">
        <View className="flex-row items-center gap-2 self-stretch">
          <Text
            className="font-poppins-medium text-md text-text flex-1"
            numberOfLines={1}
          >
            {announcement.title}
          </Text>
          <View className={`px-2 py-0.5 rounded-full ${style.bg}`}>
            <Text className={`text-[10px] font-poppins-medium ${style.text}`}>
              {announcement.category}
            </Text>
          </View>
        </View>

        <Text
          className="text-xs font-poppins-light text-gray-400"
          numberOfLines={2}
        >
          {announcement.content}
        </Text>

        <View className="mt-1 flex-row items-center gap-1.5 justify-start">
          <Clock size={13} strokeWidth={2} color="#99a1af" />
          <Text className="font-poppins-regular text-xs text-gray-400">
            {timeAgo(announcement.created_at)}
          </Text>
        </View>
      </View>

      <ChevronRight size={18} strokeWidth={2} color="#d1d5dc" />
    </Pressable>
  );
}
