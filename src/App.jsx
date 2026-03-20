import { useState, useEffect, useRef } from "react";

// ═══ MIDNIGHT OCEAN CYBERPUNK PALETTE ═══
const C = {
  abyss: "#020b18", deep: "#061428", navy: "#0a1e3d", surface: "#0d2847",
  neon: "#00e5ff", blue: "#0080ff", electric: "#00b4d8", teal: "#14b8a6",
  hot: "#ff3d71", amber: "#fbbf24", green: "#22c55e",
  text: "#e0f2fe", dim: "#64a5c7", ghost: "#2a5a7a",
  glow: "rgba(0,229,255,", panel: "rgba(6,20,40,0.82)",
  border: "rgba(0,229,255,0.12)", borderH: "rgba(0,229,255,0.35)",
};

// ═══ SONAR PARTICLE OCEAN ═══
function SonarField({ mouse }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    let w, h, particles = [], ripples = [], tick = 0;
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr; c.style.width = w + "px"; c.style.height = h + "px"; ctx.scale(dpr, dpr);
      particles = []; for (let i = 0; i < 150; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.15 - 0.1, r: Math.random() * 2 + 0.8, phase: Math.random() * Math.PI * 2, bright: Math.random() > 0.85 });
    };
    resize(); window.addEventListener("resize", resize);

    // Click to send sonar ripple
    const addRipple = (e) => ripples.push({ x: e.clientX, y: e.clientY, r: 0, a: 1 });
    window.addEventListener("click", addRipple);

    const draw = () => {
      tick++;
      ctx.fillStyle = "rgba(2,11,24,0.08)"; ctx.fillRect(0, 0, w, h);
      const mx = mouse.current?.x ?? w / 2, my = mouse.current?.y ?? h / 2;

      // Horizontal scan line
      const scanY = (tick * 0.8) % h;
      ctx.fillStyle = `rgba(0,229,255,0.03)`; ctx.fillRect(0, scanY - 1, w, 2);

      // Particles
      for (const p of particles) {
        p.x += p.vx + Math.sin(tick * 0.005 + p.phase) * 0.3;
        p.y += p.vy; p.phase += 0.01;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;

        // Mouse attraction
        const dx = mx - p.x, dy = my - p.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200 && d > 20) { p.vx += dx / d * 0.008; p.vy += dy / d * 0.008; }
        p.vx *= 0.995; p.vy *= 0.995;

        const glow = Math.sin(p.phase) * 0.3 + 0.7;
        // Connection lines
        for (const q of particles) {
          if (q === p) continue;
          const dd = Math.hypot(p.x - q.x, p.y - q.y);
          if (dd < 100) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,229,255,${(1 - dd / 100) * 0.12})`; ctx.lineWidth = 0.4; ctx.stroke();
          }
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = p.bright ? `rgba(0,229,255,${0.8 * glow})` : `rgba(0,180,216,${0.3 * glow})`;
        ctx.fill();
        if (p.bright) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fillStyle = `rgba(0,229,255,${0.04 * glow})`; ctx.fill(); }
      }

      // Sonar ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]; rp.r += 3; rp.a -= 0.012;
        if (rp.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,229,255,${rp.a * 0.4})`; ctx.lineWidth = 1.5; ctx.stroke();
      }

      // Mouse sonar pulse
      const pr = (tick % 120) * 2.5;
      const pa = 1 - pr / 300;
      if (pa > 0) { ctx.beginPath(); ctx.arc(mx, my, pr, 0, Math.PI * 2); ctx.strokeStyle = `rgba(0,229,255,${pa * 0.15})`; ctx.lineWidth = 1; ctx.stroke(); }

      requestAnimationFrame(draw);
    };
    const id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); window.removeEventListener("click", addRipple); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, zIndex: 1 }} />;
}

// ═══ CURSOR ═══
function Cursor({ mouse }) {
  const dot = useRef(null), ring = useRef(null), [hov, setHov] = useState(false);
  useEffect(() => {
    const move = e => { mouse.current = { x: e.clientX, y: e.clientY }; if (dot.current) dot.current.style.transform = `translate(${e.clientX - 5}px,${e.clientY - 5}px)`; if (ring.current) ring.current.style.transform = `translate(${e.clientX - (hov ? 28 : 18)}px,${e.clientY - (hov ? 28 : 18)}px)`; };
    const en = () => setHov(true), lv = () => setHov(false); document.addEventListener("mousemove", move);
    const bind = () => document.querySelectorAll("a,button,[data-h]").forEach(e => { e.addEventListener("mouseenter", en); e.addEventListener("mouseleave", lv); }); bind();
    const obs = new MutationObserver(bind); obs.observe(document.body, { childList: true, subtree: true }); return () => { document.removeEventListener("mousemove", move); obs.disconnect(); };
  }, [hov]);
  return <>
    <div ref={dot} style={{ position: "fixed", top: 0, left: 0, width: 10, height: 10, background: hov ? C.neon : C.electric, borderRadius: "50%", pointerEvents: "none", zIndex: 99999, boxShadow: `0 0 ${hov ? 15 : 8}px ${C.neon}`, transition: "all 0.2s" }} />
    <div ref={ring} style={{ position: "fixed", top: 0, left: 0, width: hov ? 56 : 36, height: hov ? 56 : 36, border: `1px solid ${hov ? C.neon : C.electric + "55"}`, borderRadius: hov ? "12px" : "50%", pointerEvents: "none", zIndex: 99998, transition: "all 0.35s cubic-bezier(.4,0,.2,1)", boxShadow: hov ? `0 0 20px ${C.glow}0.15)` : "none" }} />
  </>;
}

