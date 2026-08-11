"use client";

import Button from "@/components/ui/button/button";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { Controller } from "react-hook-form";
import { useUpdateEmployeeTraining } from "../hooks/use-update-employee-training";
import {
  EmployeeTraining,
  UpdateEmployeeTraining,
  UpdateEmployeeTrainingSchema,
} from "../schemas/employee-training-schema";

const tsToDate = (ms: number | null | undefined) =>
  ms ? new Date(ms).toISOString().split("T")[0] : "";

interface Props {
  training: EmployeeTraining;
  open: boolean;
  onClose: () => void;
}

export function UpdateEmployeeTrainingForm({ training, open, onClose }: Props) {
  const form = useZodForm(UpdateEmployeeTrainingSchema, {
    values: {
      training_name: training.training_name,
      organizer: training.organizer,
      start_date: tsToDate(training.start_date),
      end_date: tsToDate(training.end_date),
      certificate_url: training.certificate_url ?? "",
    },
  });

  const mutation = useUpdateEmployeeTraining(() => onClose());

  const onSubmit = (data: UpdateEmployeeTraining) => {
    mutation.mutate({ id: training.id, data });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Edit Riwayat Pelatihan"
      maxWidth="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="form-update-employee-training"
            loading={mutation.isPending}
          >
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-update-employee-training"
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
  );
}
