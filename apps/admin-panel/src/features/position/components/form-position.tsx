"client";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select, { Option } from "@/components/ui/select/select";
import Switch from "@/components/ui/switch/switch";
import { useZodForm } from "@/hooks/use-zod-form";
import { getLevel } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useCreatePosition } from "../hooks/use-create-position";
import { useSearchPosition } from "../hooks/use-search-position";
import {
  CreatePosition,
  CreatePositionSchema,
} from "../schemas/position-schema";

export function FormPosition() {
  const [open, setOpen] = useState(false);

  const { data: positions } = useSearchPosition({
    key: "",
    page: 1,
    size: 100,
  });

  const options: Option[] =
    positions?.data?.map((position) => {
      const level = getLevel(position);

      return {
        value: position.id,
        label: `${"→ ".repeat(level)} ${position.name}`,
      };
    }) ?? [];

  const form = useZodForm(CreatePositionSchema, {
    defaultValues: {
      name: "",
      is_approver: false,
      parent_id: undefined,
    },
  });

  const mutation = useCreatePosition();

  const onSubmit = (data: CreatePosition) => {
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
        title="Tambah posisi"
        maxWidth="sm"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-5">
          <FormField label="Nama ">
            <Input
              label="Nama posisi"
              type="text"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
          </FormField>

          <Controller
            name="is_approver"
            control={form.control}
            render={({ field, fieldState }) => (
              <Switch
                checked={!!field.value}
                onChange={field.onChange}
                label="Is Approver?"
                description="Turn this on to membuat approver"
              />
            )}
          />

          <FormField label="Parent / Atasan">
            <Controller
              name="parent_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Select
                  label="Parent / Atasan"
                  options={options}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
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
