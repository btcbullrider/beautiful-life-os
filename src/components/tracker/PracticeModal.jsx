export default function PracticeModal({ p, days, history, today, setViewingPractice }) {
    const totalTracked = days.length;
    const completionRate = totalTracked > 0 ? Math.round((p.totalDays / totalTracked) * 100) : 0;

    const last90 = [];
    for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        last90.push(d.toISOString().slice(0, 10));
    }

    const dowCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const dowTotals = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    days.forEach(d => {
        const dateObj = new Date(d + "T12:00:00");
        const dow = dateObj.getDay();
        dowTotals[dow]++;
        if (history[d] && history[d].items && history[d].items.includes(p.id)) {
            dowCounts[dow]++;
        }
    });
    const dowOrder = [1, 2, 3, 4, 5, 6, 0];
    const dowNames = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };

    const last7 = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        const done = history[ds] && history[ds].items && history[ds].items.includes(p.id);
        last7.push({ date: ds, done, label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()] });
    }

    return (
        <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(13,15,20,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
            onClick={() => setViewingPractice(null)}
        >
            <div
                style={{ background: "#14171E", border: "1px solid rgba(200,169,81,0.2)", borderRadius: 4, width: "100%", maxWidth: 450, padding: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ fontSize: "2rem" }}>{p.emoji}</div>
                        <div>
                            <div style={{ fontSize: "1.2rem", fontWeight: 500, color: "#E8E4DC" }}>{p.label}</div>
                            <div style={{ fontSize: "0.8rem", color: "#C8A951" }}>Current Streak: {p.current} 🔥</div>
                        </div>
                    </div>
                    <button onClick={() => setViewingPractice(null)} style={{ background: "none", border: "none", color: "#8A8678", fontSize: "1.5rem", cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {[
                        { label: "Current", value: p.current },
                        { label: "Best", value: p.best },
                        { label: "Total", value: p.totalDays },
                        { label: "Rate", value: completionRate + "%" }
                    ].map((s, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3, padding: "0.8rem", textAlign: "center" }}>
                            <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "#C8A951", marginBottom: "0.2rem" }}>{s.value}</div>
                            <div style={{ fontSize: "0.6rem", color: "#8A8678", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Last 7 Days Row */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "0.7rem", color: "#8A8678", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Last 7 Days</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        {last7.map((d, i) => (
                            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                                <div style={{ fontSize: "0.6rem", color: "#6A6A5A" }}>{d.label}</div>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: d.done ? "rgba(200,169,81,0.15)" : "rgba(255,255,255,0.02)", border: d.done ? "1px solid rgba(200,169,81,0.3)" : "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: d.done ? "#C8A951" : "#4A4A3A", fontSize: "0.9rem" }}>
                                    {d.done ? "✓" : "×"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Pattern */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "0.7rem", color: "#8A8678", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Weekly Pattern</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.3rem" }}>
                        {dowOrder.map((dow, i) => {
                            const r = dowTotals[dow] > 0 ? Math.round((dowCounts[dow] / dowTotals[dow]) * 100) : 0;
                            return (
                                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ height: 50, width: "100%", background: "rgba(255,255,255,0.02)", borderRadius: 2, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                                        <div style={{ width: "100%", background: "#C8A951", height: `${r}%`, opacity: 0.7 }} />
                                    </div>
                                    <div style={{ fontSize: "0.6rem", color: "#8A8678", marginTop: "0.4rem" }}>{dowNames[dow]}</div>
                                    <div style={{ fontSize: "0.6rem", color: "#C8A951", fontWeight: 500 }}>{r}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Last 90 Days Heatmap */}
                <div>
                    <div style={{ fontSize: "0.7rem", color: "#8A8678", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Last 90 Days Heatmap</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: "3px" }}>
                        {last90.map((d, i) => {
                            const done = history[d] && history[d].items && history[d].items.includes(p.id);
                            return (
                                <div key={i} title={`${d}: ${done ? 'Done' : 'Missed'}`} style={{ width: "100%", aspectRatio: "1", borderRadius: "2px", background: done ? "#C8A951" : "rgba(255,255,255,0.03)" }} />
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
