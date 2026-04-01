import React, { useState, useEffect } from 'react';
import { ld, sv } from "../utils/storage";

const CATEGORIES = [
  { id: 'irBriefs', name: 'BS IR Briefs', target: 3 },
  { id: 'xArticles', name: 'X Articles', target: 3 },
  { id: 'tweets', name: 'X Tweets', target: 15 },
];

const MILESTONES_DEF = {
  default: [
    { key: 'first', label: 'First Dispatch', icon: '🌱', threshold: 1 },
    { key: 'signal', label: 'Signal Rising', icon: '⚡', threshold: 10 },
    { key: 'onTheWire', label: 'On the Wire', icon: '🔥', threshold: 25 },
    { key: 'standard', label: 'The Standard', icon: '👑', threshold: 50 },
    { key: 'record', label: 'The Record', icon: '🏛️', threshold: 100 },
  ],
  tweets: [
    { key: 'first', label: 'First Dispatch', icon: '🌱', threshold: 3 },
    { key: 'signal', label: 'Signal Rising', icon: '⚡', threshold: 30 },
    { key: 'onTheWire', label: 'On the Wire', icon: '🔥', threshold: 75 },
    { key: 'standard', label: 'The Standard', icon: '👑', threshold: 150 },
    { key: 'record', label: 'The Record', icon: '🏛️', threshold: 300 },
  ]
};

const SK_POW = 'beautiful-life-os-pow';

