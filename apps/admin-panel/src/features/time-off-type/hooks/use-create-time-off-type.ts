import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateTimeOffType } from "../schemas/time-off-type-schema";
import { createTimeOffType } from "../services/create-time-off-type-service";

export const useCreateTimeOffType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateTimeOffType) =>
      await createTimeOffType(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["time-off-types"],
        exact: false,
      });
      toast.success("Berhasil membuat jenis cuti.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
