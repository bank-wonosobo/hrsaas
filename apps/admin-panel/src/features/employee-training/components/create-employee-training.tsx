"use client";

import Button from "@/components/ui/button/button";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreateEmployeeTraining } from "../hooks/use-create-employee-training";
import {
  CreateEmployeeTraining,
  CreateEmployeeTrainingSchema,
} from "../schemas/employee-training-schema";

const EMPTY_VALUES = {
  training_name: "",
  organizer: "",
  start_date: "",
  end_date: "",
  certificate_url: "",
};

interface Props {
  employeeId: string;
}

export function CreateEmployeeTrainingForm({ employeeId }: Props) {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateEmployeeTrainingSchema, {
    defaultValues: { employee_id: employeeId, ...EMPTY_VALUES },
  });

  const mutation = useCreateEmployeeTraining(() => {
    setOpen(false);
    form.reset({ employee_id: employeeId, ...EMPTY_VALUES });
  });

  const onSubmit = (data: CreateEmployeeTraining) => {
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
        Tambah Pelatihan
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Tambah Riwayat Pelatihan"
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
              form="form-employee-training"
              loading={mutation.isPending}
            >
              Simpan
            </Button>
          </>
        }
      >
        <form
          id="form-employee-training"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField label="Nama Pelatihan" required>
            <Input
              label="Nama pelatihan / kursus"
              type="text"
              {...form.register("training_name")}
              error={form.formState.errors.training_name?.message}
            />
          </FormField>

          <FormField label="Penyelenggara" required>
            <Input
              label="Nama penyelenggara"
              type="text"
              {...form.register("organizer")}
              error={form.formState.errors.organizer?.message}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tanggal Mulai" required>
              <Input
                label="Tanggal mulai"
                type="date"
                {...form.register("start_date")}
                error={form.formState.errors.start_date?.message}
              />
            </FormField>

            <FormField label="Tanggal Selesai">
              <Input
                label="Tanggal selesai"
                type="date"
                {...form.register("end_date")}
                error={form.formState.errors.end_date?.message}
              />
            </FormField>
          </div>

          <FormField label="Sertifikat">
            <Controller
              name="certificate_url"
              control={form.control}
              render={({ field, fieldState }) => (
                <FileUploader
                  accept=".pdf,.jpg,.jpeg,.png"
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
