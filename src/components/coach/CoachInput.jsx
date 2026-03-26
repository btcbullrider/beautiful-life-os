import React, { useRef, useEffect } from "react";

export default function CoachInput({ input, setInput, loading, onSend, starters, showStarters }) {
    const inputRef = useRef(null);

    // Encapsulated hook behavior restoring input focus right after API finishes loading responses
    useEffect(() => {
        if (!loading) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [loading]);

    return (
        <div>
            {showStarters && (
                <div style={{ marginBottom: 16 }}>
                    <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                        <span style={{ fontSize: 36 }}>🧠</span>
                        <h2 style={{ margin: "10px 0 4px", fontSize: "1.1rem", fontFamily: "'Georgia',serif", color: "#C8A951" }}>Your Life Coach</h2>
                        <p style={{ fontSize: "0.8rem", color: "#8A8678", margin: 0, lineHeight: 1.6 }}>
                            Talk with your coach. It sees all your data and weekly reviews<br />to track your progress and optimize your OS.
                        </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {starters.map((s, i) => (
                            <button key={i} onClick={() => onSend(s)} style={{
                                padding: "12px 16px", borderRadius: 10, textAlign: "left",
                                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                                color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit",
                            }}>{s}</button>
                        ))}
                    </div>
                </div>
            )}
            <div style={{
                display: "flex", gap: 8, padding: "12px 0 0",
                borderTop: !showStarters ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
                <input
                    ref={inputRef} value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); onSend(input); } }}
                    placeholder="Talk to your coach..."
                    disabled={loading}
                    style={{
                        flex: 1, padding: "12px 16px", borderRadius: 12,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#E8E4DC", fontSize: "0.85rem", fontFamily: "inherit", outline: "none",
                    }}
                />
                <button
                    onClick={() => onSend(input)}
                    disabled={loading || !input.trim()}
                    style={{
                        padding: "12px 18px", borderRadius: 12,
                        background: input.trim() ? "rgba(200,169,81,0.15)" : "rgba(255,255,255,0.03)",
                        border: input.trim() ? "1px solid rgba(200,169,81,0.3)" : "1px solid rgba(255,255,255,0.06)",
                        color: input.trim() ? "#C8A951" : "rgba(255,255,255,0.2)",
                        fontSize: 14, fontWeight: 600, cursor: input.trim() ? "pointer" : "default",
                    }}
                >→</button>
            </div>
        </div>
    );
}
