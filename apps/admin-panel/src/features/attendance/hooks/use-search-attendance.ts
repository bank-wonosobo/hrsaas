import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Attendance, SearchAttendanceRequest } from "../schemas/attendance-schema";
import { searchAttendance } from "../services/search-attendance";

export function useSearchAttendance(search: SearchAttendanceRequest) {
  return useQuery<PaginatedData<Attendance>>({
    queryKey: ["attendances", search],
    queryFn: () => searchAttendance(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
