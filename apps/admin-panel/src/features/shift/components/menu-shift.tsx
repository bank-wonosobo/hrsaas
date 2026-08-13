"use client";
import Button from "@/components/ui/button/button";
import SearchForm from "@/components/ui/search-form/search-form";
import { ChevronDown, Download, RotateCcw, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormShift } from "./form-shift";

export default function MenuShift() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(searchParams.get("key") ?? "");

  const currentKey = searchParams.get("key") ?? "";
  const hasFilters = !!currentKey;

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    router.push(`?page=1&size=10&key=${key}`, { scroll: false });
  }

  function handleReset() {
    setKey("");
    router.push("?page=1&size=10", { scroll: false });
  }

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((p) => !p);
        }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
            <Search className="h-4 w-4 text-zinc-600" />
          </div>
          <span className="font-semibold text-zinc-800">Cari</span>
          {hasFilters && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-bold text-white">
              1
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); handleReset(); } }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </span>
          )}
          <span onClick={(e) => e.stopPropagation()} className="flex gap-2">
            <FormShift />
            <Button variant="outline" size="sm" prefixIcon={<Download size={16} />}>
              Download
            </Button>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {open && (
        <div className="border-t border-zinc-100">
          <div className="px-5 py-4">
            <SearchForm onSearch={handleSearch} searchKey={key} setKey={setKey} />
          </div>
          {hasFilters && (
            <div className="flex flex-wrap gap-2 border-t border-zinc-100 px-5 py-3 bg-zinc-50">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                {currentKey}
                <button onClick={handleReset} className="rounded-full opacity-60 hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
