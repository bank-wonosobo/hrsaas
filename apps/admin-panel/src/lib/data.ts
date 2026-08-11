import { Option } from "@/components/ui/select/select";

export const gender: Option[] = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

export const religion: Option[] = [
  { value: "Islam", label: "Islam" },
  { value: "Hindu", label: "Hindu" },
  { value: "Budha", label: "Budha" },
  { value: "Kristen", label: "Kristen" },
  { value: "Konghuchu", label: "Konghuchu" },
];

export const blood_type: Option[] = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
  { value: "O", label: "O" },
  { value: "O+", label: "O+" },
];

export const maritalStatus: Option[] = [
  { value: "BK", label: "BK" },
  { value: "K1", label: "K1" },
  { value: "K2", label: "K2" },
  { value: "TK1", label: "TK1" },
  { value: "TK2", label: "TK2" },
];

export const contractType: Option[] = [
  { value: "Direksi", label: "Direksi" },
  { value: "Komisaris", label: "Komisaris" },
  { value: "Tetap", label: "Karyawan Tetap" },
  { value: "Kontrak", label: "Karyawan Kontrak" },
  { value: "Outsourching", label: "Karyawan Outsourching" },
  { value: "Magang", label: "Magang" },
  { value: "Freelance", label: "Freelance" },
];

export const sanctionLevel: number[] = [1, 2, 3];

export const days = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export const months: Option[] = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export const salaryComponentTypeOptions: Option[] = [
  { value: "EARNING", label: "Penambah (Earning)" },
  { value: "DEDUCTION", label: "Pengurang (Deduction)" },
];

export const calculationTypeOptions: Option[] = [
  { value: "FIXED", label: "Nominal Tetap" },
  { value: "PERCENTAGE", label: "Persentase dari Gaji Pokok" },
  { value: "FORMULA", label: "Formula" },
  { value: "MANUAL", label: "Input Manual" },
];

export const payrollAdjustmentTypeOptions: Option[] = [
  { value: "BONUS", label: "Bonus" },
  { value: "THR", label: "THR" },
  { value: "JASPROD", label: "Jasa Produksi" },
  { value: "INCENTIVE", label: "Insentif" },
  { value: "CORRECTION", label: "Koreksi" },
];

export const paymentStatusOptions: Option[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SUCCESS", label: "Berhasil" },
  { value: "FAILED", label: "Gagal" },
];
