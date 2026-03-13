import { useState, useEffect } from "react";
import { CL } from "../utils/constants";
import DailyDevotional from "./DailyDevotional";
import { ld, sv, TODAY } from "../utils/storage";

export default function TodayTab({ ck, tog, prog, cc, tot, order, onReorder, jo, onChangeJo, removedHabits }) {
  const [expanded, setExpanded] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [overCat, setOverCat] = useState(null);

  const [energy, setEnergy] = useState({ sleep: 0, diet: 0, exercise_e: 0, focus: 0, mood: 0 });
  const [enIdx, setEnIdx] = useState([]);

  const [pastEntries, setPastEntries] = useState([]);
  const [visibleCount, setVisibleCount] = useState(7);
  const [expandedEntries, setExpandedEntries] = useState({});
  const [showPastEntries, setShowPastEntries] = useState(false);

  useEffect(() => {
    (async () => {
      const ji = await ld("jo:index", []);
      const pastDates = ji.filter(d => d !== TODAY).sort((a, b) => new Date(b) - new Date(a));

      const entries = [];
      for (const d of pastDates) {
        const data = await ld(`jo:${d}`, "");
        const entryText = typeof data === "object" && data !== null ? data.text : data;
        if (entryText && typeof entryText === "string" && entryText.trim()) {
          entries.push({ date: d, text: entryText });
        }
      }
      setPastEntries(entries);
    })();
  }, []);

  const toggleEntry = (date) => {
    setExpandedEntries(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const formatDate = (ds) => {
    try {
      const d = new Date(ds + "T12:00:00");
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    } catch {
      return ds;
    }
  };


  useEffect(() => {
    (async () => {
      const [saved, idx] = await Promise.all([ld("en:today", null), ld("en:index", [])]);
      let localIdx = idx || [];
      if (saved && saved._date === TODAY) {
        setEnergy(saved.ratings || { sleep: 0, diet: 0, exercise_e: 0, focus: 0, mood: 0 });
      } else if (saved && saved._date && saved._date !== TODAY) {
        sv(`en:${saved._date}`, saved);
        if (!localIdx.includes(saved._date)) {
          localIdx = [...localIdx, saved._date]; sv("en:index", localIdx);
        }
      }
      setEnIdx(localIdx);
    })();
  }, []);

  const saveEnergy = (k, v) => {
    const next = { ...energy, [k]: v };
    setEnergy(next);
    sv("en:today", { _date: TODAY, ratings: next });
    if (!enIdx.includes(TODAY)) {
      const ni = [...enIdx, TODAY]; setEnIdx(ni); sv("en:index", ni);
    }
  };

  const saveEnergyNote = (k, v) => {
    const noteKey = k + "_note";
    const next = { ...energy, [noteKey]: v };
    setEnergy(next);
    sv("en:today", { _date: TODAY, ratings: next });
    if (!enIdx.includes(TODAY)) {
      const ni = [...enIdx, TODAY]; setEnIdx(ni); sv("en:index", ni);
    }
  };

  const cats = [{ k: "morning", l: "Morning Rhythm", e: "☀️" }, { k: "day", l: "Daytime", e: "⚡" }, { k: "evening", l: "Evening", e: "🌙" }];

  // Build ordered items per category
  const getItemsForCat = (catKey) => {
    return order
      .filter(o => CL.find(c => c.id === o.id))
      .filter(o => o.cat === catKey)
      .map(o => CL.find(c => c.id === o.id))
      .filter(Boolean)
      .filter(c => !removedHabits?.includes(c.id));
  };

  const onDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragOverItem = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragId) setOverId(id);
  };
  const onDragOverCat = (e, catKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCat(catKey);
  };
  const onDropOnItem = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); setOverCat(null); return; }

    const newOrder = [...order];
    const fromIdx = newOrder.findIndex(o => o.id === dragId);
    if (fromIdx === -1) return;
    const itemToMove = newOrder[fromIdx];

    const targetIdx = newOrder.findIndex(o => o.id === targetId);
    if (targetIdx === -1) return;

    itemToMove.cat = newOrder[targetIdx].cat;

    newOrder.splice(fromIdx, 1);
    newOrder.splice(targetIdx, 0, itemToMove);

    onReorder(newOrder);
    setDragId(null); setOverId(null); setOverCat(null);
  };
  const onDropOnCat = (e, catKey) => {
    e.preventDefault();
    if (!dragId) { setDragId(null); setOverId(null); setOverCat(null); return; }

    const newOrder = [...order];
    const fromIdx = newOrder.findIndex(o => o.id === dragId);
    if (fromIdx === -1) return;
    const itemToMove = newOrder[fromIdx];

    itemToMove.cat = catKey;
    newOrder.splice(fromIdx, 1);

    const catItems = newOrder.filter(o => o.cat === catKey);
    const lastCatItem = catItems[catItems.length - 1];
    if (lastCatItem) {
      const insertIdx = newOrder.findIndex(o => o.id === lastCatItem.id) + 1;
      newOrder.splice(insertIdx, 0, itemToMove);
    } else {
      const catOrder = ["morning", "day", "evening"];
      const catIdx = catOrder.indexOf(catKey);
      let insertIdx = newOrder.length;
      for (let ci = catIdx + 1; ci < catOrder.length; ci++) {
        const firstInNext = newOrder.find(o => o.cat === catOrder[ci]);
        if (firstInNext) { insertIdx = newOrder.findIndex(o => o.id === firstInNext.id); break; }
      }
      newOrder.splice(insertIdx, 0, itemToMove);
    }

    onReorder(newOrder);
    setDragId(null); setOverId(null); setOverCat(null);
  };
  const onDragEnd = () => { setDragId(null); setOverId(null); setOverCat(null); };

  const renderItem = (item) => {
    const isExp = expanded === item.id;
    const isDragging = dragId === item.id;
    const isOver = overId === item.id && dragId !== item.id;
    return (
      <div
        key={item.id}
        draggable
        onDragStart={e => onDragStart(e, item.id)}
        onDragOver={e => onDragOverItem(e, item.id)}
        onDrop={e => onDropOnItem(e, item.id)}
        onDragEnd={onDragEnd}
        style={{
          marginBottom: "0.35rem",
          opacity: isDragging ? 0.3 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {isOver && <div style={{ height: 2, background: "#C8A951", borderRadius: 1, marginBottom: 4, opacity: 0.6 }} />}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.6rem", width: "100%",
          background: ck[item.id] ? "rgba(90,138,106,0.06)" : "#14171E",
          border: `1px solid ${ck[item.id] ? "rgba(90,138,106,0.15)" : "rgba(200,169,81,0.08)"}`,
          borderRadius: isExp ? "3px 3px 0 0" : 3,
          padding: "0.85rem 0.8rem",
          fontFamily: "inherit", textAlign: "left", color: "#E8E4DC"
        }}>
          <div style={{ cursor: "grab", color: "#4A4A3A", fontSize: "0.85rem", padding: "0 0.15rem", userSelect: "none", flexShrink: 0, display: "flex", alignItems: "center" }}>⋮⋮</div>
          <div onClick={() => tog(item.id)} style={{ width: 20, height: 20, borderRadius: 3, border: `1.5px solid ${ck[item.id] ? "#5A8A6A" : "rgba(200,169,81,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#5A8A6A", background: ck[item.id] ? "rgba(90,138,106,0.2)" : "none", flexShrink: 0, cursor: "pointer" }}>{ck[item.id] && "✓"}</div>
          <span onClick={() => tog(item.id)} style={{ fontSize: "1rem", cursor: "pointer" }}>{item.emoji}</span>
          <span onClick={() => tog(item.id)} style={{ fontSize: "0.86rem", flex: 1, opacity: ck[item.id] ? 0.5 : 1, textDecoration: ck[item.id] ? "line-through" : "none", cursor: "pointer" }}>{item.label}</span>
          <button onClick={(e) => { e.stopPropagation(); setExpanded(isExp ? null : item.id); }} style={{ background: "none", border: "none", color: "#6A6A5A", fontSize: "0.65rem", cursor: "pointer", fontFamily: "inherit", padding: "0.2rem 0.4rem", borderRadius: 2, letterSpacing: "0.05em", opacity: 0.7 }}>
            {isExp ? "hide" : "what's this?"}
          </button>
        </div>
        {isExp && (
          <div style={{
            background: "rgba(200,169,81,0.03)", border: "1px solid rgba(200,169,81,0.08)", borderTop: "none",
            borderRadius: "0 0 3px 3px", padding: "0.9rem 1rem 0.9rem 3.8rem",
            fontSize: "0.78rem", color: "#8A8678", lineHeight: 1.65
          }}>{item.desc}</div>
        )}
      </div>
    );
  };

  return (<div>
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.72rem", color: "#8A8678", letterSpacing: "0.1em", textTransform: "uppercase" }}>Daily Coherence</span>
        <span style={{ fontSize: "0.85rem", color: "#C8A951" }}>{cc}/{tot}</span>
      </div>
      <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 2, transition: "width 0.4s", width: `${prog}%`, background: prog === 100 ? "linear-gradient(90deg,#5A8A6A,#C8A951)" : "linear-gradient(90deg,#4A6FA5,#C8A951)" }} />
      </div>
      {prog === 100 && <div style={{ textAlign: "center", color: "#C8A951", fontSize: "0.8rem", marginTop: "0.8rem", fontStyle: "italic" }}>✦ All practices complete. Well done, faithful servant.</div>}
    </div>

    {cats.map(cat => {
      const items = getItemsForCat(cat.k);
      const isCatOver = overCat === cat.k && !overId;
      return (
        <div
          key={cat.k}
          onDragOver={e => onDragOverCat(e, cat.k)}
          onDrop={e => onDropOnCat(e, cat.k)}
          style={{
            marginBottom: "1.2rem",
            padding: "0.6rem",
            borderRadius: 4,
            border: isCatOver ? "1px dashed rgba(200,169,81,0.3)" : "1px dashed transparent",
            background: isCatOver ? "rgba(200,169,81,0.03)" : "none",
            transition: "all 0.2s",
            minHeight: 60,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span>{cat.e}</span>
            <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678" }}>{cat.l}</span>
          </div>
          {items.length > 0 ? items.map(renderItem) : (
            <div style={{ padding: "0.8rem", textAlign: "center", fontSize: "0.75rem", color: "#4A4A3A", fontStyle: "italic", border: "1px dashed rgba(200,169,81,0.1)", borderRadius: 3 }}>
              Drag practices here
            </div>
          )}
        </div>
      );
    })}

    {/* Energy Check */}
    <div style={{ marginBottom: "1.2rem", padding: "1rem", borderRadius: 4, background: "rgba(200,169,81,0.03)", border: "1px solid rgba(200,169,81,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
        <span>🔋</span>
        <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678" }}>Energy Check</span>
      </div>
      <div style={{ display: "grid", gap: "0.8rem" }}>
        {[
          { k: "sleep", label: "Sleep", emoji: "💤" },
          { k: "diet", label: "Diet", emoji: "🥗" },
          { k: "exercise_e", label: "Movement", emoji: "🏃" },
          { k: "focus", label: "Focus", emoji: "🎯" },
          { k: "mood", label: "Mood", emoji: "✨" },
        ].map(item => (
          <div key={item.k} style={{ background: "#14171E", padding: "0.6rem 0.8rem", borderRadius: 3, border: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.9rem" }}>{item.emoji}</span>
                <span style={{ fontSize: "0.82rem", color: "#E8E4DC" }}>{item.label}</span>
              </div>
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => saveEnergy(item.k, n)} style={{
                    width: 24, height: 24, border: "none", borderRadius: 2, cursor: "pointer", fontSize: "0.7rem", fontWeight: 500, fontFamily: "inherit",
                    background: energy[item.k] >= n ? "rgba(200,169,81,0.6)" : "rgba(255,255,255,0.04)",
                    color: energy[item.k] >= n ? "#0D0F14" : "#6A6A5A",
                    transition: "all 0.15s"
                  }}>{n}</button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="Add a note..."
              value={energy[item.k + "_note"] || ""}
              onChange={e => saveEnergyNote(item.k, e.target.value)}
              style={{
                width: "100%", marginTop: "6px", padding: "6px 10px", 
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", 
                borderRadius: 4, color: "#8A8678", fontSize: "12px", fontFamily: "DM Sans", outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(200,169,81,0.3)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; }}
            />
          </div>
        ))}
      </div>
    </div>

    {/* Daily Reflection */}
    <div style={{ marginBottom: "2rem", padding: "1rem", borderRadius: 4, background: "rgba(106,90,138,0.05)", border: "1px solid rgba(106,90,138,0.15)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
        <span>📔</span>
        <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#A09ABB" }}>Daily Reflection</span>
      </div>
      <textarea value={jo} onChange={e => onChangeJo(e.target.value)} placeholder="Write freely. Process, pray on paper, notice what's shifting..." rows={8} style={{ width: "100%", background: "#14171E", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3, color: "#E8E4DC", fontFamily: "inherit", fontSize: "0.88rem", padding: "0.9rem", resize: "vertical", lineHeight: 1.7, outline: "none" }} />
    </div>

    {/* Past Entries */}
    {pastEntries.length > 0 && (
      <div style={{ marginBottom: "2rem" }}>
        <div 
          onClick={() => setShowPastEntries(!showPastEntries)} 
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showPastEntries ? "1rem" : 0, cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🕰️</span>
            <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678" }}>Past Entries</span>
          </div>
          <span style={{ color: "#8A8678", fontSize: "0.68rem" }}>{showPastEntries ? "▲" : "▼"}</span>
        </div>
        
        {showPastEntries && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {pastEntries.slice(0, visibleCount).map(({ date, text }) => {
                const isExpanded = expandedEntries[date];
                return (
                  <div
                    key={date}
                    onClick={() => toggleEntry(date)}
                    style={{
                      background: "#14171E",
                      padding: "1rem",
                      borderRadius: 4,
                      border: "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: "#C8A951", marginBottom: "0.5rem", opacity: 0.8 }}>{formatDate(date)}</div>
                    <div style={{
                      fontSize: "0.85rem",
                      color: "#E8E4DC",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      display: isExpanded ? "block" : "-webkit-box",
                      WebkitLineClamp: isExpanded ? "none" : 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {text}
                    </div>
                  </div>
                );
              })}
            </div>
            {visibleCount < pastEntries.length && (
              <button
                onClick={() => setVisibleCount(v => v + 7)}
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  padding: "0.7rem",
                  background: "rgba(200,169,81,0.04)",
                  border: "1px solid rgba(200,169,81,0.15)",
                  borderRadius: 4,
                  color: "#C8A951",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.2s"
                }}
              >
                Show more
              </button>
            )}
          </>
        )}
      </div>
    )}

    <DailyDevotional />
  </div>);
}
