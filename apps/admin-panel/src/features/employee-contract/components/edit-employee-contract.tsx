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
import { useUpdateEmployeeContract } from "../hooks/use-update-employee-contract";
import {
  EmployeeContract,
  EMPLOYEE_STATUS_OPTIONS,
  UpdateEmployeeContract,
  UpdateEmployeeContractSchema,
} from "../schemas/employee-contract-schema";

const employeeStatusOptions = EMPLOYEE_STATUS_OPTIONS.map((s) => ({
  label: s,
  value: s,
}));

interface Props {
  contract: EmployeeContract;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditEmployeeContract({ contract, isOpen, onClose }: Props) {
  const form = useZodForm(UpdateEmployeeContractSchema, {
    values: {
      contract_type: contract.contract_type,
      start_date: new Date(contract.start_date).toISOString(),
      end_date: contract.end_date ? new Date(contract.end_date).toISOString() : "",
      division_id: contract.division_id,
      position_id: contract.position_id,
      salary: contract.salary,
      employee_status: contract.employee_status ?? undefined,
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

  const { mutate, isPending } = useUpdateEmployeeContract(onClose);

  const onSubmit = (data: UpdateEmployeeContract) => {
    mutate({
      id: contract.id,
      data: { ...data, end_date: data.end_date || undefined },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Kontrak Karyawan"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-edit-employee-contract" loading={isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="form-edit-employee-contract"
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
