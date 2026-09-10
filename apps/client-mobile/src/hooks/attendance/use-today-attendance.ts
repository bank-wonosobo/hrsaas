import { getTodayAttendance } from "@/services/attendance/today";
import { useQuery } from "@tanstack/react-query";

export function useTodayAttendance() {
  return useQuery({
    queryKey: ["attendances", "today"],
    queryFn: getTodayAttendance,
  });
}
