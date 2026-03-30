import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "lower", label: "Lower Body", icon: "🦵" },
  { id: "upper", label: "Upper Body", icon: "💪" },
  { id: "full", label: "Full Body", icon: "🏋️" },
  { id: "sport", label: "Running / Sport", icon: "🏃" },
];

const INTENTS = {
  lower: [
    { id: "heavy", label: "Heavy", desc: "≥80% 1RM, strength", tierCeil: 4 },
    { id: "volume", label: "Volume", desc: "Moderate load, hypertrophy/GPP", tierCeil: 2 },
    { id: "power", label: "Power", desc: "Explosive output", tierCeil: 4 },
    { id: "rehab", label: "Rehab", desc: "Return to training", tierCeil: 1 },
  ],
  upper: [
    { id: "heavy", label: "Heavy", desc: "≥80% 1RM, strength", tierCeil: 4 },
    { id: "volume", label: "Volume", desc: "Moderate load, hypertrophy/GPP", tierCeil: 2 },
    { id: "power", label: "Power", desc: "Explosive output", tierCeil: 4 },
    { id: "rehab", label: "Rehab", desc: "Return to training", tierCeil: 1 },
  ],
  full: [
    { id: "heavy", label: "Heavy", desc: "≥80% 1RM, strength", tierCeil: 4 },
    { id: "volume", label: "Volume", desc: "Moderate load, hypertrophy/GPP", tierCeil: 2 },
    { id: "rehab", label: "Rehab", desc: "Return to training", tierCeil: 1 },
  ],
  sport: [
    { id: "speed", label: "Speed / Intervals", desc: "Tempo, race-pace", tierCeil: 4 },
    { id: "base", label: "Base / Easy", desc: "Conversational, aerobic", tierCeil: 2 },
    { id: "return", label: "Return to Sport", desc: "Post-injury", tierCeil: 1 },
  ],
};

const EXPERIENCE = [
  { id: "beginner", label: "Beginner", tierCeil: 2 },
  { id: "intermediate", label: "Intermediate", tierCeil: 3 },
  { id: "advanced", label: "Advanced", tierCeil: 4 },
];

const PAIN_LEVELS = [
  { id: "none", label: "No Pain", color: "#34d399", tierCeil: 4 },
  { id: "mild", label: "Mild Discomfort", color: "#fbbf24", tierCeil: 2 },
  { id: "moderate", label: "Moderate Pain", color: "#f97316", tierCeil: 1 },
  { id: "severe", label: "Significant Pain", color: "#ef4444", tierCeil: 1 },
];

// ─── DRILL LIBRARY ───────────────────────────────────────────────────────────

const PREPARE = {
  lower: [{ drill: "Stationary Bike", duration: "2 min", note: "Easy pace. Self-paced." }, { drill: "Walking / Light Jog", duration: "2 min", note: "Lowest equipment need." }],
  upper: [{ drill: "Rowing Machine", duration: "2 min", note: "Full-body, upper emphasis." }, { drill: "Stationary Bike", duration: "2 min", note: "Simple alternative." }],
  full: [{ drill: "Rowing Machine", duration: "2 min", note: "Full-body cyclical." }, { drill: "Stationary Bike", duration: "2 min", note: "Simple alternative." }],
  sport: [{ drill: "Light Jog", duration: "2 min", note: "Sport-specific. Easy pace." }, { drill: "Stationary Bike", duration: "2 min", note: "Lower-impact alternative." }],
};

const POSITION_DRILLS = [
  { drill: "90/90 Breathing", sets: "5 breaths", note: "Full exhale, feel ribs drop.", isDefault: true },
  { drill: "Dead Bug (contralateral)", sets: "6 each side", note: "Low back flat. High intent.", isDefault: true },
  { drill: "Side-lying Breathing", sets: "5 each side", note: "For lateral stability needs.", isDefault: false },
  { drill: "Dead Bug (ipsilateral)", sets: "6 each side", note: "Regression. Lower coordination.", isDefault: false },
  { drill: "Pallof Hold (isometric)", sets: "2 × 15s each", note: "For anti-rotation demand.", isDefault: false },
];

const ACCESS_JOINTS = { lower: ["ankle_df", "hip_irer"], upper: ["tspine_ext", "shoulder"], full: ["ankle_df", "hip_irer", "tspine_ext"], sport: ["ankle_df", "hip_ext", "hip_irer"] };

