import { useQuery } from "@tanstack/react-query";
import { PaginatedData } from "@/lib/response";
import {
  AttendanceLog,
  SearchPendingAttendanceLogs,
} from "../schemas/attendance-schema";
import { searchPendingAttendanceLogs } from "../services/search-pending-attendance-logs";

export function usePendingAttendanceLogs(
  search: SearchPendingAttendanceLogs,
) {
  return useQuery<PaginatedData<AttendanceLog>>({
    queryKey: ["pending-attendance-logs", search],
    queryFn: () => searchPendingAttendanceLogs(search),
    placeholderData: (previousData) => previousData,
  });
}
