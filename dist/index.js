import { jsxs as C, jsx as u, Fragment as O } from "react/jsx-runtime";
import { useState as S, useRef as L, useEffect as w, useCallback as A } from "react";
const Y = "/handoff-annotations", z = "handoff-context:pins", T = typeof window < "u";
function N(t) {
  const e = t == null ? void 0 : t.pins;
  return Array.isArray(e) ? e : [];
}
function B(t) {
  return {
    async load() {
      if (!T) return [];
      try {
        const e = window.localStorage.getItem(t);
        return e ? N(JSON.parse(e)) : [];
      } catch {
        return [];
      }
    },
    async save(e) {
      if (T)
        try {
          window.localStorage.setItem(t, JSON.stringify({ pins: e }));
        } catch {
        }
    }
  };
}
function I(t) {
  return {
    async load() {
      try {
        const e = await fetch(t);
        return e.ok ? N(await e.json()) : [];
      } catch {
        return [];
      }
    },
    async save(e) {
      try {
        await fetch(t, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pins: e })
        });
      } catch {
      }
    }
  };
}
async function H(t) {
  try {
    const e = await fetch(t);
    if (!e.ok) return { present: !1, pins: [] };
    if (e.headers.get("X-Handoff-Context"))
      return { present: !0, pins: N(await e.json()) };
    if (!(e.headers.get("Content-Type") ?? "").includes("application/json")) return { present: !1, pins: [] };
    const i = await e.json();
    return Array.isArray(i == null ? void 0 : i.pins) ? { present: !0, pins: N(i) } : { present: !1, pins: [] };
  } catch {
    return { present: !1, pins: [] };
  }
}
function X(t = {}) {
  const {
    storage: e = "auto",
    endpoint: n = Y,
    storageKey: i = z
  } = t, [f, r] = S([]), o = L(B(i));
  w(() => {
    let h = !1;
    async function p() {
      if (e === "local") {
        o.current = B(i);
        const d = await o.current.load();
        h || r(d);
        return;
      }
      if (e === "file") {
        o.current = I(n);
        const d = await o.current.load();
        h || r(d);
        return;
      }
      const a = await H(n);
      h || (a.present ? (o.current = I(n), r(a.pins)) : (o.current = B(i), r(await o.current.load())));
    }
    return p(), () => {
      h = !0;
    };
  }, [e, n, i]);
  const s = A((h, p, a) => {
    const d = {
      id: crypto.randomUUID(),
      selector: h,
      offsetXPercent: p,
      offsetYPercent: a,
      note: "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return r((m) => {
      const y = [...m, d];
      return o.current.save(y), y;
    }), d;
  }, []), c = A((h, p) => {
    r((a) => {
      const d = a.map((m) => m.id === h ? { ...m, note: p } : m);
      return o.current.save(d), d;
    });
  }, []), x = A((h) => {
    r((p) => {
      const a = p.filter((d) => d.id !== h);
      return o.current.save(a), a;
    });
  }, []);
  return { pins: f, addPin: s, updatePin: c, deletePin: x };
}
const U = "data-handoff";
function D(t) {
  return t.closest(`[${U}]`) !== null;
}
function J(t, e) {
  const [n, i] = S(null), f = A((o) => {
    const s = o.target;
    if (!s || D(s)) {
      i(null);
      return;
    }
    const c = s.getBoundingClientRect();
    i({
      top: c.top + window.scrollY,
      left: c.left + window.scrollX,
      width: c.width,
      height: c.height
    });
  }, []), r = A((o) => {
    const s = o.target;
    !s || D(s) || (o.preventDefault(), o.stopPropagation(), e(s, o.clientX, o.clientY));
  }, [e]);
  return w(() => {
    if (!t) {
      i(null), document.body.style.cursor = "";
      return;
    }
    return document.body.style.cursor = "crosshair", document.addEventListener("mousemove", f), document.addEventListener("click", r, !0), () => {
      document.body.style.cursor = "", document.removeEventListener("mousemove", f), document.removeEventListener("click", r, !0), i(null);
    };
  }, [t, f, r]), { highlight: n };
}
function q(t) {
  const e = [];
  let n = t;
  for (; n && n.tagName !== "BODY"; ) {
    if (n.id) {
      e.unshift(`#${CSS.escape(n.id)}`);
      break;
    }
    let i = n.tagName.toLowerCase();
    const f = n.getAttribute("data-testid"), r = n.getAttribute("aria-label");
    if (f)
      i += `[data-testid="${CSS.escape(f)}"]`;
    else if (r)
      i += `[aria-label="${CSS.escape(r)}"]`;
    else {
      const s = Array.from(n.classList).filter(
        (c) => !/__[a-zA-Z0-9]{4,}$/.test(c) && !/^css-/.test(c)
      );
      s.length > 0 && (i += s.slice(0, 2).map((c) => `.${CSS.escape(c)}`).join(""));
    }
    const o = n.parentElement;
    if (o) {
      const s = Array.from(o.children).filter(
        (c) => c.tagName === n.tagName
      );
      s.length > 1 && (i += `:nth-of-type(${s.indexOf(n) + 1})`);
    }
    e.unshift(i), n = n.parentElement;
  }
  return e.join(" > ");
}
const K = "_popover_whp9i_1", W = "_header_whp9i_15", G = "_label_whp9i_22", Z = "_closeBtn_whp9i_31", Q = "_textarea_whp9i_48", V = "_footer_whp9i_68", ee = "_deleteBtn_whp9i_73", v = {
  popover: K,
  header: W,
  label: G,
  closeBtn: Z,
  textarea: Q,
  footer: V,
  deleteBtn: ee
};
function te({ pin: t, onUpdate: e, onDelete: n, onClose: i }) {
  const f = L(null);
  return w(() => {
    var r;
    (r = f.current) == null || r.focus();
  }, [t.id]), w(() => {
    const r = (o) => {
      const s = o.target;
      s != null && s.closest("[data-handoff]") && o.stopImmediatePropagation();
    };
    return window.addEventListener("focusin", r, { capture: !0 }), () => window.removeEventListener("focusin", r, { capture: !0 });
  }, []), /* @__PURE__ */ C("div", { className: v.popover, "data-handoff": !0, children: [
    /* @__PURE__ */ C("div", { className: v.header, children: [
      /* @__PURE__ */ u("span", { className: v.label, children: "Annotation" }),
      /* @__PURE__ */ u("button", { className: v.closeBtn, onClick: i, "aria-label": "Close", children: "×" })
    ] }),
    /* @__PURE__ */ u(
      "textarea",
      {
        ref: f,
        className: v.textarea,
        placeholder: "Add annotation or context note…",
        value: t.note,
        onChange: (r) => e(t.id, r.target.value)
      }
    ),
    /* @__PURE__ */ u("div", { className: v.footer, children: /* @__PURE__ */ u("button", { className: v.deleteBtn, onClick: () => n(t.id), children: "Delete" }) })
  ] });
}
const ne = "_pin_x83py_1", re = {
  pin: ne
};
function F(t) {
  try {
    const e = document.querySelector(t.selector);
    if (!e) return null;
    const n = e.getBoundingClientRect();
    return n.width === 0 && n.height === 0 ? null : {
      x: n.left + t.offsetXPercent * n.width,
      y: n.top + t.offsetYPercent * n.height
    };
  } catch {
    return null;
  }
}
function oe({ pin: t, isOpen: e, onToggle: n, onUpdate: i, onDelete: f }) {
  const [r, o] = S(() => F(t)), s = L(e), c = L(null);
  if (w(() => {
    s.current = e;
  }, [e]), w(() => {
    let p, a;
    function d() {
      const g = F(t);
      g ? (c.current = g, o(g)) : s.current && c.current ? o(c.current) : o(null);
    }
    function m() {
      cancelAnimationFrame(p), p = requestAnimationFrame(d);
    }
    function y() {
      clearTimeout(a), a = setTimeout(d, 80);
    }
    d();
    const E = new MutationObserver(y);
    return E.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeFilter: ["style", "class", "hidden"]
    }), window.addEventListener("scroll", m, { capture: !0, passive: !0 }), window.addEventListener("resize", m), () => {
      cancelAnimationFrame(p), clearTimeout(a), E.disconnect(), window.removeEventListener("scroll", m, { capture: !0 }), window.removeEventListener("resize", m);
    };
  }, [t.selector, t.offsetXPercent, t.offsetYPercent]), !r) return null;
  const x = Math.min(r.x + 12, window.innerWidth - 280), h = r.y + 12;
  return /* @__PURE__ */ C(O, { children: [
    /* @__PURE__ */ u(
      "button",
      {
        "data-handoff": !0,
        className: re.pin,
        style: { top: r.y, left: r.x },
        onClick: n,
        "aria-label": "Annotation pin",
        children: /* @__PURE__ */ C("svg", { width: "16", height: "20", viewBox: "0 0 16 20", fill: "none", children: [
          /* @__PURE__ */ u(
            "path",
            {
              d: "M8 0C3.58 0 0 3.58 0 8c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z",
              fill: "#6366f1"
            }
          ),
          /* @__PURE__ */ u("circle", { cx: "8", cy: "8", r: "3", fill: "#fff" })
        ] })
      }
    ),
    e && /* @__PURE__ */ u(
      "div",
      {
        "data-handoff": !0,
        style: { position: "fixed", top: h, left: x, zIndex: 2147483646 },
        children: /* @__PURE__ */ u(
          te,
          {
            pin: t,
            onUpdate: i,
            onDelete: f,
            onClose: n
          }
        )
      }
    )
  ] });
}
const ie = "_bar_amksh_1", se = "_chip_amksh_11", ce = "_editChip_amksh_34", ae = "_editActive_amksh_38", le = "_highlight_amksh_46", b = {
  bar: ie,
  chip: se,
  editChip: ce,
  editActive: ae,
  highlight: le
}, de = () => /* @__PURE__ */ u("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", children: /* @__PURE__ */ u(
  "path",
  {
    d: "M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
) });
function he({ storage: t, endpoint: e, storageKey: n } = {}) {
  const [i, f] = S("hidden"), [r, o] = S(null), { pins: s, addPin: c, updatePin: x, deletePin: h } = X({ storage: t, endpoint: e, storageKey: n }), p = A((l, P, k) => {
    if (r !== null) {
      o(null);
      return;
    }
    const _ = l.getBoundingClientRect(), $ = q(l), R = _.width > 0 ? (P - _.left) / _.width : 0.5, j = _.height > 0 ? (k - _.top) / _.height : 0.5, M = c($, R, j);
    o(M.id);
  }, [c, r]), { highlight: a } = J(i === "editing", p);
  w(() => {
    if (!r || i === "editing") return;
    const l = (P) => {
      const k = P.target;
      k != null && k.closest("[data-handoff]") || o(null);
    };
    return document.addEventListener("click", l), () => document.removeEventListener("click", l);
  }, [r, i]);
  const d = () => {
    o(null), f((l) => l === "hidden" ? "visible" : "hidden");
  }, m = () => {
    f((l) => l === "editing" ? "visible" : "editing");
  }, y = (l) => {
    h(l), l === r && o(null);
  }, E = i !== "hidden", g = i === "editing";
  return /* @__PURE__ */ C(O, { children: [
    /* @__PURE__ */ C("div", { className: b.bar, "data-handoff": !0, children: [
      /* @__PURE__ */ u("button", { className: b.chip, onClick: d, children: E ? "Disable context" : "Enable context" }),
      /* @__PURE__ */ u(
        "button",
        {
          className: `${b.chip} ${b.editChip} ${g ? b.editActive : ""}`,
          onClick: m,
          "aria-label": "Edit context",
          "aria-pressed": g,
          children: /* @__PURE__ */ u(de, {})
        }
      )
    ] }),
    g && a && /* @__PURE__ */ u(
      "div",
      {
        "data-handoff": !0,
        className: b.highlight,
        style: {
          top: a.top,
          left: a.left,
          width: a.width,
          height: a.height
        }
      }
    ),
    E && s.map((l) => /* @__PURE__ */ u(
      oe,
      {
        pin: l,
        isOpen: l.id === r,
        onToggle: () => o((P) => P === l.id ? null : l.id),
        onUpdate: x,
        onDelete: y
      },
      l.id
    ))
  ] });
}
export {
  he as HandoffContextBar
};