const ACCESS_DRILLS = {
  ankle_df: { label: "Ankle DF", drills: [
    { drill: "Wall Ankle Mobilisation", sets: "8 each", note: "Knee tracks over toe, heel down.", level: "Default", equip: "Wall" },
    { drill: "Banded Ankle Mobilisation", sets: "8 each", note: "For bony restriction.", level: "Progression", equip: "Band" },
    { drill: "Seated Ankle Circles", sets: "10 each way", note: "Can't weight-bear? Use this.", level: "Regression", equip: "None" },
  ]},
  hip_irer: { label: "Hip IR/ER", drills: [
    { drill: "90/90 Hip Switches", sets: "6 each", note: "Controlled rotation, tall spine.", level: "Default", equip: "Floor" },
    { drill: "Quadruped Hip Circles", sets: "8 each", note: "More dynamic option.", level: "Alternative", equip: "Floor" },
    { drill: "Seated Hip Rotation", sets: "8 each", note: "Can't get to floor? Bench.", level: "Regression", equip: "Chair" },
  ]},
  hip_ext: { label: "Hip Extension", drills: [
    { drill: "Half-Kneeling Hip Flexor Mob", sets: "8 each", note: "Squeeze trailing glute. Dynamic.", level: "Default", equip: "Floor" },
    { drill: "Rear-Foot-Elevated HF Stretch", sets: "8 each", note: "Greater rec fem stretch.", level: "Progression", equip: "Bench" },
    { drill: "Standing Hip Flexor Stretch", sets: "20s each", note: "Can't kneel? Stand.", level: "Regression", equip: "None" },
  ]},
  tspine_ext: { label: "T-Spine Extension", drills: [
    { drill: "Foam Roller T-Spine Extension", sets: "10 reps", note: "Extend over roller at each segment.", level: "Default", equip: "Roller" },
    { drill: "Bench T-Spine Extension", sets: "8 reps", note: "Kneel, slide hands, chest drops.", level: "Alternative", equip: "Bench" },
    { drill: "Cat-Cow (extension bias)", sets: "8 reps", note: "Thoracic extension in cow phase.", level: "Regression", equip: "Floor" },
  ]},
  shoulder: { label: "Shoulder ER/Flexion", drills: [
    { drill: "Wall Slide", sets: "8 reps", note: "Full wall contact. Slow.", level: "Default", equip: "Wall" },
    { drill: "Floor Slide", sets: "8 reps", note: "Low back contact maintained.", level: "Alternative", equip: "Floor" },
    { drill: "Band Pull-Apart (ER bias)", sets: "12 reps", note: "Can't hold wall contact? Use band.", level: "Regression", equip: "Band" },
  ]},
};

const ACTIVATION = {
  lower: [{ drill: "Glute Bridge", sets: "10 reps", note: "Bilateral glute + hamstring.", equip: "None" }, { drill: "Banded Clamshell", sets: "10 each", note: "Glute med/max.", equip: "Band" }, { drill: "Banded Squat Walk", sets: "10 each way", note: "Glute med under squat demand.", equip: "Band" }],
  upper: [{ drill: "Prone Y-T Raise", sets: "6 each", note: "Lower trap + serratus.", equip: "None" }, { drill: "Band Pull-Apart", sets: "15 reps", note: "Scapular retractors + ER.", equip: "Band" }, { drill: "Wall Slide with Lift-Off", sets: "8 reps", note: "Overhead prep.", equip: "Wall" }],
  full: [{ drill: "Bear Crawl", sets: "2 × 10m", note: "Full body activation.", equip: "None" }, { drill: "Glute Bridge + Band Pull-Apart", sets: "10 + 15", note: "Lower + upper superset.", equip: "Band" }],
  sport: [{ drill: "Single-Leg Stance (eyes closed)", sets: "20s each", note: "Proprioception + foot intrinsics.", equip: "None" }, { drill: "Banded Lateral Walk", sets: "10 each way", note: "Glute med for single-leg.", equip: "Band" }, { drill: "Calf Raise (slow)", sets: "10 each", note: "Achilles prep.", equip: "Step" }],
};

const PATTERN = {
  lower: [{ drill: "Bodyweight RDL", sets: "8 each", note: "Hinge pattern.", equip: "None" }, { drill: "Goblet Squat (light)", sets: "8 reps", note: "Squat pattern.", equip: "KB/DB" }, { drill: "Bodyweight Reverse Lunge", sets: "6 each", note: "Lunge pattern.", equip: "None" }],
  upper: [{ drill: "Push-Up (controlled)", sets: "8 reps", note: "Press pattern. 3s lowering.", equip: "None" }, { drill: "Inverted Row", sets: "8 reps", note: "Pull pattern.", equip: "Bar/TRX" }, { drill: "Half-Kneeling SA Press", sets: "6 each", note: "Press + core.", equip: "DB/KB" }],
  full: [{ drill: "Inchworm to Push-Up", sets: "6 reps", note: "Hinge + press + locomotion.", equip: "None" }, { drill: "Goblet Squat to Press", sets: "6 reps", note: "Compound link.", equip: "KB/DB" }],
  sport: [{ drill: "A-Skip", sets: "2 × 20m", note: "Gait rehearsal.", equip: "None" }, { drill: "High-Knee March", sets: "2 × 20m", note: "Slower regression.", equip: "None" }, { drill: "Walk-Jog-Stride Build-Up", sets: "2 × 40m", note: "Gradual pace escalation.", equip: "None" }],
};

const TIER_META = {
  1: { name: "Overcoming Isometric", tag: "TIER 1", color: "#818cf8", desc: "Max intent against immovable object. Zero movement.", rx: "3 × 5–6s", cue: "Push as hard as you possibly can for 5 seconds. Every fibre. Nothing moves, but everything fires." },
  2: { name: "Yielding Isometric", tag: "TIER 2", color: "#34d399", desc: "Hold with maximal tension. Own the position.", rx: "2–3 × 6–8s", cue: "Hold and make it as hard as possible. Squeeze everything." },
  3: { name: "Fast-Intent / Ballistic", tag: "TIER 3", color: "#fbbf24", desc: "Explosive concentric, controlled landing.", rx: "2–3 × 3–5", cue: "As fast as possible up. Control down. Speed is the goal." },
  4: { name: "Plyometric / Reactive", tag: "TIER 4", color: "#f97316", desc: "Jumps, bounds. Rapid force + impact absorption.", rx: "2–3 × 3", cue: "Every rep maximal. If it doesn't feel explosive, stop." },
};

