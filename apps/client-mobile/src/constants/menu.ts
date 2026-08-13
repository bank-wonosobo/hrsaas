import { Href } from "expo-router";
import {
  BanknoteArrowDown,
  BookAlert,
  Calendar1,
  FileStack,
  LucideIcon,
  MapPinned,
  MessageCircleCheck,
  SquareArrowDown,
  SquareArrowUp,
  Users,
} from "lucide-react-native";

export interface Menu {
  id: string;
  title: string;
  icon: LucideIcon;
  route: Href;
}

export const MENUS: Menu[] = [
  {
    id: "check-in",
    title: "Check-in",
    icon: SquareArrowDown,
    route: {
      pathname: "/attendances/area",
      params: {
        type: "check-in",
      },
    },
  },
  {
    id: "check-out",
    title: "Check-out",
    icon: SquareArrowUp,
    route: {
      pathname: "/attendances/area",
      params: {
        type: "check-out",
      },
    },
  },
  {
    id: "time-off",
    title: "Izin & Cuti",
    icon: Calendar1,
    route: "/time-offs",
  },
  {
    id: "time-off-approval",
    title: "Persetujuan Cuti",
    icon: MessageCircleCheck,
    route: "/time-off-approvals",
  },
  {
    id: "sanction",
    title: "Sanksi Karyawan",
    icon: BookAlert,
    route: "/sanctions",
  },
  {
    id: "visits",
    title: "Kunjungan Client",
    icon: MapPinned,
    route: "/visits",
  },
  {
    id: "credit-collection",
    title: "Penagihan Kredit",
    icon: BanknoteArrowDown,
    route: "/credit-collections",
  },
  {
    id: "employee-docs",
    title: "Dokumen Karyawan",
    icon: FileStack,
    route: "/employee-docs",
  },
  {
    id: "employees",
    title: "Data Karyawan",
    icon: Users,
    route: "/employees",
  },
];
