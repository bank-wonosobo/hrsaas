import Title from "@/components/ui/title/title";
import ListPosition from "@/features/position/components/list-position";
import MenuPosition from "@/features/position/components/menu-position";
import { SearchPositionRequest } from "@/features/position/schemas/position-schema";
import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

type Props = {
  searchParams: Promise<{
    key?: string;
    page?: string;
    size?: string;
  }>;
};

export default async function PositionPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const key = params.key || "";
  const page = params.page || 1;
  const size = params.size || 10;

  const search: SearchPositionRequest = {
    key: key,
    page: Number(page),
    size: Number(size),
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["positions", search.key, search.page, search.size],
    queryFn: () =>
      serverApi("positions", {
        key: search.key,
        page: search.page,
        size: search.size,
      }),
  });

  return (
    <>
      <Title title="Daftar jabatan / posisi" />
      <MenuPosition />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListPosition search={search} />
      </HydrationBoundary>
    </>
  );
}
