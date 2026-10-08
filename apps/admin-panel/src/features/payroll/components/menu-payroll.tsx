"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormPayroll } from "./form-payroll";

const statusOptions = [
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
    <div className="mb-5 flex flex-col gap-4 rounded-3xl bg-card p-5 text-card-foreground shadow-md ring-1 ring-foreground/5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-full space-y-2 sm:w-56">
          <Label htmlFor="payroll-status">Status</Label>
          <Select
            value={status || "all"}
            onValueChange={(value) =>
              updateParam("status", value === "all" ? "" : value)
            }
          >
            <SelectTrigger id="payroll-status" className="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full space-y-2 sm:w-36">
          <Label htmlFor="payroll-year">Tahun</Label>
          <Input
            id="payroll-year"
            type="number"
            min={2000}
            max={2100}
            placeholder="Contoh: 2026"
            value={year}
            onChange={(e) => updateParam("period_year", e.target.value)}
          />
        </div>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("?page=1&size=10", { scroll: false })}
            className="gap-2"
          >
            <RotateCcw />
            Reset
          </Button>
        )}
      </div>

      <FormPayroll />
    </div>
  );
}
