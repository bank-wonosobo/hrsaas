"use client";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useCreateOfficeLocation } from "../hooks/use-create-office-location";
import {
  CreateOfficeLocation,
  CreateOfficeLocationSchema,
} from "../schemas/office-location-schema";
import Button from "@/components/ui/button/button";

const MapPicker = dynamic(
  () => import("@/components/ui/map-picker/map-picker"),
  { ssr: false, loading: () => <div className="h-80 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-sm text-zinc-400">Memuat peta...</div> },
);

export function FormOfficeLocation() {
  const [open, setOpen] = useState(false);

  const form = useZodForm(CreateOfficeLocationSchema, {
    defaultValues: {
      name: "",
      address: "",
      lat: "" as unknown as number,
      lng: "" as unknown as number,
      radius: "" as unknown as number,
    },
  });

  const mutation = useCreateOfficeLocation();

  const handleClose = () => {
    setOpen(false);
    form.reset();
  };

  const onSubmit = (data: CreateOfficeLocation) => {
    mutation.mutate(data, { onSuccess: handleClose });
  };

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    form.setValue("lat", lat, { shouldValidate: true });
    form.setValue("lng", lng, { shouldValidate: true });
    if (address) form.setValue("address", address, { shouldValidate: true });
  };

  const watchLat = form.watch("lat");
  const watchLng = form.watch("lng");

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
        onClose={handleClose}
        title="Tambah Lokasi Kantor"
        maxWidth="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3 space-y-5">
          <Input
            label="Nama Lokasi"
            type="text"
            {...form.register("name")}
            error={form.formState.errors.name?.message}
          />

          {/* Map Picker */}
          <MapPicker
            defaultLat={typeof watchLat === "number" ? watchLat : undefined}
            defaultLng={typeof watchLng === "number" ? watchLng : undefined}
            onLocationChange={handleLocationChange}
          />

          <Input
            label="Alamat"
            type="text"
            {...form.register("address")}
            error={form.formState.errors.address?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              {...form.register("lat")}
              error={form.formState.errors.lat?.message}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              {...form.register("lng")}
              error={form.formState.errors.lng?.message}
            />
          </div>

          <Input
            label="Radius (meter)"
            type="number"
            min="0"
            {...form.register("radius")}
            error={form.formState.errors.radius?.message}
          />

          <Button loading={mutation.isPending}>Simpan</Button>
        </form>
      </Modal>
    </>
  );
}
