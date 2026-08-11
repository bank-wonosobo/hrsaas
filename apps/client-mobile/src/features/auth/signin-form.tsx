import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import { useZodForm } from "@/hooks/common/use-form";
import { SignInRequest, SignInRequestSchema } from "@/schema/auth-schema";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

interface Props {
  onSubmit: (data: SignInRequest) => void;
  loading?: boolean;
}

export default function SigninForm({ onSubmit, loading }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useZodForm(SignInRequestSchema, {
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <View className="bg-white rounded-3xl p-6 shadow-xl shadow-black/20">
      <Text className="text-xl font-poppins-semibold text-secondary text-center">
        Masuk ke Akun
      </Text>
      <Text className="text-center font-poppins-regular text-xs text-gray-400 mt-1 mb-6">
        Masukkan email dan password untuk login BW Akses+
      </Text>

      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField label="Email" error={fieldState.error?.message} required>
            <View className="relative justify-center">
              <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                <Mail size={18} color="#9ca3af" />
              </View>
              <Input
                className="pl-11"
                placeholder="nama@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={field.value}
                error={fieldState.invalid}
                onChangeText={field.onChange}
              />
            </View>
          </FormField>
        )}
      />

      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <FormField
            label="Password"
            required
            error={fieldState.error?.message}
          >
            <View className="relative justify-center">
              <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                <Lock size={18} color="#9ca3af" />
              </View>
              <Input
                className="pl-11 pr-11"
                placeholder="Masukkan password"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                error={fieldState.invalid}
                value={field.value}
                onChangeText={field.onChange}
              />
              <Pressable
                accessibilityLabel={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                onPress={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-0 bottom-0 justify-center z-10"
              >
                {showPassword ? (
                  <EyeOff size={18} color="#9ca3af" />
                ) : (
                  <Eye size={18} color="#9ca3af" />
                )}
              </Pressable>
            </View>
          </FormField>
        )}
      />

      <Button
        loading={loading}
        variant="secondary"
        fullWidth
        onPress={form.handleSubmit(onSubmit)}
      >
        Masuk
      </Button>
    </View>
  );
}
