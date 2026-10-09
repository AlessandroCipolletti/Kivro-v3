import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

/** Minimal seller running-jobs control surface (§426, §436) until full seller UX milestone. */
const CONTROL_UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kivro — Running jobs</title>
  <style>
    :root { font-family: system-ui, sans-serif; color: #111; background: #f6f4ef; }
    body { margin: 0; padding: 1.5rem; max-width: 52rem; }
    h1 { font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem; }
    .job { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
    .meta { color: #555; font-size: 0.875rem; margin: 0.25rem 0 0.75rem; }
    .status { font-weight: 600; }
    button { margin-right: 0.5rem; padding: 0.4rem 0.75rem; border-radius: 6px; border: 1px solid #333; background: #fff; cursor: pointer; }
    button.primary { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    #err { color: #a11; margin-top: 1rem; }
    #empty { color: #666; }
  </style>
</head>
<body>
  <h1>Running jobs</h1>
  <p id="empty" hidden>No active jobs.</p>
  <div id="list"></div>
  <p id="err" hidden></p>
  <script>
    const list = document.getElementById("list");
    const err = document.getElementById("err");
    const empty = document.getElementById("empty");
    function showError(message) {
      err.hidden = false;
      err.textContent = message;
    }
    async function load() {
      err.hidden = true;
      const res = await fetch("/seller/jobs/running", { credentials: "include" });
      if (!res.ok) {
        showError("Could not load jobs. Sign in as seller with a verified email.");
        return;
      }
      const data = await res.json();
      list.innerHTML = "";
      if (!data.jobs || data.jobs.length === 0) {
        empty.hidden = false;
        return;
      }
      empty.hidden = true;
      for (const job of data.jobs) {
        const el = document.createElement("article");
        el.className = "job";
        el.innerHTML =
          '<div class="status">' + (job.uiStatus || job.status) + '</div>' +
          '<div class="meta">#' + job.id.slice(0, 8) + ' · ' + (job.capabilitySlug || "capability") +
          (job.currentStage ? ' · ' + job.currentStage : '') + '</div>' +
          '<div><button type="button" data-act="pause" data-id="' + job.id + '">Pause job</button>' +
          '<button type="button" data-act="resume" data-id="' + job.id + '">Resume job</button>' +
          '<button type="button" data-act="cancel" data-id="' + job.id + '">Cancel job</button></div>';
        list.appendChild(el);
      }
      list.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const act = btn.getAttribute("data-act");
          const path = act === "pause" ? "pause" : act === "resume" ? "resume" : "cancel";
          const res = await fetch("/seller/jobs/" + id + "/" + path, {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: "{}",
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            showError(body.error || ("Action failed: " + path));
            return;
          }
          load();
        });
      });
    }
    load();
    setInterval(load, 8000);
  </script>
</body>
</html>`;

export function sellerControlUiRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.get("/jobs/control-ui", requireAuth, requireVerifiedEmail, (c) => {
    return c.html(CONTROL_UI_HTML);
  });
  return app;
}
