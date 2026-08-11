import SigninForm from "@/features/auth/signin-form";
import { useSignIn } from "@/hooks/auth/use-signin";
import { SignInRequest } from "@/schema/auth-schema";
import { Image, ScrollView, Text, View } from "react-native";

const Logo = require("@/assets/images/logo.png");

export default function SignInPage() {
  const signInMutate = useSignIn();

  const handleSignIn = (data: SignInRequest) => {
    signInMutate.mutate(data);
  };

  return (
    <View className="flex-1 bg-secondary">
      <View className="absolute -top-16 -left-24 h-64 w-64 rounded-full bg-primary/20" />
      <View className="absolute top-16 -right-28 h-80 w-80 rounded-full bg-primary/10" />
      <View className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/5" />
      <View className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-primary/10" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-10">
          <View className="bg-white rounded-2xl px-5 py-4 shadow-lg shadow-black/30">
            <Image source={Logo} className="w-40 h-8" resizeMode="contain" />
          </View>
          <Text className="text-white font-poppins-semibold text-lg mt-6">
            Selamat Datang
          </Text>
          <Text className="text-white/60 font-poppins-regular text-xs mt-1 text-center">
            Masuk untuk mengakses layanan BW Akses+
          </Text>
        </View>

        <SigninForm onSubmit={handleSignIn} loading={signInMutate.isPending} />
      </ScrollView>
    </View>
  );
}
