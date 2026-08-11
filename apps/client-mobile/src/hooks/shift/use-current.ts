import { PaginatedData } from "@/lib/response";
import { Shift } from "@/schema/shift-schema";
import { currentShift } from "@/services/shift/current";

import { useQuery } from "@tanstack/react-query";

export const useCurrentShift = () =>
  useQuery<PaginatedData<Shift>>({
    queryKey: ["current-shift"],
    queryFn: () => currentShift(),
  });
