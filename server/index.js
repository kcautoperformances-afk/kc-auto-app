import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { JSONFilePreset } from "lowdb/node";
import { defaultData } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DB_PATH lets you point this at a Railway Volume mount (e.g. /data/db.json)
// so data survives redeploys. Falls back to a local file otherwise.
const dbPath = process.env.DB_PATH || path.join(__dirname, "db.json");
const db = await JSONFilePreset(dbPath, defaultData());

const app = express();
app.use(express.json({ limit: "3mb" }));

app.get("/api/state", async (req, res) => {
  await db.read();
  res.json(db.data);
});

app.post("/api/employees", async (req, res) => {
  db.data.employees = req.body.employees;
  await db.write();
  res.json({ ok: true });
});

app.post("/api/taskConfig", async (req, res) => {
  db.data.taskConfig = req.body.taskConfig;
  await db.write();
  res.json({ ok: true });
});

app.post("/api/accounts", async (req, res) => {
  db.data.accounts = req.body.accounts;
  await db.write();
  res.json({ ok: true });
});

app.post("/api/log", async (req, res) => {
  db.data.log = req.body.log;
  await db.write();
  res.json({ ok: true });
});

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KC Auto promotion system listening on ${PORT}`));
