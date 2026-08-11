"use client";
import Select from "@/components/ui/select/select";
import { RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormPayroll } from "./form-payroll";

const statusOptions = [
  { label: "Semua Status", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Terhitung", value: "CALCULATED" },
  { label: "Menunggu Persetujuan", value: "SUBMITTED" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Terbayar", value: "PAID" },
  { label: "Dibatalkan", value: "CANCELLED" },
];

export default function MenuPayroll() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const year = searchParams.get("period_year") ?? "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const hasFilters = !!status || !!year;

  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-52">
          <Select
            label="Status"
            options={statusOptions.filter((o) => o.value !== "")}
            value={status}
            onChange={(v) => updateParam("status", v)}
          />
        </div>
        <div className="w-32">
          <input
            type="number"
            placeholder="Tahun"
            value={year}
            onChange={(e) => updateParam("period_year", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-sm outline-none focus:border-black"
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => router.push("?page=1&size=10", { scroll: false })}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      <FormPayroll />
    </div>
  );
}
