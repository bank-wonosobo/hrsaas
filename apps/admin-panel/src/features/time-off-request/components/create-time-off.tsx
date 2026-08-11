"use client";

import { DateRange } from "@/components/shared/date-range-picker/date-range-picker";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import InputDateRange from "@/components/ui/input-date-range/input-date-range";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import SelectSearch from "@/components/ui/select-search/select-search";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { useGetAllTimeOffType } from "@/features/time-off-type/hooks/use-getall-time-off-type";
import { useZodForm } from "@/hooks/use-zod-form";
import { mapToOptions } from "@/lib/utils";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreateTimeOffRequest } from "../hooks/use-create-time-off-request";
import {
  CreateTimeOffRequest,
  CreateTimeOffRequestSchema,
} from "../schemas/time-off-schema";

export function CreateTimeOffForm() {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  const { data: employees } = useGetEmployees({ size: 500 });
  const { data: timeOffTypes } = useGetAllTimeOffType();

  const employeeOptions = mapToOptions(
    employees?.data ?? [],
    (e) => e.fullname,
    (e) => e.id,
  );

  const typeOptions = mapToOptions(
    timeOffTypes ?? [],
    (t) => t.name,
    (t) => t.id,
  );

  const form = useZodForm(CreateTimeOffRequestSchema, {
    defaultValues: {
      employee_id: "",
      time_off_type_id: "",
      start_date: "",
      end_date: "",
      request_reason: "",
      file_url: "",
    },
  });

  const mutation = useCreateTimeOffRequest(() => {
    setOpen(false);
    form.reset();
    setDateRange({ start: null, end: null });
  });

  const handleDateRange = (range: DateRange) => {
    setDateRange(range);
    form.setValue("start_date", range.start ? format(range.start, "yyyy-MM-dd") : "", { shouldValidate: true });
    form.setValue("end_date", range.end ? format(range.end, "yyyy-MM-dd") : "", { shouldValidate: true });
  };

  const onSubmit = (data: CreateTimeOffRequest) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        prefixIcon={<PlusCircle size={16} />}
        onClick={() => setOpen(true)}
      >
        Buat Pengajuan
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Buat Pengajuan Cuti"
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="form-create-time-off"
              loading={mutation.isPending}
            >
              Simpan
            </Button>
          </>
        }
      >
        <form
          id="form-create-time-off"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField label="Karyawan" required>
            <Controller
              name="employee_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Pilih karyawan"
                  options={employeeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Jenis Cuti" required>
            <Controller
              name="time_off_type_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <SelectSearch
                  label="Pilih jenis cuti"
                  options={typeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>

          <FormField
            label="Periode Cuti"
            required
            error={
              form.formState.errors.start_date?.message ||
              form.formState.errors.end_date?.message
            }
          >
            <InputDateRange
              labelStart="Tanggal Mulai"
              labelEnd="Tanggal Selesai"
              value={dateRange}
              onChange={handleDateRange}
            />
          </FormField>

          <FormField label="Alasan" required>
            <Input
              label="Alasan pengajuan"
              type="text"
              {...form.register("request_reason")}
              error={form.formState.errors.request_reason?.message}
            />
          </FormField>

          <FormField label="File Pendukung">
            <Controller
              name="file_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <FileUploader
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>
        </form>
      </Modal>
    </>
  );
}
