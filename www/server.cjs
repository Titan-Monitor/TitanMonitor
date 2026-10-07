var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var aiClient = null;
function getGeminiClient(customKey) {
  const cleanKey = customKey?.trim();
  if (cleanKey) {
    return new import_genai.GoogleGenAI({
      apiKey: cleanKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable or user API key is required");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
var CANDIDATE_TEXT_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-pro",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-flash-latest"
];
var CANDIDATE_AUDIO_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-pro",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-flash-latest"
];
var CANDIDATE_VISION_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.1-pro",
  "gemini-3.1-pro-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-flash-latest"
];
var lastSuccessfulAiModel = null;
async function generateContentWithRetry(ai, candidateModels, params, timeoutMs = 15e3) {
  let lastError = null;
  const modelsToTry = [...candidateModels];
  if (lastSuccessfulAiModel && modelsToTry.includes(lastSuccessfulAiModel)) {
    const idx = modelsToTry.indexOf(lastSuccessfulAiModel);
    if (idx > 0) {
      modelsToTry.splice(idx, 1);
      modelsToTry.unshift(lastSuccessfulAiModel);
    }
  }
  for (const modelName of modelsToTry) {
    try {
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error(`Tiempo l\xEDmite (${timeoutMs}ms) excedido para ${modelName}`)), timeoutMs)
      );
      const requestPromise = (async () => {
        try {
          return await ai.models.generateContent({
            model: modelName,
            contents: params.contents,
            config: params.config
          });
        } catch (firstErr) {
          const errStr = String(firstErr?.message || firstErr);
          if (errStr.includes("thinking") || errStr.includes("schema") || errStr.includes("responseSchema") || errStr.includes("ThinkingLevel") || errStr.includes("JSON mode") || errStr.includes("responseMimeType")) {
            const fallbackConfig = { ...params.config };
            delete fallbackConfig.thinkingConfig;
            delete fallbackConfig.responseSchema;
            delete fallbackConfig.responseMimeType;
            return await ai.models.generateContent({
              model: modelName,
              contents: params.contents,
              config: fallbackConfig
            });
          }
          throw firstErr;
        }
      })();
      const response = await Promise.race([requestPromise, timeoutPromise]);
      const responseText = response?.text || "{}";
      let parsedData = null;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[1]);
          } catch {
          }
        }
        if (!parsedData) {
          const objectMatch = responseText.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            try {
              parsedData = JSON.parse(objectMatch[0]);
            } catch {
            }
          }
        }
      }
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        parsedData = parsedData[0];
      }
      if (!parsedData && typeof responseText === "string" && responseText.trim()) {
        const amountMatch = responseText.match(/(\d+(?:[.,]\d+)?)/);
        const isVES = /bs|bolivar|soberano/i.test(responseText);
        parsedData = {
          storeOrProduct: "Gasto extra\xEDdo",
          amount: amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : 0,
          currency: isVES ? "VES" : "USD",
          category: "Alimentaci\xF3n",
          notes: responseText.trim(),
          transcript: responseText.trim()
        };
      }
      if (parsedData && (parsedData.storeOrProduct !== void 0 || parsedData.amount !== void 0 || parsedData.category !== void 0 || parsedData.transcript !== void 0)) {
        lastSuccessfulAiModel = modelName;
        console.log(`[Gemini IA Premium] Solicitud resuelta exitosamente con '${modelName}'`);
        return parsedData;
      }
    } catch (err) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini Fallback] Modelo '${modelName}' fall\xF3: ${errMsg}. Probando siguiente modelo...`);
    }
  }
  throw lastError || new Error("Ning\xFAn modelo de Gemini pudo procesar la solicitud.");
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Range");
    res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Range");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "TitanMonitor Agenda Financiera API" });
  });
  const RATES_CACHE_FILE = import_path.default.join(process.cwd(), "rates_cache.json");
  const DEFAULT_RATES = {
    bcv: 832.4883,
    bcv_eur: 968.06734453,
    p2p: 956.48,
    fecha: "Viernes, 11 Septiembre 2026",
    bcv_anterior: 827.7371,
    bcv_eur_anterior: 963.21283115,
    fecha_anterior: "Jueves, 10 Septiembre 2026",
    update: { latestVersion: "", apkUrl: "", releaseNotes: "", releaseUrl: "" }
  };
  let cachedRatesData = DEFAULT_RATES;
  try {
    if (import_fs.default.existsSync(RATES_CACHE_FILE)) {
      cachedRatesData = JSON.parse(import_fs.default.readFileSync(RATES_CACHE_FILE, "utf-8"));
      console.log("[Google Rates] Tasas cargadas desde cach\xE9 local persistente.");
    }
  } catch (e) {
    console.warn("[Google Rates] No se pudo leer cach\xE9 local:", e);
  }
  let lastRatesFetchTime = cachedRatesData ? Date.now() : 0;
  let currentRatesPromise = null;
  const RATES_CACHE_TTL_MS = 6e4;
  const GOOGLE_RATES_URL = "https://script.google.com/macros/s/AKfycbzA0nxiYt77Nl32J6JCqkmdIkMdFMzp3rU_cQSHu0_XuMZGLu5nk-vJKhR2d-30R_Mv7A/exec";
  async function fetchFreshRatesFromGoogle(maxRetries = 2) {
    if (currentRatesPromise) return currentRatesPromise;
    currentRatesPromise = (async () => {
      let lastError = null;
      for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2e4);
          let data = null;
          try {
            const res1 = await fetch(GOOGLE_RATES_URL, {
              signal: controller.signal,
              redirect: "manual",
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*"
              }
            });
            if (res1.status >= 300 && res1.status < 400 && res1.headers.get("location")) {
              const redirectUrl = res1.headers.get("location");
              const res2 = await fetch(redirectUrl, {
                signal: controller.signal,
                headers: {
                  "Accept": "application/json, text/plain, */*"
                }
              });
              if (res2.ok) {
                data = await res2.json();
              }
            } else if (res1.ok) {
              data = await res1.json();
            }
          } catch (_manualErr) {
            const fallbackRes = await fetch(GOOGLE_RATES_URL, {
              signal: controller.signal,
              redirect: "follow",
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json"
              }
            });
            if (fallbackRes.ok) {
              data = await fallbackRes.json();
            }
          }
          clearTimeout(timeoutId);
          if (data && (data.bcv || data.bcv_usd || data.bcv_usd_actual || data.p2p || data.p2p_actual)) {
            cachedRatesData = data;
            lastRatesFetchTime = Date.now();
            try {
              import_fs.default.writeFileSync(RATES_CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
            } catch (_errWrite) {
            }
            return data;
          }
          throw new Error("Respuesta inv\xE1lida o vac\xEDa de Google Apps Script");
        } catch (fetchErr) {
          lastError = fetchErr;
          if (attempt <= maxRetries) {
            await new Promise((r) => setTimeout(r, attempt * 1e3));
          }
        }
      }
      if (cachedRatesData) {
        return cachedRatesData;
      }
      throw lastError || new Error("No se pudo obtener respuesta de Google Apps Script");
    })().finally(() => {
      currentRatesPromise = null;
    });
    return currentRatesPromise;
  }
  fetchFreshRatesFromGoogle().catch(() => {
  });
  setInterval(() => {
    fetchFreshRatesFromGoogle().catch(() => {
    });
  }, 12e4);
  app.get("/api/proxy-rates", async (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=20, stale-while-revalidate=120");
    const now = Date.now();
    const isFresh = cachedRatesData && now - lastRatesFetchTime < RATES_CACHE_TTL_MS;
    if (isFresh) {
      return res.json(cachedRatesData);
    }
    if (cachedRatesData) {
      fetchFreshRatesFromGoogle().catch((err) => console.warn("Fallo en revalidaci\xF3n en segundo plano de tasas:", err?.message));
      return res.json(cachedRatesData);
    }
    try {
      const freshData = await fetchFreshRatesFromGoogle();
      if (freshData) {
        return res.json(freshData);
      }
      if (cachedRatesData) {
        return res.json(cachedRatesData);
      }
      return res.status(502).json({
        success: false,
        error: "Respuesta vac\xEDa desde Google Apps Script"
      });
    } catch (err) {
      console.error("Error en proxy de tasas:", err);
      if (cachedRatesData) {
        return res.json(cachedRatesData);
      }
      return res.status(502).json({
        success: false,
        error: "No se pudieron obtener las tasas desde el servidor de Google",
        details: err?.message || String(err)
      });
    }
  });
  app.post("/api/scan-receipt", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", targetType = "expense" } = req.body;
      const isIncome = targetType === "income";
      if (!imageBase64) {
        return res.status(400).json({
          error: "No se proporcion\xF3 la imagen en formato Base64."
        });
      }
      const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9\/+.-]+;base64,/, "").trim();
      let cleanMimeType = (mimeType || "image/jpeg").split(";")[0].trim().toLowerCase();
      const userApiKey = req.headers["x-gemini-key"] || req.body?.apiKey;
      const ai = getGeminiClient(userApiKey);
      const systemPrompt = isIncome ? `Eres el motor de Inteligencia Artificial Financiera Premium de TitanMonitor, especializado en an\xE1lisis visual y OCR de comprobantes de ingreso, pagos recibidos, transferencias, capturas de Pago M\xF3vil, Zelle, facturas emitidas o recibos de servicios en Venezuela.
