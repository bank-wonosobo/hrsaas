"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useImportEmployee } from "../hooks/use-import-employee";

interface ExcelRow {
  [key: string]: string | number | null;
}

interface ImportEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREVIEW_COLUMNS = [
  "no",
  "nama_lengkap",
  "nomer_karyawan",
  "tempat_lahir",
  "tanggal_lahir",
  "jenis_kelamin",
  "golongan_darah",
  "status_pernikahan",
  "agama",
  "nomor_telepon",
  "email",
  "jenis_kontrak",
  "divisi",
  "jabatan",
  "tanggal_mulai_bekerja",
  "gaji",
];

const COLUMN_LABELS: Record<string, string> = {
  no: "No",
  nama_lengkap: "Nama Lengkap",
  nomer_karyawan: "Nomer Karyawan",
  tempat_lahir: "Tempat Lahir",
  tanggal_lahir: "Tanggal Lahir",
  jenis_kelamin: "Jenis Kelamin",
  golongan_darah: "Golongan Darah",
  status_pernikahan: "Status Pernikahan",
  agama: "Agama",
  nomor_telepon: "Nomor Telepon",
  email: "Email",
  jenis_kontrak: "Jenis Kontrak",
  divisi: "Divisi",
  jabatan: "Jabatan",
  tanggal_mulai_bekerja: "Tanggal Mulai Bekerja",
  gaji: "Gaji",
};

export default function ImportEmployee({ isOpen, onClose }: ImportEmployeeProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // declared before useImportEmployee so it can be passed as callback
  const handleRemoveFile = () => {
    setFile(null);
    setRows([]);
    setHeaders([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleRemoveFile();
    onClose();
  };

  const { mutate, isPending } = useImportEmployee(handleClose);

  const parseExcel = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: null });

      if (jsonData.length > 0) {
        setHeaders(Object.keys(jsonData[0]));
        setRows(jsonData);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFile = useCallback(
    (selectedFile: File) => {
      const isExcel =
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls");

      if (!isExcel) {
        alert("Hanya file Excel (.xlsx / .xls) yang diperbolehkan.");
        return;
      }

      setFile(selectedFile);
      parseExcel(selectedFile);
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        no: 1,
        nama_lengkap: "Budi Santoso",
        nomer_karyawan: "EMP001",
        tempat_lahir: "Jakarta",
        tanggal_lahir: "1990-05-20",
        jenis_kelamin: "Laki-laki",
        golongan_darah: "A",
        status_pernikahan: "Belum Menikah",
        agama: "Islam",
        nomor_telepon: "081234567890",
        email: "budi@example.com",
        jenis_kontrak: "Tetap",
        divisi: "Engineering",
        jabatan: "Software Engineer",
        tanggal_mulai_bekerja: "2024-01-01",
        gaji: 10000000,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Karyawan");
    XLSX.writeFile(workbook, "template_import_karyawan.xlsx");
  };

  const handleSubmit = () => {
    if (!file) return;
    mutate(file);
  };

  const visibleHeaders = headers
    .filter((h) => PREVIEW_COLUMNS.includes(h.toLowerCase()))
    .slice(0, 8);

  const displayHeaders = visibleHeaders.length > 0 ? visibleHeaders : headers.slice(0, 6);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isPending) handleClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Import data karyawan</DialogTitle>
          <DialogDescription>
            Unggah file Excel untuk menambahkan data karyawan secara massal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/20 hover:border-ring hover:bg-muted/40"
            }`}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Upload className="size-7" />
            </div>
            <div className="text-center">
              <p className="font-medium">Seret &amp; lepas file di sini</p>
              <p className="mt-1 text-sm text-muted-foreground">
                atau klik untuk memilih file
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Format yang didukung: .xlsx, .xls
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleDownloadTemplate(); }}
              className="mt-1"
            >
              <Download />
              Download template
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/40">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="size-6 text-emerald-700 dark:text-emerald-300" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {rows.length} baris data ditemukan
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Hapus file yang dipilih"
              onClick={handleRemoveFile}
            >
              <X />
            </Button>
          </div>
        )}

        {rows.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">
              Preview data ({Math.min(rows.length, 5)} dari {rows.length} baris)
            </p>
            <div className="overflow-x-auto rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    {displayHeaders.map((header) => (
                      <TableHead
                        key={header}
                      >
                        {COLUMN_LABELS[header.toLowerCase()] ?? header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 5).map((row, i) => (
                    <TableRow
                      key={i}
                    >
                      <TableCell className="text-muted-foreground">
                        {i + 1}
                      </TableCell>
                      {displayHeaders.map((header) => (
                        <TableCell
                          key={header}
                          className="max-w-40 truncate"
                        >
                          {row[header] !== null && row[header] !== undefined ? (
                            String(row[header])
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {rows.length > 5 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                + {rows.length - 5} baris lainnya tidak ditampilkan
              </p>
            )}
          </div>
        )}
      </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isPending}
          >
            {isPending ? "Mengimpor..." : "Import"}
            {rows.length > 0 ? ` (${rows.length} data)` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
