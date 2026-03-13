import React, { useEffect, useState, useRef } from 'react';

const ANIM_TYPES = [
  "XP_FLOAT", "PARTICLE_BURST", "RIPPLE_RING", "WORD_FLASH", 
  "STREAK_LIGHTNING", "GOLD_SHIMMER", "XP_POP"
];

const WORDS = ["FOCUSED.", "LOCKED IN.", "BUILDING.", "SOVEREIGN.", "CONSISTENT.", "ALL IN."];

export default function HabitAnimations({ trigger, comboCount, isPerfectDay }) {
  const [anims, setAnims] = useState([]);
  const lastType = useRef(null);
  const audioCtx = useRef(null);
  const prevTrigger = useRef(null);
  const prevCombo = useRef(comboCount);
  const prevPerfect = useRef(isPerfectDay);
  
  const playSound = () => {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtx.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.value = 520 + Math.random() * 120; // 520 to 640
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  };

  const addAnim = (data, duration = 1000) => {
    const id = Date.now() + Math.random();
    setAnims(prev => [...prev, { id, ...data }]);
    setTimeout(() => {
      setAnims(prev => prev.filter(a => a.id !== id));
    }, duration);
  };

  useEffect(() => {
    if (trigger && trigger !== prevTrigger.current) {
      playSound();
      const available = ANIM_TYPES.filter(t => t !== lastType.current);
      const chosen = available[Math.floor(Math.random() * available.length)];
      lastType.current = chosen;
      
      addAnim({ 
        type: chosen, 
        xp: trigger.xp, 
        word: chosen === "WORD_FLASH" ? WORDS[Math.floor(Math.random() * WORDS.length)] : null 
      }, 1000);
    }
    prevTrigger.current = trigger;
  }, [trigger]);

  useEffect(() => {
    if (comboCount >= 3 && comboCount > (prevCombo.current || 0)) {
      addAnim({ type: "COMBO", count: comboCount }, 1500);
    }
    prevCombo.current = comboCount;
  }, [comboCount]);

  useEffect(() => {
    if (isPerfectDay && !prevPerfect.current) {
      addAnim({ type: "PERFECT_DAY" }, 2500);
    }
    prevPerfect.current = isPerfectDay;
  }, [isPerfectDay]);

  if (anims.length === 0) return null;

  return (
    <>
      <style>
        {`
          @keyframes animFloat {
            0% { transform: translate(-50%, -50%); opacity: 1; }
            100% { transform: translate(-50%, calc(-50% - 60px)); opacity: 0; }
          }
          @keyframes animBurst {
            0% { transform: translate(-50%, -50%); opacity: 1; }
            100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))); opacity: 0; }
          }
          @keyframes animRipple {
            0% { width: 20px; height: 20px; opacity: 1; }
            100% { width: 200px; height: 200px; opacity: 0; }
          }
          @keyframes animWord {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            25% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
          }
          @keyframes animLightning {
            0% { opacity: 1; stroke-dashoffset: 100; }
            50% { opacity: 1; stroke-dashoffset: 0; }
            100% { opacity: 0; stroke-dashoffset: 0; }
          }
          @keyframes animShimmer {
            0% { background: rgba(200,169,81,0); }
            20% { background: rgba(200,169,81,0.3); }
            100% { background: rgba(200,169,81,0); }
          }
          @keyframes animPop {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
            30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            60% { transform: translate(-50%, -50%) scale(1.0); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.0); opacity: 0; }
          }
          @keyframes animCombo {
            0% { transform: translateX(100%); opacity: 0; }
            15% { transform: translateX(0); opacity: 1; }
            85% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          @keyframes animPerfectFade {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            30% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
          }
          @keyframes animConfetti {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
        `}
      </style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000, overflow: "hidden" }}>
        {anims.map(anim => {
          if (anim.type === "XP_FLOAT") {
            return (
              <div key={anim.id} style={{ position: "absolute", top: "50%", left: "50%", color: "#C8A951", fontSize: "1rem", fontWeight: "bold", fontFamily: "'DM Sans', sans-serif", animation: "animFloat 1s ease-out forwards" }}>
                +{anim.xp} XP
              </div>
            );
          }
          if (anim.type === "PARTICLE_BURST") {
            const particles = [];
            for(let i=0; i<8; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = 40 + Math.random() * 40;
              const dx = Math.cos(angle) * dist + "px";
              const dy = Math.sin(angle) * dist + "px";
              particles.push(
                <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: "6px", height: "6px", background: "#C8A951", borderRadius: "50%", animation: "animBurst 0.7s ease-out forwards", "--dx": dx, "--dy": dy }} />
              );
            }
            return <React.Fragment key={anim.id}>{particles}</React.Fragment>;
          }
          if (anim.type === "RIPPLE_RING") {
            return (
              <div key={anim.id} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", borderRadius: "50%", border: "2px solid #C8A951", animation: "animRipple 0.6s ease-out forwards" }} />
            );
          }
          if (anim.type === "WORD_FLASH") {
            return (
              <div key={anim.id} style={{ position: "absolute", top: "50%", left: "50%", color: "#C8A951", fontSize: "2rem", letterSpacing: "0.15em", fontWeight: "bold", animation: "animWord 0.8s ease-out forwards" }}>
                {anim.word}
              </div>
            );
          }
          if (anim.type === "STREAK_LIGHTNING") {
            return (
              <svg key={anim.id} viewBox="0 0 30 100" preserveAspectRatio="none" style={{ position: "absolute", top: 0, left: 0, width: "30px", height: "100%" }}>
                <polyline points="0,100 30,80 0,60 30,40 0,20 30,0" fill="none" stroke="#C8A951" strokeWidth="2" vectorEffect="non-scaling-stroke" pathLength="100" strokeDasharray="100" strokeDashoffset="100" style={{ animation: "animLightning 0.5s ease-out forwards" }} />
              </svg>
            );
          }
          if (anim.type === "GOLD_SHIMMER") {
            return (
              <div key={anim.id} style={{ position: "absolute", inset: 0, animation: "animShimmer 0.4s ease-out forwards" }} />
            );
          }
          if (anim.type === "XP_POP") {
            return (
              <div key={anim.id} style={{ position: "absolute", top: "20%", left: "50%", color: "#C8A951", fontSize: "1.3rem", fontWeight: "bold", fontFamily: "'DM Sans', sans-serif", animation: "animPop 0.5s forwards" }}>
                +{anim.xp} XP
              </div>
            );
          }
          if (anim.type === "COMBO") {
            return (
              <div key={anim.id} style={{ position: "absolute", top: "20%", right: "1rem", background: "#1A1A1A", color: "white", padding: "0.5rem 1rem", borderRadius: "20px", fontSize: "1.2rem", fontWeight: "bold", animation: "animCombo 1.5s ease-in-out forwards" }}>
                COMBO &times;{anim.count} 🔥
              </div>
            );
          }
          if (anim.type === "PERFECT_DAY") {
            const confetti = [];
            const colors = ["#C8A951", "#FFFFFF", "#E8D5A0", "#A57A3A"];
            for(let i=0; i<30; i++) {
              const left = Math.random() * 100 + "vw";
              const dur = 1.5 + Math.random() + "s";
              const del = (Math.random() * 0.5) + "s";
              const color = colors[Math.floor(Math.random() * colors.length)];
              confetti.push(
                <div key={i} style={{ position: "absolute", top: "-10px", left, width: "6px", height: "6px", background: color, animation: `animConfetti ${dur} linear ${del} forwards` }} />
              );
            }
            return (
              <React.Fragment key={anim.id}>
                {confetti}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#C8A951", fontSize: "2rem", fontFamily: "Georgia, serif", animation: "animPerfectFade 2s forwards" }}>
                  PERFECT DAY
                </div>
              </React.Fragment>
            );
          }
          return null;
        })}
      </div>
    </>
  );
}