const EXPRESS_DRILLS = {
  1: { lower: [{ drill: "Iso Squat Push vs Pins", sets: "3 × 5s", note: "Mid-depth. Push maximally.", equip: "Rack" }, { drill: "Iso Wall Sit Push", sets: "3 × 5s", note: "Push feet into floor maximally.", equip: "None" }], upper: [{ drill: "Iso Press vs Pins", sets: "3 × 5s", note: "Mid-range. Press maximally.", equip: "Rack" }, { drill: "Iso Wall Press", sets: "3 × 5s", note: "Push into wall at chest height.", equip: "None" }], full: [{ drill: "Iso Squat Push vs Pins", sets: "3 × 5s", note: "Primary pattern.", equip: "Rack" }, { drill: "Iso Doorframe Press", sets: "3 × 5s", note: "Press up into doorframe.", equip: "None" }], sport: [{ drill: "Iso Wall Drive (SL)", sets: "3 × 5s each", note: "Knee-drive. Push maximally.", equip: "None" }, { drill: "Iso Pull vs Pins", sets: "3 × 5s", note: "Below knee.", equip: "Rack" }] },
  2: { lower: [{ drill: "Bottom Squat Hold (loaded)", sets: "2–3 × 6–8s", note: "Goblet hold. Max tension.", equip: "KB/DB" }, { drill: "Bottom Squat Hold (BW)", sets: "2–3 × 6–8s", note: "Squeeze quads + glutes.", equip: "None" }], upper: [{ drill: "Bottom Push-Up Hold", sets: "2–3 × 6–8s", note: "1–2in off floor. Max tension.", equip: "None" }, { drill: "Paused Floor Press", sets: "2–3 × 6–8s", note: "Hold at chest.", equip: "DB" }], full: [{ drill: "Bottom Squat + Elbow Press", sets: "2–3 × 6–8s", note: "BW hold, elbows into knees.", equip: "None" }, { drill: "Bottom Squat Hold (loaded)", sets: "2–3 × 6–8s", note: "Goblet hold.", equip: "KB/DB" }], sport: [{ drill: "SL Stance + Knee Drive Hold", sets: "2–3 × 6–8s", note: "Max glute tension.", equip: "None" }, { drill: "SL RDL Hold", sets: "2–3 × 6–8s", note: "Max hamstring tension.", equip: "KB" }] },
  3: { lower: [{ drill: "Squat Jump (step down)", sets: "2–3 × 5", note: "Explosive up, step down.", equip: "None" }, { drill: "KB Swing (explosive)", sets: "2–3 × 5", note: "Hip snap.", equip: "KB" }], upper: [{ drill: "Explosive Push-Up", sets: "2 × 5", note: "Hands leave surface.", equip: "None" }, { drill: "Med Ball Chest Pass", sets: "2 × 5", note: "Throw fast.", equip: "Med ball" }], full: [{ drill: "Squat Jump (step down)", sets: "2–3 × 3", note: "Explosive up, controlled.", equip: "None" }, { drill: "KB Swing (explosive)", sets: "2–3 × 5", note: "Full-body.", equip: "KB" }], sport: [{ drill: "Build-Up Accelerations", sets: "3 × 20m", note: "Gradual build.", equip: "None" }, { drill: "Short Sled Sprint", sets: "3 × 10m", note: "Concentric-dominant.", equip: "Sled" }] },
  4: { lower: [{ drill: "Countermovement Jump", sets: "3 × 3", note: "Land + full reset.", equip: "None" }, { drill: "Box Jump (step down)", sets: "3 × 3", note: "Step down.", equip: "Box" }], upper: [{ drill: "Plyo Push-Up", sets: "2 × 5", note: "Hands leave floor.", equip: "None" }, { drill: "Med Ball Slam", sets: "2 × 5", note: "Pull-to-push chain.", equip: "Med ball" }], full: [{ drill: "Countermovement Jump", sets: "3 × 3", note: "General potentiation.", equip: "None" }, { drill: "Broad Jump", sets: "3 × 3", note: "Stick landing.", equip: "None" }], sport: [{ drill: "Bounding", sets: "3 × 20m", note: "Reactive ground contact.", equip: "None" }, { drill: "Drop Jump (low box)", sets: "3 × 3", note: "Minimise ground time.", equip: "Box" }] },
};

// ─── LOGIC ───────────────────────────────────────────────────────────────────

function getExpressTier(iC, pC, eC, t) { let tC = t <= 5 ? 1 : t <= 8 ? 2 : t <= 12 ? 3 : 4; return Math.min(iC, pC, eC, tC); }

function getTierRationale(tier, iId, pId, eId, t) {
  const r = [];
  if (pId === "moderate" || pId === "severe") r.push("Pain — isometric only");
  else if (pId === "mild") r.push("Mild discomfort — capped at yielding");
  if (eId === "beginner" && tier <= 2) r.push("Beginner — building intent safely");
  if (["rehab", "return"].includes(iId)) r.push("Rehab — zero risk");
  if (["volume", "base"].includes(iId) && tier <= 2) r.push("Volume/base — prime without fatigue");
  if (["heavy", "power", "speed"].includes(iId) && tier >= 3) r.push("High output — full potentiation");
  if (t <= 5) r.push("≤5 min — Tier 1 fits");
  return r.join(". ") + (r.length ? "." : "");
}

