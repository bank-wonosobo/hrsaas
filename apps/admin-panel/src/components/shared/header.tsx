/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLogout } from "@/features/user/hooks/use-logout";
import { LogOut, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import Logo from "./logo";

export default function Header({
  onMenuClick,
  user,
}: {
  onMenuClick: () => void;
  user?: any;
}) {
  const router = useRouter();
  const { mutate: handleLogout } = useLogout();

  return (
    <header className="sticky top-0 z-50 w-full border-b-[1.5px] border-zinc-100 bg-white px-6 md:px-10 py-6 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-8">
        <Logo />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-40 rounded-xl border border-zinc-100 bg-white shadow-md py-1 animate-in fade-in-0 zoom-in-95"
            >
              {user?.name && (
                <>
                  <div className="px-3 py-2 text-xs text-zinc-500 font-medium truncate max-w-50">
                    {user.name}
                  </div>
                  <DropdownMenu.Separator className="h-px bg-zinc-100 my-1" />
                </>
              )}

              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 cursor-pointer focus:outline-none focus:bg-zinc-50"
                onSelect={() => router.push("/profile")}
              >
                <User className="w-4 h-4" />
                Profil
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-zinc-100 my-1" />

              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer focus:outline-none focus:bg-red-50"
                onSelect={() => handleLogout()}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="flex items-center gap-4">
          <button className="lg:hidden" onClick={onMenuClick}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
