"use client";
import { Tab } from "@/lib/type";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  tabs: Tab[];
}

export default function Tabs({ tabs }: Props) {
  const pathname = usePathname();
  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/", 1);

  return (
    <div className="w-full mb-8">
      <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <Link
            href={tab.path}
            key={tab.label}
            className={clsx(
              "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
              isActive(tab.path)
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/60",
            )}
          >
            {tab.label}
            {tab.totalData! > 0 && (
              <span
                className={clsx(
                  "inline-flex items-center justify-center min-w-4.5 h-4.5 text-[10px] font-semibold rounded-full px-1 transition-colors duration-200",
                  isActive(tab.path)
                    ? "bg-destructive text-white"
                    : "bg-gray-300 text-gray-500",
                )}
              >
                {tab.totalData}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
