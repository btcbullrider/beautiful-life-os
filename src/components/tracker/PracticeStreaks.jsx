export default function PracticeStreaks({ practiceStats, days, history, todayStr, setViewingPractice }) {
    return (
        <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678", marginBottom: "0.6rem" }}>Practice Streaks</div>
            {practiceStats.map(p => {
                const isPR = p.current > 0 && p.current >= p.best;

                // 1. COMEBACK NUDGES
                let nudge = null;
                if (p.current === 0 && p.best > 0) {
                    const pDays = days.filter(d => history[d].items && history[d].items.includes(p.id));
                    let daysSinceLast = 0;
                    if (pDays.length > 0) {
                        const lastDate = pDays[pDays.length - 1]; // sorted ascending earlier
                        const diffTime = new Date(todayStr + "T12:00:00") - new Date(lastDate + "T12:00:00");
                        daysSinceLast = Math.floor(diffTime / 86400000);
                    }
                    if (daysSinceLast >= 5) {
                        nudge = <span style={{ color: "#C85A5A", fontSize: "0.6rem", fontStyle: "italic", opacity: 0.9 }}>{daysSinceLast} days since last</span>;
                    } else {
                        nudge = <span style={{ color: "#D48B47", fontSize: "0.6rem", fontStyle: "italic", opacity: 0.9 }}>2 days to restart streak</span>;
                    }
                }

                // 2. CONSISTENCY TIERS
                const totalTracked = days.length;
                const rateRate = totalTracked > 0 ? (p.totalDays / totalTracked) : 0;
                const ratePct = Math.round(rateRate * 100);
                let badge = null;
                if (rateRate >= 0.9) badge = { icon: "👑", color: "#C8A951" };
                else if (rateRate >= 0.7) badge = { icon: "🥈", color: "#C0C0C0" };
                else if (rateRate >= 0.5) badge = { icon: "🥉", color: "#CD7F32" };

                // 3. MILESTONE CELEBRATIONS
                const milestones = [10, 25, 50, 100, 200];
                let milestoneBadge = null;
                if (milestones.includes(p.totalDays)) {
                    const didToday = history[todayStr] && history[todayStr].items && history[todayStr].items.includes(p.id);
                    if (didToday) {
                        milestoneBadge = <span style={{ background: "rgba(200,169,81,0.15)", color: "#C8A951", padding: "0.15rem 0.4rem", borderRadius: 3, fontSize: "0.6rem", fontWeight: 600, border: "1px solid rgba(200,169,81,0.4)", boxShadow: "0 0 8px rgba(200,169,81,0.3)" }}>{p.totalDays} days! 🎉</span>;
                    } else {
                        milestoneBadge = <span style={{ background: "rgba(255,255,255,0.05)", color: "#8A8678", padding: "0.15rem 0.4rem", borderRadius: 3, fontSize: "0.6rem", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 500 }}>{p.totalDays} days</span>;
                    }
                }

                return (
                    <div key={p.id} onClick={() => setViewingPractice(p)} style={{ cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.7rem 0.9rem", background: "#14171E", border: `1px solid ${isPR && p.current > 1 ? "rgba(200,169,81,0.2)" : "rgba(200,169,81,0.06)"}`, borderRadius: 3, marginBottom: "0.3rem" }}>
                        <span style={{ fontSize: "0.95rem", width: 28, textAlign: "center" }}>{p.emoji}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <span style={{ fontSize: "0.82rem", fontWeight: 400 }}>{p.label}</span>
                                {badge && (
                                    <span style={{ fontSize: "0.6rem", display: "flex", alignItems: "center", gap: "0.2rem", padding: "0.1rem 0.3rem", background: "rgba(255,255,255,0.03)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <span style={{ fontSize: "0.7rem", lineHeight: 1 }}>{badge.icon}</span>
                                        <span style={{ color: badge.color, fontWeight: 600 }}>{ratePct}%</span>
                                    </span>
                                )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.15rem" }}>
                                {milestoneBadge ? milestoneBadge : <span style={{ fontSize: "0.65rem", color: "#6A6A5A" }}>{p.totalDays} total days</span>}
                                {nudge && (
                                    <>
                                        <span style={{ fontSize: "0.5rem", color: "#4A4A3A" }}>•</span>
                                        {nudge}
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: isPR && p.current > 1 ? "#C8A951" : "#8A8678" }}>
                                {p.current}{isPR && p.current > 1 && " \u{1F525}"}
                            </div>
                            <div style={{ fontSize: "0.55rem", color: "#5A5A4A" }}>best: {p.best}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
