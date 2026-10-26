import { useToast } from "@/context/toast-context";
import {
  EmployeeTrainingCertificate,
  EmployeeTrainingPayload,
} from "@/services/employee-training/types";
import { updateEmployeeTraining } from "@/services/employee-training/update";
import { uploadEmployeeTrainingCertificate } from "@/services/employee-training/upload-certificate";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateEmployeeTraining() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      id: string;
      payload: EmployeeTrainingPayload;
      certificate?: EmployeeTrainingCertificate;
    }) => {
      const certificate_url = request.certificate
        ? await uploadEmployeeTrainingCertificate(request.certificate)
        : request.payload.certificate_url;

      return updateEmployeeTraining(request.id, {
        ...request.payload,
        certificate_url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-trainings"] });
      showToast("Riwayat pelatihan berhasil diperbarui", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Gagal memperbarui riwayat pelatihan", "error");
    },
  });
}
