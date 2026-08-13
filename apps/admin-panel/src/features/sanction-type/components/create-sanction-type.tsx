"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useCreateSanctionType } from "../hooks/use-create-sanction-type";
import {
  CreateSanctionType,
  CreateSanctionTypeSchema,
} from "../schemas/sanction-type-schema";

export function CreateSanctionTypeForm() {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateSanctionTypeSchema, {
    defaultValues: {
      name: "",
      description: "",
      note: "",
    },
  });

  const mutation = useCreateSanctionType();

  const onSubmit = (data: CreateSanctionType) => {
    mutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        prefixIcon={<PlusCircle size={18} />}
      >
        Tambah
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Tambah jenis sanksi"
        maxWidth="sm"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-5">
          <FormField label="Nama">
            <Input
              label="Nama jenis sanksi"
              type="text"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
          </FormField>

          <FormField label="Deskripsi">
            <Input
              label="Deskripsi"
              type="text"
              {...form.register("description")}
              error={form.formState.errors.description?.message}
            />
          </FormField>

          <FormField label="Catatan">
            <Input
              label="Catatan"
              type="text"
              {...form.register("note")}
              error={form.formState.errors.note?.message}
            />
          </FormField>

          <Button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
