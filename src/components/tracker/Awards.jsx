export default function Awards({ currentAward, nextAward, allAwards, longestStreak, currentStreak }) {
    return (
        <div>
            {/* Current Award Banner */}
            {currentAward && (
                <div style={{ textAlign: "center", padding: "1.5rem", marginBottom: "1.5rem", background: `linear-gradient(135deg, ${currentAward.color}10, ${currentAward.color}05)`, border: `1px solid ${currentAward.color}30`, borderRadius: 3 }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{currentAward.icon}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 500, color: currentAward.color, marginBottom: "0.15rem" }}>{currentAward.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "#8A8678" }}>{currentStreak} day streak — {currentAward.desc}</div>
                    {nextAward && <div style={{ fontSize: "0.7rem", color: "#6A6A5A", marginTop: "0.5rem" }}>{nextAward.need - currentStreak} days until &quot;{nextAward.title}&quot; {nextAward.icon}</div>}
                </div>
            )}

            {/* Awards showcase */}
            <div>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678", marginBottom: "0.6rem" }}>Awards</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                    {allAwards.map((a, i) => {
                        const earned = longestStreak >= a.need || currentStreak >= a.need;
                        return (
                            <div key={i} style={{
                                padding: "1rem", borderRadius: 3, textAlign: "center",
                                background: earned ? `${a.color}10` : "rgba(255,255,255,0.02)",
                                border: `1px solid ${earned ? a.color + "30" : "rgba(255,255,255,0.05)"}`,
                                opacity: earned ? 1 : 0.4
                            }}>
                                <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem", filter: earned ? "none" : "grayscale(1)" }}>{a.icon}</div>
                                <div style={{ fontSize: "0.8rem", fontWeight: 500, color: earned ? a.color : "#5A5A4A" }}>{a.title}</div>
                                <div style={{ fontSize: "0.6rem", color: "#6A6A5A" }}>{a.desc}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
