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
