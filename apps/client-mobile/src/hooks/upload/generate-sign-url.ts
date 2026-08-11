import { useToast } from "@/context/toast-context";
import { GenerateSignUrl } from "@/schema/upload-schema";
import { generateSignUrl } from "@/services/upload/generate-sign-url";
import { useMutation } from "@tanstack/react-query";

export function useGenerateSignUrl() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (request: GenerateSignUrl) => generateSignUrl(request),
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    onError(err) {
      showToast(err.message || "Gagal menyiapkan upload", "error");
    },
  });
}
