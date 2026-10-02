"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import ImportEmployee from "./import-employee";

export default function MenuEmployee() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentKey = searchParams.get("key") ?? "";
  const [key, setKey] = useState(currentKey);
  const [isImportOpen, setIsImportOpen] = useState(false);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const normalizedKey = key.trim();
    if (normalizedKey) params.set("key", normalizedKey);
    else params.delete("key");
    params.set("page", "1");
    params.set("size", searchParams.get("size") ?? "10");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleReset() {
    setKey("");
    router.push("?page=1&size=10", { scroll: false });
  }

  return (
    <>
      <ImportEmployee
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <Card className="mb-5">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-foreground">
              <Users className="size-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold">
                Data karyawan
              </h1>
              <CardDescription className="mt-1">
                Kelola profil, status, dan informasi kepegawaian.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsImportOpen(true)}
            >
              <FileSpreadsheet />
              Import
            </Button>
            <Button
              variant="outline"
              disabled
              title="Fitur unduh data karyawan belum tersedia"
            >
              <Download />
              Unduh
            </Button>
            <Button asChild>
              <Link href="/employees/create">
                <Plus />
                Tambah karyawan
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Cari karyawan"
                placeholder="Cari nama, nomor karyawan, atau informasi lainnya..."
                value={key}
                onChange={(event) => setKey(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Cari karyawan
            </Button>
            {currentKey && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
              >
                <RotateCcw />
                Reset
              </Button>
            )}
          </form>
          {currentKey && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                Pencarian: {currentKey}
                <button
                  type="button"
                  aria-label="Hapus filter pencarian"
                  onClick={handleReset}
                  className="rounded-full opacity-70 hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
