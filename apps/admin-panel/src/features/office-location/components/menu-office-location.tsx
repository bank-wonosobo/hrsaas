"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormOfficeLocation } from "./form-office-location";

export default function MenuOfficeLocation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(searchParams.get("key") ?? "");

  const currentKey = searchParams.get("key") ?? "";
  const hasFilters = !!currentKey;

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    params.set("size", "10");
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
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen((previous) => !previous)}
              aria-expanded={open}
              className="gap-2"
            >
              <Search />
              Cari Lokasi
            </Button>
            {hasFilters && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                1
              </span>
            )}
          </div>
          <FormOfficeLocation />
        </div>

        {open && (
          <div className="space-y-3 border-t pt-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <Input
                aria-label="Cari lokasi kantor"
                placeholder="Cari nama atau alamat lokasi..."
                value={key}
                onChange={(event) => setKey(event.target.value)}
              />
              <Button type="submit" className="gap-2">
                <Search />
                Cari
              </Button>
              {hasFilters && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw />
                  Reset
                </Button>
              )}
            </form>
            {hasFilters && (
              <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium">
                {currentKey}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Hapus filter pencarian"
                  onClick={handleReset}
                >
                  <X />
                </Button>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
