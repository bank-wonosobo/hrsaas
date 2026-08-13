"use client";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useCreateRole } from "../hooks/use-create-role";
import { CreateRole, CreateRoleSchema } from "../schemas/role-schema";

export function FormRole() {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateRoleSchema, {
    defaultValues: { name: "" },
  });

  const mutation = useCreateRole();

  const onSubmit = (data: CreateRole) => {
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
        Tambah Role
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Tambah Role"
        maxWidth="sm"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-5">
          <FormField label="Nama Role">
            <Input
              label="Nama Role"
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
