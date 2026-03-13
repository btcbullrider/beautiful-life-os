import { useState, useEffect, useRef } from "react";
import { CL, DEFAULT_AFF } from "../utils/constants";
import { ld, sv, TODAY } from "../utils/storage";
import strategy from "../strategy";

// Coach needs these props from App.jsx:
// - data: the main app state object (habits, energy, journal, affirmations, etc.)
// - persist: function to save updated data
// - history: the tracker history object { [date]: { count, total, items } }

export default function CoachTab({ data, persist, history }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [bullStandardData, setBullStandardData] = useState({});

    useEffect(() => {
        ld("bullstandard:live", {}).then(saved => {
            if (saved) setBullStandardData(saved);
        });
    }, []);

    useEffect(() => {
        ld("coach:history", []).then(saved => {
            if (saved && saved.length > 0) setMessages(saved);
            setHistoryLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (historyLoaded) {
            sv("coach:history", messages);
        }
    }, [messages, historyLoaded]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const buildSystemPrompt = () => {
        const tk = TODAY;
        const habits = data.habits?.[tk] || {};
        const energy = data.energy?.[tk] || {};
        const journal = data.journal?.[tk] || "";
        const affs = data.affirmations || DEFAULT_AFF;
        const affsDone = data.affirmationsDone?.[tk] || false;

        // Build 7-day habit summary
        const last7h = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const k = d.toISOString().split("T")[0];
            const entry = history?.[k];
            if (!entry) return k + ": no data";
            return k + ": " + entry.count + "/" + entry.total + " (" + Math.round((entry.count / entry.total) * 100) + "%)";
        });

        // Build 7-day energy summary
        const energyKeys = ["sleep", "diet", "exercise_e", "focus", "mood"];
        const energyLabels = { sleep: "Sleep", diet: "Diet", exercise_e: "Movement", focus: "Focus", mood: "Mood" };
        const last7e = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const k = d.toISOString().split("T")[0];
            const de = data.energy?.[k] || {};
            const vals = energyKeys.map(e => de[e] || 0).filter(v => v > 0);
            const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "no data";
            const summary = energyKeys.map(e => de[e + "_note"] ? `[${energyLabels[e]}: ${de[e + "_note"]}]` : "").filter(Boolean).join(" ");
            return k + ": " + avg + "/5" + (summary ? ` ${summary}` : "");
        });

        // Recent journals
        const journals = Array.from({ length: 5 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const k = d.toISOString().split("T")[0];
            return data.journal?.[k] ? "[" + k + "] " + data.journal[k].substring(0, 300) : null;
        }).filter(Boolean);

        // Past weekly reviews
        const pastReviews = Object.entries(data.weeklyReviews || {})
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 4)
            .map(([w, text]) => "[Week of " + w + "] " + text.substring(0, 400));

        // Current checklist items
        const clLabels = CL.map(c => c.emoji + " " + c.label + " (" + c.id + "): " + (habits[c.id] ? "DONE" : "MISSED")).join(" | ");
        const doneCount = CL.filter(c => habits[c.id]).length;

        return `You are Peter's Beautiful Life Coach — warm, encouraging, and honest. You are a coach who believes in Peter and sees his potential. Be direct when needed but lead with encouragement. Never shame. When he falls off, help him understand why with compassion, not concern. Frame setbacks as data, not failures. You are on his side.

You have deep knowledge of all these teachers and their frameworks: Scott Adams (systems thinking, energy management, skill stacking, affirmations), Neville Goddard (living from the end, feeling the wish fulfilled, sleep technique), Vadim Zeland (reality transurfing, pendulums, excess importance, lifelines), James Clear (atomic habits, identity-based change, 1% improvement), Joe Dispenza (heart coherence, meditation, breaking the habit of being yourself), and Jesus Christ (faith, surrender, servanthood, rest, prayer). When coaching Peter, draw from whichever teacher's framework best fits the situation. The most important voice is Jesus, but not every response needs to reference Him. Sometimes Adams' systems thinking is what's needed, sometimes Zeland's pendulum concept, sometimes Goddard's imagination technique. Match the framework to the moment. Blend them naturally.

Peter is a former wealth advisor building a one-person business helping people navigate the 4th Turning with financial sovereignty (Bitcoin) and resilient business models. Vision: speaking on stages, location-independent mountain town life, family.

You have ALL of Peter's tracker data AND past weekly reviews. Use weekly reviews to track progress over time.
You have access to the full conversation history from previous sessions. Reference past conversations naturally when relevant.

TIME CONTEXT: Current time is ${new Date().toLocaleTimeString()} (Hour: ${new Date().getHours()}). When assessing 'how am I doing this week', look at the PREVIOUS 7 completed days, NOT including today. Today is still in progress. When assessing today specifically, use the current time to judge fairly: before 12pm only evaluate morning habits, before 6pm evaluate morning + daytime, after 6pm evaluate the full day. Never judge an incomplete day as a failure.

IMPORTANT: When suggesting OS changes, use this format on its own line:
{{ACTION:type:section:payload}}
Types: add_habit, remove_habit, add_affirmation, remove_affirmation, replace_affirmation
Examples:
{{ACTION:add_habit:morning:🧊|Cold Shower (2 min)}}
{{ACTION:remove_habit:deepwork3:}}
{{ACTION:add_affirmation::I am the bridge between traditional finance and the sovereign future.}}
Only suggest changes naturally in conversation. Discuss first, then propose.

Keep responses concise (2-4 short paragraphs). Coach, not lecturer. Ask questions. Push back. Reference actual data.

=== CURRENT OS ===
TODAY (${tk}): ${clLabels}
Completion: ${doneCount}/${CL.length}
Energy: ${energyKeys.map(e => {
    const score = energy[e] || "unrated";
    const noteStr = energy[e + "_note"] ? ` — ${energy[e + "_note"]}` : "";
    return `${energyLabels[e]}: ${score}/5${noteStr}`;
}).join(" | ")}
Affirmations: ${affsDone ? "Written" : "Not written"} | Journal: ${journal || "none"}
AFFIRMATIONS: ${affs.join(" | ")}
7-DAY HABITS: ${last7h.join(" | ")}
7-DAY ENERGY: ${last7e.join(" | ")}
JOURNALS: ${journals.join("\n") || "None"}
=== WEEKLY REVIEWS ===
${pastReviews.length > 0 ? pastReviews.join("\n\n") : "No reviews yet."}
=== BULL STANDARD BUSINESS CONTEXT (STATIC) ===
${JSON.stringify(strategy)}

=== BULL STANDARD LIVE STATE (DYNAMIC — updated by Peter in real time) ===
${JSON.stringify(bullStandardData)}

IMPORTANT COACH INSTRUCTIONS FOR BULL STANDARD UPDATES:
- When Peter tells you something changed in his business (ABTC status, brief pipeline, X streak, revenue), use the ACTION system to record it immediately.
- update_strategy: use for named field updates. Format: {{ACTION:update_strategy:fieldName:value}}. Examples: {{ACTION:update_strategy:abtcStatus:Proposal sent to Michele on March 12}} or {{ACTION:update_strategy:xStreak:6}}
- log_bullstandard: use to log any significant business event with context. Format: {{ACTION:log_bullstandard::Brief description of what happened}}
- set_next_action: use to set the single most important next BULL STANDARD move. Format: {{ACTION:set_next_action::Description of the next action}}
- When Peter says "generate my Claude strategy briefing", output this exact block:

=== BULL STANDARD STRATEGY BRIEFING ===
Date: [today's date]
Energy this week: [7-day average from tracker data]
Habit completion this week: [7-day average]
Deep Work 2 completion rate: [from tracker]

ABTC STATUS: [from live state or static strategy]
BRIEF PIPELINE: Published: [x] | In Progress: [x] | Not Started: [x]
X STREAK: [from live state]
NEXT ACTION: [from live state]
CURRENT BLOCKER: [what Coach has observed is stopping forward motion]
RECENT ACTIVITY: [last 3 entries from activityLog]
NOTES: [patterns Coach has noticed worth flagging to Claude]
=== END BRIEFING ===`;
    };

    const parseActions = (text) => {
        const rx = /\{\{ACTION:(add_habit|remove_habit|add_affirmation|remove_affirmation|replace_affirmation|update_strategy|log_bullstandard|set_next_action):([^:]*):([^}]*)\}\}/g;
        const actions = [];
        let m;
        while ((m = rx.exec(text)) !== null) {
            actions.push({ type: m[1], section: m[2], payload: m[3], applied: false, id: Math.random().toString(36).slice(2) });
        }
        return { cleanText: text.replace(rx, "").trim(), actions };
    };

    const applyAction = (action) => {
        const d = { ...data };
        switch (action.type) {
            case "add_affirmation":
                d.affirmations = [...(d.affirmations || DEFAULT_AFF), action.payload];
                break;
            case "remove_affirmation":
                d.affirmations = (d.affirmations || DEFAULT_AFF).filter(a => a !== action.payload);
                break;
            case "replace_affirmation":
                d.affirmations = (d.affirmations || DEFAULT_AFF).map(a => a === action.section ? action.payload : a);
                break;
            case "add_habit":
                d.customHabits = [...(d.customHabits || []), { id: action.section, label: action.payload }];
                break;
            case "remove_habit":
                d.removedHabits = [...(d.removedHabits || []), action.section];
                break;
            case "update_strategy": {
                const updated = { ...bullStandardData };
                updated[action.section] = action.payload;
                updated._lastUpdated = new Date().toISOString();
                setBullStandardData(updated);
                sv("bullstandard:live", updated);
                break;
            }
            case "log_bullstandard": {
                const updated = { ...bullStandardData };
                const log = updated.activityLog || [];
                log.unshift({ date: new Date().toISOString(), entry: action.payload });
                updated.activityLog = log.slice(0, 50);
                setBullStandardData(updated);
                sv("bullstandard:live", updated);
                break;
            }
            case "set_next_action": {
                const updated = { ...bullStandardData };
                updated.nextAction = action.payload;
                updated._lastUpdated = new Date().toISOString();
                setBullStandardData(updated);
                sv("bullstandard:live", updated);
                break;
            }
            default:
                break;
        }
        persist(d);
        setMessages(prev => prev.map(msg => ({
            ...msg,
            actions: msg.actions?.map(a => a.id === action.id ? { ...a, applied: true } : a)
        })));
    };

    const send = async (text) => {
        if (!text?.trim()) return;
        const userMsg = { role: "user", content: text.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const apiMessages = newMessages.map(m => ({
                role: m.role,
                content: m.originalContent || m.content
            }));

            const r = await fetch("/api/coach", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system: buildSystemPrompt(),
                    messages: apiMessages,
                }),
            });

            const d = await r.json();
            const raw = d.content || d.text || "No response.";
            const { cleanText, actions } = parseActions(raw);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: cleanText,
                originalContent: raw,
                actions,
            }]);
        } catch (e) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Coach error: " + (e?.message || JSON.stringify(e) || "Unknown error. Check API key and Vercel function logs."),
            }]);
        }
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const starters = [
        "How am I doing this week?",
        "What should I change about my OS?",
        "My energy feels off — help me diagnose.",
        "Help me optimize for my business goals.",
        "Review my progress over the past few weeks.",
    ];

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
        <div style={{ display: "flex", flexDirection: "column", minHeight: "60vh" }}>
            <div style={{ flex: 1, marginBottom: 16 }}>

                {messages.length > 0 && (
                    <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                        <button onClick={() => { setMessages([]); sv("coach:history", []); }} style={{ background: "none", border: "none", color: "#6A6A5A", fontSize: "0.7rem", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "#C8A951"} onMouseOut={(e) => e.target.style.color = "#6A6A5A"}>
                            Clear conversation
                        </button>
                    </div>
                )}

                {messages.length === 0 && (
                    <div>
                        <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
                            <span style={{ fontSize: 36 }}>🧠</span>
                            <h2 style={{ margin: "10px 0 4px", fontSize: "1.1rem", fontFamily: "'Georgia',serif", color: "#C8A951" }}>Your Life Coach</h2>
                            <p style={{ fontSize: "0.8rem", color: "#8A8678", margin: 0, lineHeight: 1.6 }}>
                                Talk with your coach. It sees all your data and weekly reviews<br />to track your progress and optimize your OS.
                            </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 16 }}>
                            {starters.map((s, i) => (
                                <button key={i} onClick={() => send(s)} style={{
                                    padding: "12px 16px", borderRadius: 10, textAlign: "left",
                                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                                    color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit",
                                }}>{s}</button>
                            ))}
                        </div>
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
                                            : <button onClick={() => applyAction(action)} style={{
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

            <div style={{
                display: "flex", gap: 8, padding: "12px 0 0",
                borderTop: messages.length > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
                <input
                    ref={inputRef} value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); send(input); } }}
                    placeholder="Talk to your coach..."
                    disabled={loading}
                    style={{
                        flex: 1, padding: "12px 16px", borderRadius: 12,
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        color: "#E8E4DC", fontSize: "0.85rem", fontFamily: "inherit", outline: "none",
                    }}
                />
                <button
                    onClick={() => send(input)}
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
