import Title from "@/components/ui/title/title";
import AnnouncementList from "@/features/announcement/components/announcement-list";
import { SearchAnnouncementRequest } from "@/features/announcement/schemas/announcement-schema";
import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

type Props = {
  searchParams: Promise<{ key?: string; page?: string; size?: string }>;
};

export default async function AnnouncementsPage({ searchParams }: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const search: SearchAnnouncementRequest = {
    key: params.key ?? "",
    page: Number(params.page ?? 1),
    size: Number(params.size ?? 10),
  };
  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["announcements", search.key, search.page, search.size],
    queryFn: () => serverApi("announcements", search),
  });

  return (
    <>
      <Title title="Pengumuman" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AnnouncementList search={search} />
      </HydrationBoundary>
    </>
  );
}
