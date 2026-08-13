import { cn } from "@/lib/utils";
import Providers from "@/providers/providers";
import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const googleSansFlex = Google_Sans({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HR SaaS Admin",
  description: "Admin dashboard for HR SaaS application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        googleSansFlex.className,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        <div>
          <Toaster />
        </div>

        <Providers>
          <NextTopLoader height={4} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
