import { Router } from "express";
import type Database from "better-sqlite3";
import type { WorkerHub } from "../ws/workerHub.js";

export function dashboardRouter(db: Database.Database, hub: WorkerHub): Router {
  const router = Router();

  router.get("/dashboard", (_req, res) => {
    // Query stats from DB
    const totalWorkers = (
      db.prepare(`SELECT COUNT(DISTINCT worker_pubkey) AS cnt FROM jobs WHERE worker_pubkey IS NOT NULL`).get() as { cnt: number }
    ).cnt;

    const workersOnline = hub.onlineCount;

    const totalJobsCompleted = (
      db.prepare(`SELECT COUNT(*) AS cnt FROM jobs WHERE status = 'completed'`).get() as { cnt: number }
    ).cnt;

    const totalReceipts = (
      db.prepare(`SELECT COUNT(*) AS cnt FROM receipts`).get() as { cnt: number }
    ).cnt;

    const verifiedReceipts = (
      db.prepare(`SELECT COUNT(*) AS cnt FROM receipts WHERE verified = 1`).get() as { cnt: number }
    ).cnt;

    const verificationRate =
      totalReceipts > 0 ? Math.round((verifiedReceipts / totalReceipts) * 100) : 0;

    // Recent jobs
    const recentJobs = db
      .prepare(
        `SELECT id, type, status, worker_pubkey, created_at, completed_at
         FROM jobs ORDER BY created_at DESC LIMIT 10`
      )
      .all() as Array<{
      id: string;
      type: string;
      status: string;
      worker_pubkey: string | null;
      created_at: string;
      completed_at: string | null;
    }>;

    const jobRows = recentJobs
      .map(
        (j) => `
        <tr>
          <td title="${j.id}">${j.id.slice(0, 8)}...</td>
          <td>${j.type}</td>
          <td><span class="status status-${j.status}">${j.status}</span></td>
          <td>${j.worker_pubkey ? j.worker_pubkey.slice(0, 12) + "..." : "—"}</td>
          <td>${j.created_at}</td>
          <td>${j.completed_at ?? "—"}</td>
        </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="10" />
  <title>OpenClaw Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0f;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
      padding: 2rem;
    }
    h1 {
      font-size: 1.8rem;
      margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 0.85rem;
      margin-bottom: 2rem;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .card {
      background: #141420;
      border: 1px solid #1e1e30;
      border-radius: 12px;
      padding: 1.25rem;
    }
    .card .label {
      color: #94a3b8;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .card .value {
      font-size: 2rem;
      font-weight: 700;
      color: #f8fafc;
    }
    .card .value.accent { color: #6366f1; }
    .card .value.green { color: #22c55e; }
    .card .value.amber { color: #f59e0b; }
    h2 {
      font-size: 1.1rem;
      margin-bottom: 1rem;
      color: #e2e8f0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    th {
      text-align: left;
      color: #94a3b8;
      font-weight: 500;
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid #1e1e30;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td {
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid #141420;
      color: #cbd5e1;
    }
    tr:hover td { background: #141420; }
    .status {
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-completed { background: #052e16; color: #22c55e; }
    .status-assigned { background: #1e1b4b; color: #818cf8; }
    .status-pending { background: #1c1917; color: #f59e0b; }
    .status-failed { background: #2a0a0a; color: #ef4444; }
    .footer {
      margin-top: 2rem;
      color: #475569;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <h1>OpenClaw Network</h1>
  <p class="subtitle">Verifiable Compute &mdash; live &mdash; auto-refreshes every 10s</p>

  <div class="cards">
    <div class="card">
      <div class="label">Nodes Registered</div>
      <div class="value">${totalWorkers}</div>
    </div>
    <div class="card">
      <div class="label">Nodes Online</div>
      <div class="value accent">${workersOnline}</div>
    </div>
    <div class="card">
      <div class="label">Jobs Completed</div>
      <div class="value green">${totalJobsCompleted}</div>
    </div>
    <div class="card">
      <div class="label">Verified Receipts</div>
      <div class="value amber">${verificationRate}%</div>
    </div>
  </div>

  <h2>Recent Jobs</h2>
  <table>
    <thead>
      <tr>
        <th>Job ID</th>
        <th>Type</th>
        <th>Status</th>
        <th>Worker</th>
        <th>Created</th>
        <th>Completed</th>
      </tr>
    </thead>
    <tbody>
      ${jobRows || '<tr><td colspan="6" style="text-align:center;color:#475569;">No jobs yet</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    OpenClaw &mdash; Verifiable Compute Network &bull; ${new Date().toISOString()}
  </div>
</body>
</html>`;

    res.type("html").send(html);
  });

  return router;
}
