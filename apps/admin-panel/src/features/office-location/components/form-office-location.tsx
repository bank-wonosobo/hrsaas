"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useZodForm } from "@/hooks/use-zod-form";
import { PlusCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useCreateOfficeLocation } from "../hooks/use-create-office-location";
import {
  CreateOfficeLocation,
  CreateOfficeLocationSchema,
} from "../schemas/office-location-schema";

const MapPicker = dynamic(
  () => import("@/components/ui/map-picker/map-picker"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-2xl" />,
  },
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
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <PlusCircle />
        Tambah Lokasi
      </Button>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) handleClose();
          else setOpen(true);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tambah Lokasi Kantor</DialogTitle>
            <DialogDescription>
              Pilih titik pada peta lalu lengkapi informasi lokasi kantor.
            </DialogDescription>
          </DialogHeader>
          <form
            id="form-office-location"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="office-location-name">
                Nama Lokasi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="office-location-name"
                placeholder="Nama lokasi kantor"
                {...form.register("name")}
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Pilih Titik Lokasi</Label>
              <MapPicker
                defaultLat={typeof watchLat === "number" ? watchLat : undefined}
                defaultLng={typeof watchLng === "number" ? watchLng : undefined}
                onLocationChange={handleLocationChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="office-location-address">
                Alamat <span className="text-destructive">*</span>
              </Label>
              <Input
                id="office-location-address"
                placeholder="Alamat lokasi kantor"
                {...form.register("address")}
                aria-invalid={!!form.formState.errors.address}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["lat", "office-location-lat", "Latitude"],
                  ["lng", "office-location-lng", "Longitude"],
                ] as const
              ).map(([name, id, label]) => (
                <div className="space-y-2" key={name}>
                  <Label htmlFor={id}>
                    {label} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={id}
                    type="number"
                    step="any"
                    {...form.register(name)}
                    aria-invalid={!!form.formState.errors[name]}
                  />
                  {form.formState.errors[name] && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors[name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="office-location-radius">
                Radius (meter) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="office-location-radius"
                type="number"
                min="0"
                {...form.register("radius")}
                aria-invalid={!!form.formState.errors.radius}
              />
              {form.formState.errors.radius && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.radius.message}
                </p>
              )}
            </div>
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="form-office-location"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan Lokasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
