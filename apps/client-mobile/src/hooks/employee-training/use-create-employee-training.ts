import { useToast } from "@/context/toast-context";
import {
  EmployeeTrainingCertificate,
  EmployeeTrainingPayload,
} from "@/services/employee-training/types";
import { createEmployeeTraining } from "@/services/employee-training/create";
import { uploadEmployeeTrainingCertificate } from "@/services/employee-training/upload-certificate";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateEmployeeTraining() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      payload: EmployeeTrainingPayload;
      certificate?: EmployeeTrainingCertificate;
    }) => {
      const certificate_url = request.certificate
        ? await uploadEmployeeTrainingCertificate(request.certificate)
        : request.payload.certificate_url;

      return createEmployeeTraining({
        ...request.payload,
        certificate_url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-trainings"] });
      showToast("Riwayat pelatihan berhasil ditambahkan", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Gagal menambahkan riwayat pelatihan", "error");
    },
  });
}
