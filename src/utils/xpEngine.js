export const LEVELS = [
  { level: 1, title: "The Awakening", xpRequired: 0 },
  { level: 2, title: "The Initiate", xpRequired: 500 },
  { level: 3, title: "The Seeker", xpRequired: 1200 },
  { level: 4, title: "The Builder", xpRequired: 2500 },
  { level: 5, title: "The Disciplined", xpRequired: 4500 },
  { level: 6, title: "The Consistent", xpRequired: 7500 },
  { level: 7, title: "The Proven", xpRequired: 12000 },
  { level: 8, title: "The Sovereign", xpRequired: 18000 },
  { level: 9, title: "The Transformed", xpRequired: 26000 },
  { level: 10, title: "The Living Proof", xpRequired: 36000 },
];

export const PILLAR_BADGES = [
  { pillar: "Surrender", badge: "The Released", emoji: "🌊", xpRequired: 500 },
  { pillar: "Imagination", badge: "The Visionary", emoji: "🔮", xpRequired: 500 },
  { pillar: "Identity", badge: "The Embodied", emoji: "👑", xpRequired: 500 },
  { pillar: "Environment", badge: "The Cultivated", emoji: "🌱", xpRequired: 500 },
  { pillar: "Work", badge: "The Relentless", emoji: "⚡", xpRequired: 500 },
  { pillar: "Generosity", badge: "The Generous", emoji: "🤲", xpRequired: 500 },
  { pillar: "Sabbath", badge: "The Rested", emoji: "🕊️", xpRequired: 500 },
];

export function getLevelFromXP(totalXP) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXP >= lvl.xpRequired) current = lvl;
  }
  return current;
}

export function getNextLevel(totalXP) {
  const current = getLevelFromXP(totalXP);
  return LEVELS.find(l => l.level === current.level + 1) || null;
}

export function getLevelProgress(totalXP) {
  const current = getLevelFromXP(totalXP);
  const next = getNextLevel(totalXP);
  if (!next) return 100;
  const range = next.xpRequired - current.xpRequired;
  const earned = totalXP - current.xpRequired;
  return Math.round((earned / range) * 100);
}

export function awardXP(currentGamification, habit) {
  const xp = habit.xp || 0;
  const pillar = habit.pillar || null;
  const totalXP = (currentGamification.totalXP || 0) + xp;
  const perPillar = { ...(currentGamification.perPillar || {}) };
  if (pillar) perPillar[pillar] = (perPillar[pillar] || 0) + xp;
  const prevLevel = getLevelFromXP(currentGamification.totalXP || 0);
  const newLevel = getLevelFromXP(totalXP);
  const leveledUp = newLevel.level > prevLevel.level;
  const unlockedBadges = [...(currentGamification.unlockedBadges || [])];
  for (const b of PILLAR_BADGES) {
    if (!unlockedBadges.includes(b.pillar) && (perPillar[b.pillar] || 0) >= b.xpRequired) {
      unlockedBadges.push(b.pillar);
    }
  }
  return { newState: { totalXP, perPillar, unlockedBadges }, leveledUp, newLevelData: newLevel };
}
