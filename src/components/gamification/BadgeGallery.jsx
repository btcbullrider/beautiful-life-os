import React from 'react';
import { PILLAR_BADGES } from '../../utils/xpEngine';

export default function BadgeGallery({ unlockedBadges = [], perPillar = {}, badgeStreaks = {} }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "#C8A951", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
        PILLAR BADGES
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", width: "100%", padding: "0 4px", boxSizing: "border-box" }}>
        {PILLAR_BADGES.map(badgeData => {
          const isUnlocked = unlockedBadges.includes(badgeData.pillar);
          const xp = perPillar[badgeData.pillar] || 0;
          const streak = badgeStreaks[badgeData.pillar]?.streak || 0;

          return (
            <div key={badgeData.pillar} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div 
                style={{
                  aspectRatio: "1",
                  width: "100%",
                  background: isUnlocked ? "rgba(200,169,81,0.08)" : "rgba(255,255,255,0.02)",
                  border: isUnlocked ? "1px solid rgba(200,169,81,0.3)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "3px",
                  padding: "6px 4px",
                  boxSizing: "border-box",
                  overflow: "hidden"
                }}
              >
                <div 
                  style={{
                    fontSize: "clamp(0.9rem, 2vw, 1.4rem)",
                    ...(isUnlocked ? { opacity: 1 } : { opacity: 0.2, color: "white" })
                  }}
                >
                  {isUnlocked ? badgeData.emoji : "?"}
                </div>
                <div 
                  style={{
                    fontSize: "clamp(6px, 1vw, 8px)",
                    color: isUnlocked ? "#C8A951" : "#4A4A4A",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textAlign: "center"
                  }}
                >
                  {isUnlocked ? badgeData.badge : "???"}
                </div>
                <div style={{ fontSize: "clamp(5px, 0.8vw, 7px)", color: "#8A8678", textAlign: "center" }}>
                  {badgeData.pillar}
                </div>
              </div>
              <div style={{ fontSize: "clamp(5px, 0.8vw, 7px)", color: "#8A8678", textAlign: "center", marginTop: "3px" }}>
                {xp} / 500 XP
              </div>
              {streak > 0 && (
                <div style={{ fontSize: "clamp(6px, 0.9vw, 8px)", color: "#C8A951", textAlign: "center" }}>
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
