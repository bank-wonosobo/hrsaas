import { useCurrentEmployee } from "@/hooks/user/use-current-employee";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View className="flex-row justify-between py-2.5 border-b border-gray-100">
      <Text className="font-poppins-regular text-xs text-gray-400">
        {label}
      </Text>
      <Text
        numberOfLines={2}
        className="font-poppins-medium text-xs text-text flex-1 text-right ml-4"
      >
        {value || "-"}
      </Text>
    </View>
  );
}

function formatDate(dateMs?: number | null) {
  if (!dateMs) return "-";
  return new Date(dateMs).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatCurrency(amount?: number | null) {
  if (!amount) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PersonalDataPage() {
  const { data: employee, isLoading } = useCurrentEmployee();
  const activeContract =
    employee?.contracts?.find((contract) => contract.is_active) ??
    employee?.contracts?.[0];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#3f9aae" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="p-4 pb-10">
      <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
        <Text className="font-poppins-semibold text-sm text-secondary mb-2">
          Data Pribadi
        </Text>
        <InfoRow label="Nama Lengkap" value={employee?.fullname} />
        <InfoRow label="Nomor Karyawan" value={employee?.employee_number} />
        <InfoRow label="Jenis Kelamin" value={employee?.gender} />
        <InfoRow label="Tempat Lahir" value={employee?.birth_place} />
        <InfoRow
          label="Tanggal Lahir"
          value={formatDate(employee?.birth_date)}
        />
        <InfoRow label="No. KTP" value={employee?.identity_number} />
        <InfoRow label="Golongan Darah" value={employee?.blood_type} />
        <InfoRow label="Status Pernikahan" value={employee?.marital_status} />
        <InfoRow label="Agama" value={employee?.religion} />
        <InfoRow label="No. Telepon" value={employee?.phone} />
        <InfoRow label="Alamat" value={employee?.address} />
        <InfoRow label="Kota" value={employee?.city} />
      </View>

      {!!activeContract && (
        <View className="bg-white rounded-2xl p-4 border border-gray-100">
          <Text className="font-poppins-semibold text-sm text-secondary mb-2">
            Informasi Pekerjaan
          </Text>
          <InfoRow label="Divisi" value={activeContract.division?.name} />
          <InfoRow label="Posisi" value={activeContract.position?.name} />
          <InfoRow
            label="Tipe Kontrak"
            value={activeContract.contract_type}
          />
          <InfoRow label="Status" value={activeContract.employee_status} />
          <InfoRow
            label="Mulai Kontrak"
            value={formatDate(activeContract.start_date)}
          />
          <InfoRow
            label="Selesai Kontrak"
            value={
              activeContract.end_date
                ? formatDate(activeContract.end_date)
                : "Tidak Ditentukan"
            }
          />
          <InfoRow label="Gaji" value={formatCurrency(activeContract.salary)} />
        </View>
      )}
    </ScrollView>
  );
}
