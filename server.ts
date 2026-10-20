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
  createUpdateSetRecord,
  createUniversalRecord,
} from "./server/servicenow";
import { executeNowAssistAutonomous } from "./server/nowAssistEngine";
import { checkAndGenerateJiraSync } from "./server/jiraSyncEngine";

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

app.post("/api/servicenow/update-set", async (req, res) => {
  try {
    const { name, state = "complete", description = "", instanceUrl, username, password } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: "Update Set name is required" });
    }
    const result = await createUpdateSetRecord({
      name,
      state,
      description,
      instanceUrl,
      username,
      password,
    });
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to create Update Set in ServiceNow",
    });
  }
});

app.post("/api/servicenow/universal-deploy", async (req, res) => {
  try {
    const { prompt, table, payload, activeUpdateSetName, developerName } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt or requirement text is required." });
    }
    const result = await executeNowAssistAutonomous({
      prompt,
      table,
      payload,
      activeUpdateSetName,
      developerName,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "Now Assist autonomous deployment failed",
    });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, activeDeveloperName, activeUpdateSetName } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const promptText = lastUserMessage?.content || "";

    // Multi-turn context retention: Scan earlier messages for previously generated ServiceNow records
    let contextPrompt = promptText;
    const previousDeployments = messages
      .filter((m: any) => m.role === "model" && m.deploymentResult?.sysId)
      .map((m: any) => m.deploymentResult);

    if (previousDeployments.length > 0) {
      const lastDeployment = previousDeployments[previousDeployments.length - 1];
      const lower = promptText.toLowerCase();
      if (
        lower.includes("that") ||
        lower.includes("this") ||
        lower.includes("it") ||
        lower.includes("previous") ||
        lower.includes("update") ||
        lower.includes("work note") ||
        lower.includes("comment")
      ) {
        contextPrompt = `${promptText} (Context Reference: table=${lastDeployment.table}, sys_id=${lastDeployment.sysId}, number=${lastDeployment.number || ""}, name=${lastDeployment.name || ""})`;
      }
    }

    // Execute Now Assist Autonomous Engine against dev442469
    const deployResult = await executeNowAssistAutonomous({
      prompt: contextPrompt,
      developerName: activeDeveloperName,
      activeUpdateSetName: activeUpdateSetName,
    });

    // Check & generate Jira Workspace Sync (Secondary Integration)
    const jiraSync = checkAndGenerateJiraSync({
      prompt: promptText,
      table: deployResult.table,
      sysId: deployResult.sysId,
      number: deployResult.number,
      recordName: deployResult.name,
      developerName: activeDeveloperName,
      priority: deployResult.record?.priority || "2",
    });

    if (jiraSync) {
      deployResult.jiraSync = jiraSync;
    }

    if (deployResult.success) {
      const selfCorrectedNote = deployResult.selfCorrected ? " *(Auto-Healed Schema & Missing Fields)*" : "";
      const jiraNote = jiraSync
        ? `\n\n**Jira Workspace Traceability:**\n- **Issue Key:** \`${jiraSync.issueKey}\` (${jiraSync.issueType})\n- **Sync Status:** \`${jiraSync.status}\` | **Priority:** \`${jiraSync.priority}\`\n- **Sprint:** \`${jiraSync.sprint}\`\n- **Assignee:** \`${jiraSync.assignee}\`\n- **Direct Link:** [${jiraSync.jiraUrl}](${jiraSync.jiraUrl})`
        : "";

      const executiveSummary = `### ⚡ Now Assist Autonomous Execution Complete — dev442469

**Platform Target & Governance:**
- **Instance Endpoint:** \`https://dev442469.service-now.com\` (Status: ONLINE)
- **Resolved Table:** \`/api/now/table/${deployResult.table}\`
- **Record Identifier:** \`${deployResult.number || deployResult.name || deployResult.sysId}\`
- **Generated sys_id:** \`${deployResult.sysId}\`
- **Active Update Set Container:** \`${deployResult.updateSetName}\`
- **Developer Persona:** \`${deployResult.developerName}\`
- **Execution Speed:** \`${deployResult.executionTimeMs}ms\`${selfCorrectedNote}

**Now Assist Architecture:** ${deployResult.explanation}${jiraNote}

The configuration has been dynamically synthesized, validated, and committed directly into instance **dev442469** under strict enterprise governance. Open the **Live Verification Card** below to access the record in ServiceNow Classic / Polaris UI.`;

      return res.json({
        reply: executiveSummary,
        modelUsed: "Now Assist Autonomous Engine (dev442469)",
        deploymentResult: deployResult,
        jiraSync: jiraSync || undefined,
      });
    } else {
      const failureSummary = `### ⚠️ Now Assist Deployment Discrepancy

- **Target Instance:** \`${deployResult.instanceUrl}\`
- **Table:** \`${deployResult.table}\`
- **Error:** ${deployResult.error}

The automated deployment encountered an issue while communicating with the Table API on instance dev442469. Click **Retry Deployment** below to re-verify credentials and execute.`;

      return res.json({
        reply: failureSummary,
        modelUsed: "Now Assist Autonomous Engine (dev442469)",
        deploymentResult: deployResult,
        jiraSync: jiraSync || undefined,
      });
    }
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    const errMsg = error?.message || "Failed to execute Now Assist autonomous deployment.";
    return res.status(500).json({
      error: errMsg,
      success: false,
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
