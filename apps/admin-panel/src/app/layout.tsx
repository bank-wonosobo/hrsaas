import PwaRegister from "@/components/pwa-register";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Providers from "@/providers/providers";
import { ThemeProvider } from "@/providers/theme-provider";
import type { Metadata } from "next";
import { Google_Sans, Roboto } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import "./../css/globals.css";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const googleSansFlex = Google_Sans({
  variable: "--font-google-sans-flex",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HR SaaS Admin",
  description: "Admin dashboard for HR SaaS application",
  manifest: "/manifest.webmanifest",
  applicationName: "HR SaaS Admin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HR SaaS Admin",
  },
  icons: {
    icon: "/aksesplus-desk.png",
    apple: "/aksesplus-desk.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        googleSansFlex.className,
        roboto.className,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        <div>
          <Toaster />
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <TooltipProvider>
              <NextTopLoader height={5} color="#9ae600" />
              {children}
            </TooltipProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
