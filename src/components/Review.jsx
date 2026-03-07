import { useState } from "react";
import { PIL } from "../utils/constants";
import { ld, sv, WEEK_START } from "../utils/storage";

export default function ReviewTab({ ps, upPil, wn, onWn, history, weeklyReviews, setWeeklyReviews, aff }) {
  const [generating, setGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState("");

  const generateReview = async () => {
    setGenerating(true);
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    });

    const energyData = {};
    const journalData = {};
    const deepworkData = {};

    for (const d of last7) {
      const isToday = d === new Date().toISOString().split("T")[0];
      let ed = isToday ? await ld("en:today", null) : await ld(`en:${d}`, null);
      if (ed && ed.ratings) energyData[d] = ed.ratings;

      let jd = isToday ? await ld("jo:today", null) : await ld(`jo:${d}`, null);
      journalData[d] = typeof jd === "object" && jd ? jd.text : jd;

      let dwd = isToday ? await ld("dw:today", null) : await ld(`dw:${d}`, null);
      deepworkData[d] = dwd && dwd.tasks ? dwd.tasks.filter(t => t.done).length : null;
    }

    const last7h = last7.map(k => {
      const entry = history?.[k];
      if (!entry) return k + ": no data";
      return k + ": " + entry.count + "/" + entry.total + " (" + Math.round((entry.count / entry.total) * 100) + "%)";
    });

    const energyKeys = ["sleep", "diet", "exercise_e", "focus", "mood"];
    const last7e = last7.map(k => {
      const de = energyData[k] || {};
      const vals = energyKeys.map(e => de[e] || 0).filter(v => v > 0);
      return k + ": " + (vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "no data") + "/5";
    });

    const last7dw = last7.map(k => {
      const dw = deepworkData[k];
      if (dw === null) return k + ": no data";
      return k + ": " + dw + "/3 completed";
    });

    const journals = last7.map(k => {
      return journalData[k] ? "[" + k + "] " + journalData[k].substring(0, 300) : null;
    }).filter(Boolean);

    const systemPrompt = `You are Peter's weekly review coach. Analyze the data below and write a concise weekly review covering: what went well, what needs work, patterns you notice, energy trends, and one specific challenge for next week. Be direct, reference actual numbers, and keep it to 3-4 paragraphs.

=== THIS WEEK'S DATA ===
7-DAY HABITS: ${last7h.join(" | ")}
7-DAY ENERGY: ${last7e.join(" | ")}
7-DAY DEEP WORK: ${last7dw.join(" | ")}
AFFIRMATIONS: ${aff.join(" | ")}
JOURNALS: ${journals.join("\n") || "None"}`;

    try {
      const r = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: "user", content: "Generate my weekly review." }]
        })
      });
      const d = await r.json();
      const raw = d.content || d.text || "No response.";
      setGeneratedReview(raw);
    } catch (e) {
      setGeneratedReview("Error contacting the coach. Check your network or API key.");
    }
    setGenerating(false);
  };

  const saveReview = () => {
    const next = { ...weeklyReviews, [WEEK_START]: generatedReview };
    setWeeklyReviews(next);
    sv("weeklyReviews", next);
    setGeneratedReview("");
  };

  return (<div>
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1.5rem", padding: "1.1rem", background: "rgba(200,169,81,0.03)", border: "1px solid rgba(200,169,81,0.08)", borderRadius: 3 }}>
      <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>📊</div>
      <div><div style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "0.25rem" }}>Weekly Pillar Review</div>
        <div style={{ fontSize: "0.8rem", color: "#8A8678", lineHeight: 1.6 }}>Rate yourself 1-5 on each pillar. Honest, not harsh. This is calibration, not judgment.</div></div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.5rem" }}>
      {PIL.map(p => {
        const sc = ps[p.id] || 0; return (
          <div key={p.id} style={{ background: "#14171E", border: "1px solid rgba(200,169,81,0.08)", borderRadius: 3, padding: "0.9rem 1.1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <div><div style={{ fontSize: "0.86rem", fontWeight: 500 }}>{p.short}</div><div style={{ fontSize: "0.66rem", color: "#8A8678" }}>{p.name}</div></div>
            </div>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => upPil(p.id, n)} style={{
                width: 30, height: 30, border: `1px solid ${n <= sc ? p.color : "rgba(255,255,255,0.08)"}`, borderRadius: 3, cursor: "pointer", fontSize: "0.78rem", fontWeight: 500, fontFamily: "inherit",
                background: n <= sc ? p.color : "rgba(255,255,255,0.04)", color: n <= sc ? "#0D0F14" : "#5A5A5A", display: "flex", alignItems: "center", justifyContent: "center"
              }}>{n}</button>)}
            </div>
          </div>
        );
      })}
    </div>
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: 90, padding: "0.8rem 0", marginBottom: "1.5rem", borderBottom: "1px solid rgba(200,169,81,0.08)" }}>
      {PIL.map(p => {
        const sc = ps[p.id] || 0; return (
          <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", flex: 1 }}>
            <div style={{ width: 22, height: 60, background: "rgba(255,255,255,0.03)", borderRadius: 2, overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: "100%", borderRadius: 2, height: `${(sc / 5) * 100}%`, background: p.color, opacity: 0.7, transition: "height 0.4s" }} />
            </div>
            <div style={{ fontSize: "0.55rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#6A6A5A" }}>{p.short.slice(0, 3)}</div>
          </div>
        );
      })}
    </div>
    <div style={{ fontSize: "0.72rem", color: "#8A8678", marginBottom: "0.4rem" }}>Weekly notes + intentions for next week:</div>
    <textarea value={wn} onChange={e => onWn(e.target.value)} placeholder="What patterns am I noticing? What needs to shift? What am I celebrating?" rows={6} style={{ width: "100%", background: "#14171E", border: "1px solid rgba(200,169,81,0.1)", borderRadius: 3, color: "#E8E4DC", fontFamily: "inherit", fontSize: "0.85rem", padding: "0.9rem", resize: "vertical", lineHeight: 1.6, outline: "none", marginBottom: "2rem" }} />

    {/* AI Weekly Review Section */}
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>AI Weekly Review</div>
        <button onClick={generateReview} disabled={generating} style={{ padding: "0.5rem 1rem", background: "rgba(200,169,81,0.15)", border: "1px solid rgba(200,169,81,0.3)", color: "#C8A951", borderRadius: 3, cursor: generating ? "default" : "pointer", fontSize: "0.75rem", fontFamily: "inherit", transition: "all 0.2s" }}>{generating ? "Analyzing week..." : "Generate Weekly Review"}</button>
      </div>

      {generatedReview && (
        <div style={{ background: "#14171E", border: "1px solid #C8A951", borderRadius: 4, padding: "1.2rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "#E8E4DC", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: "1rem" }}>{generatedReview}</div>
          <button onClick={saveReview} style={{ padding: "0.6rem 1.2rem", background: "#C8A951", border: "none", color: "#0D0F14", borderRadius: 3, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit", transition: "all 0.2s" }}>Save Review for {WEEK_START}</button>
        </div>
      )}

      {Object.keys(weeklyReviews || {}).length > 0 && (
        <div>
          <div style={{ fontSize: "0.75rem", color: "#8A8678", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Past Reviews</div>
          {Object.entries(weeklyReviews).sort((a, b) => b[0].localeCompare(a[0])).map(([week, text]) => (
            <div key={week} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, padding: "1rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#C8A951", marginBottom: "0.5rem" }}>Week of {week}</div>
              <div style={{ fontSize: "0.82rem", color: "#B0A890", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{text}</div>
            </div>
          ))}
        </div>
      )}
    </div>

  </div>);
}
