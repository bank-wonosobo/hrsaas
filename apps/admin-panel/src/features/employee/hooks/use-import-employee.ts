"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { importEmployeeExcel } from "../services/employee-service";

export const useImportEmployee = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importEmployeeExcel(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"], exact: false });
      toast.success(`Berhasil mengimport ${data.data} data karyawan.`);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
