"use client";

import { uploadFile, uploadFileWithSignedUrl } from "@/lib/upload";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface Props {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  error?: string;
  useSignedUrl?: boolean;
  isPublic?: boolean;
}

export default function FileUploader({
  value,
  onChange,
  accept = "*/*",
  error,
  useSignedUrl = false,
  isPublic = false,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setIsUploading(true);
      try {
        const url = useSignedUrl
          ? await uploadFileWithSignedUrl(file, isPublic)
          : await uploadFile(file);
        onChange(url);
      } catch {
        setFileName("");
      } finally {
        setIsUploading(false);
      }
    },
    [isPublic, onChange, useSignedUrl],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setFileName("");
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (value && fileName) {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText size={18} className="text-blue-600 shrink-0" />
          <span className="text-sm text-zinc-700 truncate">{fileName}</span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="p-1 rounded-full hover:bg-blue-100 transition shrink-0"
        >
          <X size={15} className="text-zinc-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center justify-center gap-2 transition-colors ${
          isUploading
            ? "border-zinc-300 bg-zinc-50 cursor-not-allowed"
            : isDragging
              ? "border-primary bg-primary/5 cursor-pointer"
              : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 cursor-pointer"
        }`}
      >
        {isUploading ? (
          <Loader2 size={22} className="text-zinc-400 animate-spin" />
        ) : (
          <Upload size={22} className="text-zinc-400" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-600">
            {isUploading ? "Mengupload..." : "Seret & lepas atau klik untuk pilih file"}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
