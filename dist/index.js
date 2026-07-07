import { jsxs as N, jsx as a, Fragment as $ } from "react/jsx-runtime";
import { useState as k, useRef as P, useEffect as y, useCallback as x } from "react";
const X = "/handoff-annotations", z = "handoff-context:pins", T = typeof window < "u";
function S(t) {
  const e = t == null ? void 0 : t.pins;
  return Array.isArray(e) ? e : [];
}
function I(t) {
  return {
    async load() {
      if (!T) return [];
      try {
        const e = window.localStorage.getItem(t);
        return e ? S(JSON.parse(e)) : [];
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
function H(t) {
  return {
    async load() {
      try {
        const e = await fetch(t);
        return e.ok ? S(await e.json()) : [];
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
      return { present: !0, pins: S(await e.json()) };
    if (!(e.headers.get("Content-Type") ?? "").includes("application/json")) return { present: !1, pins: [] };
    const s = await e.json();
    return Array.isArray(s == null ? void 0 : s.pins) ? { present: !0, pins: S(s) } : { present: !1, pins: [] };
  } catch {
    return { present: !1, pins: [] };
  }
}
function Z(t = {}) {
  const {
    storage: e = "auto",
    endpoint: o = X,
    storageKey: s = z
  } = t, [d, i] = k([]), n = P(I(s));
  y(() => {
    let h = !1;
    async function g() {
      if (e === "local") {
        n.current = I(s);
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
      h || (p.present ? (n.current = H(o), i(p.pins)) : (n.current = I(s), i(await n.current.load())));
    }
    return g(), () => {
      h = !0;
    };
  }, [e, o, s]);
  const c = x((h, g, p) => {
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
  }, []), l = x((h, g) => {
    i((p) => {
      const u = p.map((f) => f.id === h ? { ...f, note: g } : f);
      return n.current.save(u), u;
    });
  }, []), b = x((h) => {
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
  const [o, s] = k(null), d = x((n) => {
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
  }, []), i = x((n) => {
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
  const d = P(null);
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
  const [i, n] = k(() => R(t)), c = P(e), l = P(null);
  if (y(() => {
    c.current = e;
  }, [e]), y(() => {
    let g, p;
    function u() {
      const C = R(t);
      C ? (l.current = C, n(C)) : c.current && l.current ? n(l.current) : n(null);
    }
    function f() {
      cancelAnimationFrame(g), g = requestAnimationFrame(u);
    }
    function E() {
      clearTimeout(p), p = setTimeout(u, 80);
    }
    u();
    const B = new MutationObserver(E);
    return B.observe(document.body, {
      childList: !0,
      subtree: !0,
      attributes: !0,
      attributeFilter: ["style", "class", "hidden"]
    }), window.addEventListener("scroll", f, { capture: !0, passive: !0 }), window.addEventListener("resize", f), () => {
      cancelAnimationFrame(g), clearTimeout(p), B.disconnect(), window.removeEventListener("scroll", f, { capture: !0 }), window.removeEventListener("resize", f);
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
const ae = "_menu_6kj2t_1", le = "_pill_6kj2t_16", de = "_pillActive_6kj2t_38", ue = "_iconBtn_6kj2t_48", fe = "_iconBtnActive_6kj2t_68", he = "_panel_6kj2t_78", pe = "_panelEmpty_6kj2t_95", me = "_panelRow_6kj2t_102", ge = "_panelIndex_6kj2t_123", ve = "_panelNote_6kj2t_137", we = "_panelNoteEmpty_6kj2t_143", _e = "_highlight_6kj2t_151", m = {
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
  const [s, d] = k("hidden"), [i, n] = k(null), [c, l] = k(!1), { pins: b, addPin: h, updatePin: g, deletePin: p } = Z({ storage: t, endpoint: e, storageKey: o }), u = x((r, w, v) => {
    if (i !== null) {
      n(null);
      return;
    }
    const _ = r.getBoundingClientRect(), F = K(r), D = _.width > 0 ? (w - _.left) / _.width : 0.5, M = _.height > 0 ? (v - _.top) / _.height : 0.5, Y = h(F, D, M);
    n(Y.id);
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
  }, B = () => {
    d((r) => r === "editing" ? "visible" : "editing");
  }, C = (r) => {
    p(r), r === i && n(null);
  }, V = (r, w) => {
    var v;
    d((_) => _ === "hidden" ? "visible" : _), n(r), l(!1);
    try {
      (v = document.querySelector(w)) == null || v.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
    }
  }, L = s !== "hidden", j = s === "editing";
  return /* @__PURE__ */ N($, { children: [
    /* @__PURE__ */ N("div", { className: m.menu, "data-handoff": !0, children: [
      /* @__PURE__ */ a(
        "button",
        {
          className: `${m.pill} ${L ? m.pillActive : ""}`,
          onClick: E,
          "aria-pressed": L,
          children: "Toggle context"
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          className: `${m.iconBtn} ${j ? m.iconBtnActive : ""}`,
          onClick: B,
          "aria-label": "Add annotation",
          "aria-pressed": j,
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
    j && f && /* @__PURE__ */ a(
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
    L && b.map((r) => /* @__PURE__ */ a(
      ce,
      {
        pin: r,
        isOpen: r.id === i,
        onToggle: () => n((w) => w === r.id ? null : r.id),
        onUpdate: g,
        onDelete: C
      },
      r.id
    ))
  ] });
}
export {
  Ee as HandoffContextBar
};
