"use client";

import Button from "@/components/ui/button/button";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import InputDate from "@/components/ui/input/input-date";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import { useSearchDivision } from "@/features/division/hooks/use-search-division";
import { useSearchPosition } from "@/features/position/hooks/use-search-position";
import { useZodForm } from "@/hooks/use-zod-form";
import { contractType } from "@/lib/data";
import { mapToOptions } from "@/lib/utils";
import { Controller } from "react-hook-form";
import { useCreateEmployeeContract } from "../hooks/use-create-employee-contract";
import {
  CreateEmployeeContract,
  CreateEmployeeContractSchema,
  EMPLOYEE_STATUS_OPTIONS,
} from "../schemas/employee-contract-schema";

const employeeStatusOptions = EMPLOYEE_STATUS_OPTIONS.map((s) => ({
  label: s,
  value: s,
}));

interface Props {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FormEmployeeContract({ employeeId, isOpen, onClose }: Props) {
  const form = useZodForm(CreateEmployeeContractSchema, {
    defaultValues: {
      employee_id: employeeId,
      contract_type: "",
      start_date: "",
      end_date: "",
      division_id: "",
      position_id: "",
      salary: 0,
      employee_status: undefined,
    },
  });

  const { data: divisionData } = useSearchDivision({ page: 1, size: 100 });
  const { data: positionData } = useSearchPosition({ page: 1, size: 100 });

  const divisionOptions = mapToOptions(
    divisionData?.data ?? [],
    (d) => d.name,
    (d) => d.id,
  );

  const positionOptions = mapToOptions(
    positionData?.data ?? [],
    (p) => p.name,
    (p) => p.id,
  );

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const { mutate, isPending } = useCreateEmployeeContract(handleClose);

  const onSubmit = (data: CreateEmployeeContract) => {
    mutate({
      ...data,
      employee_id: employeeId,
      end_date: data.end_date || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Kontrak Karyawan"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Batal
          </Button>
          <Button
            type="submit"
            form="form-employee-contract"
            loading={isPending}
          >
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-employee-contract"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField label="Jenis Kontrak" required>
          <Controller
            name="contract_type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Jenis Kontrak"
                options={contractType}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tanggal Mulai" required>
            <Controller
              name="start_date"
              control={form.control}
              render={({ field, fieldState }) => (
                <InputDate
                  label="Tanggal Mulai"
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date.toISOString())}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>

          <FormField label="Tanggal Berakhir" hint="Kosongkan jika kontrak tetap.">
            <Controller
              name="end_date"
              control={form.control}
              render={({ field, fieldState }) => (
                <InputDate
                  label="Tanggal Berakhir"
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date.toISOString())}
                  error={fieldState.error?.message}
                />
              )}
            />
          </FormField>
        </div>

        <FormField label="Divisi" required>
          <Controller
            name="division_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Divisi"
                options={divisionOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>

        <FormField label="Jabatan" required>
          <Controller
            name="position_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Jabatan"
                options={positionOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </FormField>

        <FormField label="Gaji" required>
          <Input
            label="Gaji (Rp)"
            type="number"
            min={0}
            {...form.register("salary")}
            error={form.formState.errors.salary?.message}
          />
        </FormField>

        <FormField label="Status Karyawan">
          <Controller
            name="employee_status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label="Status Karyawan"
                options={employeeStatusOptions}
                value={field.value ?? ""}
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
