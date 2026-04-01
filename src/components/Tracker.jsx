import { useState, useEffect } from "react";
import { CL } from "../utils/constants";
import { Quote } from "./shared/UI";
import MonthlyRadarGallery from "./gamification/MonthlyRadarGallery";
import BadgeGallery from "./gamification/BadgeGallery";
import {
  calcLongestStreak,
  calcCurrentStreakFromActiveDays,
  calcPracticeStreak,
  calcPracticeLongest
} from "../utils/streaks";

import PracticeStreaks from "./tracker/PracticeStreaks";
import PracticeModal from "./tracker/PracticeModal";
import Awards from "./tracker/Awards";
import EditDayModal from "./tracker/EditDayModal";
import StatsRow from "./tracker/StatsRow";

export default function TrackerTab({ history, updateHistoryItem, data, persist, gamification, saveGamification }) {
  const [editingDate, setEditingDate] = useState(null);
  const [viewingPractice, setViewingPractice] = useState(null);
  const [calendarOffset, setCalendarOffset] = useState(0);

  const sabbathWeekKey = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  })();

  const [csData, setCsData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("beautiful-life-os-v3")) || {};
      return saved.connectServe || { weekly: {} };
    } catch {
      return { weekly: {} };
    }
  });

  const updateCs = (delta) => {
    const currentCount = csData.weekly?.[sabbathWeekKey] || 0;
    const nextCount = Math.max(0, currentCount + delta);
    const nextCsData = { ...csData, weekly: { ...csData.weekly, [sabbathWeekKey]: nextCount } };
    setCsData(nextCsData);
    try {
      const full = JSON.parse(localStorage.getItem("beautiful-life-os-v3")) || {};
      full.connectServe = nextCsData;
      localStorage.setItem("beautiful-life-os-v3", JSON.stringify(full));
    } catch (e) {
      console.error("Error saving connectServe", e);
    }
  };

  const csCount = csData.weekly?.[sabbathWeekKey] || 0;

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const getMonthlyPerPillar = () => {
    const perPillar = {};
    if (!data?.habits) return perPillar;
    
    Object.keys(data.habits).forEach(date => {
      if (!date.startsWith(currentMonthKey)) return;
      const habitsDay = data.habits[date] || {};
      const deepworkCount = ["deepwork1","deepwork2","deepwork3"].filter(id => habitsDay[id]).length;
      
      Object.entries(habitsDay).forEach(([habitId, isCompleted]) => {
        if (!isCompleted) return;
        const hDef = CL.find(c => c.id === habitId);
        if (!hDef || !hDef.pillar) return;
        if (hDef.pillar === "Work" && deepworkCount < 2) return;
        if (habitId === "exercise") return;
        perPillar[hDef.pillar] = (perPillar[hDef.pillar] || 0) + (hDef.xp || 0);
      });
    });

    if (data.sabbath) {
      Object.entries(data.sabbath).forEach(([k, v]) => {
        if (v && k.startsWith(currentMonthKey.slice(0,7))) {
          perPillar["Sabbath"] = (perPillar["Sabbath"] || 0) + 150;
        }
      });
    }

    return perPillar;
  };

  const monthlyPerPillar = getMonthlyPerPillar();

  const BADGE_THRESHOLD = 500;
  const PILLARS = ["Surrender","Imagination","Identity","Health","Work","Generosity","Sabbath"];

  const [badgeStreaks, setBadgeStreaks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("blos-badge-streaks")) || {}; }
    catch { return {}; }
  });

  useEffect(() => {
    const updated = { ...badgeStreaks };
    let changed = false;
    
    PILLARS.forEach(pillar => {
      const xp = monthlyPerPillar[pillar] || 0;
      const existing = updated[pillar] || { streak: 0, lastEarnedMonth: null };
      
      if (xp >= BADGE_THRESHOLD && existing.lastEarnedMonth !== currentMonthKey) {
        const prevMonth = new Date();
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        const prevMonthKey = prevMonth.toISOString().slice(0, 7);
        
        const newStreak = existing.lastEarnedMonth === prevMonthKey 
          ? existing.streak + 1 
          : 1;
        
        updated[pillar] = { streak: newStreak, lastEarnedMonth: currentMonthKey };
        changed = true;
      }
    });
    
    if (changed) {
      setBadgeStreaks(updated);
      localStorage.setItem("blos-badge-streaks", JSON.stringify(updated));
    }
  }, [monthlyPerPillar]);

  const days = Object.keys(history).sort();
  const activeDays = days.filter(d => history[d].count > 0);
  const perfectDays = days.filter(d => history[d].count === history[d].total);
  const totalPerfect = perfectDays.length;

  const longestStreak = calcLongestStreak(activeDays);
  const currentStreak = calcCurrentStreakFromActiveDays(activeDays);

  const practiceStats = CL.map(c => ({
    ...c,
    current: calcPracticeStreak(c.id, days, history),
    best: calcPracticeLongest(c.id, days, history),
    totalDays: days.filter(d => history[d].items && history[d].items.includes(c.id)).length
  }));

  const getAward = (streak) => {
    if (streak >= 365) return { icon: "\u{1F451}", title: "Year of the Lord", desc: "365 perfect days", color: "#C8A951" };
    if (streak >= 100) return { icon: "\u{1F525}", title: "Refined by Fire", desc: "100 perfect days", color: "#E8743A" };
    if (streak >= 60) return { icon: "\u26A1", title: "Lightning Rod", desc: "60 perfect days", color: "#4A6FA5" };
    if (streak >= 30) return { icon: "\u{1F30A}", title: "Living Water", desc: "30 perfect days", color: "#4A8FA5" };
    if (streak >= 14) return { icon: "\u{1F33F}", title: "Deep Roots", desc: "14 perfect days", color: "#5A8A6A" };
    if (streak >= 7) return { icon: "\u{1F54A}\uFE0F", title: "Sabbath Complete", desc: "7 perfect days", color: "#A09ABB" };
    if (streak >= 3) return { icon: "\u{1F331}", title: "Mustard Seed", desc: "3 perfect days", color: "#7A9A6A" };
    if (streak >= 1) return { icon: "\u2726", title: "First Fruits", desc: "Day 1 complete", color: "#C8A951" };
    return null;
  };

  const allAwards = [
    { need: 1, ...getAward(1) },
    { need: 3, ...getAward(3) },
    { need: 7, ...getAward(7) },
    { need: 14, ...getAward(14) },
    { need: 30, ...getAward(30) },
    { need: 60, ...getAward(60) },
    { need: 100, ...getAward(100) },
    { need: 365, ...getAward(365) },
  ];

  const currentAward = getAward(currentStreak);
  const nextAward = allAwards.find(a => a.need > currentStreak);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const getWeekStart = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const d = new Date(todayStr + "T12:00:00Z");
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setUTCDate(diff);
    return monday;
  };

  const weekStart = getWeekStart();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setUTCDate(weekStart.getUTCDate() + i);
    return d.toISOString().split("T")[0];
  });
  
  const moveCount = weekDates.filter(dateKey => data.habits?.[dateKey]?.["exercise"] === true).length;

  const isSabbathObserved = data?.sabbath?.[sabbathWeekKey] === true;
  const totalObservedWeeks = Object.values(data?.sabbath || {}).filter(v => v === true).length;

  const toggleSabbath = () => {
    if (!data || !persist) return;
    const newState = !isSabbathObserved;
    persist({ ...data, sabbath: { ...data.sabbath, [sabbathWeekKey]: newState }});
    if (newState && !data.sabbath?.[sabbathWeekKey]) {
      const updated = {
        ...gamification,
        totalXP: (gamification.totalXP || 0) + 150,
        perPillar: { ...gamification.perPillar, Sabbath: (gamification.perPillar?.Sabbath || 0) + 150 }
      };
      saveGamification(updated);
    }
  };

  // Calendar logic directly in Tracker
  const getHeatColor = (count, total, isFuture) => {
    if (isFuture) return "transparent";
    if (count === 0) return "rgba(255,255,255,0.04)";
    if (count === total) return "#C8A951";
    const ratio = count / total;
    if (ratio >= 0.7) return "rgba(200,169,81,0.5)";
    if (ratio >= 0.4) return "rgba(200,169,81,0.25)";
    return "rgba(200,169,81,0.12)";
  };

  const getMonthData = (offset) => {
    const d = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  const displayMonths = [getMonthData(calendarOffset + 1), getMonthData(calendarOffset)];
  const dayHeaders = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div>
      <BadgeGallery 
        unlockedBadges={PILLARS.filter(p => (monthlyPerPillar[p] || 0) >= BADGE_THRESHOLD)}
        perPillar={monthlyPerPillar}
        badgeStreaks={badgeStreaks}
      />
      
      <MonthlyRadarGallery data={data} CL={CL} />
      
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '16px', width: '100%', marginBottom: '1.5rem' }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "1rem", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "10px", color: "#C8A951", letterSpacing: "0.15em", textTransform: "uppercase" }}>MOVEMENT THIS WEEK</span>
            <span style={{ fontSize: "10px", color: "#C8A951" }}>{moveCount} / 7</span>
          </div>
          <div style={{ fontSize: "9px", color: "#8A8678", marginBottom: "1rem" }}>
            Base 4 · Bull 5
          </div>
          <div style={{ position: "relative", width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", borderRadius: "3px", width: `${(moveCount / 7) * 100}%`, background: moveCount < 4 ? "rgba(200,169,81,0.4)" : moveCount < 5 ? "#5A8A6A" : "#C8A951", transition: "width 0.4s ease" }} />
            <div style={{ position: "absolute", top: 0, left: `${(4/7)*100}%`, width: "2px", height: "100%", background: "rgba(255,255,255,0.3)" }} />
            <div style={{ position: "absolute", top: 0, left: `${(5/7)*100}%`, width: "2px", height: "100%", background: "rgba(255,255,255,0.3)" }} />
          </div>
          <div style={{ marginTop: "0.8rem", fontSize: "11px", color: moveCount < 4 ? "#8A8678" : moveCount === 4 ? "#5A8A6A" : "#C8A951" }}>
            {moveCount < 4 ? `Keep pushing — ${4 - moveCount} more to hit base` : moveCount === 4 ? "Base case hit ✓" : "Bull case hit ⚡"}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "1rem", flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "10px", color: "#C8A951", letterSpacing: "0.15em", textTransform: "uppercase" }}>SABBATH THIS WEEK</span>
          </div>
          <button
            onClick={toggleSabbath}
            style={{
              width: "100%",
              borderRadius: 6,
              padding: "0.7rem",
              cursor: "pointer",
              transition: "0.2s",
              background: isSabbathObserved ? "rgba(200,169,81,0.08)" : "rgba(255,255,255,0.02)",
              border: isSabbathObserved ? "1px solid rgba(200,169,81,0.3)" : "1px solid rgba(255,255,255,0.06)",
              color: isSabbathObserved ? "#C8A951" : "#8A8678",
              fontSize: "0.85rem",
              fontFamily: "inherit",
              display: "block",
              textAlign: "center"
            }}
          >
            {isSabbathObserved ? "🕊️ Rest day observed" : "Did you observe a rest day?"}
          </button>
          <div style={{ marginTop: "0.8rem", fontSize: "9px", color: "#8A8678" }}>
            {totalObservedWeeks} weeks of Sabbath kept
          </div>
        </div>

        <div style={{ 
          background: "#14171E", 
          border: "1px solid rgba(200,169,81,0.08)", 
          borderRadius: "4px", 
          padding: "1.25rem", 
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          position: "relative",
          flex: 1,
          minWidth: 0
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.65rem", color: "#C8A951", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.3rem" }}>
                CONNECT / SERVE THIS WEEK
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#E8E4DC" }}>
                {csCount}
              </div>
            </div>
            {csCount >= 2 && (
              <div style={{ 
                background: "rgba(200,169,81,0.1)", 
                border: "1px solid rgba(200,169,81,0.3)", 
                color: "#C8A951", 
                fontSize: "0.65rem", 
                padding: "3px 6px", 
                borderRadius: "3px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                ✓ Week Complete
              </div>
            )}
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#8A8678" }}>{csCount} / 2 this week</span>
            </div>
            <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ 
                width: `${Math.min(100, (csCount / 2) * 100)}%`, 
                height: "100%", 
                background: csCount >= 2 ? "#C8A951" : "rgba(200,169,81,0.3)", 
                transition: "width 0.3s ease" 
              }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button 
              onClick={() => updateCs(-1)}
              style={{
                flex: 1,
                padding: "0.6rem",
                background: "rgba(200,169,81,0.03)",
                border: "1px solid rgba(200,169,81,0.08)",
                color: "rgba(200,169,81,0.4)",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              -1
            </button>
            <button 
              onClick={() => updateCs(1)}
              style={{
                flex: 1,
                padding: "0.6rem",
                background: "rgba(200,169,81,0.1)",
                border: "1px solid rgba(200,169,81,0.2)",
                color: "#C8A951",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              +1
            </button>
          </div>
        </div>
      </div>

      <Awards
        currentAward={currentAward}
        nextAward={nextAward}
        allAwards={allAwards}
        longestStreak={longestStreak}
        currentStreak={currentStreak}
      />

      <StatsRow
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        totalPerfect={totalPerfect}
      />

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.8rem" }}>
          <button 
            onClick={() => setCalendarOffset(prev => prev + 1)}
            style={{ background: "none", border: "none", color: "#C8A951", fontSize: "1.2rem", cursor: "pointer", transition: "0.2s", padding: 0 }}
          >
            ‹
          </button>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678" }}>YOUR JOURNEY</div>
          <button 
            onClick={() => setCalendarOffset(prev => Math.max(0, prev - 1))}
            disabled={calendarOffset === 0}
            style={{ background: "none", border: "none", color: "#C8A951", fontSize: "1.2rem", cursor: calendarOffset === 0 ? "default" : "pointer", opacity: calendarOffset === 0 ? 0.3 : 1, transition: "0.2s", padding: 0 }}
          >
            ›
          </button>
        </div>

        <div style={{ display: "flex", gap: "24px" }}>
          {displayMonths.map((m, mi) => {
            const firstDay = new Date(m.year, m.month, 1);
            const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
            const startDow = (firstDay.getDay() + 6) % 7;
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
              <div key={mi} style={{ flex: 1 }}>
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

      <PracticeStreaks
        practiceStats={practiceStats}
        days={days}
        history={history}
        todayStr={todayStr}
        setViewingPractice={setViewingPractice}
      />

      <Quote text={"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."} ref="Galatians 6:9" />

      {editingDate && (
        <EditDayModal
          editingDate={editingDate}
          setEditingDate={setEditingDate}
          history={history}
          updateHistoryItem={updateHistoryItem}
        />
      )}

      {viewingPractice && (
        <PracticeModal
          p={viewingPractice}
          days={days}
          history={history}
          today={today}
          setViewingPractice={setViewingPractice}
        />
      )}

    </div>
  );
}
