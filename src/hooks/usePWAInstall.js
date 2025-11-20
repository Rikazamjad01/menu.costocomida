import { useEffect, useState } from "react";

export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandalone, setIsInStandalone] = useState(false);
  const [showInstallUI, setShowInstallUI] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iOS);

    setIsInStandalone(window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone);

    const handler = (e) => {
      e.preventDefault(); // Prevent browser auto-popup
      setDeferredPrompt(e);
      setShowInstallUI(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log("User choice:", outcome);

    setDeferredPrompt(null);
    setShowInstallUI(false);
  };

  return {
    isIOS,
    isInStandalone,
    showInstallUI,
    install,
  };
}
