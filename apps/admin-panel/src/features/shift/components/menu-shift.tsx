"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronDown, Download, RotateCcw, Search, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormShift } from "./form-shift";

export default function MenuShift() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(searchParams.get("key") ?? "");
  const currentKey = searchParams.get("key") ?? "";
  const hasFilters = !!currentKey;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("size", searchParams.get("size") ?? "10");
    if (key.trim()) params.set("key", key.trim());
    else params.delete("key");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleReset() {
    setKey("");
    router.push("?page=1&size=10", { scroll: false });
  }

  return (
    <Card className="mb-5">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            className="justify-start px-0 hover:bg-transparent"
            aria-expanded={open}
            onClick={() => setOpen((previous) => !previous)}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Search className="size-4" />
            </span>
            Cari Shift
            {hasFilters && (
              <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                1
              </span>
            )}
            <ChevronDown
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <FormShift />
            <Button type="button" variant="outline">
              <Download />
              Download
            </Button>
          </div>
        </div>

        {open && (
          <div className="space-y-3 border-t px-5 py-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <Input
                value={key}
                onChange={(event) => setKey(event.target.value)}
                placeholder="Cari nama shift..."
                aria-label="Cari nama shift"
                className="sm:max-w-sm"
              />
              <Button type="submit">
                <Search />
                Cari
              </Button>
              {hasFilters && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                >
                  <RotateCcw />
                  Reset
                </Button>
              )}
            </form>
            {hasFilters && (
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-medium">
                  {currentKey}
                  <button
                    type="button"
                    aria-label="Hapus filter pencarian"
                    onClick={handleReset}
                    className="opacity-60 transition-opacity hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
