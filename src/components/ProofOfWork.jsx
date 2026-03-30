import React, { useState, useEffect } from 'react';
import { ld, sv } from "../utils/storage";

const CATEGORIES = [
  { id: 'irBriefs', name: 'BS IR Briefs', target: 5 },
  { id: 'xArticles', name: 'X Articles', target: 5 },
  { id: 'tweets', name: 'X Tweets', target: 15 },
];

const SK_POW = 'beautiful-life-os-pow';

export default function ProofOfWork() {
  const [data, setData] = useState({
    irBriefs: { lifetime: 0, weekly: {} },
    xArticles: { lifetime: 0, weekly: {} },
    tweets: { lifetime: 0, weekly: {} },
    badges: { irBriefs: [], xArticles: [], tweets: [] }
  });

  function getWeekKey(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  }

  const currentWeekKey = getWeekKey();

  useEffect(() => {
    (async () => {
      const saved = await ld(SK_POW, null);
      if (saved) {
        // Ensure structure is correct after migration/load
        const merged = { ...data, ...saved };
        setData(merged);
      }
    })();
  }, []);

  const addPoint = (catId) => {
    const target = CATEGORIES.find(c => c.id === catId).target;
    const newData = { ...data };
    
    // 1. Increment lifetime
    newData[catId].lifetime = (newData[catId].lifetime || 0) + 1;
    
    // 2. Increment weekly
    if (!newData[catId].weekly) newData[catId].weekly = {};
    const currentWeekCount = (newData[catId].weekly[currentWeekKey] || 0) + 1;
    newData[catId].weekly[currentWeekKey] = currentWeekCount;
    
    // 3. Update badges if threshold hit exactly
    if (currentWeekCount === target) {
      if (!newData.badges[catId].includes(currentWeekKey)) {
        newData.badges[catId] = [...newData.badges[catId], currentWeekKey];
      }
    }
    
    setData({ ...newData });
    sv(SK_POW, newData);
  };

  const removePoint = (catId) => {
    const newData = { ...data };
    
    // 1. Decrement lifetime (min 0)
    newData[catId].lifetime = Math.max(0, (newData[catId].lifetime || 0) - 1);
    
    // 2. Decrement weekly (min 0)
    if (!newData[catId].weekly) newData[catId].weekly = {};
    newData[catId].weekly[currentWeekKey] = Math.max(0, (newData[catId].weekly[currentWeekKey] || 0) - 1);
    
    setData({ ...newData });
    sv(SK_POW, newData);
  };

  return (
    <div style={{ marginTop: "2rem", marginBottom: "1rem" }}>
      <div style={{ paddingBottom: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#E8E4DC", marginBottom: "0.2rem" }}>Proof of Work</div>
        <div style={{ fontSize: "0.8rem", color: "#6A6A5A" }}>Every rep published. Forever.</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {CATEGORIES.map(cat => {
          const catData = data[cat.id] || { lifetime: 0, weekly: {} };
          const weekCount = (catData.weekly || {})[currentWeekKey] || 0;
          const pct = Math.min(100, (weekCount / cat.target) * 100);
          const badgeCount = (data.badges[cat.id] || []).length;
          const isComplete = weekCount >= cat.target;

          return (
            <div key={cat.id} style={{ 
              flex: "1 1 200px",
              background: "#14171E",
              border: "1px solid rgba(200,169,81,0.08)",
              borderRadius: "4px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem"
            }}>
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
                    fontWeight: 600
                  }}>
                    ✓ Week Complete
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#8A8678" }}>{weekCount} / {cat.target} this week</span>
                  <span style={{ fontSize: "0.75rem", color: "#6A6A5A" }}>🏅 {badgeCount} weeks hit</span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ 
                    width: `${pct}%`, 
                    height: "100%", 
                    background: isComplete ? "#C8A951" : "rgba(200,169,81,0.3)", 
                    transition: "width 0.3s ease" 
                  }} />
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
    </div>
  );
}
