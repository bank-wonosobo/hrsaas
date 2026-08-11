"use client";

import Button from "@/components/ui/button/button";
import Modal from "@/components/ui/modal/modal";
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Data Karyawan"
      maxWidth="xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isPending} loading={isPending}>
            Import {rows.length > 0 ? `(${rows.length} data)` : ""}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50"
            }`}
          >
            <div className="p-4 bg-zinc-100 rounded-full">
              <Upload size={28} className="text-zinc-500" />
            </div>
            <div className="text-center">
              <p className="font-medium text-zinc-700">Seret &amp; lepas file di sini</p>
              <p className="text-sm text-zinc-400 mt-1">atau klik untuk memilih file</p>
            </div>
            <p className="text-xs text-zinc-400">Format yang didukung: .xlsx, .xls</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleDownloadTemplate(); }}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
            >
              <Download size={13} />
              Download template
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={22} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-zinc-800">{file.name}</p>
                <p className="text-xs text-zinc-500">{rows.length} baris data ditemukan</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1.5 rounded-full hover:bg-green-100 transition"
            >
              <X size={16} className="text-zinc-500" />
            </button>
          </div>
        )}

        {rows.length > 0 && (
          <div>
            <p className="text-sm font-medium text-zinc-700 mb-2">
              Preview Data ({Math.min(rows.length, 5)} dari {rows.length} baris)
            </p>
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-zinc-500 font-medium w-8">#</th>
                    {displayHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2.5 text-left text-zinc-500 font-medium whitespace-nowrap"
                      >
                        {COLUMN_LABELS[header.toLowerCase()] ?? header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-zinc-100 last:border-none hover:bg-zinc-50"
                    >
                      <td className="px-3 py-2.5 text-zinc-400">{i + 1}</td>
                      {displayHeaders.map((header) => (
                        <td
                          key={header}
                          className="px-3 py-2.5 text-zinc-700 whitespace-nowrap max-w-40 truncate"
                        >
                          {row[header] !== null && row[header] !== undefined ? (
                            String(row[header])
                          ) : (
                            <span className="text-zinc-300">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 5 && (
              <p className="text-xs text-zinc-400 mt-2 text-center">
                + {rows.length - 5} baris lainnya tidak ditampilkan
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
