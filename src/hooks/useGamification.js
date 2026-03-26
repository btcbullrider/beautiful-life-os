import { useState, useEffect } from "react";
import { applyPrestige } from "../utils/xpEngine";

export default function useGamification() {
  const [gamification, setGamification] = useState(() => {
    try {
      const currentGamification = JSON.parse(localStorage.getItem("blos-gamification")) || { totalXP: 0, perPillar: {}, unlockedBadges: [] };
      if (currentGamification.perPillar?.Environment !== undefined) {
        currentGamification.perPillar.Health = (currentGamification.perPillar.Health || 0) + currentGamification.perPillar.Environment;
        delete currentGamification.perPillar.Environment;
        localStorage.setItem("blos-gamification", JSON.stringify(currentGamification));
      }
      return currentGamification;
    } catch {
      return { totalXP: 0, perPillar: {}, unlockedBadges: [] };
    }
  });

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [animTrigger, setAnimTrigger] = useState(null);
  const [xpFloat, setXpFloat] = useState(null);
  const [comboCount, setComboCount] = useState(0);
  const [comboTimestamps, setComboTimestamps] = useState([]);

  useEffect(() => {
    if (xpFloat) {
      const t = setTimeout(() => setXpFloat(null), 1200);
      return () => clearTimeout(t);
    }
  }, [xpFloat]);

  const handlePrestige = () => {
    const newState = applyPrestige(gamification);
    saveGamification(newState);
  };

  const recordCombo = () => {
    const now = Date.now();
    const recent = [...comboTimestamps, now].filter(t => now - t < 60000);
    setComboTimestamps(recent);
    setComboCount(recent.length);
  };

  const saveGamification = (newState) => {
    setGamification(newState);
    localStorage.setItem("blos-gamification", JSON.stringify(newState));
  };

  return {
    gamification,
    saveGamification,
    showLevelUp,
    setShowLevelUp,
    levelUpData,
    setLevelUpData,
    animTrigger,
    setAnimTrigger,
    comboCount,
    recordCombo,
    xpFloat,
    setXpFloat,
    handlePrestige
  };
}
