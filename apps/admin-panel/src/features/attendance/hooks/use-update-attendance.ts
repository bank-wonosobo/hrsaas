import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateAttendance } from "../schemas/attendance-schema";
import { updateAttendance } from "../services/update-attendance";

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateAttendance }) =>
      updateAttendance(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
  });
}