Tu objetivo es analizar la imagen y extraer los datos estructurados del cobro o ingreso:
1. 'storeOrProduct': Concepto del servicio, cliente o ingreso cobrado (ej: "Servicio t\xE9cnico", "Carrera de taxi", "Delivery de comida", "Pago M\xF3vil recibido BDV").
2. 'category': Selecciona estrictamente entre: Servicio, Delivery, Freelance, Transporte, Comisi\xF3n, Venta \xFAnica, Propina, Honorarios, Otro.
3. 'amount': Monto total cobrado o recibido (n\xFAmero positivo decimal). DISTINGUIR de cantidades f\xEDsicas (ej: si son 20 litros por 10$, el monto es 10).
4. 'currency': 'USD' si est\xE1 en D\xF3lares/Ref/Zelle, o 'VES' si est\xE1 en Bol\xEDvares/Bs.
5. 'rawDate': Fecha en formato YYYY-MM-DD o vac\xEDa si no es visible.
6. 'notes': Resumen breve del cobro o comprobante.
7. 'confidence': 'high', 'medium' o 'low'.` : `Eres el motor de Inteligencia Artificial Financiera Premium de TitanMonitor, especializado en an\xE1lisis visual y OCR de alta precisi\xF3n de comprobantes de pago, facturas, tickets de compra, recibos y etiquetas en Venezuela.
Tu objetivo es analizar la imagen y extraer los datos estructurados con exactitud comercial:
- Facturas fiscales SENIAT, tickets de caja de supermercados (Plaza's, Gama, Forum, Central Madeirense, Unicasa, R\xEDo, etc.).
- Cadenas de farmacia y salud (Farmatodo, Locatel, Redvital, etc.).
- Tiendas por departamento y tecnolog\xEDa (Daka, Traki, Mundo Total, Ivoo, etc.).
- Capturas de pantalla de Pago M\xF3vil o transferencias bancarias (BDV, Banesco, Mercantil, Bancamiga, Provincial, BNC).
- Comprobantes digitales (Zelle, Binance Pay, Zinli, Wally, etc.).
- Etiquetas de precios en anaqueles o fotos de productos con precio impreso o escrito.

Reglas de extracci\xF3n:
1. 'storeOrProduct': Nombre de la tienda, comercio o producto principal (ej: "Farmatodo", "Supermercado Forum", "20 Litros de gasolina", "Carne Molida 1kg", "Pago M\xF3vil Banesco").
2. 'category': Selecciona estrictamente entre: Alimentaci\xF3n, Supermercado, Servicios, Salud, Transporte, Entretenimiento, Ropa/Calzado, Hogar, Tecnolog\xEDa, Educaci\xF3n, Otro.
3. 'amount': Monto total final pagado o precio del producto (n\xFAmero positivo decimal, ej: 10 o 14.50).
   REGLA DE CANTIDADES: Si la imagen/texto indica una cantidad f\xEDsica y un precio total (ej: 20 litros por 10$), el campo 'amount' DEBE ser 10 (el precio) y NUNCA 20 (la cantidad).
4. 'currency': 'USD' si el monto est\xE1 expresado en D\xF3lares/$/Ref/Divisas, o 'VES' si est\xE1 expresado en Bol\xEDvares/Bs/Bs.D/Bs.S. Si el ticket muestra ambos, selecciona la moneda principal en la que se liquid\xF3 o se resalta el total.
5. 'items': Lista de nombres de productos o servicios individuales detectados en la imagen.
6. 'rawDate': Fecha detectada en formato YYYY-MM-DD o vac\xEDa si no es visible.
7. 'notes': Resumen breve de la compra.
8. 'confidence': 'high', 'medium' o 'low'.`;
      const userPrompt = `Analiza detalladamente esta imagen de comprobante, ticket, factura o captura en Venezuela y extrae los datos contables en formato JSON seg\xFAn el esquema.`;
      const parsedData = await generateContentWithRetry(ai, CANDIDATE_VISION_MODELS, {
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: cleanMimeType
            }
          },
          {
            text: userPrompt
          }
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              storeOrProduct: {
                type: import_genai.Type.STRING,
                description: isIncome ? "Concepto del servicio o cliente" : "Nombre del comercio, tienda o producto detectado"
              },
              category: {
                type: import_genai.Type.STRING,
                description: isIncome ? "Categor\xEDa del ingreso/servicio" : "Categor\xEDa asignada al gasto"
              },
              amount: {
                type: import_genai.Type.NUMBER,
                description: "Monto total monetario detectado (precio final)"
              },
              currency: {
                type: import_genai.Type.STRING,
                description: "Moneda detectada: 'USD' o 'VES'"
              },
              items: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "Art\xEDculos o conceptos detectados en el comprobante"
              },
              rawDate: {
                type: import_genai.Type.STRING,
                description: "Fecha detectada en formato YYYY-MM-DD o vac\xEDa"
              },
              notes: {
                type: import_genai.Type.STRING,
                description: "Observaci\xF3n o resumen breve del comprobante"
              },
              confidence: {
                type: import_genai.Type.STRING,
                description: "Nivel de confianza: 'high', 'medium' o 'low'"
              }
            },
            required: ["storeOrProduct", "amount", "currency", "category"]
          }
        }
      });
      return res.json({
        success: true,
        data: {
          storeOrProduct: parsedData.storeOrProduct || (isIncome ? "Servicio cobrado" : "Gasto escaneado"),
          category: parsedData.category || (isIncome ? "Servicio" : "Alimentaci\xF3n"),
          amount: Math.abs(Number(parsedData.amount)) || 0,
          currency: parsedData.currency === "VES" ? "VES" : "USD",
          items: Array.isArray(parsedData.items) ? parsedData.items : [],
          rawDate: parsedData.rawDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          notes: parsedData.notes || "",
          confidence: parsedData.confidence || "high"
        }
      });
    } catch (err) {
      console.error("Error en escaneo con Gemini IA:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Error al procesar la imagen con IA"
      });
    }
  });
  app.post("/api/fast-voice-expense", async (req, res) => {
    try {
      const { transcript, targetType = "expense" } = req.body;
      const isIncome = targetType === "income";
      const userApiKey = req.headers["x-gemini-key"] || req.body?.apiKey;
      const ai = getGeminiClient(userApiKey);
      const systemPrompt = isIncome ? `Eres el asistente de voz de Inteligencia Artificial Financiera Premium de TitanMonitor en Venezuela.
Tu tarea es interpretar dictados cotidianos de INGRESOS, COBROS Y SERVICIOS (por ejemplo: deliverys, carreras de taxi, servicios t\xE9cnicos, freelance, propinas, comisiones) y convertirlos en un registro contable estructurado.
Comprende acentos y modismos venezolanos:
- D\xF3lares: "d\xF3lares", "dolar", "verdes", "$", "le\xF1as", "divisas", "de los verdes".
- Bol\xEDvares: "bol\xEDvares", "bolivares", "bolos", "bs", "soberanos", "soberano", "digitales".

REGLA DE DESDUPLICACI\xD3N Y LIMPIEZA:
Si el texto recibido contiene palabras o frases repetidas por tartamudeo o ecos de audio (ej: "hice hice 3 carreras en 15 en 15 dolares"), l\xEDmpialo y extrae la intenci\xF3n real ("3 Carreras", 15, USD).

REGLA DE ORO DE CANTIDADES VS MONTO:
Si el usuario dice una cantidad de unidades o servicios y un precio (ej: "Hice 5 carreras de taxi por 20$" o "Entregu\xE9 4 deliverys en 12$"), el campo 'amount' DEBE ser 20 o 12 (el dinero cobrado) y la cantidad de servicios va en 'storeOrProduct' ("5 Carreras de taxi", "4 Deliverys").` : `Eres el asistente de voz de Inteligencia Artificial Financiera Premium de TitanMonitor en Venezuela.
Tu tarea es interpretar dictados cotidianos de GASTOS y convertirlos en un registro financiero limpio.
Comprende acentos y modismos venezolanos:
- D\xF3lares: "d\xF3lares", "dolar", "verdes", "$", "le\xF1as", "divisas", "de los verdes".
- Bol\xEDvares: "bol\xEDvares", "bolivares", "bolos", "bs", "soberanos", "soberano", "digitales".
- Comercios y rubros comunes: Farmatodo, Plaza's, Gama, Central Madeirense, Forum, Daka, Traki, carnicer\xEDa, panader\xEDa, abasto del chino, camionetica, metro, recarga Digitel/Movistar/Cantv, condominio, gasolina, almuerzo ejecutivo, etc.

REGLA DE DESDUPLICACI\xD3N Y LIMPIEZA:
Si el texto recibido contiene palabras o frases repetidas por tartamudeo o eco de audio (ej: "gaste gaste 30 dolares en una en una lavadora lavadora"), l\xEDmpialo y extrae el producto real ("Lavadora", 30, USD, Hogar).

REGLA DE ORO DE CANTIDADES VS PRECIO:
Si el usuario dice una cantidad o volumen f\xEDsico y el precio pagado (ej: "compre 20 litros de gasolina en 10$" o "gast\xE9 3 paquetes de harina por 4$"), el campo 'amount' DEBE ser SIEMPRE el precio/dinero pagado (ej: 10 o 4) y NUNCA la cantidad f\xEDsica de unidades (los 20 litros van en 'storeOrProduct').`;
      const prompt = isIncome ? `Analiza este dictado de un ingreso o servicio puntual realizado:
"${transcript.trim()}"

Extrae en JSON:
1. "storeOrProduct": Concepto del servicio o cliente (ej: "Carrera de taxi", "Delivery en Yummy", "Reparaci\xF3n de PC").
2. "category": Categor\xEDa estricta (Servicio, Delivery, Freelance, Transporte, Comisi\xF3n, Venta \xFAnica, Propina, Honorarios, Otro).
3. "amount": Monto total monetario cobrado (n\xFAmero positivo).
4. "currency": 'USD' (si menciona d\xF3lares, $, verdes, divisas) o 'VES' (si menciona bol\xEDvares, Bs, soberanos).
5. "notes": Resumen breve del servicio realizado.` : `Analiza este dictado de voz de un gasto cotidiano:
"${transcript.trim()}"

Extrae en JSON:
1. "storeOrProduct": Nombre del producto, servicio o tienda (ej: "20 Litros de gasolina", "2 Kilos de carne", "Pasaje de camioneta", "Farmatodo", "Almuerzo ejecutivo").
2. "category": Categor\xEDa estricta (Alimentaci\xF3n, Supermercado, Servicios, Salud, Transporte, Entretenimiento, Ropa/Calzado, Hogar, Tecnolog\xEDa, Educaci\xF3n, Otro).
3. "amount": Monto num\xE9rico del precio pagado (n\xFAmero positivo, decimales con punto). Si dice "20 litros de gasolina en 10$", el amount es 10.
4. "currency": 'USD' (si menciona d\xF3lares, $, verdes, divisas) o 'VES' (si menciona bol\xEDvares, Bs, soberanos).
5. "notes": Resumen breve de la compra.`;
      const parsedData = await generateContentWithRetry(ai, CANDIDATE_TEXT_MODELS, {
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              storeOrProduct: { type: import_genai.Type.STRING },
              category: { type: import_genai.Type.STRING },
              amount: { type: import_genai.Type.NUMBER },
              currency: { type: import_genai.Type.STRING },
              notes: { type: import_genai.Type.STRING }
            },
            required: ["storeOrProduct", "amount", "currency", "category"]
          }
        }
      });
      return res.json({
        success: true,
        data: {
          storeOrProduct: parsedData.storeOrProduct || (isIncome ? "Servicio cobrado" : "Gasto dictado"),
          category: parsedData.category || (isIncome ? "Servicio" : "Alimentaci\xF3n"),
          amount: Math.abs(Number(parsedData.amount)) || 0,
          currency: parsedData.currency === "VES" ? "VES" : "USD",
          transcript: transcript.trim(),
          notes: parsedData.notes || transcript.trim(),
          rawDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        }
      });
    } catch (err) {
      console.error("Error en procesamiento r\xE1pido de texto por IA:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Error al interpretar el texto dictado"
      });
    }
  });
  app.post("/api/process-voice-expense", async (req, res) => {
    try {
      const { audioBase64, mimeType = "audio/webm", transcriptHint = "", targetType = "expense" } = req.body;
      const isIncome = targetType === "income";
      if (!audioBase64) {
        return res.status(400).json({
          error: "No se proporcion\xF3 el audio en formato Base64."
        });
      }
      const cleanBase64 = audioBase64.replace(/^data:[a-zA-Z0-9\/+.-]+;base64,/, "").trim();
      let cleanMimeType = (mimeType || "audio/webm").split(";")[0].trim().toLowerCase();
      const userApiKey = req.headers["x-gemini-key"] || req.body?.apiKey;
      const ai = getGeminiClient(userApiKey);
      const systemPrompt = isIncome ? `Eres el asistente de voz de Inteligencia Artificial Financiera Premium de TitanMonitor en Venezuela.
Escucha con atenci\xF3n este audio de voz y extrae el registro de INGRESO o SERVICIO estructurado con alta fidelidad.
Entiende expresiones cotidianas venezolanas:
- "Cobr\xE9 20 d\xF3lares por una carrera de taxi" -> Monto: 20, Moneda: USD, Concepto: Carrera de taxi, Categor\xEDa: Transporte.
- "Hice 3 deliverys en Yummy por 15 verdes" -> Monto: 15, Moneda: USD, Concepto: 3 Deliverys en Yummy, Categor\xEDa: Delivery.
- "Me pagaron 500 bol\xEDvares por reparar una computadora" -> Monto: 500, Moneda: VES, Concepto: Reparaci\xF3n de computadora, Categor\xEDa: Servicio.
REGLA: El campo 'amount' es el dinero total cobrado (ej: 15 en "3 deliverys por 15$").` : `Eres el asistente de voz de Inteligencia Artificial Financiera Premium de TitanMonitor en Venezuela.
Escucha con atenci\xF3n este audio de voz y extrae el registro de gasto estructurado con alta fidelidad.
Entiende expresiones cotidianas venezolanas:
- "Gast\xE9 15 d\xF3lares en carne molida en el supermercado" -> Monto: 15, Moneda: USD, Comercio/Producto: Carne molida, Categor\xEDa: Alimentaci\xF3n.
- "Compr\xE9 20 litros de gasolina en 10$" -> Monto: 10, Moneda: USD, Comercio/Producto: 20 Litros de gasolina, Categor\xEDa: Transporte.
- "Pagu\xE9 450 bol\xEDvares de pasaje" -> Monto: 450, Moneda: VES, Comercio/Producto: Pasaje de camioneta, Categor\xEDa: Transporte.
- "Compr\xE9 medicamentos por 20 verdes en Farmatodo" -> Monto: 20, Moneda: USD, Comercio/Producto: Farmatodo, Categor\xEDa: Salud.
- "Pagu\xE9 150 bolos de recarga Digitel" -> Monto: 150, Moneda: VES, Comercio/Producto: Recarga Digitel, Categor\xEDa: Servicios.
REGLA: El campo 'amount' es el precio total pagado (ej: 10 en "20 litros de gasolina en 10$") y NUNCA la cantidad f\xEDsica de unidades.`;
      const prompt = transcriptHint && transcriptHint.trim() ? `Escucha el audio adjunto (pista de dictado en vivo detectada: "${transcriptHint.trim()}"). Transcribe con m\xE1xima precisi\xF3n lo escuchado en el audio y extrae los datos contables en formato JSON.` : `Escucha el audio adjunto, transcribe exactamente lo dicho y extrae los campos contables en formato JSON.`;
      const parsedData = await generateContentWithRetry(ai, CANDIDATE_AUDIO_MODELS, {
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: cleanMimeType
            }
          },
          {
            text: prompt
          }
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              storeOrProduct: {
                type: import_genai.Type.STRING,
                description: isIncome ? "Concepto del servicio o cliente" : "Nombre del comercio, tienda o producto dictado"
              },
              category: {
                type: import_genai.Type.STRING,
                description: isIncome ? "Categor\xEDa del ingreso/servicio" : "Categor\xEDa del gasto"
              },
              amount: {
                type: import_genai.Type.NUMBER,
                description: "Monto monetario num\xE9rico extra\xEDdo del audio"
              },
              currency: {
                type: import_genai.Type.STRING,
                description: "Moneda expresada: 'USD' o 'VES'"
              },
              transcript: {
                type: import_genai.Type.STRING,
                description: "Transcripci\xF3n exacta del audio en espa\xF1ol"
              },
              notes: {
                type: import_genai.Type.STRING,
                description: "Notas o resumen adicional"
              }
            },
            required: ["storeOrProduct", "amount", "currency", "category"]
          }
        }
      });
      return res.json({
        success: true,
        data: {
          storeOrProduct: parsedData.storeOrProduct || (isIncome ? "Servicio por voz" : "Gasto por voz"),
          category: parsedData.category || (isIncome ? "Servicio" : "Alimentaci\xF3n"),
          amount: Math.abs(Number(parsedData.amount)) || 0,
          currency: parsedData.currency === "VES" ? "VES" : "USD",
          transcript: parsedData.transcript || "",
          notes: parsedData.notes || parsedData.transcript || (isIncome ? "Ingreso por nota de voz IA" : "Registro por nota de voz IA"),
          rawDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        }
      });
    } catch (err) {
      console.error("Error en procesamiento de audio con Gemini IA:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Error al procesar el audio de voz con IA"
      });
    }
  });
  app.use((err, _req, res, _next) => {
    console.error("Express Global Error:", err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || "Error interno del servidor"
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`  \u279C  Local:   http://localhost:${PORT}/`);
    console.log(`  \u279C  Network: http://0.0.0.0:${PORT}/`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
