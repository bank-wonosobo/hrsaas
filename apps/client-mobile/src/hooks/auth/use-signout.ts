import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useSignOut = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Keluar", "Apakah kamu yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  return { handleSignOut };
};
