import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateShift } from "../schemas/shift-schema";
import { createShift } from "../services/shift-service";

export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateShift) => createShift(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"], exact: false });
      toast.success("Berhasil membuat shift.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
