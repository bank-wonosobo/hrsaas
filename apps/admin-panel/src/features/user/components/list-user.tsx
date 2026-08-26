"use client";

import { PageSelector } from "@/components/shared/page-selector/page-selector";
import { Pagination } from "@/components/shared/pagination/pagination";
import Button from "@/components/ui/button/button";
import ImageViewer from "@/components/ui/image-viewer/image-viewer";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetUsers } from "../hooks/use-get-users";
import { SearchUserRequest, User } from "../schemas/auth-schema";
import DetailUserModal from "./detail/detail-user-modal";

interface Props {
  search: SearchUserRequest;
}

function UserCard({ user, onDetail }: { user: User; onDetail: () => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
      {/* Avatar */}
      <div className="h-11 w-11 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-lg font-semibold flex-shrink-0">
        {user.image_url ? (
          <ImageViewer width={60} height={60} circle src={user.image_url} />
        ) : (
          user.name.charAt(0).toUpperCase()
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-800 truncate">
            {user.name}
          </span>
          {user.email_verified && (
            <BadgeCheck size={14} className="text-green-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
        {user.roles && user.roles.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <ShieldCheck size={11} className="text-gray-400" />
            <span className="text-xs text-gray-400">
              {user.roles.map((r) => r.name).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Status & Action */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            user.email_verified
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {user.email_verified ? "Terverifikasi" : "Belum"}
        </span>
        <Button variant="link" onClick={onDetail}>
          Detail
        </Button>
      </div>
    </div>
  );
}

export default function ListUser({ search }: Props): React.ReactNode {
  const router = useRouter();
  const { data, isLoading, isFetching } = useGetUsers(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-3">
        {data?.data?.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-400 text-sm">
            Tidak ada data pengguna
          </div>
        )}
        {data?.data.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onDetail={() => setSelectedId(user.id)}
          />
        ))}
      </div>

      {selectedId && (
        <DetailUserModal
          id={selectedId}
          isOpen={!!selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      {data && (
        <div className="flex flex-col w-full gap-5 items-end mt-5">
          <div className="flex w-full items-center justify-between gap-x-1">
            <p className="font-bold text-xs">
              Menampilkan {data?.data?.length} dari {data?.paging?.total_item}{" "}
              total data.
            </p>
            <PageSelector
              onValueChange={(size) => handleSize(size)}
              value={search.size?.toString() ?? "10"}
            />
          </div>
          <Pagination
            currentPage={Number(search.page)}
            paging={data.paging}
            onPageChange={(number) => handlePaginate(number)}
          />
        </div>
      )}
    </div>
  );
}
