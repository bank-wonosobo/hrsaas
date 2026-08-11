"use client";
import { SearchPermissionRequest } from "@/features/permission/schemas/permission-schema";
import ListRole from "@/features/role/components/list-role";
import MenuRole from "@/features/role/components/menu-role";
import { SearchRoleRequest } from "@/features/role/schemas/role-schema";
import React from "react";
import ListPermission from "./list-permission";
import MenuPermission from "./menu-permission";

interface Props {
  permissionSearch: SearchPermissionRequest;
  roleSearch: SearchRoleRequest;
}

export default function PermissionsRolesView({
  permissionSearch,
  roleSearch,
}: Props): React.ReactNode {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <section>
        <h2 className="text-base font-semibold mb-3">Permissions</h2>
        <MenuPermission />
        <ListPermission search={permissionSearch} />
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">Roles</h2>
        <MenuRole />
        <ListRole search={roleSearch} />
      </section>
    </div>
  );
}
