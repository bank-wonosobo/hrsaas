import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CreateEmployee } from "../schemas/employee-schema";
import { createEmployee } from "../services/employee-service";

export const useCrateEmployee = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateEmployee) =>
      await createEmployee(request),
    onSuccess: async () => {
      // Simpan token ke localStorage atau state management
      queryClient.invalidateQueries({
        queryKey: ["employees"],
        exact: false,
      });
      toast.success("Berhasil membuat karyawan.");
      router.push("/employees"); // Redirect ke dashboard atau halaman utama
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
