"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("PWA service worker registration failed", error);
    });
  }, []);

  return null;
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone =
      "standalone" in window.navigator &&
      Boolean(
        (window.navigator as Navigator & { standalone?: boolean }).standalone,
      );

    return standalone || iosStandalone;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  }

  if (isInstalled) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleInstall}
      disabled={!installPrompt}
      title={
        installPrompt
          ? "Install aplikasi"
          : "Install belum tersedia di browser ini"
      }
    >
      <Download />
      Install aplikasi
    </Button>
  );
}
