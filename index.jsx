import { useState, useEffect } from "react";

const ADMIN_EMAIL = "gabtonguno@email.com";
const ADMIN_PASSWORD = "admingab67";
const STORAGE_KEY = "capstone_tracker_data_v2";

const GROUPS_INIT = [
  { id: 1, name: "BEACONET", members: "Tong & Padua" },
  { id: 2, name: "DYNAMIC DOORS", members: "Alloush & Antonio" },
  { id: 3, name: "PAULICY", members: "Rapanut & Tacus" },
  { id: 4, name: "OSCILLOUNGE", members: "Lasam & Ubina" },
  { id: 5, name: "PROGNOSIS APP", members: "Taeza" },
  { id: 6, name: "OCCULUS", members: "Garma & Lauricio" },
  { id: 7, name: "PAULIMENTOR", members: "Martinez & Cauan" },
  { id: 8, name: "GATE", members: "Jacinto & Macadangdang" },
];

function getStatus(p) {
  if (p === 0) return "Not Started";
  if (p < 25) return "Planning";
  if (p < 50) return "In Progress";
  if (p < 75) return "Advanced";
  if (p < 100) return "Near Complete";
  return "Completed";
}

function getStatusColor(p) {
  if (p === 0) return "#4a5e7a";
  if (p < 25) return "#e8a020";
  if (p < 50) return "#4e8fdb";
  if (p < 75) return "#9b7de8";
  if (p < 100) return "#2eb87e";
  return "#d4af37";
}

function getBarColor(p) {
  if (p === 100) return "#d4af37";
  if (p >= 75) return "#2eb87e";
  if (p >= 50) return "#9b7de8";
  if (p >= 25) return "#4e8fdb";
  if (p > 0) return "#e8a020";
  return "#1a2d4e";
}

const defaultState = () => ({
  groups: GROUPS_INIT.map(g => ({ ...g, progress: 0, comments: [] })),
});

