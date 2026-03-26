import { useState } from "react";
import { CL } from "../utils/constants";
import { Quote } from "./shared/UI";
import MonthlyRadarGallery from "./gamification/MonthlyRadarGallery";
import {
  calcLongestStreak,
  calcCurrentStreakFromActiveDays,
  calcPracticeStreak,
  calcPracticeLongest
} from "../utils/streaks";

import HeatmapCalendar from "./tracker/HeatmapCalendar";
import PracticeStreaks from "./tracker/PracticeStreaks";
import PracticeModal from "./tracker/PracticeModal";
import Awards from "./tracker/Awards";
import EditDayModal from "./tracker/EditDayModal";
import StatsRow from "./tracker/StatsRow";

export default function TrackerTab({ history, updateHistoryItem, data, persist, gamification, saveGamification }) {
  const [editingDate, setEditingDate] = useState(null);
  const [viewingPractice, setViewingPractice] = useState(null);

  // Compute stats
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

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Compute Weekly Workout count
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

  // Sabbath logic
  const sabbathWeekKey = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  })();

  const isSabbathObserved = data?.sabbath?.[sabbathWeekKey] === true;
  const totalObservedWeeks = Object.values(data?.sabbath || {}).filter(v => v === true).length;

  const toggleSabbath = () => {
    console.log("toggleSabbath called", sabbathWeekKey, isSabbathObserved);
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

  return (
    <div>
      <MonthlyRadarGallery data={data} CL={CL} />
      
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" }}>
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

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem" }}>
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

      <HeatmapCalendar
        history={history}
        setEditingDate={setEditingDate}
      />

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
