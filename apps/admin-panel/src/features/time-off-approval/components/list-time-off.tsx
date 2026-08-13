"use client";

import { Pagination } from "@/components/shared/pagination/pagination";
import Table from "@/components/ui/table/table";

import { PageSelector } from "@/components/shared/page-selector/page-selector";
import Badge from "@/components/ui/badge/badge";
import Button from "@/components/ui/button/button";
import Modal from "@/components/ui/modal/modal";
import toIDDate from "@/lib/utils";
import { Check, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSearchTimeOffAppr } from "../hooks/use-search-timeoffappr";
import {
  SearchTimeOffApproval,
  TimeOffApproval,
} from "../schemas/time-off-approval-schema";
import ActionTimeOffAppr from "./action-time-offappr";

interface Props {
  search: SearchTimeOffApproval;
}

function TimeOffDetailModal({
  approval,
  isOpen,
  onClose,
}: {
  approval: TimeOffApproval | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!approval) return null;

  const req = approval.time_off_request;
  const contract = req.employee.contracts?.[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Pengajuan Cuti"
      maxWidth="md"
    >
      <div className="flex flex-col gap-5">
        {/* Info Karyawan */}
        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
          <div className="h-11 w-11 rounded-full bg-zinc-200 text-zinc-700 font-semibold flex items-center justify-center text-base shrink-0">
            {req.employee.fullname.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-zinc-900">
              {req.employee.fullname}
            </p>
            <p className="text-xs text-zinc-400">
              {contract
                ? `${contract.position.name} · ${contract.division.name}`
                : "–"}
            </p>
            <p className="text-xs text-zinc-400">
              {req.employee.employee_number}
            </p>
          </div>
        </div>

        {/* Info Pengajuan */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Informasi Pengajuan
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-xs text-zinc-400">Jenis Cuti</p>
              <p className="text-sm font-medium text-zinc-800">
                {req.time_off_type.name}
              </p>
              <p className="text-xs text-zinc-400">
                {req.time_off_type.category}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Status Pengajuan</p>
              <Badge
                variant={
                  req.request_status === "PENDING"
                    ? "warning"
                    : req.request_status === "REJECTED"
                      ? "danger"
                      : "success"
                }
              >
                {req.request_status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Tanggal Pengajuan</p>
              <p className="text-sm font-medium text-zinc-800">
                {toIDDate(new Date(req.created_at))}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Total Hari</p>
              <p className="text-sm font-medium text-zinc-800">
                {req.requested_days} hari
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Tanggal Mulai</p>
              <p className="text-sm font-medium text-zinc-800">
                {toIDDate(new Date(req.start_date))}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400">Tanggal Akhir</p>
              <p className="text-sm font-medium text-zinc-800">
                {toIDDate(new Date(req.end_date))}
              </p>
            </div>
          </div>
        </div>

        {/* Alasan */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
            Alasan
          </p>
          <p className="text-sm text-zinc-700 bg-zinc-50 rounded-lg px-3 py-2 leading-relaxed">
            {req.request_reason || (
              <span className="text-zinc-400 italic">Tidak ada alasan</span>
            )}
          </p>
        </div>

        {/* File */}
        {req.file_url && (
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Lampiran
            </p>
            <a
              href={req.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-2 rounded-lg"
            >
              <FileText size={15} />
              Lihat File
            </a>
          </div>
        )}

        {/* Approval */}
        {req.approvals && req.approvals.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Approval
            </p>
            <div className="flex flex-col gap-2">
              {req.approvals.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 py-2.5 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                        item.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : item.status === "REJECTED"
                            ? "bg-red-100 text-red-600"
                            : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {item.employee_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-800">
                        {item.employee_name}
                      </p>
                      {item.action_at ? (
                        <p className="text-xs text-zinc-400">
                          {toIDDate(new Date(item.action_at * 1000))}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-400">Belum ada aksi</p>
                      )}
                      {item.action_reason && (
                        <p className="text-xs text-zinc-500 mt-0.5 italic">
                          &ldquo;{item.action_reason}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {item.status === "APPROVED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <Check size={11} /> Disetujui
                      </span>
                    ) : item.status === "REJECTED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        <X size={11} /> Ditolak
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                        Menunggu
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function ListTimeOffApproval({
  search,
}: Props): React.ReactNode {
  const router = useRouter();
  const [selectedApproval, setSelectedApproval] =
    useState<TimeOffApproval | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, isLoading, isFetching } = useSearchTimeOffAppr(search);

  const handlePaginate = (number: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", number.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSize = (size: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("size", size);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleOpenDetail = (approval: TimeOffApproval) => {
    setSelectedApproval(approval);
    setIsDetailModalOpen(true);
  };

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Table
        data={data?.data || []}
        keyExtractor={(row) => row.id}
        columns={[
          {
            header: "Karyawan",
            accessor: (row) => (
              <div className="flex items-center justify-start gap-3 min-w-30">
                <div className="h-9 w-9 rounded-full bg-gray-200 flex justify-center items-center font-medium text-zinc-600">
                  {row.time_off_request.employee.fullname
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {row.time_off_request.employee.fullname}
                  </span>
                  <span className="text-xs font-light text-zinc-400">
                    {
                      row.time_off_request.employee.contracts?.[0]?.position
                        .name
                    }{" "}
                    ·{" "}
                    {
                      row.time_off_request.employee.contracts?.[0]?.division
                        .name
                    }
                  </span>
                </div>
              </div>
            ),
          },
          {
            header: "Tgl Pengajuan",
            accessor: (row) => (
              <p className="text-sm text-zinc-700">
                {toIDDate(new Date(row.time_off_request.created_at))}
              </p>
            ),
          },
          {
            header: "Jenis Cuti",
            accessor: (row) => (
              <div>
                <p className="text-sm text-zinc-800">
                  {row.time_off_request.time_off_type.name}
                </p>
                <p className="text-xs text-zinc-400">
                  {row.time_off_request.time_off_type.category}
                </p>
              </div>
            ),
          },
          {
            header: "Periode",
            accessor: (row) => (
              <div>
                <p className="text-sm text-zinc-700 whitespace-nowrap">
                  {toIDDate(new Date(row.time_off_request.start_date))} s/d{" "}
                  <br />
                  {toIDDate(new Date(row.time_off_request.end_date))}
                </p>
                <p className="text-xs text-zinc-400">
                  {row.time_off_request.requested_days} hari
                </p>
              </div>
            ),
          },
          {
            header: "Status",
            accessor: (row) => (
              <Badge
                variant={
                  row.status === "PENDING"
                    ? "warning"
                    : row.status === "REJECTED"
                      ? "danger"
                      : "success"
                }
              >
                {row.status}
              </Badge>
            ),
          },
          {
            header: "",
            accessor: (row) => (
              <div className="flex items-center gap-2 justify-end">
                {row.status === "PENDING" && <ActionTimeOffAppr id={row.id} />}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDetail(row)}
                >
                  Detail
                </Button>
              </div>
            ),
            className: "text-right",
          },
        ]}
      />
      {data && (
        <div className="flex flex-col w-full gap-5 justify-cente items-end mt-5">
          <div className="flex w-full items-center justify-between gap-x-1">
            <p className="font-bold text-xs">
              Menampilkan {data?.data?.length} dari {data?.paging?.total_item}{" "}
              total data.
            </p>
            <PageSelector
              onValueChange={(size) => handleSize(size)}
              value={search.size?.toString() ?? "0"}
            />
          </div>
          <Pagination
            currentPage={Number(search.page)}
            paging={data.paging}
            onPageChange={(number) => handlePaginate(number)}
          />
        </div>
      )}

      <TimeOffDetailModal
        approval={selectedApproval}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}
