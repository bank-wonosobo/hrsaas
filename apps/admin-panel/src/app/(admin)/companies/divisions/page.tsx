import Title from "@/components/ui/title/title";
import ListDivision from "@/features/division/components/list-division";
import MenuDivision from "@/features/division/components/menu-division";
import { SearchDivisionRequest } from "@/features/division/schemas/division-schema";
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

export default async function DivisionPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const key = params.key || "";
  const page = params.page || 1;
  const size = params.size || 10;

  const search: SearchDivisionRequest = {
    key: key,
    page: Number(page),
    size: Number(size),
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["divisions", search.key, search.page, search.size],
    queryFn: () =>
      serverApi("divisions", {
        key: search.key,
        page: search.page,
        size: search.size,
      }),
  });

  return (
    <>
      <Title title="Daftar divisi" />
      <MenuDivision />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListDivision search={search} />
      </HydrationBoundary>
    </>
  );
}
