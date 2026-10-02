"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  useCreateAnnouncement,
  useDeleteAnnouncement,
  useUpdateAnnouncement,
} from "../hooks/use-announcement-mutations";
import { useSearchAnnouncement } from "../hooks/use-search-announcement";
import {
  Announcement,
  CreateAnnouncement,
  SearchAnnouncementRequest,
} from "../schemas/announcement-schema";

type Props = { search?: SearchAnnouncementRequest };

const EMPTY_FORM: CreateAnnouncement = {
  title: "",
  category: "",
  content: "",
  file_url: "",
};

const CATEGORY_OPTIONS = [
  "Event",
  "Maintenance",
  "Pengumuman",
  "HR",
  "Informasi",
  "Kebijakan",
  "Training",
];

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function AnnouncementList({ search = {} }: Props) {
  const router = useRouter();
  const [searchKey, setSearchKey] = useState(search.key ?? "");
  const [form, setForm] = useState<CreateAnnouncement>(EMPTY_FORM);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [detail, setDetail] = useState<Announcement | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const { data, isLoading, isFetching, isError, refetch } =
    useSearchAnnouncement({
      ...search,
      key: search.key ?? "",
    });
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const pending = createMutation.isPending || updateMutation.isPending;
  const announcements = data?.data ?? [];

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function openCreateForm() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
    };
    if (!request.title || !request.category || !request.content) return;

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, request },
        { onSuccess: closeForm },
      );
    } else {
      createMutation.mutate(request, { onSuccess: closeForm });
    }
  }

  function edit(announcement: Announcement) {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      category: announcement.category ?? "",
      content: announcement.content,
      file_url: announcement.file_url ?? "",
    });
    setFormOpen(true);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchKey.trim()) params.set("key", searchKey.trim());
    else params.delete("key");
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  }

  return (
    <div className="space-y-5 pb-8">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-foreground">
              <Megaphone className="size-5" />
            </div>
            <div>
              <CardTitle>Pengumuman</CardTitle>
              <CardDescription className="mt-1">
                Kelola informasi dan kabar terbaru untuk karyawan.
              </CardDescription>
            </div>
          </div>
          <Button onClick={openCreateForm}>
            <Plus />
            Buat pengumuman
          </Button>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-2 sm:flex-row max-w-sm"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Cari pengumuman"
                placeholder="Cari judul atau isi pengumuman..."
                value={searchKey}
                onChange={(event) => setSearchKey(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Cari
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Daftar pengumuman</CardTitle>
            <CardDescription className="mt-1">
              {data?.paging
                ? `${data.paging.total_item.toLocaleString("id-ID")} pengumuman`
                : "Pengumuman perusahaan"}
              {isFetching && !isLoading ? " · Memperbarui..." : ""}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_8rem_2fr_8rem] gap-4"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : isError && !data ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <p className="text-sm font-medium">Pengumuman gagal dimuat.</p>
              <p className="text-sm text-muted-foreground">
                Periksa koneksi lalu coba lagi.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                Coba lagi
              </Button>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Megaphone className="size-5" />
              </div>
              <p className="text-sm font-medium">
                {search.key
                  ? "Pengumuman tidak ditemukan"
                  : "Belum ada pengumuman"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search.key
                  ? "Coba gunakan kata kunci pencarian yang berbeda."
                  : "Buat pengumuman pertama untuk membagikan informasi."}
              </p>
              {!search.key && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={openCreateForm}
                >
                  <Plus />
                  Buat pengumuman
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Isi</TableHead>
                  <TableHead>Tanggal dibuat</TableHead>
                  <TableHead className="pr-6 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="max-w-56 pl-6 font-medium">
                      <span className="line-clamp-2">{announcement.title}</span>
                    </TableCell>
                    <TableCell>
                      {announcement.category ? (
                        <Badge variant="secondary">
                          {announcement.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <span className="line-clamp-2 text-muted-foreground">
                        {announcement.content}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {announcement.created_at
                        ? dateFormatter.format(
                            new Date(announcement.created_at),
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetail(announcement)}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${announcement.title}`}
                          onClick={() => edit(announcement)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Hapus ${announcement.title}`}
                          disabled={deleteMutation.isPending}
                          onClick={() => setDeleteTarget(announcement)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (open) setFormOpen(true);
          else closeForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit pengumuman" : "Buat pengumuman"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi informasi berikut untuk dibagikan kepada karyawan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Judul</Label>
              <Input
                id="announcement-title"
                autoFocus
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="Contoh: Jadwal libur nasional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-category">Kategori</Label>
              <Select
                value={form.category || undefined}
                onValueChange={(category) => setForm({ ...form, category })}
                required
              >
                <SelectTrigger id="announcement-category" className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-content">Isi pengumuman</Label>
              <Textarea
                id="announcement-content"
                required
                value={form.content}
                onChange={(event) =>
                  setForm({ ...form, content: event.target.value })
                }
                placeholder="Tuliskan isi pengumuman..."
                className="min-h-36 resize-y"
              />
            </div>
            <div className="space-y-2">
              <Label>Lampiran</Label>
              <FileUploader
                value={form.file_url}
                onChange={(file_url) => setForm({ ...form, file_url })}
                accept=".pdf,image/*"
                useSignedUrl
                isPublic={false}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={pending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={pending}>
                {pending
                  ? "Menyimpan..."
                  : editing
                    ? "Simpan perubahan"
                    : "Terbitkan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detail !== null}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail pengumuman</DialogTitle>
            <DialogDescription>
              Informasi lengkap pengumuman yang dipilih.
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Badge variant="secondary">
                  {detail.category || "Tanpa kategori"}
                </Badge>
                <h3 className="text-xl font-semibold tracking-tight">
                  {detail.title}
                </h3>
                {detail.created_at && (
                  <p className="text-sm text-muted-foreground">
                    {dateFormatter.format(new Date(detail.created_at))}
                  </p>
                )}
              </div>
              <div className="border-t pt-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {detail.content}
                </p>
              </div>
              {detail.file_url && (
                <Button asChild variant="outline">
                  <a
                    href={detail.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText />
                    Lihat lampiran
                  </a>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pengumuman?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengumuman
              {deleteTarget ? ` “${deleteTarget.title}”` : ""} akan dihapus
              secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={deleteMutation.isPending}>
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
              >
                {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
