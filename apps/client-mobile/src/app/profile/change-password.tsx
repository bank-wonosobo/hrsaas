import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import { useZodForm } from "@/hooks/common/use-form";
import { useChangePassword } from "@/hooks/user/use-change-password";
import {
  ChangePasswordForm,
  ChangePasswordSchema,
} from "@/schema/user-schema";
import { Controller } from "react-hook-form";
import { ScrollView, View } from "react-native";

export default function ChangePasswordPage() {
  const { mutate: changePassword, isPending } = useChangePassword();

  const form = useZodForm(ChangePasswordSchema, {
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: ChangePasswordForm) => {
    changePassword({
      current_password: data.current_password,
      new_password: data.new_password,
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-4">
        <Controller
          control={form.control}
          name="current_password"
          render={({ field, fieldState }) => (
            <FormField
              label="Password Saat Ini"
              required
              error={fieldState.error?.message}
            >
              <Input
                placeholder="Masukkan password saat ini"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.invalid}
                secureTextEntry
              />
            </FormField>
          )}
        />

        <Controller
          control={form.control}
          name="new_password"
          render={({ field, fieldState }) => (
            <FormField
              label="Password Baru"
              required
              error={fieldState.error?.message}
            >
              <Input
                placeholder="Minimal 8 karakter"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.invalid}
                secureTextEntry
              />
            </FormField>
          )}
        />

        <Controller
          control={form.control}
          name="confirm_password"
          render={({ field, fieldState }) => (
            <FormField
              label="Konfirmasi Password Baru"
              required
              error={fieldState.error?.message}
            >
              <Input
                placeholder="Ulangi password baru"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.invalid}
                secureTextEntry
              />
            </FormField>
          )}
        />

        <Button
          loading={isPending}
          variant="secondary"
          fullWidth
          onPress={form.handleSubmit(onSubmit)}
        >
          Simpan Password Baru
        </Button>
      </View>
    </ScrollView>
  );
}
