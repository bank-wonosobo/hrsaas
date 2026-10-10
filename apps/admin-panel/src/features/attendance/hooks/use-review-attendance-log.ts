import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewAttendanceLog } from "../services/review-attendance-log";
import { ReviewAttendanceLog } from "../schemas/attendance-schema";

export function useReviewAttendanceLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logID,
      request,
    }: {
      logID: string;
      request: ReviewAttendanceLog;
    }) => reviewAttendanceLog(logID, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["pending-attendance-logs"],
      });
    },
  });
}
