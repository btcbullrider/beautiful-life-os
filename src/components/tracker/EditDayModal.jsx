import { CL } from "../../utils/constants";

export default function EditDayModal({ editingDate, setEditingDate, history, updateHistoryItem }) {
    return (
        <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(13,15,20,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
            onClick={() => setEditingDate(null)}
        >
            <div
                style={{ background: "#14171E", border: "1px solid rgba(200,169,81,0.2)", borderRadius: 4, width: "100%", maxWidth: 400, padding: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 500, color: "#E8E4DC" }}>
                        Edit {new Date(editingDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                    <button onClick={() => setEditingDate(null)} style={{ background: "none", border: "none", color: "#8A8678", fontSize: "1.5rem", cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {CL.map(c => {
                        const items = history[editingDate]?.items || [];
                        const isChecked = items.includes(c.id);
                        return (
                            <div
                                key={c.id}
                                onClick={() => {
                                    updateHistoryItem(editingDate, c.id, !isChecked);
                                    
                                    // Synchronize directly with the daily cl key to ensure "exercise" and all others explicitly record
                                    const clKey = `cl:${editingDate}`;
                                    try {
                                        const storedDay = JSON.parse(localStorage.getItem(clKey)) || { _date: editingDate };
                                        storedDay[c.id] = !isChecked;
                                        localStorage.setItem(clKey, JSON.stringify(storedDay));
                                    } catch (e) {}
                                }}
                                style={{
                                    display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem",
                                    background: isChecked ? "rgba(200,169,81,0.1)" : "rgba(255,255,255,0.02)",
                                    border: `1px solid ${isChecked ? "rgba(200,169,81,0.3)" : "rgba(255,255,255,0.05)"}`,
                                    borderRadius: 3, cursor: "pointer", transition: "all 0.2s"
                                }}
                            >
                                <div style={{
                                    width: 20, height: 20, borderRadius: 2, border: `1px solid ${isChecked ? "#C8A951" : "#5A5A4A"}`,
                                    background: isChecked ? "#C8A951" : "transparent", display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    {isChecked && <span style={{ color: "#0D0F14", fontSize: "0.8rem", fontWeight: "bold" }}>✓</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "0.95rem", color: isChecked ? "#E8E4DC" : "#8A8678", opacity: isChecked ? 1 : 0.7 }}>
                                        {c.emoji} {c.label}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
