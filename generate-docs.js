#!/usr/bin/env node
/**
 * NextStep — Doc Agent
 * 
 * Lit les fichiers source localement, génère la doc via Ollama,
 * et pousse tout sur B9R9/NextStep-Docs.
 * 
 * Usage:
 *   node generate-docs.js --front ../next-step/src --back ../next-step-api/src --token ghp_xxx
 * 
 * Options:
 *   --front   Chemin vers le src/ du frontend (défaut: ../next-step/src)
 *   --back    Chemin vers le src/ du backend  (défaut: ../next-step-api/src)
 *   --token   GitHub Personal Access Token    (ou env GITHUB_TOKEN)
 *   --model   Modèle Ollama à utiliser        (défaut: codestral)
 *   --dry     Dry run : génère sans pousser sur GitHub
 *   --only    Filtrer par dossier ex: --only stores,services
 */

const fs   = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

// ─── Config ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const CONFIG = {
  frontSrc:    getArg("front")  || path.join(__dirname, "../next-step/src"),
  backSrc:     getArg("back")   || path.join(__dirname, "../next-step-api/src"),
  githubToken: getArg("token")  || process.env.GITHUB_TOKEN,
  model:       getArg("model")  || "codestral",
  dryRun:      hasFlag("dry"),
  onlyFilter:  getArg("only")   ? getArg("only").split(",") : null,
  ollamaUrl:   "http://localhost:11434/api/generate",
  github: {
    owner:  "B9R9",
    repo:   "NextStep-Docs",
    branch: "main",
  },
};

// ─── File discovery ─────────────────────────────────────────────────────────

const EXTENSIONS = [".vue", ".ts"];
const IGNORE     = ["node_modules", "dist", ".quasar", "public", "__tests__"];

function walkDir(dir, baseLabel) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE.includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, baseLabel));
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      results.push({ fullPath, baseLabel });
    }
  }
  return results;
}

function getDocPath(filePath, baseLabel) {
  // ex: /...next-step/src/stores/jobs-store.js → docs/front/stores/jobs-store.md
  const srcRoot = baseLabel === "front" ? CONFIG.frontSrc : CONFIG.backSrc;
  const rel     = path.relative(srcRoot, filePath);           // stores/jobs-store.js
  const noExt   = rel.replace(/\.(vue|ts)$/, ".md");       // stores/jobs-store.md
  return `docs/${baseLabel}/${noExt}`;                         // docs/front/stores/jobs-store.md
}

// ─── Ollama ─────────────────────────────────────────────────────────────────

const NS_CONTEXT = `You are a documentation agent for Next Step, a SaaS career platform for job seekers.
Stack: Vue 3 (Composition API, <script setup>), Pinia, Vite, TypeScript, Tailwind CSS, Vue I18n (en/fr/fi/sv), Axios.
Frontend modules: applications, jobs, companies, calendar, notifications, auth, settings.
Backend: Express + Knex + SQLite, JWT auth, REST API.
Stores: useApplicationsStore, useJobsStore, useCompaniesStore, useCalendarStore, useNotificationsStore.
Services: Axios-based (applications.service, jobs.service, companies.service, calendar.service, auth.service, notifications.service).
Conventions: <script setup> with TypeScript, async actions in Pinia stores, computed getters, JWT via localStorage auth_token, i18n keys as 'module.section.key'.`;

function buildPrompt(code, filePath) {
  const fileName = path.basename(filePath);
  const isStore      = filePath.includes("/stores/");
  const isService    = filePath.includes("/services/");
  const isComponent  = filePath.includes("/components/");
  const isPage       = filePath.includes("/pages/") || filePath.includes("/views/");
  const isComposable = filePath.includes("/composables/");
  const isType       = filePath.includes("/types/");

  let docType = "module";
  if (isStore)      docType = "Pinia store";
  if (isService)    docType = "Axios service";
  if (isComponent)  docType = "Vue component";
  if (isPage)       docType = "Vue page/view";
  if (isComposable) docType = "Vue composable";
  if (isType)       docType = "TypeScript types";

  return `${NS_CONTEXT}

Generate a concise README.md for this Next Step ${docType}: ${fileName}

Structure to follow:
# ${fileName.replace(/\.(vue|ts)$/, "")}
One-line description of what this ${docType} does.

## Purpose
Why this ${docType} exists and what problem it solves.

## ${isStore ? "State & Actions" : isService ? "API Endpoints" : isComponent ? "Props & Events" : isType ? "Types & Interfaces" : "API"}
Document the public interface (props, actions, methods, exports, types).

## Usage
\`\`\`${isComponent ? "vue" : "typescript"}
// Minimal usage example
\`\`\`

## Dependencies
- Stores used, services called, i18n keys, other components, backend routes

---
Rules:
- Be specific to THIS file, not generic
- Keep it under 60 lines
- Output ONLY the markdown, no explanation, no preamble

Code:
\`\`\`
${code.slice(0, 4000)}
\`\`\``;
}

async function callOllama(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model:  CONFIG.model,
      prompt,
      stream: false,
      options: { temperature: 0.2, num_predict: 800 },
    });

    const req = http.request("http://localhost:11434/api/generate", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.response || "");
        } catch (e) {
          reject(new Error("Ollama parse error: " + data.slice(0, 200)));
        }
      });
    });

    req.on("error", (e) => reject(new Error("Ollama unreachable: " + e.message)));
    req.setTimeout(120000, () => { req.destroy(); reject(new Error("Ollama timeout")); });
    req.write(body);
    req.end();
  });
}

