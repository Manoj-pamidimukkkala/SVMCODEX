import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse incoming JSON requests with a reasonable limit to support larger source codes
  app.use(express.json({ limit: "5mb" }));

  // Initialize Gemini API client on the server
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Secure server-side code translation
  app.post("/api/transpile", async (req, res) => {
    try {
      const { srcLang, tgtLang, srcCode } = req.body;
      if (!srcCode || !srcLang || !tgtLang) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const prompt = `Transpile the following ${srcLang} code to ${tgtLang}. Respond ONLY with the raw transpiled ${tgtLang} code, without any markdown formatting, backticks, comments, explanations, or notes.
      
Code:
${srcCode}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are a professional code compiler and translation engine. Your output MUST contain only the direct executable target code translating the logic of the source language exactly. Never wrap your outputs in backticks, codeblocks (like \`\`\`js ... \`\`\`), or any human conversation. Do not add markdown.`
        }
      });

      let transpiledText = response.text || "";
      
      // Extra safety validation to strip potential code block prefixes
      transpiledText = transpiledText
        .replace(/^```[a-zA-Z0-9+#]*\n/g, "")
        .replace(/\n```$/g, "")
        .trim();

      res.json({ transpiledCode: transpiledText });
    } catch (err: any) {
      console.error("Transpilation error:", err);
      res.status(500).json({ error: err.message || "Failed to transpile code" });
    }
  });

  // Secure server-side code auditor ("AI Fix")
  app.post("/api/analyze", async (req, res) => {
    try {
      const { code, lang } = req.body;
      if (!code) {
        return res.status(400).json({ error: "No code provided" });
      }

      const prompt = `Perform a real-time diagnostic audit of this ${lang} code. Identify logical bugs, syntactic typos, warnings, style guidelines, or opportunities for optimization. Return code recommendations.

Code:
${code}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { 
                      type: Type.STRING, 
                      description: "The severity/type of feedback: 'error' (broken code/syntax), 'warning' (potentials problems/bugs), or 'tip' (minor style advice or performance suggestions)" 
                    },
                    line: { 
                      type: Type.INTEGER, 
                      description: "The line number (1-indexed integer) focusing on this issue, or null if it applies generally" 
                    },
                    msg: { 
                      type: Type.STRING, 
                      description: "Brief clear explanation and solution under 60 characters" 
                    }
                  },
                  required: ["type", "msg"]
                },
                description: "List of real-time audit messages (maximum of 4 items for focus and brevity)"
              },
              fixed: { 
                type: Type.STRING, 
                description: "The complete, fully corrected, optimized, and executable code block matching the style of the user code" 
              }
            },
            required: ["hints", "fixed"]
          }
        }
      });

      const resultText = response.text || "{}";
      res.json(JSON.parse(resultText));
    } catch (err: any) {
      console.error("Analysis error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze code" });
    }
  });

  // Secure Piston API backend proxy to coordinate sandboxed execution
  app.post("/api/execute", async (req, res) => {
    try {
      const { language, version, files } = req.body;
      if (!language || !version || !files) {
        return res.status(400).json({ error: "Missing language parameters" });
      }

      const pistonResponse = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, version, files }),
      });

      if (!pistonResponse.ok) {
        const errText = await pistonResponse.text();
        return res.status(pistonResponse.status).json({ error: errText || "Sandboxed compiling execution failed" });
      }

      const data = await pistonResponse.json();
      res.json(data);
    } catch (err: any) {
      console.error("Sandboxed execution error:", err);
      res.status(500).json({ error: err.message || "Failed to connect to executor runtime" });
    }
  });

  // Development setup using Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
