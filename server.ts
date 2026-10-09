import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { LAYA_SYSTEM_INSTRUCTION } from "./server/prompt";
import {
  getActiveConfig,
  updateActiveConfig,
  disconnectActiveConfig,
  pingAndCheckStatus,
  queryTableRecords,
} from "./server/servicenow";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini client initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  const snConfig = getActiveConfig();
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    name: "LAYA ServiceNow Assistant",
    instanceUrl: snConfig.instanceUrl,
    hasInstanceCredentials: Boolean(snConfig.token || (snConfig.username && snConfig.password)),
  });
});

// ServiceNow Instance Connection Endpoints
app.get("/api/servicenow/status", async (req, res) => {
  try {
    const status = await pingAndCheckStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || "Failed to check instance status",
    });
  }
});

app.post("/api/servicenow/connect", async (req, res) => {
  try {
    const { instanceUrl, username, password, token } = req.body;
    updateActiveConfig({ instanceUrl, username, password, token });
    const status = await pingAndCheckStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || "Failed to connect to ServiceNow instance",
    });
  }
});

app.post("/api/servicenow/disconnect", (req, res) => {
  disconnectActiveConfig();
  res.json({ success: true, message: "Disconnected instance credentials." });
});

app.get("/api/servicenow/records", async (req, res) => {
  try {
    const table = (req.query.table as string) || "incident";
    const query = (req.query.query as string) || "";
    const limit = Number(req.query.limit) || 20;
    const fields = (req.query.fields as string) || "";
    const displayValue = (req.query.display_value as string) || "true";

    const result = await queryTableRecords({
      table,
      query,
      limit,
      fields,
      displayValue,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to query records from ServiceNow",
    });
  }
});

app.post("/api/servicenow/execute-query", async (req, res) => {
  try {
    const { table = "incident", query = "", limit = 20, fields = "" } = req.body;
    const result = await queryTableRecords({
      table,
      query,
      limit: Number(limit) || 20,
      fields,
      displayValue: "true",
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to execute query",
    });
  }
});

const CANDIDATE_MODELS = [
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: any[],
  systemInstruction: string
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isHighDemand =
        err?.status === 503 ||
        errMsg.includes("503") ||
        errMsg.includes("high demand") ||
        errMsg.includes("UNAVAILABLE");

      console.log(
        `[AI Router] Model ${model} unavailable (${isHighDemand ? "high demand" : "transient"}). Trying fallback candidate...`
      );
      continue;
    }
  }

  throw lastError || new Error("All candidate models failed to generate a response.");
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        reply: `Hello! I am **LAYA**, your ServiceNow full-stack development specialist. 

I see that the \`GEMINI_API_KEY\` is not currently set in your project environment secrets. Once you provide the key in **Settings > Secrets**, I will provide dynamic AI-powered answers, code generation, and debugging.

In the meantime, you can explore the built-in **ServiceNow Developer Studio** tabs above — including the **Encoded Query Builder**, **Service Portal Widget Studio**, **Anti-Pattern Code Scanner**, and **Horizon Design Token Reference**!`,
      });
    }

    const ai = getAIClient();

    // Map conversation to @google/genai format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "model" || m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const snConfig = getActiveConfig();
    const instanceContext = `\n\n# ACTIVE INSTANCE CONTEXT\nTarget ServiceNow Instance: ${snConfig.instanceUrl}\nConfigured Username: ${snConfig.username || 'admin'}\nHas Credentials Configured: ${Boolean(snConfig.token || (snConfig.username && snConfig.password))}\nWhen the user asks to connect or interact with their instance ${snConfig.instanceUrl}, reference this specific instance URL, explain how to authenticate or wake up hibernating developer instances from developer.servicenow.com, and guide them on Table API and ServiceNow integration best practices.`;

    const { text, modelUsed } = await generateWithFallback(
      ai,
      contents,
      LAYA_SYSTEM_INSTRUCTION + instanceContext
    );

    return res.json({ reply: text, modelUsed });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    const errMsg = error?.message || "Failed to process chat with LAYA.";
    const isHighDemand =
      error?.status === 503 ||
      errMsg.includes("503") ||
      errMsg.includes("high demand") ||
      errMsg.includes("UNAVAILABLE");

    return res.status(isHighDemand ? 503 : 500).json({
      error: isHighDemand
        ? "The AI model is currently experiencing temporary high demand on Google's servers. Please click 'Retry' in a moment to try again."
        : errMsg,
      isHighDemand,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LAYA ServiceNow Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
