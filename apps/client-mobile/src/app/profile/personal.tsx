import BottomSheet from "@/components/ui/bottom-sheet";
import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import { useCurrentEmployee } from "@/hooks/user/use-current-employee";
import { useUpdateCurrentEmployee } from "@/hooks/user/use-update-current-employee";
import { UpdateCurrentEmployeeDto } from "@/services/user/update-current";
import clsx from "clsx";
import { Check, ChevronDown, Pencil } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type EditableFieldKey =
  | "fullname"
  | "email"
  | "phone"
  | "gender"
  | "birth_place"
  | "birth_date"
  | "identity_number"
  | "blood_type"
  | "marital_status"
  | "religion"
  | "address"
  | "city"
  | "timezone";

interface EditableFieldConfig {
  key: EditableFieldKey;
  label: string;
  type: "text" | "phone" | "email" | "select" | "date" | "textarea";
  placeholder?: string;
  options?: { label: string; value: string }[];
}

const EDITABLE_FIELDS: Record<EditableFieldKey, EditableFieldConfig> = {
  fullname: {
    key: "fullname",
    label: "Nama Lengkap",
    type: "text",
    placeholder: "Masukkan nama lengkap",
  },
  email: {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "contoh: user@gmail.com",
  },
  phone: {
    key: "phone",
    label: "No. Telepon",
    type: "phone",
    placeholder: "contoh: 08123456789",
  },
  gender: {
    key: "gender",
    label: "Jenis Kelamin",
    type: "select",
    options: [
      { label: "Laki-laki", value: "Laki-laki" },
      { label: "Perempuan", value: "Perempuan" },
    ],
  },
  birth_place: {
    key: "birth_place",
    label: "Tempat Lahir",
    type: "text",
    placeholder: "Masukkan tempat lahir",
  },
  birth_date: {
    key: "birth_date",
    label: "Tanggal Lahir",
    type: "date",
  },
  identity_number: {
    key: "identity_number",
    label: "No. KTP / NIK",
    type: "text",
    placeholder: "Masukkan 16 digit nomor KTP",
  },
  blood_type: {
    key: "blood_type",
    label: "Golongan Darah",
    type: "select",
    options: [
      { label: "A", value: "A" },
      { label: "B", value: "B" },
      { label: "AB", value: "AB" },
      { label: "O", value: "O" },
      { label: "A+", value: "A+" },
      { label: "A-", value: "A-" },
      { label: "B+", value: "B+" },
      { label: "B-", value: "B-" },
      { label: "AB+", value: "AB+" },
      { label: "AB-", value: "AB-" },
      { label: "O+", value: "O+" },
      { label: "O-", value: "O-" },
      { label: "-", value: "-" },
    ],
  },
  marital_status: {
    key: "marital_status",
    label: "Status Pernikahan",
    type: "select",
    options: [
      { label: "K-0 (Kawin / Menikah - 0 Tanggungan)", value: "K-0" },
      { label: "K-1 (Kawin / Menikah - 1 Tanggungan)", value: "K-1" },
      { label: "K-2 (Kawin / Menikah - 2 Tanggungan)", value: "K-2" },
      { label: "K-3 (Kawin / Menikah - 3 Tanggungan)", value: "K-3" },
      { label: "TK-0 (Tidak Kawin / Lajang - 0 Tanggungan)", value: "TK-0" },
      { label: "TK-1 (Tidak Kawin / Lajang - 1 Tanggungan)", value: "TK-1" },
      { label: "TK-2 (Tidak Kawin / Lajang - 2 Tanggungan)", value: "TK-2" },
      { label: "TK-3 (Tidak Kawin / Lajang - 3 Tanggungan)", value: "TK-3" },
      { label: "K/I/0 (Kawin Istri Bekerja - 0 Tanggungan)", value: "K/I/0" },
      { label: "K/I/1 (Kawin Istri Bekerja - 1 Tanggungan)", value: "K/I/1" },
      { label: "K/I/2 (Kawin Istri Bekerja - 2 Tanggungan)", value: "K/I/2" },
      { label: "K/I/3 (Kawin Istri Bekerja - 3 Tanggungan)", value: "K/I/3" },
      { label: "Single (Belum Menikah)", value: "Single" },
      { label: "Married (Menikah)", value: "Married" },
      { label: "Divorced (Cerai)", value: "Divorced" },
      { label: "Widowed (Duda/Janda)", value: "Widowed" },
    ],
  },
  religion: {
    key: "religion",
    label: "Agama",
    type: "select",
    options: [
      { label: "Islam", value: "Islam" },
      { label: "Kristen", value: "Kristen" },
      { label: "Katolik", value: "Katolik" },
      { label: "Hindu", value: "Hindu" },
      { label: "Buddha", value: "Buddha" },
      { label: "Konghucu", value: "Konghucu" },
      { label: "None / Lainnya", value: "None" },
    ],
  },
  address: {
    key: "address",
    label: "Alamat",
    type: "textarea",
    placeholder: "Masukkan alamat lengkap",
  },
  city: {
    key: "city",
    label: "Kota",
    type: "text",
    placeholder: "contoh: Wonosobo",
  },
  timezone: {
    key: "timezone",
    label: "Zona Waktu (Timezone)",
    type: "select",
    options: [
      { label: "WIB (Asia/Jakarta - UTC+7)", value: "Asia/Jakarta" },
      { label: "WITA (Asia/Makassar - UTC+8)", value: "Asia/Makassar" },
      { label: "WIT (Asia/Jayapura - UTC+9)", value: "Asia/Jayapura" },
      { label: "UTC", value: "UTC" },
    ],
  },
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

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

function timestampToYMD(dateMs?: number | null): string {
  if (!dateMs) return "";
  const d = new Date(dateMs);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function InfoRow({
  label,
  value,
  editable = false,
  onEdit,
}: {
  label: string;
  value?: string | null;
  editable?: boolean;
  onEdit?: () => void;
}) {
  return (
    <Pressable
      disabled={!editable}
      onPress={onEdit}
      className={clsx(
        "flex-row items-center justify-between py-3 border-b border-gray-100",
        editable && "active:bg-gray-50/80 -mx-2 px-2 rounded-xl",
      )}
    >
      <View className="flex-1 pr-2">
        <Text className="font-poppins-regular text-xs text-gray-400">
          {label}
        </Text>
        <Text
          numberOfLines={2}
          className="font-poppins-medium text-xs text-text mt-0.5"
        >
          {value || "-"}
        </Text>
      </View>

      {editable && (
        <View className="h-7 w-7 rounded-full bg-primary/10 items-center justify-center ml-2">
          <Pencil size={12} color="#3f9aae" />
        </View>
      )}
    </Pressable>
  );
}

export default function PersonalDataPage() {
  const { data: employee, isLoading } = useCurrentEmployee();
  const { mutate: updateEmployee, isPending } = useUpdateCurrentEmployee();

  const [activeEditField, setActiveEditField] =
    useState<EditableFieldKey | null>(null);
  const [fieldValue, setFieldValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Date selection state
  const [selectedYear, setSelectedYear] = useState<number>(1995);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [pickerModalType, setPickerModalType] = useState<
    "day" | "month" | "year" | null
  >(null);

  const activeContract =
    employee?.contracts?.find((contract) => contract.is_active) ??
    employee?.contracts?.[0];

  const handleOpenEdit = (fieldKey: EditableFieldKey) => {
    setActiveEditField(fieldKey);
    setErrorMessage(null);

    let initialVal = "";
    if (fieldKey === "fullname") initialVal = employee?.fullname ?? "";
    else if (fieldKey === "email") initialVal = employee?.user?.email ?? "";
    else if (fieldKey === "phone") initialVal = employee?.phone ?? "";
    else if (fieldKey === "gender") initialVal = employee?.gender ?? "";
    else if (fieldKey === "birth_place")
      initialVal = employee?.birth_place ?? "";
    else if (fieldKey === "identity_number")
      initialVal = employee?.identity_number ?? "";
    else if (fieldKey === "blood_type") initialVal = employee?.blood_type ?? "";
    else if (fieldKey === "marital_status")
      initialVal = employee?.marital_status ?? "";
    else if (fieldKey === "religion") initialVal = employee?.religion ?? "";
    else if (fieldKey === "address") initialVal = employee?.address ?? "";
    else if (fieldKey === "city") initialVal = employee?.city ?? "";
    else if (fieldKey === "timezone") initialVal = employee?.timezone ?? "UTC";
    else if (fieldKey === "birth_date") {
      initialVal = timestampToYMD(employee?.birth_date);
      if (employee?.birth_date) {
        const d = new Date(employee.birth_date);
        setSelectedYear(d.getUTCFullYear());
        setSelectedMonth(d.getUTCMonth() + 1);
        setSelectedDay(d.getUTCDate());
      } else {
        setSelectedYear(1995);
        setSelectedMonth(1);
        setSelectedDay(1);
      }
    }

    setFieldValue(initialVal);
  };

  const handleCloseEdit = () => {
    setActiveEditField(null);
    setFieldValue("");
    setErrorMessage(null);
  };

  // Sync date value when picker state changes
  useEffect(() => {
    if (activeEditField === "birth_date") {
      const yStr = String(selectedYear);
      const mStr = String(selectedMonth).padStart(2, "0");
      const dStr = String(selectedDay).padStart(2, "0");
      setFieldValue(`${yStr}-${mStr}-${dStr}`);
    }
  }, [selectedYear, selectedMonth, selectedDay, activeEditField]);

  // Days in selected month/year
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Adjust day if it exceeds days in month
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth, selectedDay]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list: number[] = [];
    for (let y = currentYear - 17; y >= 1940; y--) {
      list.push(y);
    }
    return list;
  }, []);

  const handleSave = () => {
    if (!activeEditField) return;

    const trimmedValue = fieldValue.trim();
    if (!trimmedValue) {
      setErrorMessage(
        `${EDITABLE_FIELDS[activeEditField].label} tidak boleh kosong`,
      );
      return;
    }

    if (activeEditField === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        setErrorMessage("Format email tidak valid");
        return;
      }
    }

    const payload: UpdateCurrentEmployeeDto = {
      [activeEditField]: trimmedValue,
    };

    updateEmployee(payload, {
      onSuccess: () => {
        handleCloseEdit();
      },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#3f9aae" />
      </View>
    );
  }

  const currentFieldConfig = activeEditField
    ? EDITABLE_FIELDS[activeEditField]
    : null;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Data Pribadi */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm shadow-gray-200/50">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-poppins-semibold text-sm text-secondary">
              Data Pribadi
            </Text>
            <Text className="font-poppins-regular text-[11px] text-gray-400">
              Ketuk untuk mengedit
            </Text>
          </View>

          <InfoRow
            label="Nama Lengkap"
            value={employee?.fullname}
            editable
            onEdit={() => handleOpenEdit("fullname")}
          />
          <InfoRow
            label="Email"
            value={employee?.user?.email}
            editable
            onEdit={() => handleOpenEdit("email")}
          />
          <InfoRow
            label="No. Telepon"
            value={employee?.phone}
            editable
            onEdit={() => handleOpenEdit("phone")}
          />
          <InfoRow
            label="Jenis Kelamin"
            value={employee?.gender}
            editable
            onEdit={() => handleOpenEdit("gender")}
          />
          <InfoRow
            label="Tempat Lahir"
            value={employee?.birth_place}
            editable
            onEdit={() => handleOpenEdit("birth_place")}
          />
          <InfoRow
            label="Tanggal Lahir"
            value={formatDate(employee?.birth_date)}
            editable
            onEdit={() => handleOpenEdit("birth_date")}
          />
          <InfoRow
            label="No. KTP / NIK"
            value={employee?.identity_number}
            editable
            onEdit={() => handleOpenEdit("identity_number")}
          />
          <InfoRow
            label="Golongan Darah"
            value={employee?.blood_type}
            editable
            onEdit={() => handleOpenEdit("blood_type")}
          />
          <InfoRow
            label="Status Pernikahan"
            value={employee?.marital_status}
            editable
            onEdit={() => handleOpenEdit("marital_status")}
          />
          <InfoRow
            label="Agama"
            value={employee?.religion}
            editable
            onEdit={() => handleOpenEdit("religion")}
          />
          <InfoRow
            label="Alamat"
            value={employee?.address}
            editable
            onEdit={() => handleOpenEdit("address")}
          />
          <InfoRow
            label="Kota"
            value={employee?.city}
            editable
            onEdit={() => handleOpenEdit("city")}
          />
          <InfoRow
            label="Timezone"
            value={employee?.timezone}
            editable
            onEdit={() => handleOpenEdit("timezone")}
          />
          <InfoRow label="Nomor Karyawan" value={employee?.employee_number} />
        </View>

        {/* Informasi Pekerjaan */}
        {!!activeContract && (
          <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm shadow-gray-200/50">
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
            <InfoRow
              label="Gaji"
              value={formatCurrency(activeContract.salary)}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Sheet Edit per Item */}
      <BottomSheet
        visible={!!activeEditField}
        title={
          currentFieldConfig ? `Ubah ${currentFieldConfig.label}` : "Ubah Data"
        }
        onClose={handleCloseEdit}
      >
        <View className="pt-2 pb-6">
          {currentFieldConfig?.type === "text" && (
            <FormField
              label={currentFieldConfig.label}
              required
              error={errorMessage ?? undefined}
            >
              <Input
                value={fieldValue}
                onChangeText={(text) => {
                  setFieldValue(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={currentFieldConfig.placeholder}
                autoFocus
              />
            </FormField>
          )}

          {currentFieldConfig?.type === "textarea" && (
            <FormField
              label={currentFieldConfig.label}
              required
              error={errorMessage ?? undefined}
            >
              <TextInput
                value={fieldValue}
                onChangeText={(text) => {
                  setFieldValue(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={currentFieldConfig.placeholder}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className={clsx(
                  "rounded-2xl border bg-white px-4 py-3 font-poppins-regular text-xs text-text min-h-[100px]",
                  errorMessage ? "border-red-500" : "border-gray-200",
                )}
                autoFocus
              />
            </FormField>
          )}

          {currentFieldConfig?.type === "email" && (
            <FormField
              label={currentFieldConfig.label}
              required
              error={errorMessage ?? undefined}
            >
              <Input
                value={fieldValue}
                onChangeText={(text) => {
                  setFieldValue(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={currentFieldConfig.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
            </FormField>
          )}

          {currentFieldConfig?.type === "phone" && (
            <FormField
              label={currentFieldConfig.label}
              required
              error={errorMessage ?? undefined}
            >
              <Input
                value={fieldValue}
                onChangeText={(text) => {
                  setFieldValue(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={currentFieldConfig.placeholder}
                keyboardType="phone-pad"
                autoFocus
              />
            </FormField>
          )}

          {currentFieldConfig?.type === "select" && (
            <View className="mb-4">
              <Text className="font-poppins-medium text-xs text-gray-500 mb-2">
                Pilih {currentFieldConfig.label}
              </Text>
              <View className="gap-2">
                {currentFieldConfig.options?.map((option) => {
                  const isSelected =
                    fieldValue.trim().toLowerCase() ===
                    option.value.trim().toLowerCase();
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setFieldValue(option.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className={clsx(
                        "flex-row items-center justify-between p-3.5 rounded-2xl border transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 bg-white",
                      )}
                    >
                      <Text
                        className={clsx(
                          "font-poppins-medium text-xs",
                          isSelected ? "text-primary" : "text-text",
                        )}
                      >
                        {option.label}
                      </Text>
                      {isSelected && (
                        <View className="h-5 w-5 rounded-full bg-primary items-center justify-center">
                          <Check size={12} color="white" strokeWidth={3} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
              {!!errorMessage && (
                <Text className="font-poppins-regular text-xs text-red-500 mt-2">
                  {errorMessage}
                </Text>
              )}
            </View>
          )}

          {currentFieldConfig?.type === "date" && (
            <View className="mb-4">
              <Text className="font-poppins-medium text-xs text-gray-500 mb-2">
                Pilih Tanggal, Bulan, dan Tahun
              </Text>

              {/* 3 Selector Dropdowns: Hari, Bulan, Tahun */}
              <View className="flex-row gap-2 mb-3">
                {/* Tanggal */}
                <Pressable
                  onPress={() => setPickerModalType("day")}
                  className="flex-1 flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-3 py-3"
                >
                  <View>
                    <Text className="font-poppins-regular text-[10px] text-gray-400">
                      Hari
                    </Text>
                    <Text className="font-poppins-semibold text-xs text-text">
                      {selectedDay}
                    </Text>
                  </View>
                  <ChevronDown size={14} color="#6b7280" />
                </Pressable>

                {/* Bulan */}
                <Pressable
                  onPress={() => setPickerModalType("month")}
                  className="flex-[1.4] flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-3 py-3"
                >
                  <View>
                    <Text className="font-poppins-regular text-[10px] text-gray-400">
                      Bulan
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="font-poppins-semibold text-xs text-text"
                    >
                      {MONTH_NAMES[selectedMonth - 1]}
                    </Text>
                  </View>
                  <ChevronDown size={14} color="#6b7280" />
                </Pressable>

                {/* Tahun */}
                <Pressable
                  onPress={() => setPickerModalType("year")}
                  className="flex-1 flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-3 py-3"
                >
                  <View>
                    <Text className="font-poppins-regular text-[10px] text-gray-400">
                      Tahun
                    </Text>
                    <Text className="font-poppins-semibold text-xs text-text">
                      {selectedYear}
                    </Text>
                  </View>
                  <ChevronDown size={14} color="#6b7280" />
                </Pressable>
              </View>

              {/* Preview Formatted Date */}
              <View className="bg-primary/5 rounded-xl p-3 border border-primary/20 flex-row items-center justify-between">
                <Text className="font-poppins-regular text-xs text-secondary">
                  Format API:
                </Text>
                <Text className="font-poppins-semibold text-xs text-primary">
                  {fieldValue}
                </Text>
              </View>

              {!!errorMessage && (
                <Text className="font-poppins-regular text-xs text-red-500 mt-2">
                  {errorMessage}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4">
            <Button
              variant="outline"
              disabled={isPending}
              onPress={handleCloseEdit}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="secondary"
              loading={isPending}
              disabled={isPending}
              onPress={handleSave}
              className="flex-1"
            >
              Simpan
            </Button>
          </View>
        </View>
      </BottomSheet>

      {/* Modal Dialog for Date Sub-Pickers (Day, Month, Year) */}
      <Modal
        visible={!!pickerModalType}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerModalType(null)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center p-4">
          <View className="w-full max-w-sm bg-white rounded-3xl p-5 max-h-[70%]">
            <Text className="font-poppins-semibold text-sm text-secondary mb-3 text-center">
              {pickerModalType === "day" && "Pilih Hari"}
              {pickerModalType === "month" && "Pilih Bulan"}
              {pickerModalType === "year" && "Pilih Tahun"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {pickerModalType === "day" && (
                <View className="flex-row flex-wrap gap-2 justify-center">
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (d) => (
                      <Pressable
                        key={d}
                        onPress={() => {
                          setSelectedDay(d);
                          setPickerModalType(null);
                        }}
                        className={clsx(
                          "w-12 h-12 rounded-2xl items-center justify-center border",
                          selectedDay === d
                            ? "bg-primary border-primary"
                            : "bg-gray-50 border-gray-100",
                        )}
                      >
                        <Text
                          className={clsx(
                            "font-poppins-semibold text-xs",
                            selectedDay === d ? "text-white" : "text-text",
                          )}
                        >
                          {d}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
              )}

              {pickerModalType === "month" && (
                <View className="gap-1.5">
                  {MONTH_NAMES.map((m, idx) => {
                    const mNum = idx + 1;
                    const isSelected = selectedMonth === mNum;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => {
                          setSelectedMonth(mNum);
                          setPickerModalType(null);
                        }}
                        className={clsx(
                          "p-3 rounded-2xl border flex-row items-center justify-between",
                          isSelected
                            ? "bg-primary/5 border-primary"
                            : "bg-gray-50 border-gray-100",
                        )}
                      >
                        <Text
                          className={clsx(
                            "font-poppins-medium text-xs",
                            isSelected ? "text-primary" : "text-text",
                          )}
                        >
                          {m}
                        </Text>
                        {isSelected && (
                          <Check size={14} color="#3f9aae" strokeWidth={3} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {pickerModalType === "year" && (
                <View className="flex-row flex-wrap gap-2 justify-center">
                  {years.map((y) => (
                    <Pressable
                      key={y}
                      onPress={() => {
                        setSelectedYear(y);
                        setPickerModalType(null);
                      }}
                      className={clsx(
                        "w-20 h-11 rounded-2xl items-center justify-center border",
                        selectedYear === y
                          ? "bg-primary border-primary"
                          : "bg-gray-50 border-gray-100",
                      )}
                    >
                      <Text
                        className={clsx(
                          "font-poppins-semibold text-xs",
                          selectedYear === y ? "text-white" : "text-text",
                        )}
                      >
                        {y}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>

            <Pressable
              onPress={() => setPickerModalType(null)}
              className="mt-4 py-2.5 bg-gray-100 rounded-full items-center"
            >
              <Text className="font-poppins-medium text-xs text-gray-600">
                Tutup
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
