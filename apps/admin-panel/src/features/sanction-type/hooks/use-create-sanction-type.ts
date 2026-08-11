import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateSanctionType } from "../schemas/sanction-type-schema";
import { createSanctionType } from "../services/create-sanction-type";

export const useCreateSanctionType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateSanctionType) =>
      await createSanctionType(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sanction-types"],
        exact: false,
      });
      toast.success("Berhasil membuat jenis sanksi.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
