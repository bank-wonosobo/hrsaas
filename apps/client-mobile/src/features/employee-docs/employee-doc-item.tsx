import { EmployeeDocument } from "@/schema/employee-docs-schema";
import {
  BadgeCheck,
  Contact,
  FileText,
  GraduationCap,
  IdCard,
  LucideIcon,
  ShieldCheck,
} from "lucide-react-native";
import { Linking, Pressable, Text, View } from "react-native";

interface Props {
  document: EmployeeDocument;
}

const docTypeIcons: Record<string, LucideIcon> = {
  KTP: IdCard,
  NPWP: Contact,
  Ijazah: GraduationCap,
  BPJS: ShieldCheck,
  "Kontrak Kerja": BadgeCheck,
};

function formatDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function EmployeeDocItem({ document }: Props) {
  const Icon = docTypeIcons[document.doc_type] ?? FileText;

  return (
    <View className="bg-white rounded-2xl p-4 gap-3 border border-gray-100 shadow-sm shadow-gray-200/50">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Icon size={22} strokeWidth={1.75} color="#3f9aae" />
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-poppins-semibold text-secondary text-sm"
          >
            {document.doc_name}
          </Text>
          <Text className="font-poppins-regular text-[11px] text-gray-400 mt-0.5">
            {document.doc_type}
            {document.doc_number ? ` · ${document.doc_number}` : ""}
          </Text>
        </View>
      </View>

      {!!document.issued && (
        <Text className="font-poppins-regular text-xs text-gray-500">
          Diterbitkan {formatDate(document.issued)}
        </Text>
      )}

      <Pressable
        onPress={() => Linking.openURL(document.file_url)}
        className="flex-row items-center gap-2 border-t border-dashed border-gray-200 pt-3"
      >
        <FileText size={14} color="#3f9aae" />
        <Text className="font-poppins-medium text-xs text-primary">
          Lihat Dokumen
        </Text>
      </Pressable>
    </View>
  );
}