// ═══ COMPONENTS ═══
function Mag({ children, href, variant = "default", style: s }) {
  const ref = useRef(null), [o, setO] = useState({ x: 0, y: 0 });
  const styles = {
    primary: { background: `linear-gradient(135deg,${C.neon},${C.blue})`, color: C.abyss, border: "none", fontWeight: 700, boxShadow: o.x ? `0 0 30px ${C.glow}0.3),0 0 60px ${C.glow}0.1)` : `0 0 15px ${C.glow}0.15)` },
    outline: { background: "transparent", color: C.neon, border: `1px solid ${C.neon}44` },
    ghost: { background: "transparent", color: C.electric, border: `1px solid ${C.electric}33`, padding: "6px 16px", fontSize: 11 },
    default: { background: "transparent", color: C.text, border: `1px solid ${C.ghost}` },
  };
  return <a ref={ref} href={href || "#"} data-h target={href?.startsWith("http") ? "_blank" : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 8, fontSize: 13, textDecoration: "none", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", textTransform: "uppercase", transform: `translate(${o.x}px,${o.y}px)`, transition: "all 0.3s cubic-bezier(.4,0,.2,1)", cursor: "none", ...styles[variant], ...s }} onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setO({ x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.25 }); }} onMouseLeave={() => setO({ x: 0, y: 0 })}>{children}</a>;
}

function Panel({ children, style: s, glow }) {
  const ref = useRef(null), [t, setT] = useState({ x: 0, y: 0 }), [h, setH] = useState(false);
  return <div ref={ref} data-h onMouseMove={e => { const r = ref.current.getBoundingClientRect(); setT({ x: (e.clientY - r.top) / r.height - 0.5, y: (e.clientX - r.left) / r.width - 0.5 }); }} onMouseEnter={() => setH(true)} onMouseLeave={() => { setT({ x: 0, y: 0 }); setH(false); }} style={{
    background: C.panel, backdropFilter: "blur(20px)", borderRadius: 12,
    border: `1px solid ${h ? C.borderH : C.border}`,
    transform: `perspective(800px) rotateX(${t.x * -8}deg) rotateY(${t.y * 8}deg) ${h ? "translateY(-3px)" : ""}`,
    transition: "all 0.4s cubic-bezier(.4,0,.2,1)", transformStyle: "preserve-3d", cursor: "none",
    boxShadow: h ? `0 15px 50px rgba(0,0,0,0.5),0 0 ${glow ? 40 : 20}px ${C.glow}${glow ? "0.15" : "0.06"})` : "0 4px 20px rgba(0,0,0,0.4)",
    position: "relative", overflow: "hidden", ...s,
  }}>
    {/* Top accent line */}
    <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg,transparent,${h ? C.neon + "55" : C.electric + "22"},transparent)`, transition: "all 0.4s" }} />
    {children}
  </div>;
}

function SR({ children, delay = 0, style: s }) {
  const ref = useRef(null), [v, setV] = useState(false);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0) scale(1)" : "translateY(30px) scale(0.98)", transition: `all 0.7s cubic-bezier(.4,0,.2,1) ${delay}s`, ...s }}>{children}</div>;
}

function Typed() {
  const ts = ["ML Engineer", "AI Architect", "Creative Technologist", "Open Source Hacker"];
  const [t, setT] = useState(""), [i, setI] = useState(0), [d, setD] = useState(false);
  useEffect(() => { const c = ts[i]; let tm; if (!d && t === c) tm = setTimeout(() => setD(true), 2200); else if (d && t === "") { setD(false); setI(p => (p + 1) % ts.length); } else tm = setTimeout(() => setT(d ? c.slice(0, t.length - 1) : c.slice(0, t.length + 1)), d ? 25 : 55); return () => clearTimeout(tm); }, [t, d, i]);
  return <span style={{ fontFamily: "'JetBrains Mono',monospace", color: C.neon, fontSize: "clamp(14px,2.2vw,18px)", textShadow: `0 0 20px ${C.glow}0.4)` }}>
    <span style={{ color: C.dim }}>class </span>Adarsh<span style={{ color: C.dim }}> extends </span><span style={{ color: C.electric }}>{t}</span><span style={{ color: C.neon, animation: "blink .7s step-end infinite" }}>_</span>
  </span>;
}

function Count({ end, suf = "", label }) {
  const [c, setC] = useState(0), ref = useRef(null), [go, setGo] = useState(false);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true); }, { threshold: 0.5 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);
  useEffect(() => { if (!go || !end) return; let f; const s = performance.now(); const step = n => { const p = Math.min((n - s) / 2000, 1); setC(Math.round((1 - Math.pow(1 - p, 3)) * end)); if (p < 1) f = requestAnimationFrame(step); }; f = requestAnimationFrame(step); return () => cancelAnimationFrame(f); }, [go, end]);
  return <div ref={ref} style={{ textAlign: "center" }}>
    <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: C.neon, textShadow: `0 0 15px ${C.glow}0.3)` }}>{end ? `${c}${suf}` : label}</div>
    {end > 0 && <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.dim, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>}
  </div>;
}

// ═══ SVG ICONS ═══
const I = {
  python: <svg viewBox="0 0 32 32" width="100%" height="100%"><defs><linearGradient id="py1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#387EB8"/><stop offset="100%" stopColor="#366994"/></linearGradient><linearGradient id="py2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFD43B"/><stop offset="100%" stopColor="#FFE873"/></linearGradient></defs><path d="M15.9 2c-1.5 0-2.9.1-4.2.4C8.5 3 7.8 4.5 7.8 6.7v2.8h8.2v1H5.8c-2.6 0-4.8 1.5-5.5 4.5-.8 3.3-.8 5.4 0 8.9.6 2.6 2 4.5 4.6 4.5h3v-4c0-2.9 2.5-5.5 5.5-5.5h8.2c2.5 0 4.4-2 4.4-4.5V6.7c0-2.4-2-4.2-4.4-4.5C20 2.1 17.4 2 15.9 2zm-4.4 2.8c.9 0 1.6.8 1.6 1.7s-.7 1.6-1.6 1.6-1.7-.7-1.7-1.6.8-1.7 1.7-1.7z" fill="url(#py1)"/><path d="M24.2 10.5v3.8c0 3-2.6 5.7-5.5 5.7h-8.2c-2.4 0-4.4 2.1-4.4 4.5v8.5c0 2.4 2.1 3.9 4.4 4.5 2.8.7 5.5.8 8.2 0 1.8-.6 4.4-1.7 4.4-4.5v-3.4h-8.2v-1.1h12.6c2.6 0 3.5-1.8 4.4-4.5 1-2.8.9-5.4 0-8.9-.7-2.5-2-4.5-4.4-4.5h-3.3z" fill="url(#py2)"/></svg>,
  ts: <svg viewBox="0 0 32 32" width="100%" height="100%"><rect width="32" height="32" rx="4" fill="#3178C6"/><path d="M7 16.5h3v9h2.5v-9H16v-2H7zm12-2v11c0 .2.1.4.3.4h2.2v-4.2l3 4.2h2.8l-3.2-4.5 3-4.5h-2.6l-2.4 3.8-2.5-3.8z" fill="#fff"/></svg>,
  react: <svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="3" fill="#61DAFB"/><ellipse cx="16" cy="16" rx="13" ry="5" fill="none" stroke="#61DAFB" strokeWidth="1.2"/><ellipse cx="16" cy="16" rx="13" ry="5" fill="none" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="13" ry="5" fill="none" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(120 16 16)"/></svg>,
  pytorch: <svg viewBox="0 0 32 32" width="100%" height="100%"><path d="M16.2 2L8 10.2c-4.4 4.4-4.4 11.6 0 16s11.6 4.4 16 0c4.3-4.3 4.4-11.2.3-15.6l-2.5 2.5c3 3.3 2.8 8.4-.4 11.5-3.3 3.3-8.6 3.3-11.9 0s-3.3-8.6 0-11.9l5.6-5.6 1.2-1.2V2z" fill="#EE4C2C"/><circle cx="20.5" cy="9.5" r="2" fill="#EE4C2C"/></svg>,
  tf: <svg viewBox="0 0 32 32" width="100%" height="100%"><path d="M16 2L4 8.8v5.7l6.3-3.6v14.5l5.7 3.3V14.2l5.7 3.3V11.7L16 8.1V2z" fill="#FF6F00"/><path d="M16 2v6.1l5.7 3.6v5.8l-5.7-3.3v14.5l6.3-3.6V8.8L16 2z" fill="#FF9800"/></svg>,
  hf: <svg viewBox="0 0 32 32" width="100%" height="100%"><circle cx="16" cy="16" r="14" fill="#FFD21E"/><circle cx="11" cy="13" r="2.5" fill="#1A1A2E"/><circle cx="21" cy="13" r="2.5" fill="#1A1A2E"/><circle cx="12" cy="12.5" r=".8" fill="#fff"/><circle cx="22" cy="12.5" r=".8" fill="#fff"/><path d="M10 19c0 0 2 4 6 4s6-4 6-4" fill="none" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  openai: <svg viewBox="0 0 32 32" width="100%" height="100%"><path d="M27.2 13.8c.5-1.5.3-3.2-.5-4.6-1.3-2.2-3.8-3.3-6.3-2.9-.9-1.5-2.4-2.5-4.1-2.9-2.5-.5-5.1.5-6.5 2.6-1.7.1-3.3.9-4.3 2.3-1.5 2.1-1.5 4.9-.1 7-1.5 2.1-1.5 4.9-.1 7 .5 1.5 1.6 2.7 3 3.3.9 1.5 2.4 2.5 4.1 2.9 2.5.5 5.1-.5 6.5-2.6 1.7-.1 3.3-.9 4.3-2.3 1.5-2.1 1.5-4.9.1-7z" fill="none" stroke={C.neon} strokeWidth="1.5"/><circle cx="16" cy="16" r="4" fill={C.neon} opacity=".3"/></svg>,
  anthropic: <svg viewBox="0 0 32 32" width="100%" height="100%"><rect width="32" height="32" rx="6" fill="#1a1a2e"/><path d="M18.3 8h3.2L26 24h-3.2l-1-3.5h-5.5L15.3 24h-3.1L18.3 8zm-.5 10h3.8L19.7 12l-1.9 6zM10.5 8H7l4.5 16h3.2L10.5 8z" fill="#D4A574"/></svg>,
  node: <svg viewBox="0 0 32 32" width="100%" height="100%"><path d="M16 2.5c-.5 0-1 .1-1.4.4L4.2 8.5c-.9.5-1.4 1.4-1.4 2.4v11.2c0 1 .5 1.9 1.4 2.4l10.4 5.6c.9.5 1.9.5 2.8 0l10.4-5.6c.9-.5 1.4-1.4 1.4-2.4V10.9c0-1-.5-1.9-1.4-2.4L17.4 2.9c-.4-.3-.9-.4-1.4-.4z" fill="#339933"/></svg>,
  fastapi: <svg viewBox="0 0 32 32" width="100%" height="100%"><rect width="32" height="32" rx="6" fill="#009688"/><path d="M17.5 6L11 16h5l-1.5 10L21 16h-5L17.5 6z" fill="#fff"/></svg>,
  aws: <svg viewBox="0 0 32 32" width="100%" height="100%"><path d="M8 20c0 1.5.8 2.8 2.2 3.5l4 2c.5.2 1.1.3 1.8.3s1.3-.1 1.8-.3l4-2C23.2 22.8 24 21.5 24 20v-8c0-1.5-.8-2.8-2.2-3.5l-4-2c-1.1-.5-2.5-.5-3.6 0l-4 2C8.8 9.2 8 10.5 8 12v8z" fill="none" stroke="#FF9900" strokeWidth="1.8"/><path d="M16 16l-4-2v-4l4 2v4zm0 0l4-2v-4l-4 2v4z" fill="#FF9900" opacity=".5"/></svg>,
  docker: <svg viewBox="0 0 32 32" width="100%" height="100%"><path d="M20 13h3c.5 0 1 .2 1.3.5.7.6 1.2 1.5 1.2 2.5 0 3-2 6-5 7.5-1 .5-2.2.8-3.5.8-4 0-7.5-2-9-5.5-.5-1-.8-2.2-.8-3.5 0-.3 0-.5.1-.8H20z" fill="#2496ED"/>{[0,1,2,3,4].map(i=><rect key={i} x={8+i*2.8} y={13.5} width={2.2} height={2} rx=".3" fill="#fff" opacity=".4"/>)}{[0,1,2].map(i=><rect key={i} x={10.8+i*2.8} y={11} width={2.2} height={2} rx=".3" fill="#fff" opacity=".4"/>)}<rect x={13.6} y={8.5} width={2.2} height={2} rx=".3" fill="#fff" opacity=".4"/></svg>,
  pg: <svg viewBox="0 0 32 32" width="100%" height="100%"><ellipse cx="16" cy="10" rx="8" ry="4" fill="none" stroke="#336791" strokeWidth="1.5"/><path d="M8 10v12c0 2.2 3.6 4 8 4s8-1.8 8-4V10" fill="none" stroke="#336791" strokeWidth="1.5"/><path d="M8 16c0 2.2 3.6 4 8 4s8-1.8 8-4" fill="none" stroke="#336791" strokeWidth="1.5"/></svg>,
  git: <svg viewBox="0 0 32 32" width="100%" height="100%"><path d="M29.7 15.1L16.9 2.3c-.5-.5-1.3-.5-1.8 0l-2.7 2.7 3.4 3.4c.6-.2 1.3-.1 1.8.4.5.5.6 1.2.4 1.8l3.3 3.3c.6-.2 1.3-.1 1.8.4.7.7.7 1.8 0 2.5s-1.8.7-2.5 0c-.5-.5-.7-1.3-.4-1.9l-3-3v8c.2.1.3.2.5.3.7.7.7 1.8 0 2.5s-1.8.7-2.5 0-.7-1.8 0-2.5c.2-.2.4-.3.6-.4v-8.1c-.2-.1-.4-.2-.6-.4-.5-.5-.7-1.3-.4-2l-3.3-3.3-8.8 8.8c-.5.5-.5 1.3 0 1.8l12.8 12.8c.5.5 1.3.5 1.8 0l12.7-12.7c.5-.5.5-1.3 0-1.8z" fill="#F05032"/></svg>,
  mongo: <svg viewBox="0 0 32 32" width="100%" height="100%"><path d="M16.5 2.3s-.3 2.4-1.2 3.5c-1 1.2-1.3 2.6-1.3 4.3 0 3 1.2 5.5 3.5 7.5.3.3.6.5.9.7l.1.1c.1 1.3.2 4.5-.5 7.8 0 0 1-1.3 1.7-3.3 1.4-.6 2.5-1.5 3.4-2.7 2.2-3 2.7-6.8.8-10.2C22.3 7 19 4.4 16.5 2.3z" fill="#00ED64"/></svg>,
  kotlin: <svg viewBox="0 0 32 32" width="100%" height="100%"><defs><linearGradient id="kt2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7F52FF"/><stop offset="100%" stopColor="#E54857"/></linearGradient></defs><path d="M4 28L16 16 28 28H4z" fill="url(#kt2)"/><path d="M4 4h24L16 16 4 28V4z" fill="url(#kt2)"/></svg>,
  sql: <svg viewBox="0 0 32 32" width="100%" height="100%"><ellipse cx="16" cy="9" rx="10" ry="5" fill="none" stroke={C.amber} strokeWidth="1.5"/><path d="M6 9v14c0 2.8 4.5 5 10 5s10-2.2 10-5V9" fill="none" stroke={C.amber} strokeWidth="1.5"/><path d="M6 16c0 2.8 4.5 5 10 5s10-2.2 10-5" fill="none" stroke={C.amber} strokeWidth="1.5"/></svg>,
};

// ═══ RADAR CANVAS (Skills Background) ═══
function RadarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    let w, h;
    const resize = () => { w = c.parentElement.offsetWidth; h = c.parentElement.offsetHeight; c.width = w * dpr; c.height = h * dpr; c.style.width = w + "px"; c.style.height = h + "px"; ctx.scale(dpr, dpr); };
    resize(); window.addEventListener("resize", resize);
    let angle = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, maxR = Math.min(w, h) * 0.42;
      // Concentric rings
      for (let i = 1; i <= 4; i++) { ctx.beginPath(); ctx.arc(cx, cy, maxR * i / 4, 0, Math.PI * 2); ctx.strokeStyle = `rgba(0,229,255,${0.06})`; ctx.lineWidth = 0.5; ctx.stroke(); }
      // Cross lines
      ctx.strokeStyle = "rgba(0,229,255,0.04)"; ctx.lineWidth = 0.5;
      for (let a = 0; a < Math.PI; a += Math.PI / 6) { ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR); ctx.lineTo(cx - Math.cos(a) * maxR, cy - Math.sin(a) * maxR); ctx.stroke(); }
      // Radar sweep
      angle += 0.012;
      const grad = ctx.createConicalGradient ? null : null;
      // Sweep trail (manual arc fill)
      for (let i = 0; i < 40; i++) {
        const a2 = angle - i * 0.02;
        const alpha = (1 - i / 40) * 0.12;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, a2 - 0.02, a2); ctx.closePath();
        ctx.fillStyle = `rgba(0,229,255,${alpha})`; ctx.fill();
      }
      // Sweep line
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = `rgba(0,229,255,0.5)`; ctx.lineWidth = 1.5; ctx.stroke();
      // Center dot
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,0.8)`; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,0.15)`; ctx.fill();
      requestAnimationFrame(draw);
    };
    const id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.7 }} />;
}

// ═══ SKILL CARD with animated proficiency bar ═══
function SkillCard({ skill, color, delay, isVisible }) {
  const [hov, setHov] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const profMap = { Expert: 95, Advanced: 78, Intermediate: 60 };
  const prof = profMap[skill.level] || 50;

  useEffect(() => {
    if (isVisible) { const t = setTimeout(() => setBarWidth(prof), delay * 1000 + 300); return () => clearTimeout(t); }
  }, [isVisible, prof, delay]);

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} data-h style={{
      background: hov ? `${color}12` : C.panel, backdropFilter: "blur(16px)",
      border: `1px solid ${hov ? color + "55" : C.border}`, borderRadius: 12,
      padding: "16px 18px", cursor: "none", position: "relative", overflow: "hidden",
      transform: `${hov ? "translateY(-6px) scale(1.03)" : "translateY(0) scale(1)"}`,
      boxShadow: hov ? `0 15px 40px rgba(0,0,0,0.4), 0 0 25px ${color}20` : "0 4px 16px rgba(0,0,0,0.3)",
      transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
      opacity: isVisible ? 1 : 0,
      transitionDelay: `${delay}s`,
    }}>
      {/* Hover glow line at top */}
      <div style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: 1, background: `linear-gradient(90deg,transparent,${hov ? color : "transparent"},transparent)`, transition: "all 0.4s" }} />
      {/* Floating particles on hover */}
      {hov && [0,1,2,3,4].map(i => <div key={i} style={{
        position: "absolute", width: 3, height: 3, borderRadius: "50%", background: color,
        left: `${15 + i * 18}%`, bottom: 0, opacity: 0.6,
        animation: `float-particle ${0.8 + i * 0.2}s ease-out forwards`,
      }} />)}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 8, background: `${color}15`, border: `1px solid ${color}25`,
          transform: hov ? "rotate(10deg) scale(1.15)" : "rotate(0deg) scale(1)",
          transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
        }}>{skill.icon}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: C.text }}>{skill.name}</div>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color, letterSpacing: "0.15em", textTransform: "uppercase" }}>{skill.level}</div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color, textShadow: hov ? `0 0 10px ${color}55` : "none", transition: "all 0.3s" }}>{prof}%</div>
      </div>
      {/* Animated proficiency bar */}
      <div style={{ width: "100%", height: 4, background: "rgba(0,229,255,0.06)", borderRadius: 2, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%", borderRadius: 2, width: `${barWidth}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 10px ${color}44`,
          transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
        }} />
        {/* Scanning light on bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "30%", height: "100%",
          background: `linear-gradient(90deg, transparent, ${color}33, transparent)`,
          animation: hov ? "scan-bar 1.5s linear infinite" : "none",
        }} />
      </div>
    </div>
  );
}

// ═══ SKILL ORBIT (Enhanced with trails) ═══
function SkillOrbit({ skills, radius, speed, color, rev }) {
  const [a, setA] = useState(0), [hov, setHov] = useState(null);
  useEffect(() => { let angle = 0; const tick = () => { if (hov === null) angle += speed; setA(angle); requestAnimationFrame(tick); }; const id = requestAnimationFrame(tick); return () => cancelAnimationFrame(id); }, [speed, hov]);
  return <>
    {/* Dashed orbit ring with rotation */}
    <div style={{ position: "absolute", left: "50%", top: "50%", width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius, borderRadius: "50%", border: `1px dashed ${color}18`, animation: `spin-ring ${60 / speed}s linear infinite ${rev ? "reverse" : "normal"}` }} />
    {skills.map((s, i) => {
      const deg = (a * (rev ? -1 : 1)) + (i / skills.length) * 360, rad = deg * Math.PI / 180;
      const x = Math.cos(rad) * radius, y = Math.sin(rad) * radius, isH = hov === i;
      return <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} data-h style={{ position: "absolute", left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: `translate(-50%,-50%) scale(${isH ? 1.5 : 1})`, transition: "transform 0.35s cubic-bezier(.34,1.56,.64,1)", zIndex: isH ? 50 : 10, cursor: "none" }}>
        {/* Pulse ring on hover */}
        {isH && <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1px solid ${color}44`, animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite" }} />}
        <div style={{
          width: isH ? 56 : 44, height: isH ? 56 : 44,
          borderRadius: isH ? 14 : "50%",
          display: "flex", alignItems: "center", justifyContent: "center", padding: isH ? 12 : 10,
          background: isH ? `${color}22` : C.deep,
          border: `1.5px solid ${isH ? color : color + "33"}`,
          backdropFilter: "blur(12px)",
          boxShadow: isH ? `0 0 30px ${color}55, 0 0 60px ${color}20, inset 0 0 15px ${color}10` : "none",
          transition: "all 0.35s cubic-bezier(.34,1.56,.64,1)",
        }}>{s.icon}</div>
        {isH && <div style={{
          position: "absolute", top: "calc(100% + 12px)", left: "50%", transform: "translateX(-50%)",
          background: "rgba(2,11,24,0.95)", backdropFilter: "blur(24px)",
          border: `1px solid ${color}44`, borderRadius: 10,
          padding: "10px 18px", whiteSpace: "nowrap", textAlign: "center", zIndex: 100,
          boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 15px ${color}15`,
          animation: "tooltip-in 0.25s ease-out",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: "#fff" }}>{s.name}</div>
          <div style={{ fontSize: 9, color, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 3 }}>{s.level}</div>
          {/* Mini proficiency bar in tooltip */}
          <div style={{ width: 80, height: 2, background: `${color}22`, borderRadius: 1, margin: "6px auto 0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${{ Expert: 95, Advanced: 78, Intermediate: 60 }[s.level]}%`, background: color, borderRadius: 1 }} />
          </div>
        </div>}
      </div>;
    })}
  </>;
}

