import { useState, useEffect } from "react";
import { CL } from "../utils/constants";
import DailyDevotional from "./DailyDevotional";
import { ld, sv, TODAY } from "../utils/storage";
import HabitGroup from "./today/HabitGroup";
import EnergyCheck from "./today/EnergyCheck";
import DailyChallenges from "./DailyChallenges";

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

  return (<div>
    <DailyChallenges ck={ck} />
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

    {cats.map(cat => (
      <HabitGroup 
        key={cat.k}
        catKey={cat.k}
        title={cat.l}
        emoji={cat.e}
        items={getItemsForCat(cat.k)}
        habits={ck}
        onToggle={tog}
        onReorder={onReorder}
        todayKey={TODAY}
        expanded={expanded}
        setExpanded={setExpanded}
        dragId={dragId}
        overId={overId}
        overCat={overCat}
        onDragStart={onDragStart}
        onDragOverItem={onDragOverItem}
        onDropOnItem={onDropOnItem}
        onDragEnd={onDragEnd}
        onDragOverCat={onDragOverCat}
        onDropOnCat={onDropOnCat}
      />
    ))}

    <EnergyCheck 
      energy={energy} 
      onScore={saveEnergy} 
      onNote={saveEnergyNote} 
      todayKey={TODAY} 
    />

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
