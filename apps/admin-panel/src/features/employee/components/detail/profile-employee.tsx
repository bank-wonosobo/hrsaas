"use client";
"use client";
import EditableField from "@/components/shared/editable-field/editable-field";
import ImageViewer from "@/components/ui/image-viewer/image-viewer";
import Switch from "@/components/ui/switch/switch";
import { blood_type, gender, maritalStatus, religion } from "@/lib/data";
import toIDDate, { diffDateDetail } from "@/lib/utils";
import { Globe, Mail, Phone } from "lucide-react";
import React from "react";
import { useDetailEmployee } from "../../hooks/use-detail-employee";
import { useUpdateEmployee } from "../../hooks/use-update-employee";

interface Props {
  id: string;
}

export default function ProfileEmployee({ id }: Props): React.ReactNode {
  const { data } = useDetailEmployee(id);
  const { mutate: updateEmployee, isPending } = useUpdateEmployee(id);
  const employee = data?.data;
  const birthDate = employee?.birth_date
    ? new Date(employee.birth_date)
    : undefined;
  const isActive = employee?.is_active ?? true;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* profile card */}
      <div className="p-6 bg-white border rounded-2xl h-fit w-[270px]">
        <div className="flex justify-center items-center flex-col gap-4 border-b pb-3">
          {employee?.user.image_url ? (
            <ImageViewer
              width={100}
              height={100}
              circle
              src={employee?.user.image_url}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-zinc-100 text-zinc-700 font-semibold flex items-center justify-center text-sm shrink-0 overflow-hidden">
              {employee?.fullname.charAt(0).toUpperCase()}
            </div>
          )}

          <h2 className="font-semibold text-2xl text-center">
            {employee?.fullname}
          </h2>
          <p>{employee?.contracts?.[0]?.position.name}</p>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {isActive ? "Aktif" : "Nonaktif"}
          </span>
        </div>
        <div className="mt-6 space-y-5">
          <div className="flex gap-2 items-center">
            <Mail size={16} className="text-zinc-400" />
            <span className="text-sm">{employee?.user.email}</span>
          </div>
          <div className="flex gap-2 items-center">
            <Phone size={16} className="text-zinc-400" />
            <span className="text-sm">{employee?.phone}</span>
          </div>
          <div className="flex gap-2 items-center">
            <Globe size={16} className="text-zinc-400" />
            <span className="text-sm">{employee?.timezone}</span>
          </div>
        </div>
      </div>

      {/* form detail */}
      <div className="border p-4 rounded-2xl w-full">
        <div className="flex border-b pb-3 items-center justify-between">
          <h2 className="text-lg font-semibold">
            Informasi Karyawan{" "}
            <span className="text-sm font-normal">
              (
              {birthDate
                ? diffDateDetail(birthDate, new Date()).years + " Tahun"
                : ""}
              )
            </span>
          </h2>
          <Switch
            checked={isActive}
            onChange={(val) => updateEmployee({ is_active: val })}
            disabled={isPending}
            label={isActive ? "Aktif" : "Nonaktif"}
          />
        </div>
        <div className="w-full py-5 space-y-5">
          <EditableField
            label="Nama lengkap"
            value={employee?.fullname}
            hint="Pastikan nama lengkap sesuai"
            onSave={(value) => updateEmployee({ fullname: value })}
          />
          <div className="grid grid-cols-2 gap-5">
            <EditableField
              type="select"
              label="Jenis Kelamin"
              value={employee?.gender}
              options={gender}
              hint="Pastikan jenis kelamin sesuai"
              onSave={(value) => updateEmployee({ gender: value })}
            />
            <EditableField
              label="NIK / Nomor Identitas"
              value={employee?.identity_number}
              hint="Pastikan nomor identitas sesuai"
              onSave={(value) => updateEmployee({ identity_number: value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <EditableField
              label="Tempat Lahir"
              value={employee?.birth_place}
              hint="Pastikan tempat lahir sesuai"
              onSave={(value) => updateEmployee({ birth_place: value })}
            />
            <EditableField
              type="date"
              label="Tanggal lahir"
              value={birthDate ? toIDDate(birthDate) : ""}
              dateValue={birthDate}
              hint="Pastikan tanggal lahir sesuai"
              onSave={(value) => updateEmployee({ birth_date: value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <EditableField
              type="select"
              label="Status Perkawinan"
              value={employee?.marital_status}
              options={maritalStatus}
              hint="Pastikan status perkawinan sesuai"
              onSave={(value) => updateEmployee({ marital_status: value })}
            />
            <EditableField
              type="select"
              label="Golongan darah"
              value={employee?.blood_type}
              options={blood_type}
              hint="Pastikan golongan darah sesuai"
              onSave={(value) => updateEmployee({ blood_type: value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <EditableField
              label="Nomer telepon"
              value={employee?.phone}
              hint="Pastikan nomer telepon sesuai"
              onSave={(value) => updateEmployee({ phone: value })}
            />
            <EditableField
              type="select"
              label="Agama"
              value={employee?.religion}
              options={religion}
              hint="Pastikan agama sesuai"
              onSave={(value) => updateEmployee({ religion: value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <EditableField
              label="Alamat"
              value={employee?.address}
              hint="Pastikan alamat sesuai"
              onSave={(value) => updateEmployee({ address: value })}
            />
            <EditableField
              label="Kota"
              value={employee?.city}
              hint="Pastikan kota sesuai"
              onSave={(value) => updateEmployee({ city: value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