// ─── GitHub API ──────────────────────────────────────────────────────────────

async function githubRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "api.github.com",
      path:     `/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/contents/${endpoint}`,
      method,
      headers: {
        Authorization:  `Bearer ${CONFIG.githubToken}`,
        Accept:         "application/vnd.github+json",
        "User-Agent":   "nextstep-doc-agent",
        "Content-Type": "application/json",
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function pushFile(docPath, content, message) {
  // Check if file exists to get SHA for update
  const check = await githubRequest("GET", docPath);
  const sha   = check.status === 200 ? check.body.sha : undefined;

  const result = await githubRequest("PUT", docPath, {
    message,
    content: Buffer.from(content).toString("base64"),
    branch:  CONFIG.github.branch,
    ...(sha ? { sha } : {}),
  });

  return result.status === 200 || result.status === 201;
}

// ─── README index ────────────────────────────────────────────────────────────

function generateIndex(frontFiles, backFiles) {
  const toLink = (files, label) => {
    const groups = {};
    for (const { docPath, fileName } of files) {
      const parts = docPath.split("/");
      const group = parts[2] || "root"; // docs/front/GROUP/file.md
      if (!groups[group]) groups[group] = [];
      groups[group].push({ docPath, fileName });
    }
    let md = `## ${label === "front" ? "Frontend" : "Backend"}\n\n`;
    for (const [group, items] of Object.entries(groups)) {
      md += `### ${group}\n`;
      for (const { docPath, fileName } of items) {
        md += `- [${fileName}](${docPath})\n`;
      }
      md += "\n";
    }
    return md;
  };

  return `# Next Step — Documentation

> Wiki technique du projet. Chaque page documente un fichier source réel, généré automatiquement par le Doc Agent.

---

${toLink(frontFiles, "front")}
${backFiles.length > 0 ? toLink(backFiles, "back") : ""}

---

*Généré automatiquement — ne pas éditer manuellement.*
*Mis à jour le : ${new Date().toISOString().split("T")[0]}*
`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 NextStep Doc Agent\n");

  // Validate
  if (!CONFIG.dryRun && !CONFIG.githubToken) {
    console.error("❌  GitHub token manquant. Passe --token ghp_xxx ou définis GITHUB_TOKEN");
    process.exit(1);
  }

  // Discover files
  const frontFiles = walkDir(CONFIG.frontSrc, "front");
  const backFiles  = walkDir(CONFIG.backSrc,  "back");
  const allFiles   = [...frontFiles, ...backFiles];

  // Apply --only filter
  const filtered = CONFIG.onlyFilter
    ? allFiles.filter(({ fullPath }) => CONFIG.onlyFilter.some(f => fullPath.includes(`/${f}/`)))
    : allFiles;

  console.log(`📁 ${filtered.length} fichiers à documenter`);
  if (CONFIG.dryRun) console.log("🔎 Mode dry-run activé — aucun push\n");

  // Check Ollama
  try {
    await callOllama("ping");
  } catch (e) {
    console.error(`❌  Ollama inaccessible. Lance : ollama serve`);
    process.exit(1);
  }
  console.log(`✅ Ollama connecté (modèle: ${CONFIG.model})\n`);

  const results = [];
  let success = 0, errors = 0;

  for (let i = 0; i < filtered.length; i++) {
    const { fullPath, baseLabel } = filtered[i];
    const fileName = path.basename(fullPath);
    const docPath  = getDocPath(fullPath, baseLabel);

    process.stdout.write(`[${i + 1}/${filtered.length}] ${fileName} ... `);

    try {
      const code = fs.readFileSync(fullPath, "utf8");
      if (code.trim().length < 20) { console.log("skip (vide)"); continue; }

      const doc = await callOllama(buildPrompt(code, fullPath));
      if (!doc.trim()) { console.log("skip (réponse vide)"); continue; }

      if (!CONFIG.dryRun) {
        const ok = await pushFile(docPath, doc, `docs: ${fileName} via Doc Agent`);
        console.log(ok ? "✅" : "⚠️  push échoué");
        if (ok) success++; else errors++;
      } else {
        console.log("✅ (dry)");
        success++;
      }

      results.push({ docPath, fileName });

      // Small delay to avoid GitHub rate limiting
      await new Promise(r => setTimeout(r, 300));

    } catch (e) {
      console.log(`❌ ${e.message}`);
      errors++;
    }
  }

  // Push README index
  if (!CONFIG.dryRun && results.length > 0) {
    process.stdout.write("\n📝 Génération du README index ... ");
    const frontResults = results.filter(r => r.docPath.startsWith("docs/front"));
    const backResults  = results.filter(r => r.docPath.startsWith("docs/back"));
    const readme = generateIndex(frontResults, backResults);
    const ok = await pushFile("README.md", readme, "docs: update README index");
    console.log(ok ? "✅" : "⚠️");
  }

  console.log(`\n─────────────────────────────`);
  console.log(`✅ Succès : ${success} fichiers`);
  if (errors > 0) console.log(`❌ Erreurs : ${errors} fichiers`);
  console.log(`📍 Repo   : https://github.com/${CONFIG.github.owner}/${CONFIG.github.repo}`);
}

main().catch(e => { console.error("\n❌ Erreur fatale:", e.message); process.exit(1); });
