import { useState } from "react";
import { CL } from "../utils/constants";
import { Quote } from "./shared/UI";
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

export default function TrackerTab({ history, updateHistoryItem }) {
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

  return (
    <div>
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
