import usePWAInstall from "../../hooks/usePWAInstall";

export default function PWAInstallButton() {
  const { isIOS, isInStandalone, showInstallUI, install } = usePWAInstall();

  if (isInStandalone) return null;

  // ---- ANDROID / CHROME ----
  if (showInstallUI && !isIOS) {
    return (
      <button
        onClick={install}
        style={{
          background: "#000",
          color: "#fff",
          padding: "16px",
          borderRadius: "12px",
          fontSize: "12px",
          margin: "10px auto",
          display: "block",
          cursor: "pointer",
        }}
      >
        📲 Agregar Costo Comida Menú a tu pantalla de inicio
      </button>
    );
  }

  // ---- iOS MANUAL GUIDE ----
  if (isIOS) {
    return (
      <div
        style={{
          background: "#fff8e7",
          border: "1px solid #f0d9b5",
          padding: "16px",
          borderRadius: "12px",
          margin: "10px",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        📱 <strong>Instala Costo Comida Menú</strong>
        <br />
        Abre el menú de compartir y toca:
        <br />
        <strong>“Añadir a la pantalla de inicio”</strong>
      </div>
    );
  }

  return null;
}
