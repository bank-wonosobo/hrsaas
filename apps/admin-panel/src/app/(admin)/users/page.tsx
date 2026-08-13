import Title from "@/components/ui/title/title";
import ListUser from "@/features/user/components/list-user";
import MenuUser from "@/features/user/components/menu-user";
import { SearchUserRequest } from "@/features/user/schemas/auth-schema";
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

export default async function UserPage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const key = params.key || "";
  const page = params.page || 1;
  const size = params.size || 10;

  const search: SearchUserRequest = {
    key,
    page: Number(page),
    size: Number(size),
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["users", search.key, search.page, search.size],
    queryFn: () =>
      serverApi("users", {
        key: search.key,
        page: search.page,
        size: search.size,
      }),
  });

  return (
    <>
      <Title title="Data pengguna" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MenuUser />
        <ListUser search={search} />
      </HydrationBoundary>
    </>
  );
}
