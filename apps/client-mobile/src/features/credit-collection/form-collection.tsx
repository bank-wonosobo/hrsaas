import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import { useZodForm } from "@/hooks/common/use-form";
import { Coordinates } from "@/hooks/common/use-location";
import {
  CreditCollectionVisit,
  CreditCollectionVisitSchema,
  CreditCustomer,
} from "@/schema/credit-collection-schema";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";

interface Props {
  imageUrl: string;
  loading: boolean;
  creditCustomer: CreditCustomer;
  location: Coordinates;
  onSubmit: (data: CreditCollectionVisit) => void;
}

export default function FormCollection({
  imageUrl,
  loading,
  creditCustomer,
  location,
  onSubmit,
}: Props) {
  const form = useZodForm(CreditCollectionVisitSchema, {
    defaultValues: {
      commitment: "",
      img_url: imageUrl,
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      total_paid: 0,
      pinjaman: creditCustomer,
    },
  });

  return (
    <View className="bg-white rounded-xl p-4 mb-10">
      {!!form.formState.errors.img_url?.message && (
        <Text className="mb-4 text-xs text-red-500">
          {form.formState.errors.img_url.message}
        </Text>
      )}
      <Controller
        control={form.control}
        name="total_paid"
        render={({ field, fieldState }) => (
          <FormField
            label="Jumlah Bayar"
            error={fieldState.error?.message}
            required
          >
            <Input
              type="number"
              placeholder="Jumlah Bayar"
              value={String(field.value)}
              error={fieldState.invalid}
              onChangeText={(text) => field.onChange(Number(text))}
            />
          </FormField>
        )}
      />
      <Controller
        control={form.control}
        name="commitment"
        render={({ field, fieldState }) => (
          <FormField
            label="Komitmen"
            error={fieldState.error?.message}
            required
          >
            <Input
              placeholder="Komitmet Nasabah"
              value={field.value}
              error={fieldState.invalid}
              onChangeText={field.onChange}
            />
          </FormField>
        )}
      />
      <Button
        loading={loading}
        variant="secondary"
        onPress={form.handleSubmit(onSubmit)}
      >
        Submit
      </Button>
    </View>
  );
}
