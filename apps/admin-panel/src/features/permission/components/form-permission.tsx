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
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/hooks/use-zod-form";
import { Plus } from "lucide-react";
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

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) form.reset();
  };

  const onSubmit = (data: CreatePermission) => {
    mutation.mutate(data, {
      onSuccess: () => handleOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Tambah Permission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Permission</DialogTitle>
          <DialogDescription>
            Buat permission yang dapat diberikan kepada role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="permission-name" className="text-sm font-medium">
              Nama Permission
            </label>
            <Input
              id="permission-name"
              placeholder="Contoh: EMPLOYEES"
              {...form.register("name")}
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
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
              {mutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
