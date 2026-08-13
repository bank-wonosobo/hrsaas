import Title from "@/components/ui/title/title";
import ListTimeOffType from "@/features/time-off-type/components/list-time-off-type";
import MenuTimeOffType from "@/features/time-off-type/components/menu-time-off-type";
import { TimeOffType } from "@/features/time-off-type/schemas/time-off-type-schema";
import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

export default async function TimeOffTypePage(): Promise<React.ReactNode> {
  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["time-off-types"],
    queryFn: async () => {
      const res = await serverApi<{ data: TimeOffType[] }>("time-off-types");
      return res.data;
    },
  });

  return (
    <>
      <Title title="Daftar jenis cuti" />
      <MenuTimeOffType />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListTimeOffType />
      </HydrationBoundary>
    </>
  );
}
