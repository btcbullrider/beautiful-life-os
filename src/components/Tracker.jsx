import { useState } from "react";
import { CL } from "../utils/constants";
import { Quote } from "./shared/UI";

export default function TrackerTab({ history, updateHistoryItem }) {
  const [editingDate, setEditingDate] = useState(null);
  const [viewingPractice, setViewingPractice] = useState(null);

  // Compute stats
  const days = Object.keys(history).sort();
  const activeDays = days.filter(d => history[d].count > 0);
  const perfectDays = days.filter(d => history[d].count === history[d].total);
  const totalPerfect = perfectDays.length;

  // Longest streak (any activity)
  const calcLongestStreak = (datelist) => {
    if (!datelist.length) return 0;
    const sorted = [...datelist].sort();
    let max = 1, cur = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + "T12:00:00");
      const curr = new Date(sorted[i] + "T12:00:00");
      const diff = (curr - prev) / 86400000;
      if (diff === 1) { cur++; max = Math.max(max, cur); }
      else { cur = 1; }
    }
    return Math.max(max, cur);
  };
  const longestStreak = calcLongestStreak(activeDays);

  // Current streak (any activity, derived from history)
  const calcCurrentStreak = (datelist) => {
    if (!datelist.length) return 0;
    const sorted = [...datelist].sort().reverse();
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);
    if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + "T12:00:00");
      const curr = new Date(sorted[i] + "T12:00:00");
      const diff = (prev - curr) / 86400000;
      if (diff === 1) count++;
      else break;
    }
    return count;
  };
  const currentStreak = calcCurrentStreak(activeDays);

  // Per-practice streaks (current)
  const calcPracticeStreak = (practiceId) => {
    const sorted = [...days].sort().reverse();
    let count = 0;
    for (const d of sorted) {
      if (history[d].items && history[d].items.includes(practiceId)) count++;
      else break;
    }
    return count;
  };
  // Per-practice longest streak
  const calcPracticeLongest = (practiceId) => {
    const sorted = [...days].sort();
    if (!sorted.length) return 0;
    let max = 0, cur = 0, lastDate = null;
    for (const d of sorted) {
      if (history[d].items && history[d].items.includes(practiceId)) {
        if (lastDate) {
          const diff = (new Date(d + "T12:00:00") - new Date(lastDate + "T12:00:00")) / 86400000;
          cur = diff === 1 ? cur + 1 : 1;
        } else { cur = 1; }
        max = Math.max(max, cur);
        lastDate = d;
      } else { cur = 0; lastDate = null; }
    }
    return max;
  };

  const practiceStats = CL.map(c => ({
    ...c,
    current: calcPracticeStreak(c.id),
    best: calcPracticeLongest(c.id),
    totalDays: days.filter(d => history[d].items && history[d].items.includes(c.id)).length
  }));

  // Awards system
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

  // Calendar heatmap: from first entry to current month
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

  return (<div>
    {/* Current Award Banner */}
    {currentAward && (
      <div style={{ textAlign: "center", padding: "1.5rem", marginBottom: "1.5rem", background: `linear-gradient(135deg, ${currentAward.color}10, ${currentAward.color}05)`, border: `1px solid ${currentAward.color}30`, borderRadius: 3 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{currentAward.icon}</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 500, color: currentAward.color, marginBottom: "0.15rem" }}>{currentAward.title}</div>
        <div style={{ fontSize: "0.75rem", color: "#8A8678" }}>{currentStreak} day streak — {currentAward.desc}</div>
        {nextAward && <div style={{ fontSize: "0.7rem", color: "#6A6A5A", marginTop: "0.5rem" }}>{nextAward.need - currentStreak} days until &quot;{nextAward.title}&quot; {nextAward.icon}</div>}
      </div>
    )}

    {/* Stats row */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(200,169,81,0.1)", borderRadius: 2, overflow: "hidden", marginBottom: "1.5rem" }}>
      {[
        { label: "Current Streak", value: currentStreak, sub: "days" },
        { label: "Longest Streak", value: longestStreak, sub: "PR" },
        { label: "Perfect Days", value: totalPerfect, sub: "total" },
      ].map((s, i) => (
        <div key={i} style={{ background: "#14171E", padding: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#C8A951" }}>{s.value}</div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8678" }}>{s.label}</div>
          <div style={{ fontSize: "0.55rem", color: "#5A5A4A" }}>{s.sub}</div>
        </div>
      ))}
    </div>

    {/* Calendar Heatmap */}
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

    {/* Per-practice streaks */}
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678", marginBottom: "0.6rem" }}>Practice Streaks</div>
      {practiceStats.map(p => {
        const isPR = p.current > 0 && p.current >= p.best;

        // 1. COMEBACK NUDGES
        let nudge = null;
        if (p.current === 0 && p.best > 0) {
          const pDays = days.filter(d => history[d].items && history[d].items.includes(p.id));
          let daysSinceLast = 0;
          if (pDays.length > 0) {
            const lastDate = pDays[pDays.length - 1]; // sorted ascending earlier
            const diffTime = new Date(todayStr + "T12:00:00") - new Date(lastDate + "T12:00:00");
            daysSinceLast = Math.floor(diffTime / 86400000);
          }
          if (daysSinceLast >= 5) {
            nudge = <span style={{ color: "#C85A5A", fontSize: "0.6rem", fontStyle: "italic", opacity: 0.9 }}>{daysSinceLast} days since last</span>;
          } else {
            nudge = <span style={{ color: "#D48B47", fontSize: "0.6rem", fontStyle: "italic", opacity: 0.9 }}>2 days to restart streak</span>;
          }
        }

        // 2. CONSISTENCY TIERS
        const totalTracked = days.length;
        const rateRate = totalTracked > 0 ? (p.totalDays / totalTracked) : 0;
        const ratePct = Math.round(rateRate * 100);
        let badge = null;
        if (rateRate >= 0.9) badge = { icon: "👑", color: "#C8A951" };
        else if (rateRate >= 0.7) badge = { icon: "🥈", color: "#C0C0C0" };
        else if (rateRate >= 0.5) badge = { icon: "🥉", color: "#CD7F32" };

        // 3. MILESTONE CELEBRATIONS
        const milestones = [10, 25, 50, 100, 200];
        let milestoneBadge = null;
        if (milestones.includes(p.totalDays)) {
          const didToday = history[todayStr] && history[todayStr].items && history[todayStr].items.includes(p.id);
          if (didToday) {
            milestoneBadge = <span style={{ background: "rgba(200,169,81,0.15)", color: "#C8A951", padding: "0.15rem 0.4rem", borderRadius: 3, fontSize: "0.6rem", fontWeight: 600, border: "1px solid rgba(200,169,81,0.4)", boxShadow: "0 0 8px rgba(200,169,81,0.3)" }}>{p.totalDays} days! 🎉</span>;
          } else {
            milestoneBadge = <span style={{ background: "rgba(255,255,255,0.05)", color: "#8A8678", padding: "0.15rem 0.4rem", borderRadius: 3, fontSize: "0.6rem", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 500 }}>{p.totalDays} days</span>;
          }
        }

        return (
          <div key={p.id} onClick={() => setViewingPractice(p)} style={{ cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.7rem 0.9rem", background: "#14171E", border: `1px solid ${isPR && p.current > 1 ? "rgba(200,169,81,0.2)" : "rgba(200,169,81,0.06)"}`, borderRadius: 3, marginBottom: "0.3rem" }}>
            <span style={{ fontSize: "0.95rem", width: 28, textAlign: "center" }}>{p.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 400 }}>{p.label}</span>
                {badge && (
                  <span style={{ fontSize: "0.6rem", display: "flex", alignItems: "center", gap: "0.2rem", padding: "0.1rem 0.3rem", background: "rgba(255,255,255,0.03)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "0.7rem", lineHeight: 1 }}>{badge.icon}</span>
                    <span style={{ color: badge.color, fontWeight: 600 }}>{ratePct}%</span>
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.15rem" }}>
                {milestoneBadge ? milestoneBadge : <span style={{ fontSize: "0.65rem", color: "#6A6A5A" }}>{p.totalDays} total days</span>}
                {nudge && (
                  <>
                    <span style={{ fontSize: "0.5rem", color: "#4A4A3A" }}>•</span>
                    {nudge}
                  </>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: isPR && p.current > 1 ? "#C8A951" : "#8A8678" }}>
                {p.current}{isPR && p.current > 1 && " \u{1F525}"}
              </div>
              <div style={{ fontSize: "0.55rem", color: "#5A5A4A" }}>best: {p.best}</div>
            </div>
          </div>
        );
      })}
    </div>

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

    <Quote text={"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."} ref="Galatians 6:9" />

    {/* Edit Modal */}
    {editingDate && (
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
                  onClick={() => updateHistoryItem(editingDate, c.id, !isChecked)}
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
    )}

    {/* Practice Analytics Modal */}
    {viewingPractice && (() => {
      const p = viewingPractice;
      const totalTracked = days.length;
      const completionRate = totalTracked > 0 ? Math.round((p.totalDays / totalTracked) * 100) : 0;

      const last90 = [];
      for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        last90.push(d.toISOString().slice(0, 10));
      }

      const dowCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      const dowTotals = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      days.forEach(d => {
        const dateObj = new Date(d + "T12:00:00");
        const dow = dateObj.getDay();
        dowTotals[dow]++;
        if (history[d] && history[d].items && history[d].items.includes(p.id)) {
          dowCounts[dow]++;
        }
      });
      const dowOrder = [1, 2, 3, 4, 5, 6, 0];
      const dowNames = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };

      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        const done = history[ds] && history[ds].items && history[ds].items.includes(p.id);
        last7.push({ date: ds, done, label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()] });
      }

      return (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(13,15,20,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setViewingPractice(null)}
        >
          <div
            style={{ background: "#14171E", border: "1px solid rgba(200,169,81,0.2)", borderRadius: 4, width: "100%", maxWidth: 450, padding: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ fontSize: "2rem" }}>{p.emoji}</div>
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 500, color: "#E8E4DC" }}>{p.label}</div>
                  <div style={{ fontSize: "0.8rem", color: "#C8A951" }}>Current Streak: {p.current} 🔥</div>
                </div>
              </div>
              <button onClick={() => setViewingPractice(null)} style={{ background: "none", border: "none", color: "#8A8678", fontSize: "1.5rem", cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Current", value: p.current },
                { label: "Best", value: p.best },
                { label: "Total", value: p.totalDays },
                { label: "Rate", value: completionRate + "%" }
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3, padding: "0.8rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "#C8A951", marginBottom: "0.2rem" }}>{s.value}</div>
                  <div style={{ fontSize: "0.6rem", color: "#8A8678", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Last 7 Days Row */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#8A8678", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Last 7 Days</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {last7.map((d, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                    <div style={{ fontSize: "0.6rem", color: "#6A6A5A" }}>{d.label}</div>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: d.done ? "rgba(200,169,81,0.15)" : "rgba(255,255,255,0.02)", border: d.done ? "1px solid rgba(200,169,81,0.3)" : "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: d.done ? "#C8A951" : "#4A4A3A", fontSize: "0.9rem" }}>
                      {d.done ? "✓" : "×"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Pattern */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#8A8678", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Weekly Pattern</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.3rem" }}>
                {dowOrder.map((dow, i) => {
                  const r = dowTotals[dow] > 0 ? Math.round((dowCounts[dow] / dowTotals[dow]) * 100) : 0;
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ height: 50, width: "100%", background: "rgba(255,255,255,0.02)", borderRadius: 2, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                        <div style={{ width: "100%", background: "#C8A951", height: `${r}%`, opacity: 0.7 }} />
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "#8A8678", marginTop: "0.4rem" }}>{dowNames[dow]}</div>
                      <div style={{ fontSize: "0.6rem", color: "#C8A951", fontWeight: 500 }}>{r}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Last 90 Days Heatmap */}
            <div>
              <div style={{ fontSize: "0.7rem", color: "#8A8678", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem" }}>Last 90 Days Heatmap</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 1fr)", gap: "3px" }}>
                {last90.map((d, i) => {
                  const done = history[d] && history[d].items && history[d].items.includes(p.id);
                  return (
                    <div key={i} title={`${d}: ${done ? 'Done' : 'Missed'}`} style={{ width: "100%", aspectRatio: "1", borderRadius: "2px", background: done ? "#C8A951" : "rgba(255,255,255,0.03)" }} />
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      );
    })()}

  </div>);
}
