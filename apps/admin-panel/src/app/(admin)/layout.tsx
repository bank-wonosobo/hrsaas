"use client";
import Header from "@/components/shared/header";
import Sidebar from "@/components/shared/sidebar/sidebar";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header onMenuClick={() => setOpen(true)} />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 border-r-[1.5px] border-zinc-100 bg-white">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        {open && (
          <div className="fixed inset-0 z-999 flex">
            {/* Overlay */}
            <div
              className="flex-1 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <div className="w-72 bg-white h-full shadow-xl">
              <div className="flex items-center justify-between p-4 ">
                <button onClick={() => setOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-scroll bg-zinc-50">
          <div className="max-w-5xl mx-auto ">
            <Toaster position="top-center" />
            {children}
            <footer className="relative mt-10 w-full bottom-0 flex items-center justify-between px-6 py-5 text-xs text-gray-400 border-t border-gray-100">
              <p>Copyright © 2025 BW Akses+</p>
              <div className="flex gap-2 opacity-70">
                <Link
                  target="_blank"
                  href="https://play.google.com/store/apps/details?id=id.co.bankwonosobo.bwaccess&hl=id"
                >
                  <Image
                    width={100}
                    height={50}
                    src="/getin-gp.png"
                    alt="Android Store"
                  />
                </Link>
                <Link
                  target="_blank"
                  href="https://www.apple.com/id/app-store/"
                >
                  <Image
                    width={100}
                    height={50}
                    src="/getin-as.png"
                    alt="Apple Store"
                  />
                </Link>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
