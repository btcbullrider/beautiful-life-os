import React, { useEffect, useRef } from "react";
import { sv } from "../../utils/storage";

export default function CoachMessages({ messages, setMessages, loading, onApplyAction }) {
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const actionLabels = {
        add_habit: "Add Habit", remove_habit: "Remove Habit",
        add_affirmation: "Add Affirmation", remove_affirmation: "Remove Affirmation",
        replace_affirmation: "Update Affirmation",
        update_strategy: "Update Strategy",
        log_bullstandard: "Log Activity",
        set_next_action: "Set Next Action",
    };
    
    const actionColors = {
        add_habit: "#7AB896", remove_habit: "#C87A92",
        add_affirmation: "#B088D0", remove_affirmation: "#C87A92",
        replace_affirmation: "#6A9FD8",
        update_strategy: "#F59E0B",
        log_bullstandard: "#6A9FD8",
        set_next_action: "#7AB896",
    };

    const renderText = (text) => text.split("\n").map((line, i) => {
        if (line.match(/^#{1,3}\s/)) return <h3 key={i} style={{ color: "#C8A951", fontSize: "0.9rem", fontFamily: "'Georgia',serif", margin: "14px 0 4px" }}>{line.replace(/^#+\s/, "").replace(/\*\*/g, "")}</h3>;
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return <p key={i} style={{ margin: "2px 0", lineHeight: 1.7 }}>{parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} style={{ color: "#B0A890" }}>{p.replace(/\*\*/g, "")}</strong>
                : <span key={j}>{p}</span>
        )}</p>;
    });

    return (
        <div style={{ flex: 1, marginBottom: 16 }}>
            {messages.length > 0 && (
                <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                    <button onClick={() => { setMessages([]); sv("coach:history", []); }} style={{ background: "none", border: "none", color: "#6A6A5A", fontSize: "0.7rem", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "#C8A951"} onMouseOut={(e) => e.target.style.color = "#6A6A5A"}>
                        Clear conversation
                    </button>
                </div>
            )}

            {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{
                        padding: "14px 18px", borderRadius: 14,
                        background: msg.role === "user" ? "rgba(200,169,81,0.08)" : "rgba(255,255,255,0.025)",
                        border: msg.role === "user" ? "1px solid rgba(200,169,81,0.15)" : "1px solid rgba(255,255,255,0.06)",
                        marginLeft: msg.role === "user" ? 40 : 0,
                        marginRight: msg.role === "user" ? 0 : 40,
                    }}>
                        {msg.role === "assistant" && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: 16 }}>🧠</span>
                                <span style={{ fontSize: "0.65rem", color: "#C8A951", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Coach</span>
                            </div>
                        )}
                        <div style={{
                            fontSize: "0.85rem",
                            color: msg.role === "user" ? "#B0A890" : "rgba(255,255,255,0.7)",
                            lineHeight: 1.7, fontFamily: "inherit",
                        }}>
                            {msg.role === "assistant" ? renderText(msg.content) : msg.content}
                        </div>
                    </div>

                    {msg.actions?.length > 0 && (
                        <div style={{ marginTop: 8, marginRight: 40 }}>
                            {msg.actions.map((action, j) => (
                                <div key={j} style={{
                                    padding: "12px 16px", borderRadius: 10, marginBottom: 6,
                                    background: action.applied ? "rgba(107,175,122,0.06)" : "rgba(255,255,255,0.03)",
                                    border: "1px solid " + (action.applied ? "rgba(107,175,122,0.2)" : (actionColors[action.type] + "30")),
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: "0.65rem", color: actionColors[action.type], fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
                                            {actionLabels[action.type]}
                                        </span>
                                        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                                            {action.type === "add_affirmation" && ('"' + action.payload + '"')}
                                            {action.type === "remove_affirmation" && ('Remove: "' + action.payload + '"')}
                                            {action.type === "replace_affirmation" && ('"' + action.section + '" → "' + action.payload + '"')}
                                        </p>
                                    </div>
                                    {action.applied
                                        ? <span style={{ fontSize: "0.75rem", color: "#7AB896", fontWeight: 600 }}>Applied ✓</span>
                                        : <button onClick={() => onApplyAction(action)} style={{
                                            padding: "6px 14px", borderRadius: 8,
                                            background: actionColors[action.type] + "18",
                                            border: "1px solid " + actionColors[action.type] + "40",
                                            color: actionColors[action.type], fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                                        }}>Apply</button>
                                    }
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {loading && (
                <div style={{
                    padding: "14px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                    marginRight: 40, marginBottom: 16,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>🧠</span>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                    width: 6, height: 6, borderRadius: 3, background: "#C8A951",
                                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                }} />
                            ))}
                        </div>
                    </div>
                    <style>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
                </div>
            )}

            <div ref={chatEndRef} />
        </div>
    );
}
