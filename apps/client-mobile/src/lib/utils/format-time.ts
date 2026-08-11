export function formatTime(ms: number): string {
  if (!ms) return "-";
  return new Date(ms).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    // timeZone: "UTC",
  });
}
