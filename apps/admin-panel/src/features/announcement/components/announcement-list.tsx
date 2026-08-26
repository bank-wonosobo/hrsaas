"use client";

import Button from "@/components/ui/button/button";
import FileUploader from "@/components/ui/file-uploader/file-uploader";
import FormField from "@/components/ui/form/form-field";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import Table from "@/components/ui/table/table";
import { FileText, PlusCircle, Search } from "lucide-react";
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
  { label: "Event", value: "Event" },
  { label: "Maintenance", value: "Maintenance" },
  { label: "Pengumuman", value: "Pengumuman" },
  { label: "HR", value: "HR" },
  { label: "Informasi", value: "Informasi" },
  { label: "Kebijakan", value: "Kebijakan" },
  { label: "Training", value: "Training" },
];

export default function AnnouncementList({ search = {} }: Props) {
  const router = useRouter();
  const [searchKey, setSearchKey] = useState(search.key ?? "");
  const [form, setForm] = useState<CreateAnnouncement>(EMPTY_FORM);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [detail, setDetail] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);
  const { data, isLoading, isFetching } = useSearchAnnouncement({
    ...search,
    key: search.key ?? "",
  });
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const pending = createMutation.isPending || updateMutation.isPending;

  function closeForm() {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
    };
    if (!request.title || !request.category || !request.content) return;
    if (editing)
      updateMutation.mutate(
        { id: editing.id, request },
        { onSuccess: closeForm },
      );
    else createMutation.mutate(request, { onSuccess: closeForm });
  }
  function edit(announcement: Announcement) {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      category: announcement.category ?? "",
      content: announcement.content,
      file_url: announcement.file_url ?? "",
    });
    setOpen(true);
  }
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchKey) params.set("key", searchKey);
    else params.delete("key");
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
        <form onSubmit={handleSearch} className="flex min-w-64 flex-1 gap-2">
          <Input
            label="Cari pengumuman"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <Button type="submit" variant="outline" icon aria-label="Cari">
            <Search size={18} />
          </Button>
        </form>
        <Button
          variant="secondary"
          prefixIcon={<PlusCircle size={18} />}
          onClick={() => setOpen(true)}
        >
          Tambah
        </Button>
      </div>
      {isLoading || isFetching ? (
        <p className="py-6 text-sm text-zinc-400">Memuat data...</p>
      ) : (
        <Table<Announcement>
          data={data?.data ?? []}
          keyExtractor={(row) => row.id}
          emptyMessage="Belum ada pengumuman."
          columns={[
            {
              header: "Judul",
              accessor: (row) => (
                <span className="font-medium">{row.title}</span>
              ),
            },
            { header: "Kategori", accessor: (row) => row.category || "-" },
            {
              header: "Isi",
              accessor: (row) => (
                <span className="line-clamp-2 max-w-xl">{row.content}</span>
              ),
            },
            {
              header: "Aksi",
              className: "text-right",
              accessor: (row) => (
                <div className="flex justify-end gap-3">
                  <button
                    className="text-sm text-zinc-500 hover:text-black"
                    onClick={() => setDetail(row)}
                  >
                    Detail
                  </button>
                  <button
                    className="text-sm text-zinc-500 hover:text-black"
                    onClick={() => edit(row)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm text-red-500 hover:text-red-700"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm("Yakin ingin menghapus pengumuman ini?"))
                        deleteMutation.mutate(row.id);
                    }}
                  >
                    Hapus
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
      <Modal
        isOpen={open}
        onClose={closeForm}
        title={editing ? "Edit Pengumuman" : "Tambah Pengumuman"}
        maxWidth="md"
      >
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Judul" required>
            <Input
              label="Judul pengumuman"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>
          <FormField label="Kategori" required>
            <Select
              label="Kategori"
              options={CATEGORY_OPTIONS}
              value={form.category}
              onChange={(category) => setForm({ ...form, category })}
            />
          </FormField>
          <FormField label="Isi" required>
            <textarea
              className="min-h-32 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:border-black"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </FormField>
          <FormField label="Lampiran">
            <FileUploader
              value={form.file_url}
              onChange={(file_url) => setForm({ ...form, file_url })}
              accept=".pdf,image/*"
              useSignedUrl
              isPublic={false}
            />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Batal
            </Button>
            <Button type="submit" loading={pending}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={detail !== null}
        onClose={() => setDetail(null)}
        title="Detail Pengumuman"
        maxWidth="md"
      >
        {detail && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Judul
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">
                {detail.title}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Kategori
              </p>
              <p className="mt-1 text-sm text-zinc-700">
                {detail.category || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Isi
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {detail.content}
              </p>
            </div>
            {detail.file_url && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Lampiran
                </p>
                <a
                  href={detail.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:underline"
                >
                  <FileText size={15} />
                  Lihat Dokumen
                </a>
              </div>
            )}
          </div>
        )}

      </Modal>
    </div>
  );
}
