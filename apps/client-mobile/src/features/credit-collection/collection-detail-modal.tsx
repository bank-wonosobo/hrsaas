import AppModal from "@/components/ui/modal";
import { CreditCollectionVisitRecord } from "@/schema/credit-collection-schema";
import clsx from "clsx";
import { MapPin, MessageSquareText, Navigation } from "lucide-react-native";
import { Image, Linking, Pressable, Text, View } from "react-native";
import { COLLECTIBILITY_STYLE, formatVisitDate, getInitials } from "./collection-item";

interface Props {
  record: CreditCollectionVisitRecord | null;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="font-poppins-regular text-xs text-gray-400">
        {label}
      </Text>
      <Text
        numberOfLines={1}
        className="font-poppins-semibold text-xs text-secondary text-right pl-4 flex-1"
        style={{ textAlign: "right" }}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="font-poppins-semibold text-xs text-gray-400 uppercase mt-4 mb-1">
      {children}
    </Text>
  );
}

export default function CollectionDetailModal({ record, onClose }: Props) {
  if (!record) return null;

  const { pinjaman } = record;
  const collectibility = COLLECTIBILITY_STYLE[pinjaman.collectibility] ?? {
    label: pinjaman.collectibility,
    badge: "bg-gray-100",
    text: "text-gray-600",
  };

  const openMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${record.lat},${record.lng}`,
    );
  };

  return (
    <AppModal visible title="Detail Penagihan" onClose={onClose}>
      <View className="items-center mb-2">
        <View className="h-14 w-14 rounded-full bg-primary/10 items-center justify-center mb-2">
          <Text className="font-poppins-bold text-primary text-base">
            {getInitials(pinjaman.nasabah_name)}
          </Text>
        </View>
        <Text className="font-poppins-bold text-sm text-secondary">
          {pinjaman.nasabah_name}
        </Text>
        <Text className="font-poppins-regular text-xs text-gray-400">
          {pinjaman.no_pjm}
        </Text>
        <View
          className={clsx(
            "px-2 py-1 rounded-full mt-2",
            collectibility.badge,
          )}
        >
          <Text
            className={clsx(
              "font-poppins-semibold text-[10px]",
              collectibility.text,
            )}
          >
            {collectibility.label}
          </Text>
        </View>
      </View>

      {record.img_url ? (
        <Image
          source={{ uri: record.img_url }}
          className="w-full h-40 rounded-xl mt-3 bg-gray-100"
          resizeMode="cover"
        />
      ) : null}

      <SectionTitle>Riwayat Kunjungan</SectionTitle>
      <View className="bg-gray-50 rounded-xl px-3">
        <DetailRow
          label="Setoran Kunjungan"
          value={`Rp ${record.total_paid.toLocaleString("id-ID")}`}
        />
        <DetailRow label="Tanggal Kunjungan" value={formatVisitDate(record.created_at)} />
        {record.employee_name ? (
          <DetailRow label="Petugas" value={record.employee_name} />
        ) : null}
      </View>

      {record.commitment ? (
        <View className="flex-row items-start gap-2 bg-gray-50 rounded-xl p-3 mt-2">
          <MessageSquareText size={14} color="#9ca3af" style={{ marginTop: 1 }} />
          <Text className="font-poppins-regular text-xs text-gray-500 flex-1">
            {record.commitment}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={openMaps}
        className="flex-row items-center gap-2 bg-gray-50 rounded-xl p-3 mt-2 active:bg-gray-100"
      >
        <MapPin size={14} color="#9ca3af" />
        <Text
          numberOfLines={1}
          className="font-poppins-regular text-xs text-gray-500 flex-1"
        >
          {pinjaman.address}
        </Text>
        <Navigation size={14} color="#3f9aae" />
      </Pressable>

      <SectionTitle>Informasi Pinjaman</SectionTitle>
      <View className="bg-gray-50 rounded-xl px-3">
        <DetailRow label="Jenis Pinjaman" value={pinjaman.loan_type} />
        <DetailRow label="Unit" value={pinjaman.unit} />
        <DetailRow
          label="Plafon"
          value={`Rp ${pinjaman.loan_limit.toLocaleString("id-ID")}`}
        />
        <DetailRow
          label="Sisa Pinjaman"
          value={`Rp ${pinjaman.outstanding_balance.toLocaleString("id-ID")}`}
        />
        <DetailRow
          label="Tunggakan Pokok"
          value={`Rp ${pinjaman.overdue_principal.toLocaleString("id-ID")}`}
        />
        <DetailRow
          label="Tunggakan Bunga"
          value={`Rp ${pinjaman.overdue_interest.toLocaleString("id-ID")}`}
        />
        <DetailRow
          label="Total Tunggakan"
          value={`Rp ${pinjaman.overdue_total.toLocaleString("id-ID")}`}
        />
        <DetailRow label="Status Pinjaman" value={pinjaman.loan_status} />
      </View>
    </AppModal>
  );
}
