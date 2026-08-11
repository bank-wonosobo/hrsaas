"client";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useCreateDivision } from "../hooks/use-create-division";
import {
  CreateDivision,
  CreateDivisionSchema,
} from "../schemas/division-schema";

export function FormDivision() {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateDivisionSchema, {
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const mutation = useCreateDivision();

  const onSubmit = (data: CreateDivision) => {
    mutation.mutate(data);
    form.reset();
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
        title="Tambah divisi"
        maxWidth="sm"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-5">
          <FormField label="Nama ">
            <Input
              label="Nama Divisi"
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

          <Button className="px-4 py-2 bg-black text-white rounded-lg">
            Save
          </Button>
        </form>
      </Modal>
    </>
  );
}
