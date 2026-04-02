import React, { useState, useEffect } from 'react';
import useGamification from '../hooks/useGamification';
import { CL } from '../utils/constants';

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

const CHALLENGES_POOL = [
  {
    id: 'morning_trifecta',
    label: 'Morning Trifecta',
    desc: 'Complete Silence + Scripture + Affirmations',
    xp: 200,
    habits: ['silence', 'scripture', 'affirmations'],
    emoji: '🌅'
  },
  {
    id: 'deep_work_hat_trick',
    label: 'Deep Work Hat Trick',
    desc: 'Complete all 3 deep work blocks',
    xp: 300,
    habits: ['deepwork1', 'deepwork2', 'deepwork3'],
    emoji: '⚡'
  },
  {
    id: 'perfect_day',
    label: 'Perfect Day',
    desc: 'Complete every habit today',
    xp: 500,
    habits: ['all'],
    emoji: '👑'
  },
  {
    id: 'surrender_block',
    label: 'Surrender Block',
    desc: 'Complete Silence + Scripture + Midday Reset',
    xp: 200,
    habits: ['silence', 'scripture', 'midday'],
    emoji: '🙏'
  },
  {
    id: 'identity_stack',
    label: 'Identity Stack',
    desc: 'Complete Heart Coherence + Journal',
    xp: 150,
    habits: ['heartcoherence', 'journal'],
    emoji: '👤'
  },
  {
    id: 'publisher',
    label: 'The Publisher',
    desc: 'Log a tweet + an IR Brief or X Article',
    xp: 250,
    habits: ['tweets_pow', 'irBriefs_pow'],
    emoji: '📡'
  },
  {
    id: 'body_and_mind',
    label: 'Body & Mind',
    desc: 'Complete Move Your Body + Meridian Energy',
    xp: 200,
    habits: ['exercise', 'meridian'],
    emoji: '💪'
  },
  {
    id: 'full_standard',
    label: 'The Full Standard',
    desc: 'Perfect day + log a tweet',
    xp: 600,
    habits: ['all', 'tweets_pow'],
    emoji: '🏛️'
  }
];

