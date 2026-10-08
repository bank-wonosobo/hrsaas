import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import ListOfficeLocation from "@/features/office-location/components/list-office-location";
import MenuOfficeLocation from "@/features/office-location/components/menu-office-location";
import { SearchOfficeLocationRequest } from "@/features/office-location/schemas/office-location-schema";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

type Props = {
  searchParams: Promise<{
    key?: string;
    page?: string;
    size?: string;
  }>;
};

export default async function OfficeLocationsPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const key = params.key || "";
  const page = params.page || 1;
  const size = params.size || 10;

  const search: SearchOfficeLocationRequest = {
    key,
    page: Number(page),
    size: Number(size),
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["office-locations", search.key, search.page, search.size],
    queryFn: () =>
      serverApi("office-locations", {
        key: search.key,
        page: search.page,
        size: search.size,
      }),
  });

  return (
    <>
      <header className="mt-4 mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Daftar Lokasi Kantor
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola lokasi kantor dan karyawan yang ditugaskan ke setiap lokasi.
        </p>
      </header>
      <MenuOfficeLocation />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListOfficeLocation search={search} />
      </HydrationBoundary>
    </>
  );
}