function getTimeAlloc(t, tier, pain) {
  const eT = tier <= 2 ? 0.5 : 2;
  if (pain === "moderate" || pain === "severe") { const r = t - eT; return { prepare: 2, position: Math.min(3, r * 0.25), access: Math.min(4, r * 0.35), integrate: Math.min(3, r * 0.25), express: eT }; }
  if (t <= 5) return { prepare: 1, position: 1, access: 0, integrate: t - 2.5, express: 0.5 };
  if (t <= 10) { const r = t - eT; return { prepare: 2, position: 2, access: 2, integrate: Math.max(2, r - 6), express: eT }; }
  const r = t - eT; return { prepare: 1, position: 2, access: 3, integrate: Math.max(3, r - 6), express: eT };
}

const FIRST_REP = [
  { symptom: "Poor bracing — ribs flare, trunk collapses", layer: "Position", action: "Return to 90/90 breathing or dead bug. 1 set. Retry.", color: "#818cf8" },
  { symptom: "Limited range — can't hit depth, restricted", layer: "Access", action: "Return to Access drill. 30–60s. Retry.", color: "#34d399" },
  { symptom: "Disorganised — wrong sequencing", layer: "Integrate", action: "Return to Pattern Rehearsal. 1–2 sets BW. Retry.", color: "#fbbf24" },
  { symptom: "Technically fine but sluggish", layer: "Express", action: "Repeat Express or tier up. Or reduce load.", color: "#f97316" },
  { symptom: "Pain appears", layer: "STOP", action: "Do not push through. Regress. Modify or substitute.", color: "#ef4444" },
];

// ─── AI ASSIST ───────────────────────────────────────────────────────────────

const QUICK_TAGS = ["No equipment", "Can't kneel", "Knee issue", "Shoulder issue", "Back pain", "Very stiff", "Elderly (60+)", "Hypermobile", "Post-surgery", "Limited space", "First session", "Poor balance"];

const LAYER_INFO = {
  prepare: { purpose: "Transition from passive to active. Raise tissue temp and NS activity.", constraints: "1-2 min, no fatigue, no complexity." },
  position: { purpose: "Establish control, alignment, IAP. Align ribcage/pelvis.", constraints: "Low load, high intent, 1-2 drills. Default: 90/90 + dead bug." },
  access: { purpose: "Create usable joint range for the session's demands.", constraints: "1-2 areas, dynamic over static, 30-60s per drill." },
  integrate_activation: { purpose: "Wake up under-active muscle groups for the session.", constraints: "Match session category, 1 drill, avoid fatigue." },
  integrate_pattern: { purpose: "Rehearse the session's primary movement at low load.", constraints: "Match session, quality over volume, 1 drill." },
  express: { purpose: "Increase neural drive and RFD. Never skipped — tiered.", constraints: "Low volume, high intent, full recovery. Only known patterns." },
};

