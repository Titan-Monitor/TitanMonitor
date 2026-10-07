<div align="center">
<img width="1983" height="793" alt="banner" src="https://github.com/user-attachments/assets/aa07d478-d33a-4b3c-b564-9fee979f6c9f" />
# ⚡ TitanMonitor

**Calculadora de Arbitraje P2P, Monitor de Tasas y Agenda Financiera Inteligente con IA para Venezuela 🇻🇪**

[![GitHub release](https://img.shields.io/github/v/release/TitanMonitor/TitanMonitor?color=00F0FF&style=for-the-badge&logo=github)](https://github.com/TitanMonitor/TitanMonitor/releases/latest)
[![PWA Status](https://img.shields.io/badge/PWA-Ready-10B981?style=for-the-badge&logo=pwa)](https://titanmonitor.github.io/TitanMonitor)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android-1192EE?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-Multimodal-8E75B2?style=for-the-badge&logo=googlegemini)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[📱 Descargar APK Directo](https://github.com/TitanMonitor/TitanMonitor/releases/latest) • [🌐 Abrir Web App (PWA)](https://titanmonitor.github.io/TitanMonitor) • [🐛 Reportar Error / Sugerencia](https://github.com/TitanMonitor/TitanMonitor/issues)

</div>

---

## 🚀 Sobre el Proyecto

**TitanMonitor** es una suite financiera integral diseñada especialmente para comerciantes P2P, freelancers, pequeños negocios y usuarios particulares en Venezuela que operan diariamente con divisas (**USD, USDT, EUR**) y bolívares (**VES**). 

Combina la monitorización de tasas oficiales y del mercado en tiempo real, cálculo automatizado de márgenes de arbitraje, asistente conversacional de voz y escaneo visual de comprobantes con **Google Gemini AI**, y una agenda financiera completa con soporte Local-First para privacidad absoluta.

---

## ✨ Características Principales

### 📊 1. Monitor de Tasas y Gráficos Históricos
* **Cotizaciones en Tiempo Real:** Seguimiento constante del Dólar BCV, Dólar Paralelo / EnParaleloVzla, Binance P2P USDT y Euro BCV.
* **Gráfica de Fluctuaciones e Historial 2026:** Visualización interactiva con Recharts para estudiar tendencias, rangos de volatilidad y promedios diarios.
* **Brecha Cambiaria:** Cálculo automático del diferencial porcentual entre la tasa oficial (BCV) y el mercado paralelo/USDT.
* **Exportación y Compartir:** Generación de tarjetas visuales listas para compartir en WhatsApp, Telegram o redes sociales con las tasas del día.

### 🔄 2. Calculadora de Arbitraje P2P
* **Simulador de Ciclos P2P:** Modela compras y ventas en bolívares y USDT incluyendo comisiones de plataformas (Binance, El Dorado, Zinli, etc.).
* **Métricas Clave:** Cálculo instantáneo de rentabilidad porcentual (**ROI**), ganancia bruta y neta en USD/VES por ciclo.
* **Historial de Operaciones:** Registro detallado de cada orden realizada con cálculo acumulado de rendimiento.
* **Comprobante Gráfico Compartible:** Generación de imágenes estilizadas de las operaciones de arbitraje para registro personal o envío a clientes.

### 📅 3. Agenda Financiera y Control de Gastos
* **Registro de Ingresos y Gastos:** Clasificación por categorías (*Alimentación, Servicios, Transporte, Nómina, etc.*) y divisas (**VES / USD**).
* **Gastos Fijos y Recordatorios Flotantes:** Control de pagos recurrentes con alertas de vencimiento y notificaciones push locales.
* **Cuentas y Fondos de Ahorro:** Creación de alcancías digitales y seguimiento de metas de ahorro progresivas.
* **Presupuesto por Categorías:** Límites mensuales con barras de progreso visuales y cálculo de remanente.
* **Teclado Numérico Ergonómico:** Entrada ultrarrápida de montos optimizada para uso con una sola mano en móviles.

### 🤖 4. Inteligencia Artificial Multimodal (Google Gemini AI)
* 🎙️ **Asistente de Voz Financiero:** Envía notas de voz como *"Anoté un gasto de 15 dólares en supermercado"* o *"¿Cuánto he gastado este mes?"* para registro automático o resumen.
* 📷 **Escaneo OCR de Comprobantes (Visión):** Captura con la cámara o sube comprobantes de Pago Móvil, transferencias bancarias o facturas para auto-completar monto, banco, referencia y fecha al instante.
* 💬 **Chat Financiero Rápido:** Interfaz conversacional fluida para registrar movimientos complejos utilizando lenguaje natural.

### 🎨 5. Diseño Avanzado y Experiencia de Usuario (UI/UX)
* **Modo OLED Puro & Modo Claro:** Optimizado para pantallas AMOLED/OLED con consumo mínimo de energía.
* **Dock Flotante con Borde Dinámico:** Barra de navegación inferior con estética moderna, curvatura fluida y delineado en el color de acento.
* **Personalización de Acento:** Selección de color de la interfaz con aplicación instantánea en variables CSS.
* **Sincronización con Barras del Sistema:** Ajuste automático de tono en la barra de notificaciones superior (*Status Bar*) y la barra de navegación inferior del dispositivo móvil.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion) |
| **Visualización** | Recharts, Lucide Icons |
| **Inteligencia Artificial** | Google GenAI SDK (`@google/genai`), Gemini Multimodal (Voz, OCR Visión y Chat) |
| **Backend & Servidor** | Node.js, Express, TSX, esbuild |
| **Móvil / PWA** | Capacitor (Android, Local Notifications), Web App Manifest, Service Worker |
| **Build Tooling** | Vite 6 |

---

## 📂 Estructura del Proyecto

```text
TitanMonitor/
├── android/                   # Proyecto nativo Android configurado con Capacitor
├── public/                    # Archivos estáticos y manifest PWA
├── src/
│   ├── assets/                # Iconos, logotipos y recursos gráficos
│   ├── components/            # Componentes de la interfaz de usuario
│   │   ├── AgendaFinanciera.tsx       # Módulo principal de presupuesto y gastos
│   │   ├── Arbitraje.tsx              # Calculadora y simulador de arbitraje P2P
│   │   ├── BottomNav.tsx              # Barra de navegación dock inferior
│   │   ├── DetailedRatesModal.tsx     # Gráficos y análisis de tasas
│   │   ├── Historial.tsx              # Histórico de transacciones y rentabilidad
│   │   ├── Home.tsx                   # Panel principal con tarjetas de tasas
│   │   ├── LiveCameraModal.tsx        # Escáner de comprobantes con cámara
│   │   ├── Personalizacion.tsx        # Ajustes de color, tema y preferencias
│   │   ├── VoiceAgentChatModal.tsx    # Asistente de IA multimodal por voz y texto
│   │   └── ...
│   ├── context/               # Contextos de estado global
│   ├── data/                  # Datos de tasas históricas y bancos
│   ├── utils/                 # Utilidades de cálculo, tasas, OCR, audio y sistema
│   │   ├── audioRecorder.ts           # Grabación y codificación de audio para IA
│   │   ├── geminiAI.ts                # Integración con Google Gemini API
│   │   ├── systemBars.ts              # Control de Status Bar y Navigation Bar móvil
│   │   ├── rateHistory.ts             # Sincronización y caché de tasas
│   │   └── themeColors.ts             # Gestión de paleta de temas y variables CSS
│   ├── App.tsx                # Contenedor raíz y enrutamiento por vistas
│   ├── index.css              # Estilos globales y temas Tailwind CSS
│   └── main.tsx               # Punto de entrada React
├── metadata.json              # Configuración y permisos del applet
├── package.json               # Dependencias y scripts del proyecto
├── server.ts                  # Servidor proxy Express y API backend
└── vite.config.ts             # Configuración de compilación Vite
