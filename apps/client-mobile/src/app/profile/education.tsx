import Button from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import AppModal from "@/components/ui/modal";
import { TabContent, TabList, Tabs, TabTrigger } from "@/components/ui/tabs";
import { useCreateEmployeeTraining } from "@/hooks/employee-training/use-create-employee-training";
import { useCreateEmployeeEducation } from "@/hooks/employee-education/use-create-employee-education";
import { useEmployeeEducations } from "@/hooks/employee-education/use-employee-educations";
import { useEmployeeTrainings } from "@/hooks/employee-training/use-employee-trainings";
import { useUpdateEmployeeEducation } from "@/hooks/employee-education/use-update-employee-education";
import { useUpdateEmployeeTraining } from "@/hooks/employee-training/use-update-employee-training";
import { EmployeeEducation } from "@/schema/employee-education-schema";
import { EmployeeTraining } from "@/schema/employee-training-schema";
import { EmployeeEducationPayload } from "@/services/employee-education/types";
import {
  EmployeeTrainingCertificate,
  EmployeeTrainingPayload,
} from "@/services/employee-training/types";
import {
  Award,
  FileText,
  GraduationCap,
  Inbox,
  Pencil,
  Upload,
  X,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInputProps,
  View,
} from "react-native";

function formatDate(dateMs?: number | null) {
  if (!dateMs) return "-";
  return new Date(dateMs).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function EducationItem({
  item,
  onEdit,
}: {
  item: EmployeeEducation;
  onEdit: () => void;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 gap-2 border border-gray-100 shadow-sm shadow-gray-200/50">
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
          <GraduationCap size={16} color="#3f9aae" />
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-poppins-semibold text-secondary text-xs"
          >
            {item.education_level} · {item.institution_name}
          </Text>
          <Text className="font-poppins-regular text-[11px] text-gray-400 mt-0.5">
            {item.major}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${item.institution_name}`}
          onPress={onEdit}
          className="rounded-full bg-gray-50 p-2"
        >
          <Pencil size={15} color="#3f9aae" />
        </Pressable>
      </View>
      <Text className="font-poppins-regular text-xs text-gray-500">
        Lulus {formatDate(item.graduation_year)}
        {item.gpa ? ` · IPK ${item.gpa}` : ""}
      </Text>
    </View>
  );
}

type EducationFormValues = {
  education_level: string;
  institution_name: string;
  major: string;
  graduation_year: string;
  gpa: string;
  start_year: string;
  end_year: string;
};

const EDUCATION_LEVELS = ["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"];
const EMPTY_EDUCATION: EducationFormValues = {
  education_level: "",
  institution_name: "",
  major: "",
  graduation_year: "",
  gpa: "",
  start_year: "",
  end_year: "",
};

function educationDateToInput(value?: number | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function EducationFormModal({
  education,
  pending,
  onClose,
  onSubmit,
}: {
  education: EmployeeEducation | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (payload: EmployeeEducationPayload) => void;
}) {
  const [values, setValues] = useState<EducationFormValues>(() =>
    education
      ? {
          education_level: education.education_level,
          institution_name: education.institution_name,
          major: education.major,
          graduation_year: educationDateToInput(education.graduation_year),
          gpa: education.gpa?.toString() ?? "",
          start_year: education.start_year?.toString() ?? "",
          end_year: education.end_year?.toString() ?? "",
        }
      : EMPTY_EDUCATION,
  );
  const [error, setError] = useState("");

  const setField = (field: keyof EducationFormValues) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const submit = () => {
    if (!values.education_level || !values.institution_name.trim() || !values.major.trim()) {
      setError("Jenjang, nama institusi, dan jurusan wajib diisi.");
      return;
    }
    if (!values.graduation_year) {
      setError("Tanggal kelulusan wajib dipilih.");
      return;
    }
    const gpa = parseOptionalNumber(values.gpa);
    const startYear = parseOptionalNumber(values.start_year);
    const endYear = parseOptionalNumber(values.end_year);
    if (values.gpa && (gpa === undefined || gpa < 0 || gpa > 4)) {
      setError("IPK harus berada di antara 0 dan 4.");
      return;
    }
    if (startYear !== undefined && endYear !== undefined && endYear < startYear) {
      setError("Tahun selesai tidak boleh sebelum tahun masuk.");
      return;
    }

    setError("");
    onSubmit({
      education_level: values.education_level,
      institution_name: values.institution_name.trim(),
      major: values.major.trim(),
      graduation_year: values.graduation_year,
      ...(gpa !== undefined ? { gpa } : {}),
      ...(startYear !== undefined ? { start_year: startYear } : {}),
      ...(endYear !== undefined ? { end_year: endYear } : {}),
    });
  };

  return (
    <AppModal
      visible
      title={education ? "Edit Riwayat Pendidikan" : "Tambah Riwayat Pendidikan"}
      onClose={onClose}
    >
      <View className="gap-1">
        <FormField label="Jenjang Pendidikan" required>
          <View className="flex-row flex-wrap gap-2">
            {EDUCATION_LEVELS.map((level) => (
              <Pressable
                key={level}
                onPress={() => setField("education_level")(level)}
                className={values.education_level === level ? "rounded-xl bg-primary px-3 py-2" : "rounded-xl border border-gray-200 px-3 py-2"}
              >
                <Text className={values.education_level === level ? "font-poppins-medium text-xs text-white" : "font-poppins-medium text-xs text-gray-600"}>
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </FormField>
        <FormField label="Nama Institusi" required>
          <Input value={values.institution_name} onChangeText={setField("institution_name")} placeholder="Contoh: Universitas Australia" />
        </FormField>
        <FormField label="Jurusan" required>
          <Input value={values.major} onChangeText={setField("major")} placeholder="Contoh: Teknik Informatika" />
        </FormField>
        <FormField label="Tanggal Kelulusan" required>
          <DatePicker
            value={dateInputToDate(values.graduation_year)}
            onChange={(date) => setField("graduation_year")(dateToInputValue(date))}
            placeholder="Pilih tanggal kelulusan"
          />
        </FormField>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField label="Tahun Masuk">
              <Input value={values.start_year} onChangeText={setField("start_year")} type="number" placeholder="2016" maxLength={4} />
            </FormField>
          </View>
          <View className="flex-1">
            <FormField label="Tahun Selesai">
              <Input value={values.end_year} onChangeText={setField("end_year")} type="number" placeholder="2020" maxLength={4} />
            </FormField>
          </View>
        </View>
        <FormField label="IPK / Nilai">
          <Input value={values.gpa} onChangeText={setField("gpa")} type="number" placeholder="3.75" />
        </FormField>
        {!!error && <Text accessibilityRole="alert" className="mb-3 font-poppins-regular text-xs text-red-500">{error}</Text>}
        <View className="flex-row gap-3 pt-1">
          <Button variant="outline" className="flex-1" onPress={onClose} disabled={pending}>Batal</Button>
          <Button className="flex-1" onPress={submit} loading={pending} disabled={pending}>Simpan</Button>
        </View>
      </View>
    </AppModal>
  );
}

function TrainingItem({
  item,
  onEdit,
}: {
  item: EmployeeTraining;
  onEdit: () => void;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 gap-2 border border-gray-100 shadow-sm shadow-gray-200/50">
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
          <Award size={16} color="#3f9aae" />
        </View>
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-poppins-semibold text-secondary text-xs"
          >
            {item.training_name}
          </Text>
          <Text className="font-poppins-regular text-[11px] text-gray-400 mt-0.5">
            {item.organizer}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${item.training_name}`}
          onPress={onEdit}
          className="rounded-full bg-gray-50 p-2"
        >
          <Pencil size={15} color="#3f9aae" />
        </Pressable>
      </View>
      <Text className="font-poppins-regular text-xs text-gray-500">
        {formatDate(item.start_date)}
        {item.end_date ? ` - ${formatDate(item.end_date)}` : ""}
      </Text>
      {!!item.certificate_url && (
        <Pressable
          onPress={() => Linking.openURL(item.certificate_url!)}
          className="flex-row items-center gap-2 border-t border-dashed border-gray-200 pt-3"
        >
          <FileText size={14} color="#3f9aae" />
          <Text className="font-poppins-medium text-xs text-primary">
            Lihat Sertifikat
          </Text>
        </Pressable>
      )}
    </View>
  );
}

