import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import ProfileMenuItem from "@/features/profile/profile-menu-item";
import { useSignOut } from "@/hooks/auth/use-signout";
import { useRouter } from "expo-router";
import {
  FileText,
  GraduationCap,
  Info,
  KeyRound,
  LogOut,
  Mail,
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
      contentContainerClassName="p-4 pb-10 pt-15"
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-5">
        <Text className="font-poppins-semibold text-2xl text-secondary">
          Profil Saya
        </Text>
        <Text className="font-poppins-regular text-xs text-gray-500 mt-1">
          Kelola informasi akun dan data kepegawaian Anda
        </Text>
      </View>

      <View className="w-full bg-secondary rounded-3xl mb-4 overflow-hidden shadow-lg shadow-secondary/30">
        <View className="absolute -top-14 -right-8 h-44 w-44 rounded-full bg-primary/30" />
        <View className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-primary/20" />

        <View className="p-5 items-center gap-3">
          <View className="rounded-full border-2 border-primary/60 p-1.5 bg-white/10">
            <Avatar src={user?.image_url} name={user?.name} size={72} />
          </View>
          <View className="items-center">
            <Text className="text-white font-poppins-semibold text-lg">
              {user?.name ?? "-"}
            </Text>
            <Text className="text-white/60 text-xs font-poppins-regular mt-1">
              {user?.employee?.employee_number ?? "-"}
            </Text>
          </View>
          {user?.roles?.[0]?.name ? (
            <View className="bg-primary px-4 py-1.5 rounded-full">
              <Text className="text-white text-[11px] font-poppins-medium capitalize">
                {user.roles[0].name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm shadow-gray-200">
        <Text className="font-poppins-semibold text-xs text-secondary mb-3">
          KONTAK
        </Text>
        <View className="flex-row items-center gap-3 mb-3">
          <View className="h-9 w-9 rounded-xl bg-primary/10 items-center justify-center">
            <Mail size={16} color="#3f9aae" />
          </View>
          <View className="flex-1">
            <Text className="font-poppins-regular text-[10px] text-gray-400">
              Email
            </Text>
            <Text
              numberOfLines={1}
              className="font-poppins-medium text-xs text-gray-700"
            >
              {user?.email ?? "-"}
            </Text>
          </View>
        </View>
        {/* <View className="h-px bg-gray-100 mb-3" />
        <View className="flex-row items-center gap-3">
          <View className="h-9 w-9 rounded-xl bg-primary/10 items-center justify-center">
            <Phone size={16} color="#3f9aae" />
          </View>
          <View className="flex-1">
            <Text className="font-poppins-regular text-[10px] text-gray-400">
              Nomor Telepon
            </Text>
            <Text className="font-poppins-medium text-xs text-gray-700">
              {user?.employee?.phone ?? "-"}
            </Text>
          </View>
        </View> */}
      </View>

      <View className="bg-white rounded-2xl px-4 mb-4 border border-gray-100 shadow-sm shadow-gray-200">
        <Text className="font-poppins-semibold text-xs text-secondary pt-4 pb-1">
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

      <View className="bg-white rounded-2xl px-4 border border-gray-100 shadow-sm shadow-gray-200">
        <Text className="font-poppins-semibold text-xs text-secondary pt-4 pb-1">
          PENGATURAN
        </Text>
        <ProfileMenuItem
          icon={KeyRound}
          label="Ubah Kata Sandi"
          onPress={() => router.push("/profile/change-password")}
        />
        <View className="h-px bg-gray-100" />
        <ProfileMenuItem
          icon={Info}
          label="Informasi Versi"
          onPress={() => router.push("/profile/version")}
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
