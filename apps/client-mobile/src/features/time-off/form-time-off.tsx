import Button from "@/components/ui/button";
import DateRangePicker, { DateRange } from "@/components/ui/date-range-picker";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { useZodForm } from "@/hooks/common/use-form";
import { useCreateTimeOff } from "@/hooks/time-off/use-create-time-off";
import { useTimeOffTypes } from "@/hooks/time-off/use-time-off-types";
import { useGenerateSignUrl } from "@/hooks/upload/generate-sign-url";
import { PhotoResult } from "@/schema/photo-schema";
import {
  CreateTimeOffRequest,
  CreateTimeOffRequestSchema,
} from "@/schema/time-off-schema";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Text, View } from "react-native";
import CaptureTimeOff from "./capture-time-off";

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function FormTimeOff() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const generateSignUrl = useGenerateSignUrl();
  const { data: types, isLoading: loadingTypes } = useTimeOffTypes();
  const { mutate: createTimeOff, isPending } = useCreateTimeOff();

  useEffect(() => {
    generateSignUrl.mutate({ mime_type: "image/jpeg", is_public: false });
  }, []);

  const options = types?.map((t) => ({ label: t.name, value: t.id })) ?? [];

  const form = useZodForm(CreateTimeOffRequestSchema, {
    defaultValues: {
      time_off_type_id: "",
      start_date: "",
      end_date: "",
      request_reason: "",
    },
  });

  const handleRangeChange = (next: DateRange) => {
    setRange(next);
    form.setValue("start_date", next.from ? toDateStr(next.from) : "", {
      shouldValidate: true,
    });
    form.setValue("end_date", next.to ? toDateStr(next.to) : "", {
      shouldValidate: true,
    });
  };

  const dateError =
    form.formState.errors.start_date?.message ||
    form.formState.errors.end_date?.message;

  const onSubmit = (data: CreateTimeOffRequest) => {
    if (photo && !generateSignUrl.data) {
      if (generateSignUrl.isError) {
        generateSignUrl.mutate({ mime_type: "image/jpeg", is_public: false });
      }
      return;
    }
    createTimeOff({ data, photo, signUrl: generateSignUrl.data });
  };

  return (
    <View className="p-4">
      <Controller
        control={form.control}
        name="time_off_type_id"
        render={({ field, fieldState }) => (
          <FormField
            label="Jenis Cuti / Izin"
            required
            error={fieldState.error?.message}
          >
            <Select
              placeholder={loadingTypes ? "Memuat..." : "Pilih jenis cuti"}
              options={options}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.invalid}
            />
          </FormField>
        )}
      />

      <FormField label="Periode Cuti" required error={dateError}>
        <DateRangePicker
          value={range}
          onChange={handleRangeChange}
          error={!!dateError}
        />
      </FormField>
      <Text className="mb-4 text-xs text-gray-500">
        Untuk pengajuan cuti selain hari Senin - Jumat, silakan melakukan
        pangajuan melalui bagian SDM.
      </Text>

      <Controller
        control={form.control}
        name="request_reason"
        render={({ field, fieldState }) => (
          <FormField
            label="Alasan Cuti"
            required
            error={fieldState.error?.message}
          >
            <Input
              placeholder="Tulis alasan pengajuan cuti"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.invalid}
              multiline
              numberOfLines={4}
              className="min-h-[100px]"
              textAlignVertical="top"
            />
          </FormField>
        )}
      />
      <CaptureTimeOff
        photo={photo}
        onCapture={setPhoto}
        onRemove={() => setPhoto(null)}
      />

      <Button
        loading={isPending}
        variant="secondary"
        fullWidth
        className="mt-10"
        onPress={form.handleSubmit(onSubmit)}
      >
        Ajukan
      </Button>
    </View>
  );
}