type TrainingFormValues = {
  training_name: string;
  organizer: string;
  start_date: string;
  end_date: string;
  certificate_url: string;
};

const EMPTY_TRAINING: TrainingFormValues = {
  training_name: "",
  organizer: "",
  start_date: "",
  end_date: "",
  certificate_url: "",
};

function dateToInput(value?: number | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function dateInputToDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateToInputValue(value: Date | null): string {
  if (!value) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function certificateMimeType(name: string, mimeType?: string | null): string {
  if (
    mimeType &&
    ["application/pdf", "image/jpeg", "image/png"].includes(mimeType)
  ) {
    return mimeType;
  }
  const extension = name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "application/pdf";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  return "";
}

function TrainingFormModal({
  training,
  pending,
  onClose,
  onSubmit,
}: {
  training: EmployeeTraining | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (
    payload: EmployeeTrainingPayload,
    certificate: EmployeeTrainingCertificate | undefined,
  ) => void;
}) {
  const [values, setValues] = useState<TrainingFormValues>(() =>
    training
      ? {
          training_name: training.training_name,
          organizer: training.organizer,
          start_date: dateToInput(training.start_date),
          end_date: dateToInput(training.end_date),
          certificate_url: training.certificate_url ?? "",
        }
      : EMPTY_TRAINING,
  );
  const [error, setError] = useState("");
  const [certificate, setCertificate] =
    useState<EmployeeTrainingCertificate | null>(null);
  const [certificateName, setCertificateName] = useState("");

  const setField = (field: keyof TrainingFormValues) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const pickCertificate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;

      const picked = result.assets[0];
      const mimeType = certificateMimeType(picked.name, picked.mimeType);
      if (!mimeType) {
        setError("Format sertifikat yang didukung: PDF, JPG, atau PNG.");
        return;
      }

      setCertificate({ uri: picked.uri, mimeType });
      setCertificateName(picked.name);
      setError("");
    } catch (pickError) {
      setError(
        pickError instanceof Error
          ? pickError.message
          : "Gagal memilih file sertifikat.",
      );
    }
  };

  const submit = () => {
    if (!values.training_name.trim() || !values.organizer.trim()) {
      setError("Nama pelatihan dan penyelenggara wajib diisi.");
      return;
    }
    if (!values.start_date) {
      setError("Tanggal mulai wajib dipilih.");
      return;
    }
    if (values.end_date && values.end_date < values.start_date) {
      setError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    setError("");
    onSubmit(
      {
        training_name: values.training_name.trim(),
        organizer: values.organizer.trim(),
        start_date: values.start_date,
        end_date: values.end_date || undefined,
        certificate_url: values.certificate_url || undefined,
      },
      certificate ?? undefined,
    );
  };

  const renderTextInput = (
    label: string,
    field: "training_name" | "organizer",
    props?: TextInputProps,
  ) => (
    <FormField label={label} required>
      <Input
        value={values[field]}
        onChangeText={setField(field)}
        className="py-3"
        {...props}
      />
    </FormField>
  );

  return (
    <AppModal
      visible
      title={training ? "Edit Riwayat Pelatihan" : "Tambah Riwayat Pelatihan"}
      onClose={onClose}
    >
      <View className="gap-4">
        {renderTextInput("Nama Pelatihan", "training_name", {
          placeholder: "Contoh: AWS Cloud Practitioner",
          autoCapitalize: "sentences",
        })}
        {renderTextInput("Penyelenggara", "organizer", {
          placeholder: "Nama penyelenggara",
          autoCapitalize: "words",
        })}
        <FormField label="Tanggal Mulai" required>
          <DatePicker
            value={dateInputToDate(values.start_date)}
            onChange={(date) => setField("start_date")(dateToInputValue(date))}
            placeholder="Pilih tanggal mulai"
            maxDate={dateInputToDate(values.end_date)}
          />
        </FormField>
        <FormField label="Tanggal Selesai">
          <DatePicker
            value={dateInputToDate(values.end_date)}
            onChange={(date) => setField("end_date")(dateToInputValue(date))}
            placeholder="Pilih tanggal selesai"
            minDate={dateInputToDate(values.start_date)}
            clearable
          />
        </FormField>
        <FormField label="Sertifikat">
          <View className="gap-2">
            {certificate ? (
              <View className="flex-row items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">
                <View className="flex-1 flex-row items-center gap-2">
                  <FileText size={17} color="#3f9aae" />
                  <Text
                    numberOfLines={1}
                    className="flex-1 font-poppins-regular text-xs text-text"
                  >
                    {certificateName}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="Batalkan pilihan sertifikat"
                  disabled={pending}
                  onPress={() => {
                    setCertificate(null);
                    setCertificateName("");
                  }}
                  className="ml-2 rounded-full p-1"
                >
                  <X size={16} color="#6b7280" />
                </Pressable>
              </View>
            ) : values.certificate_url ? (
              <Pressable
                onPress={() => Linking.openURL(values.certificate_url)}
                className="flex-row items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5"
              >
                <FileText size={17} color="#3f9aae" />
                <Text className="flex-1 font-poppins-regular text-xs text-primary">
                  Sertifikat saat ini · Lihat
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              disabled={pending}
              onPress={pickCertificate}
              className="flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3"
            >
              <Upload size={16} color="#3f9aae" />
              <Text className="font-poppins-medium text-xs text-primary">
                {certificate || values.certificate_url
                  ? "Ganti Sertifikat"
                  : "Pilih Sertifikat"}
              </Text>
            </Pressable>
            <Text className="font-poppins-regular text-[11px] text-gray-400">
              Format yang didukung: PDF, JPG, atau PNG.
            </Text>
          </View>
        </FormField>
        {!!error && (
          <Text accessibilityRole="alert" className="font-poppins-regular text-xs text-red-500">
            {error}
          </Text>
        )}
        <View className="flex-row gap-3 pt-1">
          <Button
            variant="outline"
            className="flex-1"
            onPress={onClose}
            disabled={pending}
          >
            Batal
          </Button>
          <Button
            className="flex-1"
            onPress={submit}
            loading={pending}
            disabled={pending}
          >
            Simpan
          </Button>
        </View>
      </View>
    </AppModal>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View className="items-center justify-center py-16 gap-2">
      <Inbox size={32} color="#9ca3af" />
      <Text className="font-poppins-medium text-sm text-gray-400">
        {label}
      </Text>
    </View>
  );
}

export default function EducationPage() {
  const [formVisible, setFormVisible] = useState(false);
  const [educationFormVisible, setEducationFormVisible] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EmployeeEducation | null>(
    null,
  );
  const [editingTraining, setEditingTraining] = useState<EmployeeTraining | null>(
    null,
  );
  const createEducation = useCreateEmployeeEducation();
  const updateEducation = useUpdateEmployeeEducation();
  const createTraining = useCreateEmployeeTraining();
  const updateTraining = useUpdateEmployeeTraining();
  const { data: educationData, isLoading: isLoadingEducation } =
    useEmployeeEducations({ page: 1, size: 50 });
  const { data: trainingData, isLoading: isLoadingTraining } =
    useEmployeeTrainings({ page: 1, size: 50 });

  const closeForm = () => {
    setFormVisible(false);
    setEditingTraining(null);
  };

  const closeEducationForm = () => {
    setEducationFormVisible(false);
    setEditingEducation(null);
  };

  const submitEducation = (payload: EmployeeEducationPayload) => {
    if (editingEducation) {
      updateEducation.mutate(
        { id: editingEducation.id, payload },
        { onSuccess: closeEducationForm },
      );
      return;
    }
    createEducation.mutate(payload, { onSuccess: closeEducationForm });
  };

  const submitTraining = (
    payload: EmployeeTrainingPayload,
    certificate?: EmployeeTrainingCertificate,
  ) => {
    if (editingTraining) {
      updateTraining.mutate(
        { id: editingTraining.id, payload, certificate },
        { onSuccess: closeForm },
      );
      return;
    }
    createTraining.mutate({ payload, certificate }, { onSuccess: closeForm });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Tabs defaultValue="education">
          <TabList>
            <TabTrigger value="education" title="Pendidikan" />
            <TabTrigger value="training" title="Pelatihan" />
          </TabList>

          <TabContent value="education">
            <Button
              className="mb-4"
              onPress={() => {
                setEditingEducation(null);
                setEducationFormVisible(true);
              }}
            >
              Tambah Pendidikan
            </Button>
            {isLoadingEducation ? (
              <View className="items-center justify-center py-16">
                <ActivityIndicator color="#3f9aae" />
              </View>
            ) : (
              <FlatList
                data={educationData?.data ?? []}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="h-2" />}
                renderItem={({ item }) => (
                  <EducationItem
                    item={item}
                    onEdit={() => {
                      setEditingEducation(item);
                      setEducationFormVisible(true);
                    }}
                  />
                )}
                ListEmptyComponent={
                  <EmptyState label="Belum ada riwayat pendidikan" />
                }
              />
            )}
          </TabContent>

          <TabContent value="training">
            <Button
              className="mb-4"
              onPress={() => {
                setEditingTraining(null);
                setFormVisible(true);
              }}
            >
              Tambah Pelatihan
            </Button>
            {isLoadingTraining ? (
              <View className="items-center justify-center py-16">
                <ActivityIndicator color="#3f9aae" />
              </View>
            ) : (
              <FlatList
                data={trainingData?.data ?? []}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="h-2" />}
                renderItem={({ item }) => (
                  <TrainingItem
                    item={item}
                    onEdit={() => {
                      setEditingTraining(item);
                      setFormVisible(true);
                    }}
                  />
                )}
                ListEmptyComponent={
                  <EmptyState label="Belum ada riwayat pelatihan" />
                }
              />
            )}
          </TabContent>
        </Tabs>
      </ScrollView>
      {educationFormVisible && (
        <EducationFormModal
          education={editingEducation}
          pending={createEducation.isPending || updateEducation.isPending}
          onClose={closeEducationForm}
          onSubmit={submitEducation}
        />
      )}
      {formVisible && (
        <TrainingFormModal
          training={editingTraining}
          pending={createTraining.isPending || updateTraining.isPending}
          onClose={closeForm}
          onSubmit={submitTraining}
        />
      )}
    </View>
  );
}