async function askAi({ layerKey, ctx, drills, tags, text, onStatus }) {
  const li = LAYER_INFO[layerKey];
  const prompt = `You are a sports performance coaching assistant for the Coach-X Warm-Up Framework.
Recommend ONE drill for the ${layerKey.replace("_", " ")} layer.
LAYER: ${li.purpose} CONSTRAINTS: ${li.constraints}
RULES:
- Prefer library drills. If none fit, suggest an alternative and explain why.
- Return JSON only, no markdown, no backticks, no preamble: {"drill":"name","sets":"prescription","note":"coaching note","equip":"equipment or None","reasoning":"2-3 sentences max","fromLibrary":true/false}

SESSION: ${ctx.category} ${ctx.intent}, ${ctx.experience}, ${ctx.pain}, ${ctx.time}min
LIBRARY: ${drills.map(d => `${d.drill} (${d.sets || d.duration}) [${d.equip || "?"}]`).join("; ")}
COACH TAGS: ${tags.length ? tags.join(", ") : "none"}
COACH NOTES: ${text || "none"}
Respond ONLY with the JSON object.`;

  try {
    onStatus("Calling AI...");
    const response = await fetch("/api/ai-assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    onStatus("Reading response...");
    const data = await response.json();

    if (data.error) {
      return { _error: data.error };
    }

    if (!data.text) return { _error: "Empty response from AI" };

    onStatus("Done");
    const clean = data.text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    if (e instanceof SyntaxError) return { _error: "AI response wasn't valid JSON. Try again." };
    return { _error: `${e.name}: ${e.message}` };
  }
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const FONT = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap";
const Card = ({ selected, onClick, children, style }) => (<button onClick={onClick} style={{ background: selected ? "rgba(228,224,216,0.12)" : "rgba(228,224,216,0.03)", border: selected ? "1.5px solid rgba(228,224,216,0.5)" : "1.5px solid rgba(228,224,216,0.1)", borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s", textAlign: "left", color: "#e4e0d8", fontFamily: "'DM Sans', sans-serif", ...style }}>{children}</button>);

function AiPanel({ layerKey, ctx, drills, color, onAccept, onClose }) {
  const [tags, setTags] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const toggle = t => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const ask = async () => {
    setLoading(true); setError(null); setResult(null); setStatus("Starting...");
    const r = await askAi({ layerKey, ctx, drills, tags, text, onStatus: setStatus });
    if (r?._error) { setError(r._error); } else if (r) { setResult(r); } else { setError("No response."); }
    setLoading(false); setStatus("");
  };
  const canAsk = !loading && (tags.length > 0 || text.trim());
  return (
    <div style={{ background: "rgba(228,224,216,0.03)", border: `1px solid ${color}30`, borderRadius: "0 0 10px 10px", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>AI Drill Assist</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(228,224,216,0.4)", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {QUICK_TAGS.map(t => (<button key={t} onClick={() => toggle(t)} style={{ background: tags.includes(t) ? color + "20" : "rgba(228,224,216,0.04)", border: `1px solid ${tags.includes(t) ? color + "50" : "rgba(228,224,216,0.08)"}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: tags.includes(t) ? color : "rgba(228,224,216,0.5)", transition: "all 0.15s" }}>{t}</button>))}
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Add context... e.g., 'ACL repair 6mo ago, cleared but nervous about jumping'" rows={2}
        style={{ width: "100%", background: "rgba(228,224,216,0.04)", border: "1px solid rgba(228,224,216,0.1)", borderRadius: 8, padding: "10px 12px", color: "#e4e0d8", fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none", lineHeight: 1.5, boxSizing: "border-box" }} />
      <button onClick={canAsk ? ask : undefined} style={{ width: "100%", marginTop: 10, padding: "10px 16px", background: canAsk ? color + "20" : "rgba(228,224,216,0.05)", border: `1px solid ${canAsk ? color + "40" : "rgba(228,224,216,0.08)"}`, borderRadius: 8, color: canAsk ? color : "rgba(228,224,216,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: canAsk ? "pointer" : "default" }}>
        {loading ? (status || "Thinking...") : "Get Recommendation"}
      </button>
      {error && <div style={{ marginTop: 10, fontSize: 12, color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "8px 10px", lineHeight: 1.5, wordBreak: "break-word" }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 12, background: color + "08", border: `1px solid ${color}25`, borderRadius: 10, padding: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color, background: color + "15", padding: "2px 6px", borderRadius: 3, marginTop: 2, whiteSpace: "nowrap" }}>{result.sets}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{result.drill}</div>
              <div style={{ fontSize: 12, color: "rgba(228,224,216,0.55)", lineHeight: 1.4 }}>{result.note}</div>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: result.equip === "None" ? "#34d39966" : "rgba(228,224,216,0.3)", marginTop: 3, display: "inline-block" }}>{result.equip === "None" ? "No equipment" : result.equip}</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(228,224,216,0.5)", lineHeight: 1.5, padding: "8px 10px", background: "rgba(228,224,216,0.02)", borderRadius: 6, marginBottom: 10, fontStyle: "italic" }}>
            {result.reasoning}
            {result.fromLibrary === false && <span style={{ display: "block", marginTop: 4, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#fbbf2480" }}>⚡ Outside library</span>}
          </div>
          <button onClick={() => { onAccept({ drill: result.drill, sets: result.sets, note: result.note, equip: result.equip, level: result.fromLibrary ? "AI pick" : "AI custom" }); onClose(); }}
            style={{ width: "100%", padding: "10px 16px", background: color + "20", border: `1px solid ${color}40`, borderRadius: 8, color, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Use This Drill
          </button>
        </div>
      )}
    </div>
  );
}

function DrillSlot({ drill, alternatives, color, onSwap, layerKey, ctx }) {
  const [showAlts, setShowAlts] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const hasAlts = alternatives && alternatives.length > 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 12, padding: "12px 14px", background: "rgba(228,224,216,0.03)", borderRadius: (showAlts || showAi) ? "8px 8px 0 0" : 8, alignItems: "flex-start" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color, background: color + "15", padding: "2px 6px", borderRadius: 3, marginTop: 3, whiteSpace: "nowrap" }}>{drill.sets || drill.duration}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{drill.drill}</div>
          <div style={{ fontSize: 12, color: "rgba(228,224,216,0.55)", lineHeight: 1.4 }}>{drill.note}</div>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: drill.equip === "None" ? "#34d39966" : "rgba(228,224,216,0.3)", marginTop: 4, display: "inline-block" }}>{drill.equip === "None" ? "No equipment" : (drill.equip || "")}</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {hasAlts && <button onClick={() => { setShowAlts(!showAlts); setShowAi(false); }} style={{ background: "rgba(228,224,216,0.06)", border: "1px solid rgba(228,224,216,0.1)", borderRadius: 4, padding: "2px 6px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: showAlts ? "#e4e0d8" : "rgba(228,224,216,0.4)", letterSpacing: "0.05em" }}>{showAlts ? "HIDE" : "SWAP"}</button>}
          <button onClick={() => { setShowAi(!showAi); setShowAlts(false); }} style={{ background: showAi ? color + "20" : "rgba(228,224,216,0.06)", border: `1px solid ${showAi ? color + "40" : "rgba(228,224,216,0.1)"}`, borderRadius: 4, padding: "2px 6px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: showAi ? color : "rgba(228,224,216,0.4)", letterSpacing: "0.05em" }}>AI</button>
        </div>
      </div>
      {showAlts && alternatives.map((alt, i) => (
        <div key={i} onClick={() => { onSwap(alt); setShowAlts(false); }}
          style={{ display: "flex", gap: 12, padding: "10px 14px", background: "rgba(228,224,216,0.015)", borderBottom: i < alternatives.length - 1 ? "1px solid rgba(228,224,216,0.04)" : "none", borderRadius: i === alternatives.length - 1 ? "0 0 8px 8px" : 0, cursor: "pointer", alignItems: "flex-start" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(228,224,216,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(228,224,216,0.015)"}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(228,224,216,0.3)", padding: "2px 5px", marginTop: 3, background: "rgba(228,224,216,0.05)", borderRadius: 3, whiteSpace: "nowrap" }}>{alt.level || alt.sets || alt.duration}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13, color: "rgba(228,224,216,0.7)" }}>{alt.drill}</div>
            <div style={{ fontSize: 11, color: "rgba(228,224,216,0.4)", lineHeight: 1.4 }}>{alt.note}</div>
          </div>
        </div>
      ))}
      {showAi && <AiPanel layerKey={layerKey} ctx={ctx} drills={[drill, ...(alternatives || [])]} color={color} onAccept={onSwap} onClose={() => setShowAi(false)} />}
    </div>
  );
}

function LayerBlock({ number, name, time, color, note, skipped, tierInfo, children }) {
  const [open, setOpen] = useState(!skipped);
  return (
    <div style={{ background: skipped ? "rgba(228,224,216,0.02)" : "rgba(228,224,216,0.04)", border: `1px solid ${skipped ? "rgba(228,224,216,0.06)" : color + "33"}`, borderRadius: 12, overflow: "hidden", opacity: skipped ? 0.45 : 1, marginBottom: 12 }}>
      <button onClick={() => !skipped && setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", background: "none", border: "none", cursor: skipped ? "default" : "pointer", color: "#e4e0d8", fontFamily: "'DM Sans', sans-serif" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500, color, background: color + "18", padding: "3px 8px", borderRadius: 4 }}>{number}</span>
        <span style={{ fontWeight: 600, fontSize: 16, flex: 1, textAlign: "left" }}>
          {name}{tierInfo && <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: tierInfo.color, background: tierInfo.color + "18", padding: "2px 6px", borderRadius: 3, marginLeft: 8 }}>{tierInfo.tag}</span>}
        </span>
        {skipped ? <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "rgba(228,224,216,0.35)" }}>SKIPPED</span>
          : <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "rgba(228,224,216,0.5)" }}>{typeof time === "number" ? (time < 1 ? "30s" : `${Math.round(time * 10) / 10} min`) : time}</span>}
        {!skipped && <span style={{ fontSize: 14, color: "rgba(228,224,216,0.4)", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>}
      </button>
      {open && !skipped && (
        <div style={{ padding: "0 18px 18px 18px" }}>
          {tierInfo && <div style={{ background: tierInfo.color + "0a", border: `1px solid ${tierInfo.color}20`, borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}><div style={{ fontSize: 12, fontWeight: 600, color: tierInfo.color, marginBottom: 4 }}>{tierInfo.name}</div><div style={{ fontSize: 11, color: "rgba(228,224,216,0.5)", lineHeight: 1.5 }}>{tierInfo.desc}</div>{tierInfo.rationale && <div style={{ fontSize: 11, color: "rgba(228,224,216,0.4)", marginTop: 6, fontStyle: "italic" }}>{tierInfo.rationale}</div>}</div>}
          {note && <p style={{ fontSize: 13, color: "rgba(228,224,216,0.5)", margin: "0 0 14px 0", fontStyle: "italic", lineHeight: 1.5 }}>{note}</p>}
          {children}
          {tierInfo?.cue && <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(228,224,216,0.02)", borderRadius: 8, borderLeft: `2px solid ${tierInfo.color}40` }}><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "rgba(228,224,216,0.35)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Coaching Cue</span><div style={{ fontSize: 12, color: "rgba(228,224,216,0.6)", marginTop: 4, fontStyle: "italic", lineHeight: 1.5 }}>"{tierInfo.cue}"</div></div>}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function CoachXApp() {
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState(null);
  const [intent, setIntent] = useState(null);
  const [exp, setExp] = useState(null);
  const [pain, setPain] = useState(null);
  const [time, setTime] = useState(10);
  const [view, setView] = useState("plan");
  const topRef = useRef(null);
  const [swaps, setSwaps] = useState({});
  const sw = (k, d) => setSwaps(p => ({ ...p, [k]: d }));
  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step, view]);
  const ok = () => step === 0 ? cat && intent : step === 1 ? exp && pain : true;
  const iObj = cat ? INTENTS[cat]?.find(i => i.id === intent) : null;
  const pObj = PAIN_LEVELS.find(p => p.id === pain);
  const eObj = EXPERIENCE.find(e => e.id === exp);
  const tier = iObj && pObj && eObj ? getExpressTier(iObj.tierCeil, pObj.tierCeil, eObj.tierCeil, time) : 1;
  const alloc = pain ? getTimeAlloc(time, tier, pain) : null;
  const reset = () => { setStep(0); setCat(null); setIntent(null); setExp(null); setPain(null); setTime(10); setView("plan"); setSwaps({}); };
  const ctx = { category: CATEGORIES.find(c => c.id === cat)?.label || "", intent: iObj?.label || "", experience: eObj?.label || "", pain: pObj?.label || "", time };

  return (
    <div style={{ minHeight: "100vh", background: "#1a1917", color: "#e4e0d8", fontFamily: "'DM Sans', sans-serif", display: "flex", justifyContent: "center", padding: "0 16px" }}>
      <link href={FONT} rel="stylesheet" />
      <div ref={topRef} style={{ maxWidth: 520, width: "100%", padding: "40px 0 60px" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.2em", color: "rgba(228,224,216,0.4)", marginBottom: 6, textTransform: "uppercase" }}>Coach-X</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Warm-Up Builder</h1>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
          {["Session", "Parameters", "Warm-Up"].map((l, i) => (<div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}><div style={{ height: 3, width: "100%", borderRadius: 2, background: i <= step ? "#e4e0d8" : "rgba(228,224,216,0.15)" }} /><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em", color: i <= step ? "#e4e0d8" : "rgba(228,224,216,0.3)", textTransform: "uppercase" }}>{l}</span></div>))}
        </div>

        {step === 0 && <div>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: "block" }}>What are you training?</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
            {CATEGORIES.map(c => <Card key={c.id} selected={cat === c.id} onClick={() => { setCat(c.id); setIntent(null); }}><span style={{ fontSize: 20, marginRight: 8 }}>{c.icon}</span><span style={{ fontSize: 14, fontWeight: 500 }}>{c.label}</span></Card>)}
          </div>
          {cat && <><label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: "block" }}>How are you training it?</label>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${INTENTS[cat].length > 3 ? 2 : INTENTS[cat].length}, 1fr)`, gap: 8, marginBottom: 24 }}>
              {INTENTS[cat].map(i => <Card key={i.id} selected={intent === i.id} onClick={() => setIntent(i.id)}><div style={{ fontSize: 14, fontWeight: 600 }}>{i.label}</div><div style={{ fontSize: 11, color: "rgba(228,224,216,0.45)", marginTop: 2 }}>{i.desc}</div></Card>)}
            </div></>}
        </div>}

        {step === 1 && <div>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: "block" }}>Experience Level</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>{EXPERIENCE.map(e => <Card key={e.id} selected={exp === e.id} onClick={() => setExp(e.id)} style={{ flex: 1, textAlign: "center" }}><span style={{ fontSize: 14, fontWeight: 500 }}>{e.label}</span></Card>)}</div>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: "block" }}>Pain Status</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>{PAIN_LEVELS.map(p => <Card key={p.id} selected={pain === p.id} onClick={() => setPain(p.id)}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: p.color, marginRight: 8 }} /><span style={{ fontSize: 14, fontWeight: 500 }}>{p.label}</span></Card>)}</div>
          <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: "block" }}>Time: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#fbbf24" }}>{time} min</span></label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}><span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "rgba(228,224,216,0.4)" }}>5</span><input type="range" min={5} max={25} value={time} onChange={e => setTime(+e.target.value)} style={{ flex: 1, accentColor: "#fbbf24", height: 4 }} /><span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "rgba(228,224,216,0.4)" }}>25</span></div>
          <div style={{ fontSize: 11, color: "rgba(228,224,216,0.35)", marginBottom: 28, fontFamily: "'JetBrains Mono', monospace" }}>{time <= 5 ? "Minimum viable" : time <= 10 ? "Standard" : time <= 15 ? "Full framework" : "Extended"} · Express {TIER_META[tier]?.tag}</div>
        </div>}

        {step === 2 && view === "plan" && alloc && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, padding: "0 2px" }}>
            <span style={{ fontSize: 13, color: "rgba(228,224,216,0.5)", fontWeight: 500 }}>{ctx.category} · {ctx.intent}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#fbbf24" }}>{time} min</span>
          </div>
          {(pain === "moderate" || pain === "severe") && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, lineHeight: 1.5, color: "#fca5a5" }}><strong>Pain modification active.</strong> Express {TIER_META[tier].tag}. Traffic light rule applies.</div>}

          <LayerBlock number="01" name="Prepare" time={alloc.prepare} color="#94a3b8" note="Passive → active. No complexity, no fatigue.">
            <DrillSlot drill={swaps.prepare || PREPARE[cat][0]} alternatives={PREPARE[cat].slice(1)} color="#94a3b8" onSwap={d => sw("prepare", d)} layerKey="prepare" ctx={ctx} />
          </LayerBlock>

          <LayerBlock number="02" name="Position" time={alloc.position} color="#818cf8" note="Default pair covers 80%+ of sessions.">
            {POSITION_DRILLS.filter(d => d.isDefault).map((d, i) => <DrillSlot key={i} drill={swaps[`pos_${i}`] || d} alternatives={POSITION_DRILLS.filter(a => !a.isDefault)} color="#818cf8" onSwap={a => sw(`pos_${i}`, a)} layerKey="position" ctx={ctx} />)}
          </LayerBlock>

          {(() => { const jts = ACCESS_JOINTS[cat] || [], mx = time <= 5 ? 0 : time <= 10 ? 2 : 3, aj = jts.slice(0, mx); return (
            <LayerBlock number="03" name="Access" time={alloc.access} color="#34d399" skipped={time <= 5} note={time <= 5 ? "Skipped — insufficient time." : `Targeting: ${aj.map(j => ACCESS_DRILLS[j]?.label).join(", ")}.`}>
              {aj.map(j => { const jd = ACCESS_DRILLS[j]; if (!jd) return null; const cur = swaps[`access_${j}`] || jd.drills[0]; return <DrillSlot key={j} drill={cur} alternatives={jd.drills.filter(d => d.drill !== cur.drill)} color="#34d399" onSwap={d => sw(`access_${j}`, d)} layerKey="access" ctx={ctx} />; })}
            </LayerBlock>); })()}

          <LayerBlock number="04" name="Integrate" time={alloc.integrate} color="#fbbf24" note={time <= 5 ? "Pattern Rehearsal only." : "Activation + Pattern Rehearsal."}>
            {time > 5 && <><div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "rgba(228,224,216,0.3)", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Activation</div>
              <DrillSlot drill={swaps.act || ACTIVATION[cat][0]} alternatives={ACTIVATION[cat].slice(1)} color="#fbbf24" onSwap={d => sw("act", d)} layerKey="integrate_activation" ctx={ctx} /></>}
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "rgba(228,224,216,0.3)", marginBottom: 6, marginTop: time > 5 ? 8 : 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pattern Rehearsal</div>
            <DrillSlot drill={swaps.pat || PATTERN[cat][0]} alternatives={PATTERN[cat].slice(1)} color="#fbbf24" onSwap={d => sw("pat", d)} layerKey="integrate_pattern" ctx={ctx} />
          </LayerBlock>

          {(() => { const td = EXPRESS_DRILLS[tier]?.[cat] || [], m = TIER_META[tier], rat = getTierRationale(tier, intent, pain, exp, time); return (
            <LayerBlock number="05" name="Express" time={alloc.express} color="#f97316" tierInfo={{ ...m, rationale: rat }}>
              <DrillSlot drill={swaps.express || td[0]} alternatives={td.slice(1)} color="#f97316" onSwap={d => sw("express", d)} layerKey="express" ctx={ctx} />
            </LayerBlock>); })()}

          <div style={{ marginTop: 20, padding: "16px 18px", background: "rgba(228,224,216,0.04)", border: "1px solid rgba(228,224,216,0.1)", borderRadius: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>→ Ramp-Up Handoff</div>
            <p style={{ fontSize: 12, color: "rgba(228,224,216,0.55)", margin: 0, lineHeight: 1.5 }}>Start at ~40–50% working weight. First loaded set = First Rep checkpoint.</p>
          </div>
          <button onClick={() => setView("diagnostic")} style={{ width: "100%", marginTop: 16, padding: "14px 20px", background: "rgba(228,224,216,0.06)", border: "1.5px solid rgba(228,224,216,0.15)", borderRadius: 10, color: "#e4e0d8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>First Rep Diagnostic →</button>
        </div>}

        {step === 2 && view === "diagnostic" && <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>First Rep Diagnostic</h2>
          <p style={{ fontSize: 13, color: "rgba(228,224,216,0.5)", margin: "0 0 24px", lineHeight: 1.5 }}>Assess the first loaded ramp-up set.</p>
          {FIRST_REP.map((f, i) => <div key={i} style={{ background: "rgba(228,224,216,0.03)", border: `1px solid ${f.color}25`, borderRadius: 10, padding: "16px 18px", marginBottom: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500, color: f.color, background: f.color + "18", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>→ {f.layer}</span>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, marginTop: 8 }}>{f.symptom}</div>
            <div style={{ fontSize: 12, color: "rgba(228,224,216,0.55)", lineHeight: 1.5 }}>{f.action}</div>
          </div>)}
          <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(228,224,216,0.03)", borderRadius: 10, border: "1px solid rgba(228,224,216,0.08)" }}>
            <p style={{ fontSize: 12, color: "rgba(228,224,216,0.45)", margin: 0, lineHeight: 1.5 }}><strong style={{ color: "rgba(228,224,216,0.65)" }}>One correction attempt only.</strong> If it persists, log for programming review.</p>
          </div>
          <button onClick={() => setView("plan")} style={{ width: "100%", marginTop: 16, padding: "14px 20px", background: "rgba(228,224,216,0.06)", border: "1.5px solid rgba(228,224,216,0.15)", borderRadius: 10, color: "#e4e0d8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>← Back to Warm-Up</button>
        </div>}

        {!(step === 2 && view === "diagnostic") && <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {step > 0 && <button onClick={() => { setStep(step - 1); setView("plan"); setSwaps({}); }} style={{ padding: "14px 24px", background: "rgba(228,224,216,0.04)", border: "1.5px solid rgba(228,224,216,0.1)", borderRadius: 10, color: "#e4e0d8", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Back</button>}
          {step < 2 && <button onClick={() => ok() && setStep(step + 1)} style={{ flex: 1, padding: "14px 24px", background: ok() ? "#e4e0d8" : "rgba(228,224,216,0.08)", border: "none", borderRadius: 10, color: ok() ? "#1a1917" : "rgba(228,224,216,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: ok() ? "pointer" : "default" }}>{step === 0 ? "Set Parameters →" : "Build Warm-Up →"}</button>}
          {step === 2 && view === "plan" && <button onClick={reset} style={{ flex: 1, padding: "14px 24px", background: "#e4e0d8", border: "none", borderRadius: 10, color: "#1a1917", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>New Warm-Up</button>}
        </div>}

        <div style={{ marginTop: 48, textAlign: "center", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "rgba(228,224,216,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Coach-X v3.1 · AI-Assisted</div>
      </div>
    </div>
  );
}
