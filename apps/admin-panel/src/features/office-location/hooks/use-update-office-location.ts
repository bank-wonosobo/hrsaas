import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdateOfficeLocation } from "../schemas/office-location-schema";
import { updateOfficeLocation } from "../services/office-location-service";

export function useUpdateOfficeLocation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateOfficeLocation) =>
      updateOfficeLocation(id, request),
    onSuccess: () => {
      toast.success("Lokasi kantor berhasil diperbarui.");
      queryClient.invalidateQueries({
        queryKey: ["office-locations"],
        exact: false,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
