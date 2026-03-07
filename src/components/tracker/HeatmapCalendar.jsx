import { CL } from "../../utils/constants";

export default function HeatmapCalendar({ history, setEditingDate }) {
    const days = Object.keys(history).sort();

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const sortedDates = Object.keys(history).sort();
    const firstEntry = sortedDates.length > 0 ? new Date(sortedDates[0] + "T12:00:00") : new Date(today);

    const months = [];
    const cursor = new Date(firstEntry.getFullYear(), firstEntry.getMonth(), 1);
    const endMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    while (cursor <= endMonth) {
        months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    const getHeatColor = (count, total, isFuture) => {
        if (isFuture) return "transparent";
        if (count === 0) return "rgba(255,255,255,0.04)";
        if (count === total) return "#C8A951";
        const ratio = count / total;
        if (ratio >= 0.7) return "rgba(200,169,81,0.5)";
        if (ratio >= 0.4) return "rgba(200,169,81,0.25)";
        return "rgba(200,169,81,0.12)";
    };

    const dayHeaders = ["S", "M", "T", "W", "T", "F", "S"];

    return (
        <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678", marginBottom: "0.8rem" }}>Your journey</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
                {months.map((m, mi) => {
                    const firstDay = new Date(m.year, m.month, 1);
                    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
                    const startDow = firstDay.getDay();
                    const monthLabel = firstDay.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                    const cells = [];
                    for (let i = 0; i < startDow; i++) cells.push(null);
                    for (let d = 1; d <= daysInMonth; d++) {
                        const ds = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                        const entry = history[ds];
                        const isFuture = new Date(ds + "T12:00:00") > today;
                        cells.push({ day: d, date: ds, isFuture, count: entry ? entry.count : 0, total: entry ? entry.total : CL.length });
                    }
                    return (
                        <div key={mi} style={{ minWidth: 240 }}>
                            <div style={{ fontSize: "0.75rem", color: "#8A8678", marginBottom: "0.4rem", fontWeight: 500 }}>{monthLabel}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                                {dayHeaders.map((h, hi) => <div key={hi} style={{ fontSize: "0.6rem", color: "#5A5A4A", textAlign: "center", paddingBottom: 2 }}>{h}</div>)}
                                {cells.map((cell, ci) => cell === null ? (
                                    <div key={"e" + ci} />
                                ) : (
                                    <div key={cell.date} title={cell.isFuture ? "" : `${cell.date}: ${cell.count}/${cell.total}`} style={{
                                        width: "100%", aspectRatio: "1", borderRadius: 2,
                                        background: getHeatColor(cell.count, cell.total, cell.isFuture),
                                        border: cell.date === todayStr ? "1.5px solid #C8A951" : "none",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.6rem", color: cell.isFuture ? "#2A2A2A" : cell.count > 0 ? "#0D0F14" : "#4A4A3A",
                                        fontWeight: cell.date === todayStr ? 600 : 400,
                                        cursor: cell.isFuture ? "default" : "pointer"
                                    }} onClick={() => { if (!cell.isFuture) setEditingDate(cell.date); }}>{cell.day}</div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end", marginTop: "0.8rem" }}>
                <span style={{ fontSize: "0.5rem", color: "#5A5A4A" }}>Less</span>
                {["rgba(255,255,255,0.04)", "rgba(200,169,81,0.12)", "rgba(200,169,81,0.25)", "rgba(200,169,81,0.5)", "#C8A951"].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: 1, background: c }} />
                ))}
                <span style={{ fontSize: "0.5rem", color: "#5A5A4A" }}>More</span>
            </div>
        </div>
    );
}
