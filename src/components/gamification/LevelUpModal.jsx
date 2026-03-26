import React from 'react';

export default function LevelUpModal({ show, levelData, onDismiss, onPrestige }) {
  if (!show || !levelData) return null;

  return (
    <>
      <style>
        {`
          @keyframes fillBar {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          @keyframes pulseIn {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1.0); opacity: 1; }
          }
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(13,15,20,0.97)",
        }}
        onClick={onDismiss}
      >
        <div 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            height: "3px", 
            background: "#C8A951", 
            animation: "fillBar 0.8s ease-out forwards" 
          }} 
        />
        
        <div 
          onClick={e => e.stopPropagation()}
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            height: "100%"
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#C8A951", textTransform: "uppercase", letterSpacing: "0.3em", animation: "pulseIn 0.6s 0.8s both" }}>
            LEVEL UP
          </div>
          <div style={{ fontSize: "0.85rem", color: "#C8A951", animation: "fadeUp 0.5s 1.2s both" }}>
            Level {levelData.level}
          </div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "2.4rem", color: "white", fontWeight: 300, animation: "fadeUp 0.5s 1.5s both" }}>
            {levelData.title}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#8A8678", marginTop: "0.5rem", animation: "fadeUp 0.5s 1.8s both" }}>
            Keep becoming.
          </div>
          <button
            onClick={onDismiss}
            style={{
              marginTop: "3rem",
              padding: "0.7rem 2rem",
              background: "transparent",
              border: "1px solid #C8A951",
              color: "#C8A951",
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              cursor: "pointer",
              animation: "fadeUp 0.5s 2.1s both"
            }}
          >
            Continue →
          </button>
          
          {levelData.level === 10 && onPrestige && (
            <button
              onClick={() => {
                onPrestige();
                onDismiss();
              }}
              style={{
                marginTop: "1rem",
                padding: "0.7rem 2rem",
                background: "transparent",
                border: "1px solid #E8D5A0",
                color: "#E8D5A0",
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
                cursor: "pointer",
                animation: "fadeUp 0.5s 2.4s both"
              }}
            >
              ✦ Prestige — Reset to Level 1
            </button>
          )}
        </div>
      </div>
    </>
  );
}
