import { ResponseData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Attendance } from "../schemas/attendance-schema";
import { getAttendanceDetail } from "../services/get-attendance-detail";

export function useGetAttendanceDetail(id: string | null) {
  return useQuery<ResponseData<Attendance>>({
    queryKey: ["attendance-detail", id],
    queryFn: () => getAttendanceDetail(id!),
    enabled: !!id,
  });
}
