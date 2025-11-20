import { useEffect, useState } from "react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidButton, setShowAndroidButton] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);

  // Detect iOS devices
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Detect if already in standalone mode
  const isInStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  useEffect(() => {
    if (isInStandalone) return;

    if (isIOS) {
      setShowIOSBanner(true);
    }

    // Android / Chrome beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidButton(true);
      // Auto-hide after 10 seconds if not clicked
      setTimeout(() => setShowAndroidButton(false), 10000);
    };

    window.addEventListener("beforeinstallprompt", handler as any);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as any);
    };
  }, [isInStandalone, isIOS]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log("User choice:", choiceResult.outcome);
    setDeferredPrompt(null);
    setShowAndroidButton(false);
  };

  if (isInStandalone) return null; // Already installed

  return (
    <>
      {/* Android / Chrome */}
      {showAndroidButton && !isIOS && (
        <button
          onClick={handleInstallClick}
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(to right, #A6D49F, #7BB97A)",
            border: "1px solid #4e9643",
            color: "#fff",
            padding: "12px",
            borderRadius: "12px",
            fontSize: "14px",
            zIndex: 9999,
          }}
        >
          📲 Agregar Costo Comida Menú a tu pantalla de inicio
        </button>
      )}

      {/* iOS */}
      {showIOSBanner && (
        <div
          style={{
            position: "fixed",
            top: 10,
            left: 0,
            width: "100%",
            background: "linear-gradient(to right, #A6D49F, #7BB97A)",
            border: "1px solid #4e9643",
            padding: "12px",
            textAlign: "center",
            fontSize: "14px",
            zIndex: 9999,
          }}
        >
          📱 <strong>Instala Costo Comida Menú</strong>
          <br />
          Abre el menú de compartir y toca:
          <br />
          <strong>“Añadir a la pantalla de inicio”</strong>
          <br />
          <button
            onClick={() => setShowIOSBanner(false)}
            style={{
              marginTop: 8,
              padding: "6px 12px",
              borderRadius: 8,
              border: "none",
              background: "#7BB97A",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}
