"use client";
import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import InputDate from "@/components/ui/input/input-date";
import Select from "@/components/ui/select/select";
import { useZodForm } from "@/hooks/use-zod-form";
import { blood_type, gender, maritalStatus, religion } from "@/lib/data";
import { Controller } from "react-hook-form";
import { useCrateEmployee } from "../hooks/use-create-employee";
import {
  CreateEmployee,
  CreateEmployeeScheme,
} from "../schemas/employee-schema";

export default function FormEmployee() {
  const form = useZodForm(CreateEmployeeScheme, {
    defaultValues: {
      fullname: "",
      gender: "",
      email: "",
      birth_date: "",
      birth_place: "",
      identity_number: "",
      blood_type: "",
      employee_number: "",
      marital_status: "",
      password: "",
      phone: "",
      address: "",
      city: "",
      religion: "",
      timezone: "UTC-3",
    },
  });

  const mutation = useCrateEmployee();

  const onSubmit = (data: CreateEmployee) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nama lengkap">
          <Input
            label="Nama lengkap karyawan"
            type="text"
            {...form.register("fullname")}
            error={form.formState.errors.fullname?.message}
          />
        </FormField>

        <FormField label="Jenis Kelamin">
          <Controller
            name="gender"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Jenis Kelamin"
                options={gender}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Nomer induk karyawan"
          hint="Nomer induk harus bersifat unik."
        >
          <Input
            label="Nomer induk karyawan"
            type="text"
            {...form.register("employee_number")}
            error={form.formState.errors.employee_number?.message}
          />
        </FormField>

        <FormField label="NIK / Nomor Identitas" hint="Sesuai KTP.">
          <Input
            label="NIK / Nomor Identitas"
            type="text"
            {...form.register("identity_number")}
            error={form.formState.errors.identity_number?.message}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Email karyawan"
          hint="Digunakan untuk login aplikasi BW akses+"
        >
          <Input
            label="Email karyawan"
            type="text"
            {...form.register("email")}
            error={form.formState.errors.email?.message}
          />
        </FormField>

        <FormField label="Password">
          <Input
            label="Password"
            type="password"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Tempat lahir" hint="Tempat lahir berdasarkan KTP.">
          <Input
            label="Tempat lahir"
            type="text"
            {...form.register("birth_place")}
            error={form.formState.errors.birth_place?.message}
          />
        </FormField>

        <FormField label="Tanggal Lahir">
          <Controller
            name="birth_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputDate
                label="Birth Date"
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => field.onChange(date.toISOString())}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Golongan darah">
          <Controller
            name="blood_type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Golongan Darah"
                options={blood_type}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>

        <FormField label="Status Pernikahan">
          <Controller
            name="marital_status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Status Perkawinan"
                options={maritalStatus}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nomer Telepon">
          <Input
            label="Nomer Telepon"
            type="text"
            {...form.register("phone")}
            error={form.formState.errors.phone?.message}
          />
        </FormField>

        <FormField label="Agama">
          <Controller
            name="religion"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Agama"
                options={religion}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Alamat">
          <Input
            label="Alamat"
            type="text"
            {...form.register("address")}
            error={form.formState.errors.address?.message}
          />
        </FormField>

        <FormField label="Kota">
          <Input
            label="Kota"
            type="text"
            {...form.register("city")}
            error={form.formState.errors.city?.message}
          />
        </FormField>
      </div>

      <div className="flex justify-end px-6 py-5">
        {mutation.isPending ? (
          <Button disabled size="sm">
            {/* <Spinner /> */}
            Loading...
          </Button>
        ) : (
          <Button type="submit">Berikutnya</Button>
        )}
      </div>
    </form>
  );
}
