"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const tabs = [
  { label: "User", path: "/users" },
  { label: "Hak Akses", path: "/users/permissions" },
];

export default function UsersLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const activePath = pathname.startsWith("/users/permissions")
    ? "/users/permissions"
    : "/users";

  return (
    <div className="space-y-5">
      <Tabs
        value={activePath}
        onValueChange={(path) => router.push(path)}
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.path} value={tab.path}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}
