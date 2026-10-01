"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Option } from "@/components/ui/select/select";
import { Skeleton } from "@/components/ui/skeleton";
import { blood_type, gender, maritalStatus, religion } from "@/lib/data";
import toIDDate, { diffDateDetail, formatDate } from "@/lib/utils";
import { format } from "date-fns";
import { Check, Pencil, RefreshCw, X } from "lucide-react";
import { useId, useState } from "react";
import { useDetailEmployee } from "../../hooks/use-detail-employee";
import { useUpdateEmployee } from "../../hooks/use-update-employee";

interface Props {
  id: string;
}

type ProfileFieldProps = {
  label: string;
  value?: string | null;
  hint?: string;
  type?: "text" | "date" | "select";
  dateValue?: Date;
  options?: Option[];
  disabled?: boolean;
  onSave: (value: string) => void;
};

function ProfileField({
  label,
  value = "",
  hint,
  type = "text",
  dateValue,
  options = [],
  disabled,
  onSave,
}: ProfileFieldProps) {
  const id = useId();
  const dateTimestamp = dateValue?.getTime();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function cancelEdit() {
    setEditing(false);
  }

  function startEdit() {
    setDraft(
      type === "date" && dateTimestamp
        ? format(new Date(dateTimestamp), "yyyy-MM-dd")
        : (value ?? ""),
    );
    setEditing(true);
  }

  function save() {
    onSave(type === "date" ? formatDate(new Date(`${draft}T00:00:00`)) : draft);
    setEditing(false);
  }

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="flex min-h-28 flex-col justify-between gap-3 rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor={id} className="text-muted-foreground">
            {label}
          </Label>
          {editing ? (
            type === "select" ? (
              <Select
                value={draft || undefined}
                onValueChange={setDraft}
                disabled={disabled}
              >
                <SelectTrigger id={id} className="w-full">
                  <SelectValue placeholder={`Pilih ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={id}
                type={type === "date" ? "date" : "text"}
                value={
                  type === "date" && draft && !/^\d{4}-\d{2}-\d{2}$/.test(draft)
                    ? ""
                    : draft
                }
                onChange={(event) => setDraft(event.target.value)}
                disabled={disabled}
                autoFocus
              />
            )
          ) : (
            <p className="break-words text-sm font-medium">
              {type === "select" && selectedOption
                ? selectedOption.label
                : value || "Belum diisi"}
            </p>
          )}
        </div>
        {!editing && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${label.toLowerCase()}`}
            disabled={disabled}
            onClick={startEdit}
          >
            <Pencil />
          </Button>
        )}
      </div>
      {editing && (
        <div className="space-y-3">
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={cancelEdit}
            >
              <X />
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={disabled || (type === "date" && !draft)}
              onClick={save}
            >
              <Check />
              Simpan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfileEmployee({ id }: Props) {
  const { data, isLoading, isError, refetch } = useDetailEmployee(id);
  const { mutate: updateEmployee, isPending } = useUpdateEmployee(id);
  const employee = data?.data;
  const birthDate = employee?.birth_date
    ? new Date(employee.birth_date)
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-5 pt-5">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <Card className="mt-5">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-destructive">
            {isError
              ? "Informasi karyawan gagal dimuat."
              : "Informasi karyawan tidak tersedia."}
          </p>
          {isError && (
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCw />
              Coba lagi
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const age = birthDate
    ? diffDateDetail(birthDate, new Date()).years
    : undefined;

  return (
    <div className="pt-5">
      <Card>
        <CardHeader className="flex flex-col gap-2 border-b sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Informasi umum</CardTitle>
            <CardDescription className="mt-1">
              Data pribadi karyawan{age !== undefined ? ` · ${age} tahun` : ""}.
              Pilih ikon edit untuk memperbarui informasi.
            </CardDescription>
          </div>
          <Button
            variant={employee.is_active === false ? "default" : "destructive"}
            disabled={isPending}
            onClick={() =>
              updateEmployee({ is_active: employee.is_active === false })
            }
          >
            {isPending
              ? "Memperbarui..."
              : employee.is_active === false
                ? "Aktifkan karyawan"
                : "Nonaktifkan karyawan"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ProfileField
            label="Nama lengkap"
            value={employee.fullname}
            hint="Pastikan nama lengkap sesuai dokumen resmi."
            disabled={isPending}
            onSave={(value) => updateEmployee({ fullname: value })}
          />
          <ProfileField
            label="Jenis kelamin"
            value={employee.gender}
            type="select"
            options={gender}
            disabled={isPending}
            onSave={(value) => updateEmployee({ gender: value })}
          />
          <ProfileField
            label="NIK / nomor identitas"
            value={employee.identity_number}
            disabled={isPending}
            onSave={(value) => updateEmployee({ identity_number: value })}
          />
          <ProfileField
            label="Tempat lahir"
            value={employee.birth_place}
            disabled={isPending}
            onSave={(value) => updateEmployee({ birth_place: value })}
          />
          <ProfileField
            label="Tanggal lahir"
            type="date"
            value={birthDate ? toIDDate(birthDate) : ""}
            dateValue={birthDate}
            disabled={isPending}
            onSave={(value) => updateEmployee({ birth_date: value })}
          />
          <ProfileField
            label="Status perkawinan"
            value={employee.marital_status}
            type="select"
            options={maritalStatus}
            disabled={isPending}
            onSave={(value) => updateEmployee({ marital_status: value })}
          />
          <ProfileField
            label="Golongan darah"
            value={employee.blood_type}
            type="select"
            options={blood_type}
            disabled={isPending}
            onSave={(value) => updateEmployee({ blood_type: value })}
          />
          <ProfileField
            label="Nomor telepon"
            value={employee.phone}
            disabled={isPending}
            onSave={(value) => updateEmployee({ phone: value })}
          />
          <ProfileField
            label="Agama"
            value={employee.religion}
            type="select"
            options={religion}
            disabled={isPending}
            onSave={(value) => updateEmployee({ religion: value })}
          />
          <ProfileField
            label="Alamat"
            value={employee.address}
            disabled={isPending}
            onSave={(value) => updateEmployee({ address: value })}
          />
          <ProfileField
            label="Kota"
            value={employee.city}
            disabled={isPending}
            onSave={(value) => updateEmployee({ city: value })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
