// copy/costoComidaMiniApp.ts
export const MINIAPP_COPY = {
  directa: {
    capture: {
      title: "Sube tus platos y calcula su rentabilidad 🍽️",
      subtitle:
        "Agrega tus ingredientes y el precio de venta. Ve el costo real y el margen de cada plato en minutos.",
      cta: "Empezar ahora",
      badge: "Herramienta gratuita para dueños de restaurantes",
      placeholders: {
        name: "Tu nombre",
        contact: "tu@email.com o +52 123 456 7890",
        businessType: "Selecciona una opción",
      },
      fieldLabels: {
        name: "Nombre",
        contact: "WhatsApp o correo",
        businessType: "Tipo de negocio",
      },
    },
    confirm: {
      title: (name: string) => `¡Listo, ${name}!`,
      subtitle:
        "Ahora registra tus ingredientes y comienza a calcular el costo real de tus platos.",
      cta: "Ir al mini-app",
    },
  },

  amigable: {
    capture: {
      title: "Convierte tus recetas en números claros",
      subtitle:
        "Sube tus platos, agrega ingredientes y descubre cuáles te dejan mejor ganancia. Simple y rápido.",
      cta: "Calcular mis platos",
      badge: "Gratis y fácil de usar",
      placeholders: {
        name: "Tu nombre",
        contact: "tu@email.com o +57 300 000 0000",
        businessType: "Selecciona una opción",
      },
      fieldLabels: {
        name: "Nombre",
        contact: "WhatsApp o correo",
        businessType: "Tipo de negocio",
      },
    },
    confirm: {
      title: (name: string) => `¡Perfecto, ${name}!`,
      subtitle:
        "Bienvenido. Empieza agregando tus ingredientes y ve tu margen al instante.",
      cta: "Empezar a calcular",
    },
  },

  motivadora: {
    capture: {
      title: "Tu menú puede ser rentable hoy",
      subtitle:
        "Carga tus platos, define precios y deja que nosotros calculemos el costo y el margen por ti.",
      cta: "Probar gratis",
      badge: "Optimiza tu rentabilidad",
      placeholders: {
        name: "Tu nombre",
        contact: "tu@email.com o +56 9 0000 0000",
        businessType: "Selecciona una opción",
      },
      fieldLabels: {
        name: "Nombre",
        contact: "WhatsApp o correo",
        businessType: "Tipo de negocio",
      },
    },
    confirm: {
      title: (name: string) => `¡A darle, ${name}!`,
      subtitle:
        "Entra al mini-app, registra tus ingredientes y ve qué platos dejan más margen 💸.",
      cta: "Ir a calcular",
    },
  },
} as const;
