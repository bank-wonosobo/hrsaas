import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreatePosition } from "../schemas/position-schema";
import { createPosition } from "../services/create-position";

export const useCreatePosition = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreatePosition) =>
      await createPosition(request),
    onSuccess: async () => {
      // Simpan token ke localStorage atau state management
      queryClient.invalidateQueries({
        queryKey: ["positions"],
        exact: false,
      });
      toast.success("Berhasil membuat posisi / jabatan.");
      router.push("/companies/positions"); // Redirect ke dashboard atau halaman utama
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
