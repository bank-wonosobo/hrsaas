import { EmployeeSanction } from "@/schema/sanction-schema";

export function isSanctionActive(
  sanction: EmployeeSanction,
  now: number,
): boolean {
  return !sanction.end_date || sanction.end_date > now;
}