// ═══ SKILL GRID VIEW ═══
function SkillGrid() {
  const ref = useRef(null), [vis, setVis] = useState(false);
  useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);
  const categories = [
    { name: "Languages", color: C.blue, skills: [{ name: "Python", icon: I.python, level: "Expert" },{ name: "TypeScript", icon: I.ts, level: "Advanced" },{ name: "Kotlin", icon: I.kotlin, level: "Intermediate" },{ name: "SQL", icon: I.sql, level: "Advanced" }] },
    { name: "ML / AI", color: C.teal, skills: [{ name: "PyTorch", icon: I.pytorch, level: "Expert" },{ name: "TensorFlow", icon: I.tf, level: "Advanced" },{ name: "HuggingFace", icon: I.hf, level: "Expert" },{ name: "OpenAI", icon: I.openai, level: "Expert" },{ name: "LangChain", icon: I.anthropic, level: "Advanced" },{ name: "Anthropic", icon: I.anthropic, level: "Advanced" }] },
    { name: "Web & Cloud", color: C.neon, skills: [{ name: "React", icon: I.react, level: "Advanced" },{ name: "FastAPI", icon: I.fastapi, level: "Expert" },{ name: "Node.js", icon: I.node, level: "Advanced" },{ name: "AWS", icon: I.aws, level: "Advanced" },{ name: "Docker", icon: I.docker, level: "Advanced" },{ name: "Git", icon: I.git, level: "Expert" },{ name: "PostgreSQL", icon: I.pg, level: "Advanced" },{ name: "MongoDB", icon: I.mongo, level: "Intermediate" }] },
  ];
  let globalIdx = 0;
  return <div ref={ref}>
    {categories.map((cat, ci) => <div key={ci} style={{ marginBottom: 32 }}>
      {/* Category header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-20px)", transition: `all 0.6s cubic-bezier(.4,0,.2,1) ${ci * 0.15}s` }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color, boxShadow: `0 0 10px ${cat.color}55` }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: cat.color, letterSpacing: "0.1em" }}>{cat.name}</span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${cat.color}25, transparent)` }} />
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.dim }}>{cat.skills.length} SKILLS</span>
      </div>
      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 10 }}>
        {cat.skills.map((skill, si) => {
          const idx = globalIdx++;
          return <SkillCard key={si} skill={skill} color={cat.color} delay={idx * 0.06} isVisible={vis} />;
        })}
      </div>
    </div>)}
  </div>;
}

// ═══ DATA ═══
const projects = [
  { title: "CLAWBOT", sub: "AI ASSISTANT", desc: "Full-stack AI on AWS with n8n, Notion, Telegram & voice-powered call handling.", tags: ["Python","AWS","n8n","LLMs"], color: C.neon, status: "DEPLOYED" },
  { title: "MESA-LLM", sub: "GSoC 2026", desc: "Production LLM agents for agent-based modeling with structured outputs.", tags: ["Mesa","OpenAI","Anthropic"], color: C.blue, status: "ACTIVE" },
  { title: "AI CALLER", sub: "VOICE AGENT", desc: "Android call routing: STT → cloud AI → TTS with ESP32 IoT extensions.", tags: ["Kotlin","Vosk","IoT"], color: C.teal, status: "BUILDING" },
  { title: "RAG PIPELINE", sub: "RETRIEVAL AI", desc: "Vector search, semantic embeddings & LLM response generation.", tags: ["LangChain","FAISS","FastAPI"], color: C.green, status: "DEPLOYED" },
  { title: "ML TUNING", sub: "FINE-TUNING", desc: "BERT & GPT-2 fine-tuning pipeline with HuggingFace.", tags: ["PyTorch","HuggingFace"], color: C.amber, status: "COMPLETE" },
  { title: "IOT SYSTEM", sub: "SMART MONITOR", desc: "ESP32-CAM streaming with sensor data & cloud dashboard.", tags: ["ESP32","MQTT","AWS"], color: C.hot, status: "PROTOTYPE" },
];
const orbits = [
  { color: C.blue, radius: 88, speed: 0.16, skills: [{ name: "Python", icon: I.python, level: "Expert" },{ name: "TypeScript", icon: I.ts, level: "Advanced" },{ name: "Kotlin", icon: I.kotlin, level: "Intermediate" },{ name: "SQL", icon: I.sql, level: "Advanced" }] },
  { color: C.teal, radius: 152, speed: 0.08, skills: [{ name: "PyTorch", icon: I.pytorch, level: "Expert" },{ name: "TensorFlow", icon: I.tf, level: "Advanced" },{ name: "HuggingFace", icon: I.hf, level: "Expert" },{ name: "OpenAI", icon: I.openai, level: "Expert" },{ name: "LangChain", icon: I.anthropic, level: "Advanced" },{ name: "Anthropic", icon: I.anthropic, level: "Advanced" }] },
  { color: C.neon, radius: 218, speed: 0.045, skills: [{ name: "React", icon: I.react, level: "Advanced" },{ name: "FastAPI", icon: I.fastapi, level: "Expert" },{ name: "Node.js", icon: I.node, level: "Advanced" },{ name: "AWS", icon: I.aws, level: "Advanced" },{ name: "Docker", icon: I.docker, level: "Advanced" },{ name: "Git", icon: I.git, level: "Expert" },{ name: "PostgreSQL", icon: I.pg, level: "Advanced" },{ name: "MongoDB", icon: I.mongo, level: "Intermediate" }] },
];
const exps = [
  { title: "ML ENGINEER", co: "ValersAI", date: "JUN 2024 – FEB 2026", color: C.neon, items: ["Production ML models & LLM apps","RAG pipelines & agentic AI","OpenAI / Anthropic / Gemini integration"], stack: ["Python","PyTorch","FastAPI","AWS"] },
  { title: "ML INTERN", co: "ValersAI", date: "FEB – JUN 2024", color: C.blue, items: ["BERT & GPT-2 fine-tuning","Data pipelines & feature engineering"], stack: ["Python","TensorFlow","Flask"] },
  { title: "GSoC 2026", co: "Mesa-LLM", date: "MAR 2026 – PRESENT", color: C.teal, items: ["Stabilizing Mesa-LLM for production","Structured outputs & multi-provider"], stack: ["Python","Mesa","LLMs"] },
  { title: "BSc CSDA", co: "IIT Patna", date: "2023 – PRESENT", color: C.green, items: ["CS & Data Analytics","ML, DSA, Algorithms"], stack: ["Academics"] },
];

// ═══ LOADER ═══
function Loader({ onDone }) {
  const [p, setP] = useState(0), [out, setOut] = useState(false);
  useEffect(() => { let v = 0; const i = setInterval(() => { v += Math.random() * 4 + 2; if (v >= 100) { v = 100; clearInterval(i); setTimeout(() => setOut(true), 500); setTimeout(onDone, 1300); } setP(Math.min(v, 100)); }, 40); return () => clearInterval(i); }, []);
  return <div style={{ position: "fixed", inset: 0, zIndex: 100000, background: C.abyss, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: out ? "translateY(-100%)" : "none", transition: "transform 0.8s cubic-bezier(.76,0,.24,1)" }}>
    {/* Sonar ping animation */}
    <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: `1px solid ${C.neon}11`, animation: "sonar 3s ease-out infinite" }} />
    <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: `1px solid ${C.neon}11`, animation: "sonar 3s ease-out infinite 1s" }} />
    {/* Boot sequence */}
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.dim, marginBottom: 24, textAlign: "left", width: 300 }}>
      {[{ t: 8, m: "SONAR_INIT: Scanning deep network..." },{ t: 25, m: "NEURAL_LINK: Establishing connections..." },{ t: 50, m: "DATA_STREAM: Loading ML pipelines..." },{ t: 75, m: "RENDER_ENGINE: Assembling interface..." }].map((s, i) => <div key={i} style={{ opacity: p > s.t ? 1 : 0, transition: "opacity 0.3s", marginBottom: 3 }}>[<span style={{ color: p > s.t + 12 ? C.green : C.neon }}>{p > s.t + 12 ? "OK" : ".."}</span>] {s.m}</div>)}
    </div>
    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(24px,5vw,48px)", fontWeight: 800, color: C.text, letterSpacing: "0.15em", textShadow: `0 0 30px ${C.glow}0.3)` }}>
      ADARSH<span style={{ color: C.neon }}> KUMAR</span>
    </div>
    <div style={{ marginTop: 20, width: 240, height: 3, background: C.deep, borderRadius: 2, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <div style={{ height: "100%", width: `${p}%`, background: `linear-gradient(90deg,${C.blue},${C.neon})`, transition: "width 0.1s", boxShadow: `0 0 15px ${C.neon}` }} />
    </div>
    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: C.neon, marginTop: 10, textShadow: `0 0 10px ${C.glow}0.4)` }}>{Math.round(p)}%</div>
  </div>;
}

