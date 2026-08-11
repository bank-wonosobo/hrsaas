import { CheckFaceRes } from "@/schema/attendance-schema";
import { checkFace } from "@/services/attendance/check-face";

import { useQuery } from "@tanstack/react-query";

export const useCheckFace = () =>
  useQuery<CheckFaceRes>({
    queryKey: ["check-face"],
    queryFn: () => checkFace(),
  });
