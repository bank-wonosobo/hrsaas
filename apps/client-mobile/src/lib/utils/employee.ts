import { Employee } from "@/features/employee/employee-schema";

export function getEmployeePosition(employee: Employee): string | undefined {
  const contracts = employee.contracts ?? [];
  const activeContract =
    contracts.find((contract) => contract.is_active) ?? contracts[0];
  return activeContract?.position?.name;
}

export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}