export default function DailyChallenges({ ck }) {
  const { gamification, saveGamification } = useGamification();
  const [challengesState, setChallengesState] = useState({ date: '', challenges: [], awardedChallenges: [] });

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem('beautiful-life-os-challenges'));
    } catch {}

    if (stored && stored.date === todayStr && stored.challenges && stored.challenges.length === 3) {
      setChallengesState(stored);
    } else {
      const histData = {};
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      for (let i = 0; i < 14; i++) {
        const d = new Date(yesterday);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        try {
          const parsed = JSON.parse(localStorage.getItem(`cl:${ds}`)) || {};
          histData[ds] = parsed;
        } catch {
          histData[ds] = {};
        }
      }

      const habitScores = {};
      CL.forEach(c => {
        let hits = 0;
        Object.values(histData).forEach(day => {
          if (day[c.id]) hits++;
        });
        const completionRate = hits / 14;
        let priority = 'LOW';
        if (completionRate <= 0.40) priority = 'HIGH';
        else if (completionRate <= 0.70) priority = 'MEDIUM';
        habitScores[c.id] = priority;
      });

      const buckets = { HIGH: [], MEDIUM: [], LOW: [] };
      
      CHALLENGES_POOL.forEach(ch => {
        let chPri = 'LOW';
        if (ch.habits.includes('all')) {
          chPri = 'MEDIUM';
        } else {
          const hasHigh = ch.habits.some(h => habitScores[h] === 'HIGH');
          const hasMedium = ch.habits.some(h => habitScores[h] === 'MEDIUM');
          if (hasHigh) chPri = 'HIGH';
          else if (hasMedium) chPri = 'MEDIUM';
        }
        buckets[chPri].push(ch);
      });

      const seedNum = todayStr.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      let seedIndex = 0;
      const getRand = (arr) => {
        if (!arr.length) return null;
        const r = seededRandom(seedNum + seedIndex++);
        return arr[Math.floor(r * arr.length)];
      };

      const selected = [];
      
      let c1 = getRand(buckets.HIGH);
      if (!c1) c1 = getRand(buckets.MEDIUM);
      if (c1) selected.push(c1.id);

      let medAvail = buckets.MEDIUM.filter(c => !selected.includes(c.id));
      let c2 = getRand(medAvail);
      if (!c2) {
        let lowAvail = buckets.LOW.filter(c => !selected.includes(c.id));
        c2 = getRand(lowAvail);
      }
      if (c2) selected.push(c2.id);

      let weightedFull = [];
      const addWeighted = (arr, weight) => {
        arr.forEach(c => {
          if (!selected.includes(c.id)) {
            for(let i=0; i<weight; i++) weightedFull.push(c);
          }
        });
      };
      addWeighted(buckets.HIGH, 3);
      addWeighted(buckets.MEDIUM, 2);
      addWeighted(buckets.LOW, 1);
      
      let c3 = getRand(weightedFull);
      if (c3 && !selected.includes(c3.id)) selected.push(c3.id);
      
      const finalSelection = [...new Set(selected)];
      while (finalSelection.length < 3) {
        let remaining = CHALLENGES_POOL.filter(c => !finalSelection.includes(c.id));
        if (!remaining.length) break;
        finalSelection.push(getRand(remaining)?.id || remaining[0].id);
      }

      const newChallenges = finalSelection.map(id => ({ id, completed: false }));
      const newState = {
        date: todayStr,
        challenges: newChallenges,
        awardedChallenges: stored?.awardedChallenges || []
      };
      setChallengesState(newState);
      try {
        localStorage.setItem('beautiful-life-os-challenges', JSON.stringify(newState));
      } catch {}
    }
  }, [todayStr]);

  let changed = false;
  const nextChallenges = challengesState.challenges.map(chDef => {
    if (chDef.completed) return chDef;

    const poolDef = CHALLENGES_POOL.find(c => c.id === chDef.id);
    if (!poolDef) return chDef;

    let isComplete = true;
    
    const allHabitsIds = CL.map(c => c.id);
    if (poolDef.habits.includes('all')) {
      if (!allHabitsIds.every(id => ck?.[id])) isComplete = false;
    }

    poolDef.habits.forEach(h => {
      if (h === 'all') return;
      if (h === 'tweets_pow' || h === 'irBriefs_pow') {
        const powDataString = localStorage.getItem('beautiful-life-os-pow');
        let val = 0;
        try {
          const powData = powDataString ? JSON.parse(powDataString) : null;
          if (powData) {
            const wk = getWeekKey(new Date());
            if (h === 'tweets_pow') val = powData.tweets?.weekly?.[wk] || 0;
            if (h === 'irBriefs_pow') val = powData.irBriefs?.weekly?.[wk] || 0;
          }
        } catch {}
        if (val < 1) isComplete = false;
      } else {
        if (!ck?.[h]) isComplete = false;
      }
    });

    if (isComplete) {
      changed = true;
      return { ...chDef, completed: true };
    }
    return chDef;
  });

  const allComplete = nextChallenges.length === 3 && nextChallenges.every(c => c.completed);

  if (changed) {
    const nextAwarded = [...(challengesState.awardedChallenges || [])];
    let gamificationUpdated = false;
    let nextTotalXP = gamification.totalXP || 0;
    let nextWorkPillar = gamification.perPillar?.Work || 0;

    nextChallenges.forEach(c => {
      if (c.completed && !nextAwarded.includes(c.id)) {
        nextAwarded.push(c.id);
        const xpAmount = CHALLENGES_POOL.find(p => p.id === c.id)?.xp || 0;
        nextTotalXP += xpAmount;
        nextWorkPillar += xpAmount;
        gamificationUpdated = true;
      }
    });

    if (gamificationUpdated) {
      const nextGamification = {
        ...gamification,
        totalXP: nextTotalXP,
        perPillar: { ...gamification.perPillar, Work: nextWorkPillar }
      };
      saveGamification(nextGamification);
    }

    const newState = {
      ...challengesState,
      challenges: nextChallenges,
      awardedChallenges: nextAwarded
    };
    setChallengesState(newState);
    try {
      localStorage.setItem('beautiful-life-os-challenges', JSON.stringify(newState));
    } catch {}
  }

  if (!challengesState.challenges.length) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
        <h2 style={{ fontSize: "0.8rem", color: "#C8A951", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>⚡ Daily Challenges</h2>
        <span style={{ fontSize: "0.8rem", color: "#C8A951", fontWeight: 600 }}>
          {challengesState.challenges.filter(c => c.completed).length}/3
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {challengesState.challenges.map(stateCh => {
          const p = CHALLENGES_POOL.find(c => c.id === stateCh.id);
          if (!p) return null;
          const isDone = stateCh.completed;
          return (
            <div key={p.id} style={{
              background: isDone ? "rgba(200,169,81,0.08)" : "#14171E",
              border: isDone ? "1px solid rgba(200,169,81,0.2)" : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 6,
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "all 0.3s ease",
            }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span style={{ fontSize: "1.2rem", filter: isDone ? "none" : "grayscale(30%)" }}>{p.emoji}</span>
                <div>
                  <div style={{ 
                    fontSize: "0.85rem", 
                    color: isDone ? "#C8A951" : "#E8E4DC", 
                    fontWeight: 600, 
                    marginBottom: "0.2rem",
                    textDecoration: isDone ? "line-through" : "none" 
                  }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#8A8678" }}>{p.desc}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {!isDone ? (
                  <span style={{ fontSize: "0.75rem", color: "#C8A951", fontWeight: 700, whiteSpace: "nowrap" }}>+{p.xp} XP</span>
                ) : (
                  <span style={{ color: "#C8A951", fontSize: "1rem" }}>✓</span>
                )}
              </div>
            </div>
          );
        })}
        {allComplete && (
          <div style={{
            marginTop: "0.4rem",
            background: "linear-gradient(45deg, rgba(200,169,81,0.15), rgba(200,169,81,0.05))",
            color: "#C8A951",
            padding: "0.8rem",
            borderRadius: 6,
            textAlign: "center",
            fontSize: "0.85rem",
            fontWeight: 600,
            border: "1px solid rgba(200,169,81,0.3)",
            animation: "fadeIn 0.5s ease-out"
          }}>
            🔥 All challenges complete!
          </div>
        )}
      </div>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginTop: "2rem" }}></div>
    </div>
  );
}
