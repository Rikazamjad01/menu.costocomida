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
      const timer = setTimeout(() => setShowAndroidButton(false), 10000);
      return () => clearTimeout(timer);
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
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            zIndex: 9999,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(to right, #A6D49F, #7BB97A)",
            border: "1px solid #4e9643",
            padding: "12px 16px",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "14px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          <span>📲 Agregar Costo Comida Menú a tu pantalla de inicio</span>
          <button
            onClick={() => setShowAndroidButton(false)}
            style={{
              marginLeft: 8,
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* iOS Banner */}
      {showIOSBanner && (
        <div
          style={{
            position: "fixed",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            zIndex: 9999,
            background: "linear-gradient(to right, #A6D49F, #7BB97A)",
            border: "1px solid #4e9643",
            padding: "12px 16px",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "14px",
            textAlign: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          📱 <strong>Instala Costo Comida Menú</strong>
          <br />
          Abre el menú de compartir y toca:
          <br />
          <strong>“Añadir a la pantalla de inicio”</strong>
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
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}
