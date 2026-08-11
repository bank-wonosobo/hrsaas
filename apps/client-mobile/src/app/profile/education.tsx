import { TabContent, TabList, Tabs, TabTrigger } from "@/components/ui/tabs";
import { useEmployeeEducations } from "@/hooks/employee-education/use-employee-educations";
import { useEmployeeTrainings } from "@/hooks/employee-training/use-employee-trainings";
import { EmployeeEducation } from "@/schema/employee-education-schema";
import { EmployeeTraining } from "@/schema/employee-training-schema";
import {
  Award,
  FileText,
  GraduationCap,
  Inbox,
} from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  Text,
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

function EducationItem({ item }: { item: EmployeeEducation }) {
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
      </View>
      <Text className="font-poppins-regular text-xs text-gray-500">
        Lulus {item.graduation_year}
        {item.gpa ? ` · IPK ${item.gpa}` : ""}
      </Text>
    </View>
  );
}

function TrainingItem({ item }: { item: EmployeeTraining }) {
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
  const { data: educationData, isLoading: isLoadingEducation } =
    useEmployeeEducations({ page: 1, size: 50 });
  const { data: trainingData, isLoading: isLoadingTraining } =
    useEmployeeTrainings({ page: 1, size: 50 });

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
                renderItem={({ item }) => <EducationItem item={item} />}
                ListEmptyComponent={
                  <EmptyState label="Belum ada riwayat pendidikan" />
                }
              />
            )}
          </TabContent>

          <TabContent value="training">
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
                renderItem={({ item }) => <TrainingItem item={item} />}
                ListEmptyComponent={
                  <EmptyState label="Belum ada riwayat pelatihan" />
                }
              />
            )}
          </TabContent>
        </Tabs>
      </ScrollView>
    </View>
  );
}
