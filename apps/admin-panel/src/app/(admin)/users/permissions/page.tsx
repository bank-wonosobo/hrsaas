// import Title from "@/components/ui/title/title";
// import PermissionsRolesView from "@/features/permission/components/permissions-roles-view";
// import { SearchPermissionRequest } from "@/features/permission/schemas/permission-schema";
// import { SearchRoleRequest } from "@/features/role/schemas/role-schema";
// import { serverApi } from "@/lib/server-api";
// import { getQueryclient } from "@/providers/get-query-client";
// import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
// import type React from "react";

// type Props = {
//   searchParams: Promise<{
//     key?: string;
//     page?: string;
//     size?: string;
//     tab?: string;
//   }>;
// };

// export default async function PermissionsPage({
//   searchParams,
// }: Props): Promise<React.ReactNode> {
//   const params = await searchParams;
//   const key = params.key || "";
//   const page = Number(params.page || 1);
//   const size = Number(params.size || 10);
//   const tab = params.tab || "permissions";

//   const permissionSearch: SearchPermissionRequest = { key, page, size };
//   const roleSearch: SearchRoleRequest = { key, page, size };

//   const queryClient = getQueryclient();

//   await Promise.all([
//     queryClient.prefetchQuery({
//       queryKey: ["permissions", key, page, size],
//       queryFn: () => serverApi("permissions", { name: key, page, size }),
//     }),
//     queryClient.prefetchQuery({
//       queryKey: ["roles", key, page, size],
//       queryFn: () => serverApi("roles", { name: key, page, size }),
//     }),
//   ]);

//   return (
//     <>
//       <Title title="Roles & Permissions" />
//       <HydrationBoundary state={dehydrate(queryClient)}>
//         <PermissionsRolesView
//           permissionSearch={permissionSearch}
//           roleSearch={roleSearch}
//         />
//       </HydrationBoundary>
//     </>
//   );
// }

import Title from "@/components/ui/title/title";
import PivotTable from "@/features/permission/components/pivot-table";
import type React from "react";

export default function PermissionsPage(): React.ReactNode {
  return (
    <>
      <Title title="Roles & Permissions" />
      <PivotTable />
    </>
  );
}
