import React from 'react';
import AttributesWeb from '../gamification/AttributesWeb';

export default function MonthlyRadarGallery({ data, CL }) {
  if (!data?.habits || Object.keys(data.habits).length === 0) {
    return (
      <div style={{ padding: "2rem 0" }}>
        <div style={{ fontSize: "10px", color: "#C8A951", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
          MONTHLY ATTRIBUTES
        </div>
        <div style={{ color: "#8A8678", fontSize: "0.85rem", fontStyle: "italic" }}>
          Complete habits to see your monthly attributes
        </div>
      </div>
    );
  }

  const monthsMap = {}; 
  
  const getMonday = (dStr) => {
    const d2 = new Date(dStr);
    d2.setHours(0,0,0,0);
    const day = d2.getDay();
    const diff = d2.getDate() - day + (day === 0 ? -6 : 1);
    const mDate = new Date(d2.setDate(diff));
    return `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}-${String(mDate.getDate()).padStart(2, '0')}`;
  };

  Object.keys(data.habits).forEach(date => {
    const monthKey = date.slice(0, 7);
    if (!monthsMap[monthKey]) monthsMap[monthKey] = { perPillar: {}, dates: [] };
    monthsMap[monthKey].dates.push(date);
  });

  Object.keys(monthsMap).forEach(monthKey => {
    const monthData = monthsMap[monthKey];
    const { perPillar } = monthData;
    const weeksInMonth = {};

    monthData.dates.forEach(date => {
      const habitsDay = data.habits[date] || {};
      const deepworkCount = ["deepwork1", "deepwork2", "deepwork3"].filter(id => habitsDay[id]).length;

      Object.entries(habitsDay).forEach(([habitId, isCompleted]) => {
        if (isCompleted) {
          const hDef = CL.find(c => c.id === habitId);
          if (hDef && hDef.pillar) {
            if (hDef.pillar === "Work" && deepworkCount < 2) {
              // Skip awarding Work XP if only 1 deep work completed
            } else if (habitId === "exercise") {
              // Health XP from exercise is awarded weekly, skip daily
            } else {
              perPillar[hDef.pillar] = (perPillar[hDef.pillar] || 0) + (hDef.xp || 0);
            }
          }
        }
      });

      const weekKey = getMonday(date);
      if (!weeksInMonth[weekKey]) weeksInMonth[weekKey] = { dates: [], exerciseCompleted: false };
      weeksInMonth[weekKey].dates.push(date);
      if (habitsDay["exercise"]) {
        weeksInMonth[weekKey].exerciseCompleted = true;
      }
    });

    Object.keys(weeksInMonth).forEach(weekKey => {
      const week = weeksInMonth[weekKey];
      
      // Weekly Move Your Body reward
      if (week.exerciseCompleted) {
        perPillar["Health"] = (perPillar["Health"] || 0) + 80;
      }
      
      // Weekly Energy scores reward
      let sum = 0;
      let count = 0;
      week.dates.forEach(date => {
        const en = data.energy?.[date];
        if (en) {
          if (en.sleep !== undefined && en.sleep !== null && en.sleep !== "") { sum += Number(en.sleep); count++; }
          if (en.diet !== undefined && en.diet !== null && en.diet !== "") { sum += Number(en.diet); count++; }
        }
      });

      if (count > 0 && (sum / count) >= 4) {
        perPillar["Health"] = (perPillar["Health"] || 0) + 40;
      }
    });
  });

  const monthKeys = Object.keys(monthsMap).sort().reverse();
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const formatMonth = (str) => {
    const [y, m] = str.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ fontSize: "10px", color: "#C8A951", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
        MONTHLY ATTRIBUTES
      </div>
      <div style={{ 
        display: "flex", 
        gap: "16px", 
        overflowX: "auto", 
        paddingBottom: "1rem",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch"
      }}>
        {monthKeys.map(mk => {
          const isThisMonth = mk === currentMonthStr;
          return (
            <div 
              key={mk}
              style={{
                width: "280px",
                minWidth: "280px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: "1rem",
                scrollSnapAlign: "start"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "11px", color: "#C8A951", fontWeight: 600 }}>
                  {isThisMonth ? "This Month" : formatMonth(mk)}
                </span>
                {isThisMonth && (
                  <span style={{ 
                    fontSize: "9px", 
                    background: "rgba(90,138,106,0.2)", 
                    color: "#5A8A6A", 
                    padding: "2px 6px", 
                    borderRadius: 4, 
                    fontWeight: 600,
                    letterSpacing: "0.1em"
                  }}>
                    LIVE
                  </span>
                )}
              </div>
              <AttributesWeb perPillar={monthsMap[mk].perPillar} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
