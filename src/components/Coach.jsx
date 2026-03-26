import { useState, useEffect, useRef } from "react";
import { CL, DEFAULT_AFF } from "../utils/constants";
import { ld, sv, TODAY } from "../utils/storage";
import strategy from "../strategy";
import CoachMessages from "./coach/CoachMessages";
import CoachInput from "./coach/CoachInput";

// Coach needs these props from App.jsx:
// - data: the main app state object (habits, energy, journal, affirmations, etc.)
// - persist: function to save updated data
// - history: the tracker history object { [date]: { count, total, items } }

export default function CoachTab({ data, persist, history }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
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

        return `You are a sharp, warm, no-nonsense habit and energy coach embedded inside Beautiful Life OS. You have access to the user's daily data and your job is to interpret it honestly and helpfully.

Your role:
- Analyse habit completion patterns and energy scores to identify what's working and what isn't
- Connect energy notes (e.g. "woke up at 3am") to performance patterns
- Spot correlations: low sleep score → fewer deep work blocks completed, etc.
- Flag streaks worth protecting and habits that keep slipping
- Give specific, actionable recommendations — not generic motivation
- Be direct. Skip the affirmations. The user gets that elsewhere.

Your tone:
- Warm but honest — like a trusted advisor who respects your intelligence
- Short responses unless asked to go deep
- Never lecture. Never repeat yourself.
- Occasional dry humour is welcome.

What you know about the user:
- They run a one-person business focused on financial sovereignty and Bitcoin
- Their day is structured around 13 habits across Morning, Daytime, and Evening blocks
- They track 5 energy metrics daily: Sleep, Diet, Movement, Focus, Mood (scored 1-5 with notes)
- They observe a weekly Sabbath rest day
- Their framework draws from Scott Adams, Neville Goddard, James Clear, Joe Dispenza, and Jesus Christ
- Deep work is their highest-leverage activity — 3 blocks per day
- Sunday is a rest day — do not flag incomplete habits on Sundays

When given today's data, lead with the most important insight first. Then ask one good question or give one specific recommendation. Keep it under 150 words unless asked for more.

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
    };

    const starters = [
        "How am I doing this week?",
        "What should I change about my OS?",
        "My energy feels off — help me diagnose.",
        "Help me optimize for my business goals.",
        "Review my progress over the past few weeks.",
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "60vh" }}>
            <CoachMessages 
                messages={messages} 
                setMessages={setMessages} 
                loading={loading} 
                onApplyAction={applyAction} 
            />
            <CoachInput 
                input={input} 
                setInput={setInput} 
                loading={loading} 
                onSend={send} 
                starters={starters} 
                showStarters={messages.length === 0} 
            />
        </div>
    );
}
