import {
  ListAttendanceParams,
  listAttendance,
} from "@/services/attendance/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useGetAttendances(params: ListAttendanceParams) {
  return useQuery({
    queryKey: ["attendances", params],
    queryFn: () => listAttendance(params),
    placeholderData: keepPreviousData,
  });
}
