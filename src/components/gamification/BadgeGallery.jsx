import React from 'react';
import { PILLAR_BADGES } from '../../utils/xpEngine';

export default function BadgeGallery({ unlockedBadges = [], perPillar = {}, badgeStreaks = {} }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "#C8A951", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
        PILLAR BADGES
      </div>
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px" }}>
        {PILLAR_BADGES.map(badgeData => {
          const isUnlocked = unlockedBadges.includes(badgeData.pillar);
          const xp = perPillar[badgeData.pillar] || 0;
          const streak = badgeStreaks[badgeData.pillar]?.streak || 0;

          return (
            <div key={badgeData.pillar} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div 
                style={{
                  width: "80px",
                  minWidth: "80px",
                  borderRadius: "8px",
                  padding: "10px 6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  textAlign: "center",
                  ...(isUnlocked ? {
                    background: "rgba(200, 169, 81, 0.08)",
                    border: "1px solid rgba(200, 169, 81, 0.3)"
                  } : {
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)"
                  })
                }}
              >
                <div 
                  style={{
                    fontSize: "1.8rem",
                    ...(isUnlocked ? { opacity: 1 } : { opacity: 0.2, color: "white" })
                  }}
                >
                  {isUnlocked ? badgeData.emoji : "?"}
                </div>
                <div 
                  style={{
                    fontSize: "8px",
                    color: isUnlocked ? "#C8A951" : "#4A4A4A"
                  }}
                >
                  {isUnlocked ? badgeData.badge : "???"}
                </div>
                <div style={{ fontSize: "7px", color: "#8A8678" }}>
                  {badgeData.pillar}
                </div>
              </div>
              <div style={{ fontSize: "7px", color: "#8A8678", marginTop: "4px", textAlign: "center", width: "90px", whiteSpace: "nowrap" }}>
                {xp} / 500 XP THIS MONTH
              </div>
              {streak > 0 && (
                <div style={{ fontSize: "8px", color: "#C8A951", marginTop: "2px", fontWeight: "bold" }}>
                  🔥 {streak} month streak
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
