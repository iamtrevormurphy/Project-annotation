import e from "node:fs";
import s from "node:path";
function l() {
  let n;
  return {
    name: "handoff-context",
    configResolved(a) {
      n = s.resolve(a.root, "public", "handoff-annotations.json"), e.existsSync(n) || (e.mkdirSync(s.dirname(n), { recursive: !0 }), e.writeFileSync(n, JSON.stringify({ pins: [] }, null, 2)));
    },
    configureServer(a) {
      a.middlewares.use("/handoff-annotations", (o, t) => {
        if (t.setHeader("Content-Type", "application/json"), t.setHeader("X-Handoff-Context", "1"), t.setHeader("Access-Control-Allow-Origin", "*"), t.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"), t.setHeader("Access-Control-Allow-Headers", "Content-Type"), t.setHeader("Access-Control-Expose-Headers", "X-Handoff-Context"), o.method === "OPTIONS") {
          t.statusCode = 204, t.end();
          return;
        }
        if (o.method === "GET") {
          const i = e.existsSync(n) ? e.readFileSync(n, "utf-8") : JSON.stringify({ pins: [] });
          t.end(i);
          return;
        }
        if (o.method === "POST") {
          let i = "";
          o.on("data", (d) => {
            i += d.toString();
          }), o.on("end", () => {
            try {
              const d = JSON.parse(i);
              e.writeFileSync(n, JSON.stringify(d, null, 2)), t.statusCode = 200, t.end(JSON.stringify({ ok: !0 }));
            } catch {
              t.statusCode = 400, t.end(JSON.stringify({ error: "Invalid JSON" }));
            }
          });
          return;
        }
        t.statusCode = 405, t.end();
      });
    }
  };
}
export {
  l as handoffPlugin
};
