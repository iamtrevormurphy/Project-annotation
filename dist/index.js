import { jsxs as N, jsx as a, Fragment as $ } from "react/jsx-runtime";
import { useState as x, useRef as S, useEffect as y, useCallback as C } from "react";
const Y = "/handoff-annotations", X = "handoff-context:pins", z = typeof window < "u";
function L(t) {
  const e = t == null ? void 0 : t.pins;
  return Array.isArray(e) ? e : [];
}
function T(t) {
  return {
    async load() {
      if (!z) return [];
      try {
        const e = window.localStorage.getItem(t);
        return e ? L(JSON.parse(e)) : [];
      } catch {
        return [];
      }
    },
    async save(e) {
      if (z)
        try {
          window.localStorage.setItem(t, JSON.stringify({ pins: e }));
        } catch {
        }
    }
  };
}
function H(t) {
  return {
    async load() {
      try {
        const e = await fetch(t);
        return e.ok ? L(await e.json()) : [];
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
async function U(t) {
  try {
    const e = await fetch(t);
    if (!e.ok) return { present: !1, pins: [] };
    if (e.headers.get("X-Handoff-Context"))
      return { present: !0, pins: L(await e.json()) };
    if (!(e.headers.get("Content-Type") ?? "").includes("application/json")) return { present: !1, pins: [] };
    const s = await e.json();
    return Array.isArray(s == null ? void 0 : s.pins) ? { present: !0, pins: L(s) } : { present: !1, pins: [] };
  } catch {
    return { present: !1, pins: [] };
  }
}
function Z(t = {}) {
  const {
    storage: e = "auto",
    endpoint: o = Y,
    storageKey: s = X
  } = t, [d, i] = x([]), n = S(T(s));
  y(() => {
    let h = !1;
    async function g() {
      if (e === "local") {
        n.current = T(s);
        const u = await n.current.load();
        h || i(u);
        return;
      }
      if (e === "file") {
        n.current = H(o);
        const u = await n.current.load();
        h || i(u);
        return;
      }
      const p = await U(o);
      h || (p.present ? (n.current = H(o), i(p.pins)) : (n.current = T(s), i(await n.current.load())));
    }
    return g(), () => {
      h = !0;
    };
  }, [e, o, s]);
  const c = C((h, g, p) => {
    const u = {
      id: crypto.randomUUID(),
      selector: h,
      offsetXPercent: g,
      offsetYPercent: p,
      note: "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return i((f) => {
      const E = [...f, u];
      return n.current.save(E), E;
    }), u;
  }, []), l = C((h, g) => {
    i((p) => {
      const u = p.map((f) => f.id === h ? { ...f, note: g } : f);
      return n.current.save(u), u;
    });
  }, []), b = C((h) => {
    i((g) => {
      const p = g.filter((u) => u.id !== h);
      return n.current.save(p), p;
    });
  }, []);
  return { pins: d, addPin: c, updatePin: l, deletePin: b };
}
const q = "data-handoff";
function O(t) {
  return t.closest(`[${q}]`) !== null;
}
function J(t, e) {
  const [o, s] = x(null), d = C((n) => {
    const c = n.target;
    if (!c || O(c)) {
      s(null);
      return;
    }
    const l = c.getBoundingClientRect();
    s({
      top: l.top + window.scrollY,
      left: l.left + window.scrollX,
      width: l.width,
      height: l.height
    });
  }, []), i = C((n) => {
    const c = n.target;
    !c || O(c) || (n.preventDefault(), n.stopPropagation(), e(c, n.clientX, n.clientY));
  }, [e]);
  return y(() => {
    if (!t) {
      s(null), document.body.style.cursor = "";
      return;
    }
    return document.body.style.cursor = "crosshair", document.addEventListener("mousemove", d), document.addEventListener("click", i, !0), () => {
      document.body.style.cursor = "", document.removeEventListener("mousemove", d), document.removeEventListener("click", i, !0), s(null);
    };
  }, [t, d, i]), { highlight: o };
}
function K(t) {
  const e = [];
  let o = t;
  for (; o && o.tagName !== "BODY"; ) {
    if (o.id) {
      e.unshift(`#${CSS.escape(o.id)}`);
      break;
    }
    let s = o.tagName.toLowerCase();
    const d = o.getAttribute("data-testid"), i = o.getAttribute("aria-label");
    if (d)
      s += `[data-testid="${CSS.escape(d)}"]`;
    else if (i)
      s += `[aria-label="${CSS.escape(i)}"]`;
    else {
      const c = Array.from(o.classList).filter(
        (l) => !/__[a-zA-Z0-9]{4,}$/.test(l) && !/^css-/.test(l)
      );
      c.length > 0 && (s += c.slice(0, 2).map((l) => `.${CSS.escape(l)}`).join(""));
    }
    const n = o.parentElement;
    if (n) {
      const c = Array.from(n.children).filter(
        (l) => l.tagName === o.tagName
      );
      c.length > 1 && (s += `:nth-of-type(${c.indexOf(o) + 1})`);
    }
    e.unshift(s), o = o.parentElement;
  }
  return e.join(" > ");
}
const G = "_popover_whp9i_1", W = "_header_whp9i_15", Q = "_label_whp9i_22", ee = "_closeBtn_whp9i_31", te = "_textarea_whp9i_48", ne = "_footer_whp9i_68", oe = "_deleteBtn_whp9i_73", A = {
  popover: G,
  header: W,
  label: Q,
  closeBtn: ee,
  textarea: te,
  footer: ne,
  deleteBtn: oe
};
function ie({ pin: t, onUpdate: e, onDelete: o, onClose: s }) {
  const d = S(null);
  return y(() => {
    var i;
    (i = d.current) == null || i.focus();
  }, [t.id]), y(() => {
    const i = (n) => {
      const c = n.target;
      c != null && c.closest("[data-handoff]") && n.stopImmediatePropagation();
    };
    return window.addEventListener("focusin", i, { capture: !0 }), () => window.removeEventListener("focusin", i, { capture: !0 });
  }, []), /* @__PURE__ */ N("div", { className: A.popover, "data-handoff": !0, children: [
    /* @__PURE__ */ N("div", { className: A.header, children: [
      /* @__PURE__ */ a("span", { className: A.label, children: "Annotation" }),
      /* @__PURE__ */ a("button", { className: A.closeBtn, onClick: s, "aria-label": "Close", children: "×" })
    ] }),
    /* @__PURE__ */ a(
      "textarea",
      {
        ref: d,
        className: A.textarea,
        placeholder: "Add annotation or context note…",
        value: t.note,
        onChange: (i) => e(t.id, i.target.value)
      }
    ),
    /* @__PURE__ */ a("div", { className: A.footer, children: /* @__PURE__ */ a("button", { className: A.deleteBtn, onClick: () => o(t.id), children: "Delete" }) })
  ] });
}
const re = "_pin_x83py_1", se = {
  pin: re
};
function R(t) {
  try {
    const e = document.querySelector(t.selector);
    if (!e) return null;
    const o = e.getBoundingClientRect();
    return o.width === 0 && o.height === 0 ? null : {
      x: o.left + t.offsetXPercent * o.width,
      y: o.top + t.offsetYPercent * o.height
    };
  } catch {
    return null;
  }
}
function ce({ pin: t, isOpen: e, onToggle: o, onUpdate: s, onDelete: d }) {
  const [i, n] = x(() => R(t)), c = S(e), l = S(null);
  if (y(() => {
    c.current = e;
  }, [e]), y(() => {
    let g, p;
    function u() {
      const B = R(t);
      B ? (l.current = B, n(B)) : c.current && l.current ? n(l.current) : n(null);
    }
    function f() {
      cancelAnimationFrame(g), g = requestAnimationFrame(u);
    }
    function E() {
      clearTimeout(p), p = setTimeout(u, 80);
    }
    u();
    const P = new MutationObserver(E);
    return P.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeFilter: ["style", "class", "hidden"]
    }), window.addEventListener("scroll", f, { capture: !0, passive: !0 }), window.addEventListener("resize", f), () => {
      cancelAnimationFrame(g), clearTimeout(p), P.disconnect(), window.removeEventListener("scroll", f, { capture: !0 }), window.removeEventListener("resize", f);
    };
  }, [t.selector, t.offsetXPercent, t.offsetYPercent]), !i) return null;
  const b = Math.min(i.x + 12, window.innerWidth - 280), h = i.y + 12;
  return /* @__PURE__ */ N($, { children: [
    /* @__PURE__ */ a(
      "button",
      {
        "data-handoff": !0,
        className: se.pin,
        style: { top: i.y, left: i.x },
        onClick: o,
        "aria-label": "Annotation pin",
        children: /* @__PURE__ */ N("svg", { width: "16", height: "20", viewBox: "0 0 16 20", fill: "none", children: [
          /* @__PURE__ */ a(
            "path",
            {
              d: "M8 0C3.58 0 0 3.58 0 8c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z",
              fill: "#6366f1"
            }
          ),
          /* @__PURE__ */ a("circle", { cx: "8", cy: "8", r: "3", fill: "#fff" })
        ] })
      }
    ),
    e && /* @__PURE__ */ a(
      "div",
      {
        "data-handoff": !0,
        style: { position: "fixed", top: h, left: b, zIndex: 2147483646 },
        children: /* @__PURE__ */ a(
          ie,
          {
            pin: t,
            onUpdate: s,
            onDelete: d,
            onClose: o
          }
        )
      }
    )
  ] });
}
const ae = "_menu_10z02_1", le = "_pill_10z02_16", de = "_pillActive_10z02_38", ue = "_iconBtn_10z02_48", fe = "_iconBtnActive_10z02_68", he = "_panel_10z02_78", pe = "_panelEmpty_10z02_95", me = "_panelRow_10z02_102", ge = "_panelIndex_10z02_123", ve = "_panelNote_10z02_137", we = "_panelNoteEmpty_10z02_143", _e = "_highlight_10z02_151", m = {
  menu: ae,
  pill: le,
  pillActive: de,
  iconBtn: ue,
  iconBtnActive: fe,
  panel: he,
  panelEmpty: pe,
  panelRow: me,
  panelIndex: ge,
  panelNote: ve,
  panelNoteEmpty: we,
  highlight: _e
}, ye = () => /* @__PURE__ */ a("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", "aria-hidden": !0, children: /* @__PURE__ */ a("path", { d: "M9.5 6.5H6.5V9.5H5.5V6.5H2.5V5.5H5.5V2.5H6.5V5.5H9.5V6.5Z", fill: "currentColor" }) }), be = () => /* @__PURE__ */ a("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", "aria-hidden": !0, children: /* @__PURE__ */ a(
  "path",
  {
    d: "M4.5 9H10.5V8H4.5V9ZM1.5 3V4H10.5V3H1.5ZM4.5 6.5H10.5V5.5H4.5V6.5Z",
    fill: "currentColor"
  }
) });
function Ee({ storage: t, endpoint: e, storageKey: o } = {}) {
  const [s, d] = x("hidden"), [i, n] = x(null), [c, l] = x(!1), { pins: b, addPin: h, updatePin: g, deletePin: p } = Z({ storage: t, endpoint: e, storageKey: o }), u = C((r, w, v) => {
    if (i !== null) {
      n(null);
      return;
    }
    const _ = r.getBoundingClientRect(), F = K(r), D = _.width > 0 ? (w - _.left) / _.width : 0.5, M = _.height > 0 ? (v - _.top) / _.height : 0.5, j = h(F, D, M);
    n(j.id);
  }, [h, i]), { highlight: f } = J(s === "editing", u);
  y(() => {
    if (!i || s === "editing") return;
    const r = (w) => {
      const v = w.target;
      v != null && v.closest("[data-handoff]") || n(null);
    };
    return document.addEventListener("click", r), () => document.removeEventListener("click", r);
  }, [i, s]), y(() => {
    if (!c) return;
    const r = (w) => {
      const v = w.target;
      v != null && v.closest("[data-handoff]") || l(!1);
    };
    return document.addEventListener("click", r), () => document.removeEventListener("click", r);
  }, [c]);
  const E = () => {
    n(null), d((r) => r === "hidden" ? "visible" : "hidden");
  }, P = () => {
    d((r) => r === "editing" ? "visible" : "editing");
  }, B = (r) => {
    p(r), r === i && n(null);
  }, V = (r, w) => {
    var v;
    d((_) => _ === "hidden" ? "visible" : _), n(r), l(!1);
    try {
      (v = document.querySelector(w)) == null || v.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
    }
  }, k = s !== "hidden", I = s === "editing";
  return /* @__PURE__ */ N($, { children: [
    /* @__PURE__ */ N("div", { className: m.menu, "data-handoff": !0, children: [
      /* @__PURE__ */ a(
        "button",
        {
          className: `${m.pill} ${k ? m.pillActive : ""}`,
          onClick: E,
          "aria-pressed": k,
          children: "Toggle context"
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          className: `${m.iconBtn} ${I ? m.iconBtnActive : ""}`,
          onClick: P,
          "aria-label": "Add annotation",
          "aria-pressed": I,
          children: /* @__PURE__ */ a(ye, {})
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          className: `${m.iconBtn} ${c ? m.iconBtnActive : ""}`,
          onClick: () => l((r) => !r),
          "aria-label": "Annotation list",
          "aria-pressed": c,
          children: /* @__PURE__ */ a(be, {})
        }
      ),
      c && /* @__PURE__ */ a("div", { className: m.panel, "data-handoff": !0, children: b.length === 0 ? /* @__PURE__ */ a("div", { className: m.panelEmpty, children: "No annotations yet" }) : b.map((r, w) => /* @__PURE__ */ N(
        "button",
        {
          className: m.panelRow,
          onClick: () => V(r.id, r.selector),
          children: [
            /* @__PURE__ */ a("span", { className: m.panelIndex, children: w + 1 }),
            /* @__PURE__ */ a("span", { className: r.note ? m.panelNote : m.panelNoteEmpty, children: r.note || "Empty note" })
          ]
        },
        r.id
      )) })
    ] }),
    I && f && /* @__PURE__ */ a(
      "div",
      {
        "data-handoff": !0,
        className: m.highlight,
        style: {
          top: f.top,
          left: f.left,
          width: f.width,
          height: f.height
        }
      }
    ),
    k && b.map((r) => /* @__PURE__ */ a(
      ce,
      {
        pin: r,
        isOpen: r.id === i,
        onToggle: () => n((w) => w === r.id ? null : r.id),
        onUpdate: g,
        onDelete: B
      },
      r.id
    ))
  ] });
}
export {
  Ee as HandoffContextBar
};
