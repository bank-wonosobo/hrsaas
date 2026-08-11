import Title from "@/components/ui/title/title";
import ListShift from "@/features/shift/components/list-shift";
import MenuShift from "@/features/shift/components/menu-shift";
import { SearchShiftRequest } from "@/features/shift/schemas/shift-schema";
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

export default async function ShiftsPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const key = params.key || "";
  const page = params.page || 1;
  const size = params.size || 10;

  const search: SearchShiftRequest = {
    key,
    page: Number(page),
    size: Number(size),
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["shifts", search.key, search.page, search.size],
    queryFn: () =>
      serverApi("shifts", {
        key: search.key,
        page: search.page,
        size: search.size,
      }),
  });

  return (
    <>
      <Title title="Daftar Shift" />
      <MenuShift />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListShift search={search} />
      </HydrationBoundary>
    </>
  );
}
