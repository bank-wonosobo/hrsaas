import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateAnnouncement } from "../schemas/announcement-schema";
import { createAnnouncement, deleteAnnouncement, updateAnnouncement } from "../services/announcement-service";

function useAnnouncementMutation() {
  const queryClient = useQueryClient();
  return { queryClient };
}

export function useCreateAnnouncement() {
  const { queryClient } = useAnnouncementMutation();
  return useMutation({
    mutationFn: (request: CreateAnnouncement) => createAnnouncement(request),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["announcements"], exact: false }); toast.success("Pengumuman berhasil ditambahkan."); },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateAnnouncement() {
  const { queryClient } = useAnnouncementMutation();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CreateAnnouncement }) => updateAnnouncement(id, request),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["announcements"], exact: false }); toast.success("Pengumuman berhasil diubah."); },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteAnnouncement() {
  const { queryClient } = useAnnouncementMutation();
  return useMutation({
    mutationFn: (id: string) => deleteAnnouncement(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["announcements"], exact: false }); toast.success("Pengumuman berhasil dihapus."); },
    onError: (error: Error) => toast.error(error.message),
  });
}
