export default function StatsRow({ currentStreak, longestStreak, totalPerfect }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(200,169,81,0.1)", borderRadius: 2, overflow: "hidden", marginBottom: "1.5rem" }}>
            {[
                { label: "Current Streak", value: currentStreak, sub: "days" },
                { label: "Longest Streak", value: longestStreak, sub: "PR" },
                { label: "Perfect Days", value: totalPerfect, sub: "total" },
            ].map((s, i) => (
                <div key={i} style={{ background: "#14171E", padding: "1rem", textAlign: "center" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#C8A951" }}>{s.value}</div>
                    <div style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8678" }}>{s.label}</div>
                    <div style={{ fontSize: "0.55rem", color: "#5A5A4A" }}>{s.sub}</div>
                </div>
            ))}
        </div>
    );
}
