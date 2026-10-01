import Title from "@/components/ui/title/title";
import ExportAttendance from "@/features/attendance/components/export-attendance";
import ListAttendance from "@/features/attendance/components/list-attendance";
import MenuAttendance from "@/features/attendance/components/menu-attendance";

import { SearchAttendanceRequest } from "@/features/attendance/schemas/attendance-schema";
import { serverApi } from "@/lib/server-api";
import { getQueryclient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type React from "react";

type Props = {
  searchParams: Promise<{
    page?: string;
    size?: string;
    employee_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }>;
};

function getTodayInJakarta() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

export default async function AttendancePage({
  searchParams,
}: Props): Promise<React.ReactNode> {
  const params = await searchParams;
  const today = getTodayInJakarta();

  const search: SearchAttendanceRequest = {
    page: Number(params.page || 1),
    size: Number(params.size || 10),
    employee_id: params.employee_id || "",
    start_date: params.start_date || today,
    end_date: params.end_date || today,
    status: params.status || "",
  };

  const queryClient = getQueryclient();

  await queryClient.prefetchQuery({
    queryKey: ["attendances", search],
    queryFn: () =>
      serverApi("attendances", {
        page: search.page,
        size: search.size,
        employee_id: search.employee_id,
        start_date: search.start_date,
        end_date: search.end_date,
        status: search.status,
      }),
  });

  return (
    <>
      <Title title="Kehadiran Karyawan" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MenuAttendance
          search={search}
          exportAction={<ExportAttendance search={search} />}
        />
        <ListAttendance search={search} />
      </HydrationBoundary>
    </>
  );
}