export default function ProofOfWork() {
  const [data, setData] = useState({
    irBriefs: { lifetime: 0, weekly: {} },
    xArticles: { lifetime: 0, weekly: {} },
    tweets: { lifetime: 0, weekly: {} },
    badges: { irBriefs: [], xArticles: [], tweets: [] },
    milestoneBadges: { irBriefs: [], xArticles: [], tweets: [] },
    weeklyStreak: 0,
    bestWeeklyStreak: 0,
    lastStreakWeek: '',
    trifectaWeeks: [],
    hotStreakWeeks: { irBriefs: [], xArticles: [], tweets: [] }
  });

  function getWeekKey(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  function getPreviousWeekKey(currentKey) {
    const [year, weekStr] = currentKey.split('-W');
    const weekNum = parseInt(weekStr);
    const jan4 = new Date(parseInt(year), 0, 4);
    const dayOfWeek = (jan4.getDay() + 6) % 7;
    const weekStart = new Date(jan4);
    weekStart.setDate(jan4.getDate() - dayOfWeek + (weekNum - 1) * 7);
    weekStart.setDate(weekStart.getDate() - 7);
    return getWeekKey(weekStart);
  }

  const currentWeekKey = getWeekKey();

  useEffect(() => {
    (async () => {
      const saved = await ld(SK_POW, null);
      if (saved) {
        setData(prev => ({
          ...prev,
          ...saved,
          // Ensure nested objects exist
          milestoneBadges: { ...prev.milestoneBadges, ...(saved.milestoneBadges || {}) },
          hotStreakWeeks: { ...prev.hotStreakWeeks, ...(saved.hotStreakWeeks || {}) },
          irBriefs: { ...prev.irBriefs, ...(saved.irBriefs || {}) },
          xArticles: { ...prev.xArticles, ...(saved.xArticles || {}) },
          tweets: { ...prev.tweets, ...(saved.tweets || {}) }
        }));
      }
    })();
  }, []);

  const addPoint = (catId) => {
    const target = CATEGORIES.find(c => c.id === catId).target;
    let newData = { ...data };
    
    // 1. Increment lifetime and weekly
    newData[catId] = { 
      ...newData[catId],
      lifetime: (newData[catId].lifetime || 0) + 1,
      weekly: {
        ...(newData[catId].weekly || {}),
        [currentWeekKey]: ((newData[catId].weekly || {})[currentWeekKey] || 0) + 1
      }
    };
    
    const currentWeekCount = newData[catId].weekly[currentWeekKey];
    
    // 2. Award weekly target badge
    if (currentWeekCount === target) {
      if (!newData.badges[catId].includes(currentWeekKey)) {
        newData.badges[catId] = [...newData.badges[catId], currentWeekKey];
      }
    }

    // 3. Milestone badges
    const milestones = catId === 'tweets' ? MILESTONES_DEF.tweets : MILESTONES_DEF.default;
    milestones.forEach(m => {
      if (newData[catId].lifetime >= m.threshold && !newData.milestoneBadges[catId].includes(m.key)) {
        newData.milestoneBadges[catId] = [...newData.milestoneBadges[catId], m.key];
      }
    });

    // 4. Hot streak (exactly 2x target)
    if (currentWeekCount === target * 2) {
      if (!newData.hotStreakWeeks[catId].includes(currentWeekKey)) {
        newData.hotStreakWeeks[catId] = [...newData.hotStreakWeeks[catId], currentWeekKey];
      }
    }

    // 5. Trifecta check
    const trifectaCondition = CATEGORIES.every(c => {
      const count = (newData[c.id].weekly || {})[currentWeekKey] || 0;
      return count >= c.target;
    });

    const isNewTrifecta = trifectaCondition && !newData.trifectaWeeks.includes(currentWeekKey);
    if (isNewTrifecta) {
      newData.trifectaWeeks = [...newData.trifectaWeeks, currentWeekKey];

      // 6. Consistency streak
      const prevWeek = getPreviousWeekKey(currentWeekKey);
      if (newData.lastStreakWeek === prevWeek) {
        newData.weeklyStreak += 1;
      } else if (newData.lastStreakWeek === currentWeekKey) {
        // Already counted
      } else {
        newData.weeklyStreak = 1;
      }
      
      newData.lastStreakWeek = currentWeekKey;
      if (newData.weeklyStreak > newData.bestWeeklyStreak) {
        newData.bestWeeklyStreak = newData.weeklyStreak;
      }
    }
    
    setData(newData);
    sv(SK_POW, newData);
  };

  const removePoint = (catId) => {
    const newData = { ...data };
    newData[catId].lifetime = Math.max(0, (newData[catId].lifetime || 0) - 1);
    if (!newData[catId].weekly) newData[catId].weekly = {};
    newData[catId].weekly[currentWeekKey] = Math.max(0, (newData[catId].weekly[currentWeekKey] || 0) - 1);
    setData({ ...newData });
    sv(SK_POW, newData);
  };

  const totalLifetime = CATEGORIES.reduce((sum, c) => sum + (data[c.id]?.lifetime || 0), 0);
  const getPublishingTitle = (total) => {
    if (total >= 150) return "The Standard";
    if (total >= 75) return "Strategist";
    if (total >= 30) return "Analyst";
    if (total >= 10) return "Correspondent";
    return "Observer";
  };

  const currentTitle = getPublishingTitle(totalLifetime);

  return (
    <div style={{ marginTop: "2rem", marginBottom: "1rem" }}>
      <div style={{ paddingBottom: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#E8E4DC", marginBottom: "0.2rem" }}>Proof of Work</div>
        <div style={{ fontSize: "0.8rem", color: "#6A6A5A", marginBottom: "0.4rem" }}>Every rep published. Forever.</div>
        <div style={{ fontSize: "0.65rem", color: "#C8A951", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>{currentTitle}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "nowrap", gap: "1rem" }}>
        {CATEGORIES.map(cat => {
          const catData = data[cat.id] || { lifetime: 0, weekly: {} };
          const weekCount = (catData.weekly || {})[currentWeekKey] || 0;
          const pct = Math.min(100, (weekCount / cat.target) * 100);
          const badgeCount = (data.badges[cat.id] || []).length;
          const isComplete = weekCount >= cat.target;
          const isHot = (data.hotStreakWeeks[cat.id] || []).includes(currentWeekKey);
          const milestones = cat.id === 'tweets' ? MILESTONES_DEF.tweets : MILESTONES_DEF.default;
          const earnedMilestones = data.milestoneBadges[cat.id] || [];

          return (
            <div key={cat.id} style={{ 
              flex: 1,
              minWidth: 0,
              background: "#14171E",
              border: "1px solid rgba(200,169,81,0.08)",
              borderRadius: "4px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              position: "relative"
            }}>
              {isHot && (
                <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "0.8rem", color: "#C8A951" }}>🔥</div>
              )}
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "#C8A951", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.3rem" }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#E8E4DC" }}>
                    {catData.lifetime}
                  </div>
                </div>
                {isComplete && (
                  <div style={{ 
                    background: "rgba(90,138,106,0.1)", 
                    border: "1px solid rgba(90,138,106,0.3)", 
                    color: "#5A8A6A", 
                    fontSize: "0.65rem", 
                    padding: "3px 6px", 
                    borderRadius: "3px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    ✓ Week{isHot && " 🔥"}
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#8A8678" }}>{weekCount} / {cat.target} this week</span>
                  <span style={{ fontSize: "0.75rem", color: "#6A6A5A" }}>🏅 {badgeCount}</span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "2px", overflow: "hidden", marginBottom: "0.8rem" }}>
                  <div style={{ 
                    width: `${pct}%`, 
                    height: "100%", 
                    background: isComplete ? "#C8A951" : "rgba(200,169,81,0.3)", 
                    transition: "width 0.3s ease" 
                  }} />
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", gap: "2px" }}>
                  {milestones.map(m => {
                    const earned = earnedMilestones.includes(m.key);
                    return (
                      <div key={m.key} title={m.label} style={{ 
                        flex: 1, 
                        textAlign: "center", 
                        opacity: earned ? 1 : 0.25, 
                        filter: earned ? "none" : "grayscale(100%)",
                        transition: "0.3s"
                      }}>
                        <div style={{ fontSize: "0.9rem", marginBottom: "1px" }}>{m.icon}</div>
                        <div style={{ fontSize: "4px", color: earned ? "#C8A951" : "#8A8678", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label.split(' ')[0]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button 
                  onClick={() => removePoint(cat.id)}
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
                  onClick={() => addPoint(cat.id)}
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
          );
        })}
      </div>

      {/* Summary Row */}
      <div style={{ 
        marginTop: "1.5rem", 
        background: "#14171E", 
        border: "1px solid rgba(200,169,81,0.08)", 
        borderRadius: "4px", 
        padding: "1rem 1.5rem", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "0.6rem", color: "#6A6A5A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Consistency Streak</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: data.weeklyStreak >= 3 ? "#C8A951" : "#E8E4DC" }}>
            {data.weeklyStreak} weeks
          </div>
          <div style={{ fontSize: "0.65rem", color: "#6A6A5A" }}>best: {data.bestWeeklyStreak}</div>
        </div>
        
        <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.06)" }} />

        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: "0.6rem", color: "#6A6A5A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Trifecta Accomplished</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: data.trifectaWeeks.includes(currentWeekKey) ? "#C8A951" : "#E8E4DC" }}>
            {data.trifectaWeeks.length} times
          </div>
          <div style={{ fontSize: "0.65rem", color: "#6A6A5A" }}>all 3 hit same week</div>
        </div>

        <div style={{ width: "1px", height: "30px", background: "rgba(255,255,255,0.06)" }} />

        <div style={{ display: "flex", gap: "10px", flex: 1, justifyContent: "center", alignItems: "center" }}>
          {CATEGORIES.map(cat => {
            const hit = (data[cat.id]?.weekly || {})[currentWeekKey] >= cat.target;
            return (
              <div key={cat.id} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.55rem", color: "#6A6A5A", marginBottom: "2px" }}>{cat.name.split(' ')[1] || cat.name}</div>
                <div style={{ color: hit ? "#5A8A6A" : "#8A8678", fontSize: "0.9rem" }}>{hit ? "✓" : "✗"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
