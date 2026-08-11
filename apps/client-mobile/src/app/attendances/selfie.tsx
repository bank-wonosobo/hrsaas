import AttendanceCamera from "@/features/attendance/attendance-form";
import { useClockIn } from "@/hooks/attendance/use-clockin";
import { useClockOut } from "@/hooks/attendance/use-clockout";

import { ClockInReq } from "@/schema/attendance-schema";

import { PhotoResult } from "@/schema/photo-schema";
import { useLocalSearchParams } from "expo-router";

export default function AttendanceSelfie() {
  const { lat, lng, type } = useLocalSearchParams<{
    lat: string;
    lng: string;
    type: string;
  }>();

  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const handleAttendance = (data: ClockInReq, photo: PhotoResult) => {
    if (type === "check-in") {
      clockInMutation.mutate({
        data,
        photo,
      });
    }

    if (type === "check-out") {
      clockOutMutation.mutate({
        data,
        photo,
      });
    }
  };

  return (
    <AttendanceCamera
      loading={clockInMutation.isPending || clockOutMutation.isPending}
      coordinate={{ lat: Number(lat), lng: Number(lng) }}
      onSubmit={handleAttendance}
    />
  );
}
