"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useZodForm } from "@/hooks/use-zod-form";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreateEmployeeSanction } from "../hooks/use-create-employee-sanction";
import { useGetSanctionTypes } from "../hooks/use-get-sanction-types";
import {
  CreateEmployeeSanction,
  CreateEmployeeSanctionSchema,
} from "../schemas/employee-sanction-schema";

export function CreateEmployeeSanctionForm() {
  const [open, setOpen] = useState(false);
  const { data: employees, isLoading: employeesLoading } = useGetEmployees({
    size: 500,
  });
  const { data: sanctionTypes, isLoading: sanctionsLoading } =
    useGetSanctionTypes();

  const form = useZodForm(CreateEmployeeSanctionSchema, {
    defaultValues: {
      employee_id: "",
      sanction_id: "",
      reason: "",
      start_date: "",
      end_date: "",
      document_url: "",
    },
  });

  const mutation = useCreateEmployeeSanction(() => {
    setOpen(false);
    form.reset();
  });

  const onSubmit = (data: CreateEmployeeSanction) => {
    mutation.mutate(data);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value && !mutation.isPending) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Tambah Sanksi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tambah Sanksi Karyawan</DialogTitle>
          <DialogDescription>
            Isi informasi karyawan, masa berlaku, dan dokumen pendukung.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="sanction-employee">Karyawan</Label>
            <Controller
              name="employee_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={employeesLoading}
                  >
                    <SelectTrigger
                      id="sanction-employee"
                      className="w-full"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue
                        placeholder={
                          employeesLoading
                            ? "Memuat karyawan..."
                            : "Pilih karyawan"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(employees?.data ?? []).map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.fullname} · {employee.employee_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sanction-type">Jenis Sanksi</Label>
            <Controller
              name="sanction_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={sanctionsLoading}
                  >
                    <SelectTrigger
                      id="sanction-type"
                      className="w-full"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue
                        placeholder={
                          sanctionsLoading
                            ? "Memuat jenis sanksi..."
                            : "Pilih jenis sanksi"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(sanctionTypes?.data ?? []).map((sanction) => (
                        <SelectItem key={sanction.id} value={sanction.id}>
                          {sanction.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sanction-reason">Alasan</Label>
            <Textarea
              id="sanction-reason"
              placeholder="Tuliskan alasan pemberian sanksi..."
              rows={3}
              {...form.register("reason")}
              aria-invalid={!!form.formState.errors.reason}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sanction-start-date">Tanggal Berlaku</Label>
              <Input
                id="sanction-start-date"
                type="date"
                {...form.register("start_date")}
                aria-invalid={!!form.formState.errors.start_date}
              />
              {form.formState.errors.start_date && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.start_date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sanction-end-date">Tanggal Akhir</Label>
              <Input
                id="sanction-end-date"
                type="date"
                {...form.register("end_date")}
                aria-invalid={!!form.formState.errors.end_date}
              />
              {form.formState.errors.end_date && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dokumen Pendukung</Label>
            <Controller
              name="document_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <FileUploader
                  value={field.value}
                  onChange={field.onChange}
                  isPublic={false}
                  error={fieldState.error?.message}
                  accept="application/pdf, image/*"
                  useSignedUrl={true}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Simpan Sanksi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
