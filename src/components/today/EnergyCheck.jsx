import React from "react";

export default function EnergyCheck({ energy, onScore, onNote, todayKey }) {
    return (
        <div style={{ marginBottom: "1.2rem", padding: "1rem", borderRadius: 4, background: "rgba(200,169,81,0.03)", border: "1px solid rgba(200,169,81,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
                <span>🔋</span>
                <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678" }}>Energy Check</span>
            </div>
            <div style={{ display: "grid", gap: "0.8rem" }}>
                {[
                    { k: "sleep", label: "Sleep", emoji: "💤" },
                    { k: "diet", label: "Diet", emoji: "🥗" },
                    { k: "exercise_e", label: "Movement", emoji: "🏃" },
                    { k: "focus", label: "Focus", emoji: "🎯" },
                    { k: "mood", label: "Mood", emoji: "✨" },
                ].map(item => (
                    <div key={item.k} style={{ background: "#14171E", padding: "0.6rem 0.8rem", borderRadius: 3, border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <span style={{ fontSize: "0.9rem" }}>{item.emoji}</span>
                                <span style={{ fontSize: "0.82rem", color: "#E8E4DC" }}>{item.label}</span>
                            </div>
                            <div style={{ display: "flex", gap: "0.2rem" }}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button key={n} onClick={() => onScore(item.k, n)} style={{
                                        width: 24, height: 24, border: "none", borderRadius: 2, cursor: "pointer", fontSize: "0.7rem", fontWeight: 500, fontFamily: "inherit",
                                        background: energy[item.k] >= n ? "rgba(200,169,81,0.6)" : "rgba(255,255,255,0.04)",
                                        color: energy[item.k] >= n ? "#0D0F14" : "#6A6A5A",
                                        transition: "all 0.15s"
                                    }}>{n}</button>
                                ))}
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Add a note..."
                            value={energy[item.k + "_note"] || ""}
                            onChange={e => onNote(item.k, e.target.value)}
                            style={{
                                width: "100%", marginTop: "6px", padding: "6px 10px", 
                                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", 
                                borderRadius: 4, color: "#8A8678", fontSize: "12px", fontFamily: "DM Sans", outline: "none",
                                transition: "border-color 0.2s"
                            }}
                            onFocus={(e) => { e.target.style.borderColor = "rgba(200,169,81,0.3)"; }}
                            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
