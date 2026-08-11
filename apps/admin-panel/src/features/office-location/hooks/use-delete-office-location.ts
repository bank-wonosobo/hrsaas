import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteOfficeLocation } from "../services/office-location-service";

export function useDeleteOfficeLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOfficeLocation(id),
    onSuccess: () => {
      toast.success("Lokasi kantor berhasil dihapus.");
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
