"use client";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useCreatePermission } from "../hooks/use-create-permission";
import {
  CreatePermission,
  CreatePermissionSchema,
} from "../schemas/permission-schema";

export function FormPermission() {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreatePermissionSchema, {
    defaultValues: { name: "" },
  });

  const mutation = useCreatePermission();

  const onSubmit = (data: CreatePermission) => {
    mutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
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
        Tambah Permission
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Tambah Permission"
        maxWidth="sm"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-5">
          <FormField label="Nama Permission">
            <Input
              label="Nama Permission"
              type="text"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
          </FormField>

          <Button
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
