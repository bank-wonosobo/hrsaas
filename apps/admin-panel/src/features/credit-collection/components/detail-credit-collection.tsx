"use client";

import { Pagination } from "@/components/shared/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, History, MapPin } from "lucide-react";
import { useState } from "react";
import { getCreditCollectionHistory } from "../services/get-credit-collection-history";

interface Props {
  noPjm: string;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}

export default function DetailCreditCollection({ noPjm }: Props) {
  const [historyPage, setHistoryPage] = useState(1);
  const historyQuery = useQuery({
    queryKey: ["credit-collection-history", noPjm, historyPage],
    queryFn: () => getCreditCollectionHistory(noPjm, historyPage, 10),
  });
  const firstRecord = historyQuery.data?.data[0];
  const loan = firstRecord?.pinjaman;

  if (historyQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  if (historyQuery.isError) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          {historyQuery.error.message || "Riwayat penagihan gagal dimuat."}
        </CardContent>
      </Card>
    );
  }

  if (!historyQuery.data?.data.length || !loan) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Belum ada riwayat penagihan untuk pinjaman {noPjm}.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi pinjaman</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Nama nasabah" value={loan.nasabah_name} />
            <DetailItem label="Nomor pinjaman" value={loan.no_pjm} />
            <DetailItem label="ID nasabah" value={loan.nasabah_id} />
            <DetailItem label="Jenis pinjaman" value={loan.loan_type} />
            <DetailItem label="Unit" value={loan.unit} />
            <DetailItem label="Kolektibilitas" value={loan.collectibility} />
            <DetailItem label="Plafon" value={formatRupiah(loan.loan_limit)} />
            <DetailItem
              label="Sisa pinjaman"
              value={formatRupiah(loan.outstanding_balance)}
            />
            <DetailItem
              label="Total tunggakan"
              value={formatRupiah(loan.overdue_total)}
            />
            <DetailItem label="Status pinjaman" value={loan.loan_status} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            Riwayat penagihan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {historyQuery.data.data.map((item) => (
            <article
              key={item.id}
              className="space-y-4 rounded-xl border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {item.employee_name || item.employee_id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <Badge variant="secondary">
                  {item.pinjaman.loan_status || "Status tidak tersedia"}
                </Badge>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Jumlah dibayar"
                  value={formatRupiah(item.total_paid)}
                />
                <DetailItem
                  label="Sisa pinjaman"
                  value={formatRupiah(item.pinjaman.outstanding_balance)}
                />
                <DetailItem
                  label="Total tunggakan"
                  value={formatRupiah(item.pinjaman.overdue_total)}
                />
                <DetailItem label="Komitmen" value={item.commitment} />
              </dl>
              <div className="flex flex-wrap items-center gap-4">
                {item.lat && item.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(`${item.lat},${item.lng}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                  >
                    <MapPin className="size-3.5" />
                    Lokasi kunjungan
                  </a>
                )}
                {item.img_url && (
                  <a
                    href={item.img_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Buka foto kunjungan
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </article>
          ))}
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {historyQuery.data.paging.total_item} catatan riwayat
            </p>
            <Pagination
              paging={historyQuery.data.paging}
              currentPage={historyPage}
              onPageChange={setHistoryPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
