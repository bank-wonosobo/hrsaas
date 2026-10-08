"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { useGetAllTimeOffType } from "@/features/time-off-type/hooks/use-getall-time-off-type";
import { useZodForm } from "@/hooks/use-zod-form";
import { mapToOptions } from "@/lib/utils";
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
  });

  const onSubmit = (data: CreateTimeOffRequest) => {
    mutation.mutate(data);
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <PlusCircle size={16} />
        Buat Pengajuan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Buat Pengajuan Cuti</DialogTitle>
            <DialogDescription>
              Lengkapi informasi cuti yang ingin diajukan karyawan.
            </DialogDescription>
          </DialogHeader>

          <form
            id="form-create-time-off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="employee_id">
                Karyawan <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="employee_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="employee_id"
                        className="w-full"
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Pilih karyawan" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_off_type_id">
                Jenis Cuti <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="time_off_type_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="time_off_type_id"
                        className="w-full"
                        aria-invalid={!!fieldState.error}
                      >
                        <SelectValue placeholder="Pilih jenis cuti" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Periode Cuti <span className="text-destructive">*</span>
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="start_date"
                    className="text-xs text-muted-foreground"
                  >
                    Tanggal Mulai
                  </Label>
                  <Controller
                    name="start_date"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          {...field}
                          id="start_date"
                          type="date"
                          value={field.value ?? ""}
                          aria-invalid={!!fieldState.error}
                        />
                        {fieldState.error && (
                          <p className="text-sm text-destructive">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="end_date"
                    className="text-xs text-muted-foreground"
                  >
                    Tanggal Selesai
                  </Label>
                  <Controller
                    name="end_date"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          {...field}
                          id="end_date"
                          type="date"
                          value={field.value ?? ""}
                          aria-invalid={!!fieldState.error}
                        />
                        {fieldState.error && (
                          <p className="text-sm text-destructive">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_reason">
                Alasan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="request_reason"
                placeholder="Tuliskan alasan pengajuan cuti"
                {...form.register("request_reason")}
                aria-invalid={!!form.formState.errors.request_reason}
              />
              {form.formState.errors.request_reason && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.request_reason.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file_url">File Pendukung</Label>
              <Controller
                name="file_url"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <FileUploader
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                      isPublic={false}
                      accept="application/pdf, image/*"
                      useSignedUrl={true}
                    />
                  </div>
                )}
              />
            </div>
          </form>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="form-create-time-off"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
