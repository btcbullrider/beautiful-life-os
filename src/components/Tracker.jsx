import { TODAY } from "../utils/storage";
import { useState } from "react";
import { CL } from "../utils/constants";

export default function TrackerTab({ history }) {
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
      const prev = new Date(sorted[i-1]+"T12:00:00");
      const curr = new Date(sorted[i]+"T12:00:00");
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
      const prev = new Date(sorted[i-1] + "T12:00:00");
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
          const diff = (new Date(d+"T12:00:00") - new Date(lastDate+"T12:00:00")) / 86400000;
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
    if (streak >= 365) return { icon: "👑", title: "Year of the Lord", desc: "365 perfect days", color: "#C8A951" };
    if (streak >= 100) return { icon: "🔥", title: "Refined by Fire", desc: "100 perfect days", color: "#E8743A" };
    if (streak >= 60) return { icon: "⚡", title: "Lightning Rod", desc: "60 perfect days", color: "#4A6FA5" };
    if (streak >= 30) return { icon: "🌊", title: "Living Water", desc: "30 perfect days", color: "#4A8FA5" };
    if (streak >= 14) return { icon: "🌿", title: "Deep Roots", desc: "14 perfect days", color: "#5A8A6A" };
    if (streak >= 7) return { icon: "🕊️", title: "Sabbath Complete", desc: "7 perfect days", color: "#A09ABB" };
    if (streak >= 3) return { icon: "🌱", title: "Mustard Seed", desc: "3 perfect days", color: "#7A9A6A" };
    if (streak >= 1) return { icon: "✦", title: "First Fruits", desc: "Day 1 complete", color: "#C8A951" };
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

  // Heatmap: last 12 weeks
  const heatmapWeeks = 12;
  const heatmapDays = [];
  const today = new Date();
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() - (heatmapWeeks * 7 - 1) - startDay.getDay());
  for (let i = 0; i < heatmapWeeks * 7; i++) {
    const d = new Date(startDay);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    const isFuture = d > today;
    const entry = history[ds];
    heatmapDays.push({ date: ds, day: d.getDay(), isFuture, count: entry ? entry.count : 0, total: entry ? entry.total : CL.length, perfect: entry ? entry.count === entry.total : false });
  }

  const weeks = [];
  for (let i = 0; i < heatmapDays.length; i += 7) weeks.push(heatmapDays.slice(i, i + 7));

  const getHeatColor = (day) => {
    if (day.isFuture) return "rgba(255,255,255,0.02)";
    if (day.count === 0) return "rgba(255,255,255,0.04)";
    if (day.perfect) return "#C8A951";
    const ratio = day.count / day.total;
    if (ratio >= 0.7) return "rgba(200,169,81,0.5)";
    if (ratio >= 0.4) return "rgba(200,169,81,0.25)";
    return "rgba(200,169,81,0.12)";
  };

  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const d = new Date(week[0].date + "T12:00:00");
    if (d.getMonth() !== lastMonth) {
      monthLabels.push({ idx: wi, label: d.toLocaleDateString("en-US", { month: "short" }) });
      lastMonth = d.getMonth();
    }
  });

  return (<div>
    {/* Current Award Banner */}
    {currentAward && (
      <div style={{ textAlign: "center", padding: "1.5rem", marginBottom: "1.5rem", background: `linear-gradient(135deg, ${currentAward.color}10, ${currentAward.color}05)`, border: `1px solid ${currentAward.color}30`, borderRadius: 3 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{currentAward.icon}</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 500, color: currentAward.color, marginBottom: "0.15rem" }}>{currentAward.title}</div>
        <div style={{ fontSize: "0.75rem", color: "#8A8678" }}>{currentStreak} day streak — {currentAward.desc}</div>
        {nextAward && <div style={{ fontSize: "0.7rem", color: "#6A6A5A", marginTop: "0.5rem" }}>{nextAward.need - currentStreak} days until "{nextAward.title}" {nextAward.icon}</div>}
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

    {/* Heatmap */}
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678", marginBottom: "0.8rem" }}>Last {heatmapWeeks} weeks</div>
      <div style={{ position: "relative" }}>
        {/* Month labels */}
        <div style={{ display: "flex", paddingLeft: 28, marginBottom: "0.3rem" }}>
          {weeks.map((_, wi) => {
            const ml = monthLabels.find(m => m.idx === wi);
            return <div key={wi} style={{ flex: 1, fontSize: "0.55rem", color: "#6A6A5A" }}>{ml ? ml.label : ""}</div>;
          })}
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {/* Day labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 4, justifyContent: "space-around" }}>
            {["", "M", "", "W", "", "F", ""].map((l, i) => <div key={i} style={{ height: 12, fontSize: "0.5rem", color: "#5A5A4A", display: "flex", alignItems: "center" }}>{l}</div>)}
          </div>
          {/* Grid */}
          <div style={{ display: "flex", gap: 2, flex: 1 }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                {week.map((day, di) => (
                  <div key={di} title={day.isFuture ? "" : `${day.date}: ${day.count}/${day.total}`} style={{
                    aspectRatio: "1", borderRadius: 2, background: getHeatColor(day),
                    border: day.date === TODAY ? "1.5px solid #C8A951" : "none",
                    minHeight: 12
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <span style={{ fontSize: "0.5rem", color: "#5A5A4A" }}>Less</span>
          {["rgba(255,255,255,0.04)", "rgba(200,169,81,0.12)", "rgba(200,169,81,0.25)", "rgba(200,169,81,0.5)", "#C8A951"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: 1, background: c }} />
          ))}
          <span style={{ fontSize: "0.5rem", color: "#5A5A4A" }}>More</span>
        </div>
      </div>
    </div>

    {/* Per-practice streaks */}
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678", marginBottom: "0.6rem" }}>Practice Streaks</div>
      {practiceStats.map(p => {
        const isPR = p.current > 0 && p.current >= p.best;
        return (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.7rem 0.9rem", background: "#14171E", border: `1px solid ${isPR && p.current > 1 ? "rgba(200,169,81,0.2)" : "rgba(200,169,81,0.06)"}`, borderRadius: 3, marginBottom: "0.3rem" }}>
            <span style={{ fontSize: "0.95rem", width: 28, textAlign: "center" }}>{p.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 400 }}>{p.label}</div>
              <div style={{ fontSize: "0.65rem", color: "#6A6A5A" }}>{p.totalDays} total days</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: isPR && p.current > 1 ? "#C8A951" : "#8A8678" }}>
                {p.current}{isPR && p.current > 1 && " 🔥"}
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

    <Quote text={'"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."'} ref="Galatians 6:9" />
  </div>);
}

// ════════════════════════════════════════
// WEEKLY REVIEW TAB
// ════════════════════════════════════════
