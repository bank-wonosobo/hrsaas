import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deletePayroll } from "../services/payroll-service";

export function useDeletePayroll() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: string) => deletePayroll(id),
    onSuccess: () => {
      toast.success("Payroll berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["payrolls"], exact: false });
      router.push("/payrolls");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
