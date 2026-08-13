import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateOfficeLocation } from "../schemas/office-location-schema";
import { createOfficeLocation } from "../services/office-location-service";

export function useCreateOfficeLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateOfficeLocation) => createOfficeLocation(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["office-locations"],
        exact: false,
      });
      toast.success("Berhasil membuat lokasi kantor.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
