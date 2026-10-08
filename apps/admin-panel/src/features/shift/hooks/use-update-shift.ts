"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UpdateShift } from "../schemas/shift-schema";
import { updateShift } from "../services/shift-service";

export function useUpdateShift(id: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateShift) => updateShift(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shifts"] });
      await queryClient.invalidateQueries({ queryKey: ["shifts", id] });
      toast.success("Shift berhasil diperbarui");
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