export default function App() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [newComments, setNewComments] = useState({});

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);

    const load = async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          const merged = defaultState();
          merged.groups = merged.groups.map((g) => {
            const saved = parsed.groups?.find((sg) => sg.id === g.id);
            return saved ? { ...g, progress: saved.progress ?? 0, comments: saved.comments ?? [] } : g;
          });
          setData(merged);
        } else {
          setData(defaultState());
        }
      } catch {
        setData(defaultState());
      }
      setLoaded(true);
    };
    load();
  }, []);

  const persist = async (newData) => {
    setSaving(true);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(newData));
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1800);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const login = () => {
    if (loginEmail === ADMIN_EMAIL && loginPass === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError("");
      setLoginEmail("");
      setLoginPass("");
    } else {
      setLoginError("Incorrect email or password.");
    }
  };

  const updateProgress = async (id, val) => {
    const p = parseInt(val, 10);
    const updated = {
      ...data,
      groups: data.groups.map((g) => (g.id === id ? { ...g, progress: p } : g)),
    };
    setData(updated);
    await persist(updated);
  };

  const addComment = async (id) => {
    const text = (newComments[id] || "").trim();
    if (!text) return;
    const comment = {
      id: Date.now(),
      text,
      time: new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }),
    };
    const updated = {
      ...data,
      groups: data.groups.map((g) =>
        g.id === id ? { ...g, comments: [...g.comments, comment] } : g
      ),
    };
    setData(updated);
    setNewComments((prev) => ({ ...prev, [id]: "" }));
    await persist(updated);
  };

  const deleteComment = async (groupId, commentId) => {
    const updated = {
      ...data,
      groups: data.groups.map((g) =>
        g.id === groupId ? { ...g, comments: g.comments.filter((c) => c.id !== commentId) } : g
      ),
    };
    setData(updated);
    await persist(updated);
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: "#060e1c", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "2px solid #c9a84c", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#c9a84c", fontFamily: "Georgia, serif", fontSize: 14, letterSpacing: "0.1em" }}>Loading tracker...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const avgProgress = Math.round(data.groups.reduce((s, g) => s + g.progress, 0) / data.groups.length);
  const completed = data.groups.filter((g) => g.progress === 100).length;
  const inProgress = data.groups.filter((g) => g.progress > 0 && g.progress < 100).length;
  const notStarted = data.groups.filter((g) => g.progress === 0).length;

  return (
    <div style={{ minHeight: "100vh", background: "#060e1c", fontFamily: "'Inter', system-ui, sans-serif", color: "#ddd6c4", position: "relative" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; background: #1a2d4e; border-radius: 2px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #c9a84c; border: 2px solid #07101f; cursor: pointer; transition: transform 0.15s; }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type=range]::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #c9a84c; border: 2px solid #07101f; cursor: pointer; }
        .group-card { transition: border-color 0.25s, transform 0.2s; }
        .group-card:hover { border-color: #2e4470 !important; }
        .notes-btn:hover { border-color: #2e4470 !important; background: #0d1e38 !important; }
        .del-btn:hover { color: #e05c5c !important; }
        .admin-btn:hover { opacity: 0.88; }
        textarea:focus, input:focus { outline: 1px solid #c9a84c44 !important; }
      `}</style>

      {/* Login overlay */}
      {showLogin && (
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(4, 9, 20, 0.97)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, minHeight: "100vh" }}
          onClick={() => { setShowLogin(false); setLoginError(""); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#0b1a30", border: "1px solid #2a3f6b", borderRadius: 14, padding: "44px 48px", width: "100%", maxWidth: 420, animation: "fadeIn 0.25s ease" }}
          >
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ width: 48, height: 48, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#e8dfc8", marginBottom: 6 }}>Administrator Access</div>
              <div style={{ fontSize: 13, color: "#4a5e7a", letterSpacing: "0.03em" }}>Restricted — Authorized personnel only</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#5a6e8a", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: "100%", background: "#060e1c", border: "1px solid #1e2f4d", borderRadius: 7, padding: "11px 14px", color: "#e2d9c8", fontSize: 14, boxSizing: "border-box" }}
                placeholder="your@email.com"
              />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 11, color: "#5a6e8a", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Password</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                style={{ width: "100%", background: "#060e1c", border: "1px solid #1e2f4d", borderRadius: 7, padding: "11px 14px", color: "#e2d9c8", fontSize: 14, boxSizing: "border-box" }}
                placeholder="••••••••"
              />
            </div>
            {loginError && (
              <div style={{ color: "#e05c5c", fontSize: 13, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {loginError}
              </div>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button className="admin-btn" onClick={login} style={{ flex: 1, background: "#c9a84c", border: "none", borderRadius: 7, padding: "12px", color: "#060e1c", fontWeight: 600, fontSize: 14, cursor: "pointer", letterSpacing: "0.03em" }}>
                Sign In
              </button>
              <button onClick={() => { setShowLogin(false); setLoginError(""); }} style={{ flex: 1, background: "transparent", border: "1px solid #1e2f4d", borderRadius: 7, padding: "12px", color: "#5a6e8a", fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: "#2a3f5a", marginTop: 20, marginBottom: 0 }}>Session ends when you sign out or close the tab</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "#030912", borderBottom: "1px solid #131f33" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto", padding: "0 36px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 78 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 40, height: 40, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 3, fontWeight: 500 }}>Research & Development</div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#ece4d0", margin: 0, letterSpacing: "0.01em" }}>
                Capstone Progress Tracker
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {saveFlash && (
              <span style={{ fontSize: 12, color: "#2eb87e", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Saved
              </span>
            )}
            {saving && !saveFlash && <span style={{ fontSize: 12, color: "#c9a84c" }}>Saving...</span>}
            {isAdmin && (
              <span style={{ fontSize: 11, background: "rgba(201,168,76,0.12)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.28)", borderRadius: 4, padding: "4px 11px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Admin
              </span>
            )}
            {isAdmin ? (
              <button onClick={() => setIsAdmin(false)} style={{ background: "transparent", border: "1px solid #1e2f4d", borderRadius: 6, padding: "8px 18px", color: "#5a6e8a", fontSize: 13, cursor: "pointer" }}>
                Sign Out
              </button>
            ) : (
              <button className="admin-btn" onClick={() => setShowLogin(true)} style={{ background: "#c9a84c", border: "none", borderRadius: 7, padding: "9px 22px", color: "#060e1c", fontWeight: 600, fontSize: 13, cursor: "pointer", letterSpacing: "0.03em" }}>
                Admin Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div style={{ background: "#08111f", borderBottom: "1px solid #131f33" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto", padding: "16px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div style={{ fontSize: 13, color: "#3a4e68" }}>
            Academic Year 2024–2025 &nbsp;·&nbsp; {data.groups.length} Research Groups
          </div>
          <div style={{ display: "flex", gap: 36 }}>
            {[
              { label: "Avg Progress", value: `${avgProgress}%`, accent: true },
              { label: "Completed", value: completed },
              { label: "In Progress", value: inProgress },
              { label: "Not Started", value: notStarted },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: s.accent ? "#c9a84c" : "#7a8aa8", fontFamily: s.accent ? "'Playfair Display', serif" : "inherit" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: "#3a4e68", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <main style={{ maxWidth: 1260, margin: "0 auto", padding: "36px 36px 60px" }}>

        {/* Cohort progress bar */}
        <div style={{ background: "#0b1929", border: "1px solid #131f33", borderRadius: 10, padding: "22px 28px", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3a4e68" }}>Overall Cohort Progress</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#c9a84c" }}>{avgProgress}%</span>
          </div>
          <div style={{ height: 7, background: "#0e1e33", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${avgProgress}%`, background: "linear-gradient(90deg, #a07828 0%, #c9a84c 60%, #e8d080 100%)", borderRadius: 4, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ display: "flex", marginTop: 10, gap: 0 }}>
            {data.groups.map((g) => (
              <div key={g.id} title={`${g.name}: ${g.progress}%`} style={{ flex: 1, height: 3, background: getBarColor(g.progress), borderRight: "2px solid #0b1929", transition: "background 0.4s" }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#2a3e57", marginTop: 6 }}>Each segment represents one group</div>
        </div>

        {isAdmin && (
          <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.18)", borderRadius: 8, padding: "12px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: 13, color: "#9a8848" }}>You are in <strong style={{ color: "#c9a84c" }}>Admin Mode</strong>. Use the sliders to update progress and add advisor notes. All changes save automatically.</span>
          </div>
        )}

        {/* Group grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 18 }}>
          {data.groups.map((group) => (
            <div
              key={group.id}
              className="group-card"
              style={{ background: "#0b1929", border: "1px solid #131f33", borderRadius: 12, overflow: "hidden" }}
            >
              {/* Top accent bar */}
              <div style={{ height: 3, background: getBarColor(group.progress) }} />

              <div style={{ padding: "22px 24px 18px" }}>
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: "#0e1e33", border: "1px solid #1e3050", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#4a5e7a", letterSpacing: "0.05em" }}>
                      {String(group.id).padStart(2, "0")}
                    </div>
                    <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#3a4e68", textTransform: "uppercase" }}>Group</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 12px", borderRadius: 20, border: `1px solid ${getStatusColor(group.progress)}3a`, color: getStatusColor(group.progress), letterSpacing: "0.05em" }}>
                    {getStatus(group.progress)}
                  </span>
                </div>

                {/* Name & members */}
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: "#ece4d0", margin: "0 0 4px", letterSpacing: "0.01em" }}>
                  {group.name}
                </h3>
                <p style={{ fontSize: 13, color: "#4a5e7a", margin: "0 0 22px", letterSpacing: "0.02em" }}>
                  {group.members}
                </p>

                {/* Progress section */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: "#3a4e68", letterSpacing: "0.12em", textTransform: "uppercase" }}>Research Progress</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: getBarColor(group.progress), fontFamily: "'Playfair Display', serif" }}>
                      {group.progress}%
                    </span>
                  </div>

                  {/* Track */}
                  <div style={{ height: 6, background: "#0e1e33", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ height: "100%", width: `${group.progress}%`, background: getBarColor(group.progress), borderRadius: 3, transition: "width 0.35s ease" }} />
                  </div>

                  {isAdmin && (
                    <div style={{ marginBottom: 4 }}>
                      <input
                        type="range" min="0" max="100" step="1"
                        value={group.progress}
                        onChange={(e) => updateProgress(group.id, e.target.value)}
                        style={{ width: "100%", accentColor: "#c9a84c" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#2a3e57", marginTop: 2 }}>
                        <span>0%</span><span>50%</span><span>100%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes toggle */}
                <button
                  className="notes-btn"
                  onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                  style={{ marginTop: 16, width: "100%", background: "transparent", border: "1px solid #131f33", borderRadius: 7, padding: "9px 16px", color: "#4a5e7a", fontSize: 12, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", letterSpacing: "0.04em", transition: "border-color 0.2s, background 0.2s" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {group.comments.length} Advisor Note{group.comments.length !== 1 ? "s" : ""}
                  </span>
                  <span style={{ fontSize: 10, color: "#2a3e57" }}>{expandedGroup === group.id ? "▲ Hide" : "▼ View"}</span>
                </button>
              </div>

              {/* Expanded notes */}
              {expandedGroup === group.id && (
                <div style={{ borderTop: "1px solid #131f33", padding: "18px 24px 22px", background: "#08111f" }}>
                  {group.comments.length === 0 && (
                    <p style={{ fontSize: 13, color: "#2a3e57", fontStyle: "italic", margin: "0 0 14px" }}>No advisor notes have been added yet.</p>
                  )}
                  {group.comments.map((c) => (
                    <div key={c.id} style={{ background: "#0b1929", border: "1px solid #131f33", borderRadius: 8, padding: "13px 15px", marginBottom: 10 }}>
                      <p style={{ fontSize: 14, color: "#c4cedc", margin: "0 0 9px", lineHeight: 1.55 }}>{c.text}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "#2a3e57" }}>{c.time}</span>
                        {isAdmin && (
                          <button className="del-btn" onClick={() => deleteComment(group.id, c.id)} style={{ background: "transparent", border: "none", color: "#3a4e68", fontSize: 11, cursor: "pointer", padding: 0, letterSpacing: "0.03em", transition: "color 0.15s" }}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAdmin && (
                    <div style={{ marginTop: 12 }}>
                      <textarea
                        value={newComments[group.id] || ""}
                        onChange={(e) => setNewComments((prev) => ({ ...prev, [group.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addComment(group.id); }}
                        placeholder="Add an advisor note... (Ctrl+Enter to submit)"
                        rows={2}
                        style={{ width: "100%", background: "#060e1c", border: "1px solid #1e2f4d", borderRadius: 7, padding: "11px 13px", color: "#ddd6c4", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 }}
                      />
                      <button
                        className="admin-btn"
                        onClick={() => addComment(group.id)}
                        style={{ marginTop: 9, background: "#c9a84c", border: "none", borderRadius: 7, padding: "9px 20px", color: "#060e1c", fontWeight: 600, fontSize: 13, cursor: "pointer", letterSpacing: "0.03em" }}
                      >
                        Add Note
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #0e1828", padding: "22px 36px" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#1e2e44", letterSpacing: "0.05em" }}>
            Capstone Progress Tracker · Academic Year 2024–2025 · Research & Development Division
          </div>
          <div style={{ fontSize: 12, color: "#1e2e44" }}>All changes are saved automatically and persist across sessions</div>
        </div>
      </footer>
    </div>
  );
}
