import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import ProfileMenuItem from "@/features/profile/profile-menu-item";
import { useSignOut } from "@/hooks/auth/use-signout";
import { useRouter } from "expo-router";
import {
  FileText,
  GraduationCap,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  UserRound,
} from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

export default function ProfilePage() {
  const { user } = useAuth();
  const { handleSignOut } = useSignOut();
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4 pb-10"
    >
      <View className="w-full bg-primary rounded-3xl mb-4 overflow-hidden shadow-lg shadow-secondary/40">
        <View className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-primary/10" />
        <View className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-primary/10" />

        <View className="p-5 items-center gap-3">
          <View className="rounded-full border-2 border-white/30 p-1">
            <Avatar src={user?.image_url} name={user?.name} size={72} />
          </View>
          <View className="items-center">
            <Text className="text-white font-poppins-semibold text-base">
              {user?.name ?? "-"}
            </Text>
            <Text className="text-white/60 text-xs font-poppins-regular mt-0.5">
              {user?.employee?.employee_number ?? "-"}
            </Text>
          </View>
          {user?.roles?.[0]?.name ? (
            <View className="bg-white/10 px-3 py-1 rounded-full">
              <Text className="text-white text-[11px] font-poppins-medium">
                {user.roles[0].name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="bg-white rounded-2xl p-4 gap-3 mb-4 border border-gray-100">
        <View className="flex-row items-center gap-3">
          <Mail size={16} color="#9ca3af" />
          <Text
            numberOfLines={1}
            className="flex-1 font-poppins-regular text-xs text-gray-600"
          >
            {user?.email ?? "-"}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Phone size={16} color="#9ca3af" />
          <Text className="flex-1 font-poppins-regular text-xs text-gray-600">
            {user?.employee?.phone ?? "-"}
          </Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl px-4 mb-4 border border-gray-100">
        <Text className="font-poppins-semibold text-xs text-gray-400 pt-4 pb-1">
          AKUN
        </Text>
        <ProfileMenuItem
          icon={UserRound}
          label="Data Diri"
          onPress={() => router.push("/profile/personal")}
        />
        <View className="h-px bg-gray-100" />
        <ProfileMenuItem
          icon={FileText}
          label="Riwayat Kontrak"
          onPress={() => router.push("/profile/contracts")}
        />
        <View className="h-px bg-gray-100" />
        <ProfileMenuItem
          icon={GraduationCap}
          label="Pendidikan dan Pelatihan"
          onPress={() => router.push("/profile/education")}
        />
      </View>

      <View className="bg-white rounded-2xl px-4 border border-gray-100">
        <Text className="font-poppins-semibold text-xs text-gray-400 pt-4 pb-1">
          PENGATURAN
        </Text>
        <ProfileMenuItem
          icon={KeyRound}
          label="Ubah Kata Sandi"
          onPress={() => router.push("/profile/change-password")}
        />
        <View className="h-px bg-gray-100" />
        <ProfileMenuItem
          icon={LogOut}
          iconColor="#ef4444"
          labelClassName="text-red-500"
          label="Keluar"
          onPress={handleSignOut}
        />
      </View>
    </ScrollView>
  );
}
