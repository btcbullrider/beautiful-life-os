export const calcCurrentStreak = (history) => {
  const days = Object.keys(history).sort().reverse();
  const active = days.filter(d => history[d].count > 0);
  if (!active.length) return 0;
  const sorted = [...active].sort().reverse();
  const todayStr = new Date().toISOString().slice(0, 10);
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const ydStr = yd.toISOString().slice(0, 10);
  if (sorted[0] !== todayStr && sorted[0] !== ydStr) return 0;
  let count = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T12:00:00");
    const curr = new Date(sorted[i] + "T12:00:00");
    if ((prev - curr) / 86400000 === 1) count++;
    else break;
  }
  return count;
};

// Longest streak (any activity)
export const calcLongestStreak = (datelist) => {
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

// Current streak (any activity, derived from history)
export const calcCurrentStreakFromActiveDays = (datelist) => {
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

// Per-practice streaks (current)
export const calcPracticeStreak = (practiceId, days, history) => {
  const sorted = [...days].sort().reverse();
  let count = 0;
  for (const d of sorted) {
    if (history[d].items && history[d].items.includes(practiceId)) count++;
    else break;
  }
  return count;
};

// Per-practice longest streak
export const calcPracticeLongest = (practiceId, days, history) => {
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