// ═══ MAIN APP ═══
export default function App() {
  const [loaded, setLoaded] = useState(false), [show, setShow] = useState(false);
  const mouse = useRef({ x: 0, y: 0 }), [scrolled, setScrolled] = useState(false), [activeNav, setActiveNav] = useState("");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" }), [fErr, setFErr] = useState({}), [fStat, setFStat] = useState("idle");
  const [skillView, setSkillView] = useState("orbit");

  useEffect(() => { if (loaded) setTimeout(() => setShow(true), 200); }, [loaded]);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", f); return () => window.removeEventListener("scroll", f); }, []);
  useEffect(() => { if (!show) return; const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActiveNav(e.target.id); }), { threshold: 0.25, rootMargin: "-80px 0px -40% 0px" }); document.querySelectorAll("section[id]").forEach(s => o.observe(s)); return () => o.disconnect(); }, [show]);
  const submit = e => { e.preventDefault(); const er = {}; if (form.name.length < 2) er.name = 1; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 1; if (form.subject.length < 3) er.subject = 1; if (form.message.length < 10) er.message = 1; setFErr(er); if (Object.keys(er).length) return; setFStat("sending"); setTimeout(() => { setFStat("sent"); setTimeout(() => { setFStat("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }, 4000); }, 1500); };

  const pad = { padding: "clamp(80px,12vw,140px) clamp(16px,4vw,64px)", maxWidth: 1200, margin: "0 auto", position: "relative" };
  const mono = "'JetBrains Mono',monospace";
  const navs = ["about","skills","projects","experience","contact"];

  return <div style={{ background: C.abyss, color: C.text, minHeight: "100vh", cursor: "none", fontFamily: "'General Sans',sans-serif", overflowX: "hidden" }}>
    <style>{`
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes sonar{0%{transform:scale(0.5);opacity:0.6}100%{transform:scale(2.5);opacity:0}}
      @keyframes gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes bounce{0%,100%{transform:translateY(0);opacity:.8}50%{transform:translateY(8px);opacity:.3}}
      @keyframes scan-h{0%{left:-20%}100%{left:100%}}
      @keyframes pulse-core{0%,100%{box-shadow:0 0 20px ${C.glow}0.3)}50%{box-shadow:0 0 40px ${C.glow}0.6),0 0 80px ${C.glow}0.2)}}
      @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
      @keyframes tooltip-in{from{opacity:0;transform:translateX(-50%) translateY(6px) scale(0.95)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
      @keyframes spin-ring{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes float-particle{0%{transform:translateY(0);opacity:0.6}100%{transform:translateY(-30px);opacity:0}}
      @keyframes scan-bar{0%{left:-30%}100%{left:100%}}
      html{scroll-behavior:smooth}::selection{background:${C.neon}33;color:#fff}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:${C.abyss}}::-webkit-scrollbar-thumb{background:${C.neon}33;border-radius:2px}
      *{box-sizing:border-box;margin:0;padding:0}
      input:focus,textarea:focus{outline:none;border-color:${C.neon} !important;box-shadow:0 0 0 2px ${C.neon}15,0 0 20px ${C.neon}10 !important}
    `}</style>

    {!loaded && <Loader onDone={() => setLoaded(true)} />}
    <Cursor mouse={mouse} />

    {/* NAV */}
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: scrolled ? "8px 24px" : "16px 24px", background: scrolled ? "rgba(2,11,24,0.9)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? `1px solid ${C.border}` : "none", transition: "all 0.5s", opacity: show ? 1 : 0, transform: show ? "none" : "translateY(-100%)", transitionDelay: "0.3s" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="#" data-h style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, textDecoration: "none", color: C.neon, cursor: "none", textShadow: `0 0 15px ${C.glow}0.3)` }}>AK</a>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {navs.map(n => <a key={n} href={`#${n}`} data-h style={{ textDecoration: "none", fontSize: 10, fontFamily: mono, color: activeNav === n ? C.neon : C.dim, transition: "color 0.3s", cursor: "none", letterSpacing: "0.15em", textTransform: "uppercase", textShadow: activeNav === n ? `0 0 10px ${C.glow}0.3)` : "none" }}>{n}</a>)}
          <Mag href="#contact" variant="primary" style={{ padding: "7px 16px", fontSize: 10 }}>CONNECT</Mag>
        </div>
      </div>
    </nav>

    {/* HERO */}
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <SonarField mouse={mouse} />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, background: `radial-gradient(ellipse at 50% 60%,transparent 20%,${C.abyss} 70%)`, pointerEvents: "none" }} />
      {/* Grid lines overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, opacity: 0.03, backgroundImage: `linear-gradient(${C.neon}22 1px,transparent 1px),linear-gradient(90deg,${C.neon}22 1px,transparent 1px)`, backgroundSize: "80px 80px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px", maxWidth: 900, opacity: show ? 1 : 0, transform: show ? "none" : "translateY(40px)", transition: "all 1s cubic-bezier(.4,0,.2,1) 0.5s" }}>
        {/* Signal indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
          <span style={{ fontFamily: mono, fontSize: 10, color: C.green, letterSpacing: "0.2em" }}>SIGNAL ACTIVE — BOKARO, INDIA</span>
        </div>

        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(48px,10vw,120px)", lineHeight: 0.9, marginBottom: 6 }}>
          <span style={{ display: "block", color: C.text, letterSpacing: "-0.01em" }}>ADARSH</span>
          <span style={{ display: "block", color: C.neon, textShadow: `0 0 40px ${C.glow}0.4),0 0 80px ${C.glow}0.15)`, letterSpacing: "0.05em" }}>KUMAR</span>
        </h1>
        <div style={{ marginTop: 16, marginBottom: 32 }}><Typed /></div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          <Mag href="#projects" variant="primary">EXPLORE WORK</Mag>
          <Mag href="#contact" variant="outline">OPEN CHANNEL</Mag>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {[["●","Available","green"],["◆","IIT Patna","blue"],["▲","GSoC 2026","teal"]].map(([sym,txt,col]) => <span key={txt} style={{ fontFamily: mono, fontSize: 10, color: C[col] || C.dim, padding: "5px 14px", borderRadius: 6, border: `1px solid ${(C[col] || C.dim) + "22"}`, background: `${(C[col] || C.dim)}08` }}>{sym} {txt}</span>)}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 10, opacity: show ? 1 : 0, transition: "opacity 1s 1.8s" }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.dim + "55", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6, textAlign: "center" }}>DIVE DEEPER</div>
        <div style={{ animation: "bounce 2s ease-in-out infinite", fontSize: 14, color: C.neon + "44", textAlign: "center" }}>▽</div>
      </div>
    </section>

    {/* ABOUT */}
    <section id="about"><div style={pad}><div style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}>
      <SR style={{ flex: "1 1 370px" }}>
        <Panel glow style={{ padding: 0 }}>
          <div style={{ background: C.deep, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.hot }} /><div style={{ width: 8, height: 8, borderRadius: "50%", background: C.amber }} /><div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
            <span style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginLeft: 8 }}>identity.sys</span>
            <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: 9, color: C.neon + "55" }}>■ CLASSIFIED</span>
          </div>
          <div style={{ padding: 20, fontFamily: mono, fontSize: 11, lineHeight: 2.2, color: C.dim }}>
            <div><span style={{ color: C.green }}>→</span> cat /home/adarsh/profile.json</div>
            <div style={{ color: C.text }}>{"{"}</div>
            {[["name","Adarsh Kumar",C.amber],["class","ML Engineer",C.amber],["base","IIT Patna",C.amber],["xp","2+ years",C.neon],["stack",'["LLMs","RAG","Agents","IoT"]',C.electric],["status","GSoC 2026 ✓",C.green]].map(([k,v,c]) => <div key={k}>&nbsp;&nbsp;<span style={{ color: C.electric }}>"{k}"</span>: <span style={{ color: c }}>{v.startsWith("[") ? v : `"${v}"`}</span>,</div>)}
            <div style={{ color: C.text }}>{"}"}</div>
          </div>
          {/* Scan line effect */}
          <div style={{ position: "absolute", top: 0, left: "-20%", width: "40%", height: "100%", background: `linear-gradient(90deg,transparent,${C.neon}05,transparent)`, animation: "scan-h 4s linear infinite", pointerEvents: "none" }} />
        </Panel>
      </SR>
      <div style={{ flex: "1 1 400px" }}>
        <SR><p style={{ fontFamily: mono, color: C.neon, fontSize: 11, letterSpacing: "0.2em", marginBottom: 10 }}>{"// ABOUT"}</p>
          <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontFamily: "'Syne',sans-serif", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>Crafting Intelligence<br/><span style={{ color: C.neon, textShadow: `0 0 20px ${C.glow}0.3)` }}>from the Deep</span></h2>
        </SR>
        {["From fine-tuning transformers to architecting production RAG on AWS — I build ML that ships. Two years at ValersAI taught me AI isn't about papers, it's about reliability under pressure.","Currently a GSoC 2026 contributor stabilizing Mesa-LLM, and building Clawbot — a voice AI assistant with IoT extensions. Always diving deeper."].map((t,i) => <SR key={i} delay={0.12*(i+1)}><p style={{ color: C.dim, lineHeight: 1.8, fontSize: 14, marginBottom: 12 }}>{t}</p></SR>)}
        <SR delay={0.4}><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {[{e:2,s:"+",l:"Years"},{e:15,s:"+",l:"Projects"},{e:0,l:"GSoC 2026"},{e:0,l:"IIT Patna"}].map((c,i) => <Panel key={i} style={{ padding: 14, flex: 1, minWidth: 100 }}><Count end={c.e} suf={c.s} label={c.l} /></Panel>)}
        </div></SR>
      </div>
    </div></div></section>

    {/* SKILLS */}
    <section id="skills" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: `${C.neon}04`, filter: "blur(120px)", pointerEvents: "none" }} />
      <div style={pad}>
        <SR style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: mono, color: C.neon, fontSize: 11, letterSpacing: "0.2em", marginBottom: 8 }}>{"// TECH_SONAR"}</p>
          <h2 style={{ fontSize: "clamp(30px,5vw,50px)", fontFamily: "'Syne',sans-serif", fontWeight: 800, color: C.neon, textShadow: `0 0 30px ${C.glow}0.2)` }}>Technologies I Command</h2>
          {/* View Toggle */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {["orbit", "grid"].map(v => <button key={v} data-h onClick={() => setSkillView(v)} style={{
              fontFamily: mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "6px 18px", borderRadius: 6, cursor: "none", border: `1px solid ${skillView === v ? C.neon : C.border}`,
              background: skillView === v ? `${C.neon}15` : "transparent", color: skillView === v ? C.neon : C.dim,
              transition: "all 0.3s", boxShadow: skillView === v ? `0 0 15px ${C.glow}0.15)` : "none",
            }}>{v === "orbit" ? "◎ ORBITAL" : "▦ GRID"}</button>)}
          </div>
        </SR>

        {/* ORBITAL VIEW */}
        {skillView === "orbit" && <SR><div style={{ position: "relative", width: "100%", height: 500, margin: "0 auto" }}>
          <RadarCanvas />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 44, height: 44, marginLeft: -22, marginTop: -22, borderRadius: "50%", background: C.neon, animation: "pulse-core 3s ease-in-out infinite", zIndex: 20 }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: "50%", background: "#fff", zIndex: 21 }} />
          {[{r:88,l:"LANG",c:C.blue},{r:152,l:"ML/AI",c:C.teal},{r:218,l:"INFRA",c:C.neon}].map((o,i) => <div key={i} style={{ position: "absolute", left: "50%", top: `calc(50% - ${o.r}px - 14px)`, transform: "translateX(-50%)", fontFamily: mono, fontSize: 8, color: o.c, letterSpacing: "0.25em", opacity: 0.5, zIndex: 5 }}>{o.l}</div>)}
          {orbits.map((o,i) => <SkillOrbit key={i} {...o} rev={i%2===1} />)}
          <p style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", fontFamily: mono, fontSize: 9, color: C.dim + "66" }}>hover nodes · orbits auto-rotate · click to pause</p>
        </div></SR>}

        {/* GRID VIEW with animated cards */}
        {skillView === "grid" && <SR>
          <SkillGrid />
        </SR>}
      </div>
    </section>

    {/* PROJECTS */}
    <section id="projects"><div style={pad}>
      <SR style={{ textAlign: "center", marginBottom: 40 }}>
        <p style={{ fontFamily: mono, color: C.neon, fontSize: 11, letterSpacing: "0.2em", marginBottom: 8 }}>{"// DEPLOYMENTS"}</p>
        <h2 style={{ fontSize: "clamp(30px,5vw,50px)", fontFamily: "'Syne',sans-serif", fontWeight: 800, color: C.neon, textShadow: `0 0 30px ${C.glow}0.2)` }}>Mission Log</h2>
      </SR>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 16 }}>
        {projects.map((p,i) => <SR key={i} delay={i*0.08}><Panel glow style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div><span style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: "0.2em" }}>SYS_{String(i+1).padStart(2,"0")}</span><div style={{ fontSize: 10, color: p.color, fontFamily: mono, letterSpacing: "0.1em", marginTop: 2 }}>{p.sub}</div></div>
            <span style={{ fontFamily: mono, fontSize: 9, padding: "3px 8px", borderRadius: 4, border: `1px solid ${p.color}33`, color: p.color, background: `${p.color}0a` }}>{p.status}</span>
          </div>
          <div style={{ padding: "12px 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: 20, fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 6 }}>{p.title}</h3>
            <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.7, flex: 1, marginBottom: 14 }}>{p.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {p.tags.map((t,j) => <span key={j} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontFamily: mono, border: `1px solid ${p.color}20`, color: p.color, background: `${p.color}08` }}>{t}</span>)}
            </div>
          </div>
          <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${p.color}33,transparent)` }} />
        </Panel></SR>)}
      </div>
    </div></section>

    {/* EXPERIENCE */}
    <section id="experience"><div style={pad}>
      <SR style={{ textAlign: "center", marginBottom: 40 }}>
        <p style={{ fontFamily: mono, color: C.neon, fontSize: 11, letterSpacing: "0.2em", marginBottom: 8 }}>{"// VOYAGE_LOG"}</p>
        <h2 style={{ fontSize: "clamp(30px,5vw,50px)", fontFamily: "'Syne',sans-serif", fontWeight: 800, color: C.neon, textShadow: `0 0 30px ${C.glow}0.2)` }}>The Journey</h2>
      </SR>
      <div style={{ position: "relative", maxWidth: 660, margin: "0 auto" }}>
        <div style={{ position: "absolute", left: 18, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom,${C.neon},${C.blue},${C.teal})`, opacity: 0.6 }} />
        {exps.map((e,i) => <SR key={i} delay={i*0.1}><div style={{ position: "relative", paddingLeft: 48, marginBottom: 24 }}>
          <div style={{ position: "absolute", left: 9, top: 6, width: 20, height: 20, borderRadius: "50%", background: C.abyss, border: `2px solid ${e.color}`, boxShadow: `0 0 12px ${e.color}44`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} /></div>
          <Panel style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
              <div><h3 style={{ fontSize: 16, fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{e.title}</h3><span style={{ fontSize: 11, color: e.color, fontFamily: mono }}>{e.co}</span></div>
              <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>{e.date}</span>
            </div>
            {e.items.map((item,j) => <p key={j} style={{ fontSize: 12, color: C.dim, lineHeight: 1.7, display: "flex", gap: 6 }}><span style={{ color: e.color, fontSize: 8, marginTop: 4 }}>▸</span>{item}</p>)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              {e.stack.map((s,j) => <span key={j} style={{ padding: "2px 7px", borderRadius: 3, fontSize: 9, fontFamily: mono, background: `${e.color}0a`, border: `1px solid ${e.color}15`, color: e.color }}>{s}</span>)}
            </div>
          </Panel>
        </div></SR>)}
      </div>
    </div></section>

    {/* CONTACT */}
    <section id="contact"><div style={{ ...pad, display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}>
      <div style={{ flex: "1 1 340px" }}>
        <SR><p style={{ fontFamily: mono, color: C.neon, fontSize: 11, letterSpacing: "0.2em", marginBottom: 8 }}>{"// OPEN_CHANNEL"}</p>
          <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontFamily: "'Syne',sans-serif", fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>Let's Build<br/><span style={{ color: C.neon, textShadow: `0 0 20px ${C.glow}0.3)` }}>Something Deep</span></h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[{l:"SIGNAL",v:"adarsh23072005@gmail.com",h:"mailto:adarsh23072005@gmail.com"},{l:"FREQ",v:"+91 8797272375"},{l:"COORDS",v:"Bokaro, Jharkhand"}].map((c,i) => <div key={i}><span style={{ fontSize: 9, fontFamily: mono, color: C.neon, letterSpacing: "0.2em" }}>{c.l}</span>{c.h ? <a href={c.h} data-h style={{ display: "block", fontSize: 16, fontWeight: 500, color: C.text, textDecoration: "none", cursor: "none", marginTop: 2 }}>{c.v}</a> : <p style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>{c.v}</p>}</div>)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {[{n:"GitHub",u:"https://github.com/adarshkumar23",i:"⟨/⟩"},{n:"LinkedIn",u:"https://linkedin.com/in/adarshkumar2375",i:"in"},{n:"Email",u:"mailto:adarsh23072005@gmail.com",i:"✉"}].map(s => <Mag key={s.n} href={s.u} variant="ghost" style={{ width: 40, height: 40, borderRadius: 8, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{s.i}</Mag>)}
          </div>
        </SR>
      </div>
      <SR delay={0.15} style={{ flex: "1 1 380px" }}>
        <Panel glow style={{ padding: 0 }}>
          <div style={{ background: C.deep, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${C.border}` }}>
            {[C.hot,C.amber,C.green].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
            <span style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginLeft: 8 }}>transmit.sh</span>
          </div>
          {fStat === "sent" && <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(2,11,24,0.92)", backdropFilter: "blur(20px)", borderRadius: 12 }}><div style={{ fontSize: 40, marginBottom: 10, color: C.green }}>✓</div><h3 style={{ fontSize: 18, fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>TRANSMISSION SENT</h3><p style={{ color: C.dim, marginTop: 4, fontFamily: mono, fontSize: 11 }}>Response incoming.</p></div>}
          <form onSubmit={submit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, opacity: fStat === "sent" ? 0 : 1 }}>
            {["name","email","subject","message"].map(f => <div key={f}><label style={{ fontSize: 9, fontFamily: mono, color: C.dim, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 3 }}>{f}</label>
              {f === "message" ? <textarea value={form[f]} onChange={e => setForm({...form,[f]:e.target.value})} rows={3} style={{ width: "100%", background: C.abyss, color: C.text, border: `1px solid ${fErr[f] ? C.hot : C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "'General Sans',sans-serif", resize: "none", transition: "all 0.3s" }} placeholder="Your message..." />
                : <input type={f==="email"?"email":"text"} value={form[f]} onChange={e => setForm({...form,[f]:e.target.value})} style={{ width: "100%", background: C.abyss, color: C.text, border: `1px solid ${fErr[f] ? C.hot : C.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "'General Sans',sans-serif", transition: "all 0.3s" }} placeholder={f==="name"?"Your name":f==="email"?"your@email.com":"Subject"} />}
              {fErr[f] && <span style={{ fontSize: 9, color: C.hot, fontFamily: mono }}>REQUIRED</span>}</div>)}
            <button type="submit" data-h disabled={fStat==="sending"} style={{ marginTop: 4, padding: "12px 0", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "none", background: `linear-gradient(135deg,${C.neon},${C.blue})`, color: C.abyss, border: "none", fontFamily: mono, letterSpacing: "0.1em", boxShadow: `0 0 20px ${C.glow}0.2)`, opacity: fStat==="sending" ? 0.6 : 1 }}>
              {fStat==="sending" ? "◌ TRANSMITTING..." : "▶ TRANSMIT"}
            </button>
          </form>
        </Panel>
      </SR>
    </div></section>

    {/* FOOTER */}
    <footer style={{ position: "relative", padding: "40px 24px 18px", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,${C.neon}33,${C.blue}33,${C.neon}33)`, backgroundSize: "200% 100%", animation: "gradient 6s linear infinite" }} />
      <p style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>Engineered by <span style={{ color: C.neon, textShadow: `0 0 10px ${C.glow}0.3)` }}>Adarsh Kumar</span></p>
      <p style={{ fontFamily: mono, fontSize: 9, color: C.ghost, marginTop: 6 }}>React · Three.js · ☕ · © 2026</p>
    </footer>
  </div>;
}
