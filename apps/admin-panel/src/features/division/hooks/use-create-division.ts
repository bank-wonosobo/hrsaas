import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreateDivision } from "../schemas/division-schema";
import { createDivision } from "../services/create-division";

export const useCreateDivision = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateDivision) =>
      await createDivision(request),
    onSuccess: async () => {
      // Simpan token ke localStorage atau state management
      queryClient.invalidateQueries({
        queryKey: ["divisions"],
        exact: false,
      });
      toast.success("Berhasil membuat divisi.");
      router.push("/companies/divisions"); // Redirect ke dashboard atau halaman utama
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
