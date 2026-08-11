"use client";
import EditableField from "@/components/shared/editable-field/editable-field";
import Button from "@/components/ui/button/button";
import Modal from "@/components/ui/modal/modal";
import SelectSearch from "@/components/ui/select-search/select-search";
import Switch from "@/components/ui/switch/switch";
import { useGetEmployees } from "@/features/employee/hooks/use-get-employee";
import { mapToOptions } from "@/lib/utils";
import { MapPin, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useAssignEmployeeOfficeLocation } from "../hooks/use-assign-employee-office-location";
import { useDeleteOfficeLocation } from "../hooks/use-delete-office-location";
import { useDetailOfficeLocation } from "../hooks/use-detail-office-location";
import { useUpdateOfficeLocation } from "../hooks/use-update-office-location";

interface Props {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetailOfficeLocationModal({ id, isOpen, onClose }: Props) {
  const { data } = useDetailOfficeLocation(id);
  const updateMutation = useUpdateOfficeLocation(id);
  const deleteMutation = useDeleteOfficeLocation();
  const assignMutation = useAssignEmployeeOfficeLocation();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const { data: employeesData } = useGetEmployees({ key: "", page: 1, size: 200 });
  const employeeOptions = mapToOptions(
    employeesData?.data ?? [],
    (emp) => `${emp.fullname} (${emp.employee_number})`,
    (emp) => emp.id,
  );

  const location = data?.data;

  const handleAssign = () => {
    if (!selectedEmployeeId) return;
    assignMutation.mutate(
      { employeeId: selectedEmployeeId, officeLocationId: id },
      { onSuccess: () => setSelectedEmployeeId("") },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setConfirmDelete(false);
        onClose();
      },
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Detail Lokasi Kantor" maxWidth="md">
        {/* Header */}
        <div className="flex items-center gap-4 pb-5 mb-2 border-b">
          <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-zinc-600" />
          </div>
          <div>
            <p className="font-semibold text-lg">{location?.name}</p>
            <p className="text-sm text-gray-500">{location?.address}</p>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-0 mt-4">
          <EditableField
            label="Nama"
            value={location?.name}
            onSave={(val) => updateMutation.mutate({ name: val })}
          />
          <EditableField
            label="Alamat"
            value={location?.address}
            onSave={(val) => updateMutation.mutate({ address: val })}
          />
          <EditableField
            label="Latitude"
            value={location?.lat?.toString()}
            onSave={(val) => {
              const num = parseFloat(val);
              if (!isNaN(num)) updateMutation.mutate({ lat: num });
            }}
          />
          <EditableField
            label="Longitude"
            value={location?.lng?.toString()}
            onSave={(val) => {
              const num = parseFloat(val);
              if (!isNaN(num)) updateMutation.mutate({ lng: num });
            }}
          />
          <EditableField
            label="Radius (meter)"
            value={location?.radius_meters?.toString()}
            onSave={(val) => {
              const num = parseInt(val, 10);
              if (!isNaN(num) && num >= 0) updateMutation.mutate({ radius: num });
            }}
          />

          <div className="flex flex-col w-full justify-start items-center pb-6 border-b border-gray-200">
            <div className="flex w-full justify-between gap-y-1 items-center">
              <label className="text-md font-semibold">Status Aktif</label>
              <Switch
                checked={location?.is_active ?? false}
                onChange={(val) => updateMutation.mutate({ is_active: val })}
              />
            </div>
            <div className="flex w-full justify-start mt-1">
              <p className="text-sm text-gray-500">
                {location?.is_active ? "Aktif" : "Tidak aktif"}
              </p>
            </div>
          </div>
        </div>

        {/* Assign Employee Section */}
        <div className="mt-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-1.5 mb-4">
            <Users size={15} className="text-gray-500" />
            <p className="text-md font-semibold">Karyawan Terdaftar</p>
          </div>

          {/* Assigned employees list */}
          <div className="space-y-2 mb-4">
            {location?.employees && location.employees.length > 0 ? (
              location.employees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0"
                >
                  <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-medium shrink-0">
                    {emp.fullname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{emp.fullname}</p>
                    <p className="text-xs text-gray-400">{emp.employee_number}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">Belum ada karyawan terdaftar</p>
            )}
          </div>

          {/* Assign form */}
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <SelectSearch
                label="Cari karyawan"
                value={selectedEmployeeId}
                options={employeeOptions}
                onChange={setSelectedEmployeeId}
              />
            </div>
            <Button
              onClick={handleAssign}
              loading={assignMutation.isPending}
              disabled={!selectedEmployeeId}
              className="mt-0.5"
            >
              Assign
            </Button>
          </div>
        </div>

        {/* Delete Section */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-md font-semibold">Hapus Lokasi</p>
              <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
            </div>
            <Button
              variant="outline"
              prefixIcon={<Trash2 size={16} />}
              onClick={() => setConfirmDelete(true)}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Hapus Lokasi Kantor"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Batal
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              Hapus
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus lokasi{" "}
          <span className="font-semibold">{location?.name}</span>? Tindakan ini
          tidak dapat dibatalkan.
        </p>
      </Modal>
    </>
  );
}
