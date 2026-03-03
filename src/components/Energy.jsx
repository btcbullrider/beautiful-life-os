import { useState, useEffect } from "react";
import { ld, sv, TODAY } from "../utils/storage";
import { Quote } from "./shared/UI";

export default function EnergyTab() {
  const SK_EN = "en:today";
  const SK_ENI = "en:index";
  const defaultEnergy = {
    morning: { energy: 0, note: "", meals: [] },
    midday: { energy: 0, note: "", meals: [] },
    evening: { energy: 0, note: "", meals: [] },
  };
  const [data, setData] = useState(defaultEnergy);
  const [loaded, setLoaded] = useState(false);
  const [newMeals, setNewMeals] = useState({ morning: "", midday: "", evening: "" });
  const [enIdx, setEnIdx] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [pastData, setPastData] = useState(null);
  const [loadingPast, setLoadingPast] = useState(false);

  useEffect(() => {
    (async () => {
      const [saved, idx] = await Promise.all([ld(SK_EN, null), ld(SK_ENI, [])]);
      let localIdx = idx || [];
      if (saved && saved._date === TODAY) {
        // Today's data — migrate and load
        const migrated = { ...saved };
        if (!migrated.morning) migrated.morning = { energy: 0, note: "", meals: [] };
        if (!migrated.midday) migrated.midday = { energy: 0, note: "", meals: [] };
        if (!migrated.evening) migrated.evening = { energy: 0, note: "", meals: [] };
        if (!migrated.morning.meals) migrated.morning = { ...migrated.morning, meals: [] };
        if (!migrated.midday.meals) migrated.midday = { ...migrated.midday, meals: [] };
        if (!migrated.evening.meals) migrated.evening = { ...migrated.evening, meals: [] };
        setData(migrated);
      } else if (saved && saved._date && saved._date !== TODAY) {
        // Archive old data
        sv(`en:${saved._date}`, saved);
        if (!localIdx.includes(saved._date)) {
          localIdx = [...localIdx, saved._date]; sv(SK_ENI, localIdx);
        }
        // Start fresh
        setData(defaultEnergy);
      }
      setEnIdx(localIdx);
      setLoaded(true);
    })();
  }, []);

  const persist = (d) => {
    const stamped = { ...d, _date: TODAY };
    setData(stamped); sv(SK_EN, stamped);
    if (!enIdx.includes(TODAY)) {
      const ni = [...enIdx, TODAY]; setEnIdx(ni); sv(SK_ENI, ni);
    }
  };

  const setEnergy = (period, val) => { persist({ ...data, [period]: { ...data[period], energy: val } }); };
  const setNote = (period, val) => { persist({ ...data, [period]: { ...data[period], note: val } }); };
  const addMealTo = (period) => {
    const text = newMeals[period];
    if (!text || !text.trim()) return;
    const meal = { id: Date.now(), text: text.trim(), time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
    persist({ ...data, [period]: { ...data[period], meals: [...(data[period].meals || []), meal] } });
    setNewMeals({ ...newMeals, [period]: "" });
  };
  const removeMealFrom = (period, id) => {
    persist({ ...data, [period]: { ...data[period], meals: (data[period].meals || []).filter(m => m.id !== id) } });
  };

  const viewPast = async (date) => {
    setLoadingPast(true);
    const entry = await ld(`en:${date}`, null);
    setPastData(entry);
    setViewing(date);
    setLoadingPast(false);
  };
  const backToToday = () => { setViewing(null); setPastData(null); };

  const energyColor = (val) => {
    if (val === 0) return "#3A3A3A";
    if (val <= 3) return "#A5566A";
    if (val <= 5) return "#A57A3A";
    if (val <= 7) return "#C8A951";
    return "#5A8A6A";
  };
  const energyLabel = (val) => {
    if (val === 0) return "Not rated";
    if (val <= 2) return "Depleted";
    if (val <= 4) return "Low";
    if (val <= 6) return "Steady";
    if (val <= 8) return "Strong";
    return "On fire";
  };

  const periods = [
    { k: "morning", label: "Morning", emoji: "☀️", hint: "How do you feel after waking + morning routine?" },
    { k: "midday", label: "Midday", emoji: "🌤️", hint: "Energy level after lunch / mid-afternoon?" },
    { k: "evening", label: "Evening", emoji: "🌙", hint: "How did your energy hold up through the day?" },
  ];

  const calcAvg = (d) => {
    const rated = periods.map(p => (d[p.k] && d[p.k].energy) || 0).filter(v => v > 0);
    return rated.length > 0 ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : "—";
  };

  const sortedDates = [...enIdx].sort().reverse().filter(d => d !== TODAY);
  const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  if (!loaded) return <div style={{padding:"2rem",textAlign:"center",color:"#8A8678"}}>Loading...</div>;

  const activeData = viewing ? pastData : data;
  const isReadOnly = viewing !== null;
  const avgEnergy = activeData ? calcAvg(activeData) : "—";

  const renderEnergyBar = (val) => (
    <div style={{display:"flex",gap:"0.25rem"}}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <div key={n} style={{
          flex:1,height:24,borderRadius:2,
          background: n <= val ? energyColor(val) : "rgba(255,255,255,0.04)",
          opacity: n <= val ? (0.5 + (n / val) * 0.5) : 1
        }}/>
      ))}
    </div>
  );

  return (<div>
    <div style={{display:"flex",gap:"1rem",alignItems:"flex-start",marginBottom:"1.5rem",padding:"1.1rem",background:"rgba(200,169,81,0.03)",border:"1px solid rgba(200,169,81,0.08)",borderRadius:3}}>
      <div style={{fontSize:"1.5rem",flexShrink:0}}>🔋</div>
      <div>
        <div style={{fontSize:"1rem",fontWeight:500,marginBottom:"0.25rem"}}>Energy & Fuel Tracker</div>
        <div style={{fontSize:"0.8rem",color:"#8A8678",lineHeight:1.6}}>
          {viewing ? `Viewing ${fmtDate(viewing)}` : "Track how you feel throughout the day and what you're eating."}
        </div>
      </div>
    </div>

    {/* History browser */}
    {sortedDates.length > 0 && (
      <div style={{marginBottom:"1.2rem"}}>
        <div style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#8A8678",marginBottom:"0.4rem"}}>Past days:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem",alignItems:"center"}}>
          <button onClick={backToToday} style={{
            background: viewing===null ? "rgba(200,169,81,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${viewing===null ? "rgba(200,169,81,0.3)" : "rgba(255,255,255,0.08)"}`,
            color: viewing===null ? "#C8A951" : "#8A8678",
            padding:"0.35rem 0.7rem",borderRadius:2,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit",fontWeight:viewing===null?500:400
          }}>Today</button>
          {sortedDates.map(d => (
            <button key={d} onClick={() => viewPast(d)} style={{
              background: viewing===d ? "rgba(106,90,138,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${viewing===d ? "rgba(106,90,138,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: viewing===d ? "#A09ABB" : "#6A6A5A",
              padding:"0.35rem 0.7rem",borderRadius:2,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit",fontWeight:viewing===d?500:400
            }}>{fmtDate(d)}</button>
          ))}
        </div>
      </div>
    )}

    {loadingPast ? <div style={{padding:"2rem",textAlign:"center",color:"#8A8678"}}>Loading...</div> :
    !activeData && viewing ? <div style={{padding:"2rem",textAlign:"center",color:"#6A6A5A",fontStyle:"italic"}}>No data found for this date.</div> :
    (<>
      {viewing && (
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <div style={{fontSize:"0.9rem",fontWeight:500}}>{fmtDate(viewing)}</div>
          <button onClick={backToToday} style={{background:"none",border:"1px solid rgba(200,169,81,0.2)",color:"#C8A951",padding:"0.4rem 0.8rem",borderRadius:3,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit"}}>← Back to today</button>
        </div>
      )}

      {/* Average energy badge */}
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",background:"rgba(200,169,81,0.06)",border:"1px solid rgba(200,169,81,0.12)",borderRadius:4,padding:"0.8rem 1.5rem"}}>
          <div style={{fontSize:"1.8rem",fontWeight:600,color:energyColor(parseFloat(avgEnergy) || 0)}}>{avgEnergy}</div>
          <div style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#8A8678"}}>Avg energy{viewing ? "" : " today"}</div>
        </div>
      </div>

      {/* Energy check-ins with per-period food logs */}
      {periods.map(p => {
        const val = (activeData[p.k] && activeData[p.k].energy) || 0;
        const note = (activeData[p.k] && activeData[p.k].note) || "";
        const meals = (activeData[p.k] && activeData[p.k].meals) || [];
        return (
          <div key={p.k} style={{marginBottom:"1.2rem",background:"#14171E",border:"1px solid rgba(200,169,81,0.08)",borderRadius:3,padding:"1rem 1.1rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.6rem"}}>
              <span>{p.emoji}</span>
              <span style={{fontSize:"0.88rem",fontWeight:500}}>{p.label}</span>
              {val > 0 && <span style={{marginLeft:"auto",fontSize:"0.75rem",color:energyColor(val),fontWeight:500}}>{val}/10 — {energyLabel(val)}</span>}
            </div>
            {!isReadOnly && <div style={{fontSize:"0.68rem",color:"#6A6A5A",marginBottom:"0.6rem",fontStyle:"italic"}}>{p.hint}</div>}
            {isReadOnly ? renderEnergyBar(val) : (
              <div style={{display:"flex",gap:"0.25rem",marginBottom:"0.6rem"}}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setEnergy(p.k, n)} style={{
                    flex:1,height:32,border:"none",borderRadius:2,cursor:"pointer",fontSize:"0.7rem",fontWeight:500,fontFamily:"inherit",
                    background: n <= val ? energyColor(val) : "rgba(255,255,255,0.04)",
                    color: n <= val ? "#0D0F14" : "#4A4A3A",
                    transition:"all 0.15s",
                    opacity: n <= val ? (0.5 + (n / val) * 0.5) : 1
                  }}>{n}</button>
                ))}
              </div>
            )}
            {isReadOnly ? (note && <div style={{fontSize:"0.8rem",color:"#8A8678",marginTop:"0.5rem",fontStyle:"italic"}}>{note}</div>) : (
              <input type="text" value={note} onChange={e => setNote(p.k, e.target.value)} placeholder="How are you feeling? What's affecting your energy?"
                style={{width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(200,169,81,0.08)",borderRadius:2,color:"#C8C0B0",fontFamily:"inherit",fontSize:"0.8rem",padding:"0.6rem 0.8rem",outline:"none",boxSizing:"border-box"}} />
            )}

            {/* Per-period food log */}
            <div style={{marginTop:"0.8rem",paddingTop:"0.7rem",borderTop:"1px solid rgba(200,169,81,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.4rem",marginBottom:"0.5rem"}}>
                <span style={{fontSize:"0.8rem"}}>🍽️</span>
                <span style={{fontSize:"0.6rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#6A6A5A"}}>What I ate</span>
                {meals.length > 0 && <span style={{fontSize:"0.6rem",color:"#4A4A3A",marginLeft:"auto"}}>{meals.length}</span>}
              </div>
              {!isReadOnly && (
                <div style={{display:"flex",gap:"0.3rem",marginBottom:"0.4rem"}}>
                  <input type="text" value={newMeals[p.k]} onChange={e => setNewMeals({...newMeals, [p.k]: e.target.value})} onKeyDown={e => { if (e.key === "Enter") addMealTo(p.k); }}
                    placeholder="What did you eat or drink?"
                    style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(200,169,81,0.06)",borderRadius:2,color:"#E8E4DC",fontFamily:"inherit",fontSize:"0.78rem",padding:"0.5rem 0.7rem",outline:"none"}} />
                  <button onClick={() => addMealTo(p.k)} style={{
                    background: newMeals[p.k] && newMeals[p.k].trim() ? "rgba(200,169,81,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${newMeals[p.k] && newMeals[p.k].trim() ? "rgba(200,169,81,0.2)" : "rgba(255,255,255,0.05)"}`,
                    color: newMeals[p.k] && newMeals[p.k].trim() ? "#C8A951" : "#4A4A3A",
                    padding:"0.5rem 0.7rem",borderRadius:2,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit",fontWeight:500
                  }}>+</button>
                </div>
              )}
              {meals.length > 0 ? (
                <div style={{display:"flex",flexDirection:"column",gap:"0.2rem"}}>
                  {meals.map(meal => (
                    <div key={meal.id} style={{display:"flex",alignItems:"center",gap:"0.6rem",padding:"0.4rem 0.6rem",background:"rgba(255,255,255,0.02)",borderRadius:2}}>
                      <span style={{fontSize:"0.6rem",color:"#5A5A4A",minWidth:48}}>{meal.time}</span>
                      <span style={{fontSize:"0.78rem",flex:1,color:"#A8A098"}}>{meal.text}</span>
                      {!isReadOnly && <button onClick={() => removeMealFrom(p.k, meal.id)} style={{background:"none",border:"none",color:"#4A4A3A",fontSize:"0.9rem",cursor:"pointer",padding:"0 0.2rem",fontFamily:"inherit"}}>×</button>}
                    </div>
                  ))}
                </div>
              ) : (
                !isReadOnly && <div style={{fontSize:"0.68rem",color:"#3A3A3A",fontStyle:"italic",padding:"0.3rem 0"}}>No meals logged yet</div>
              )}
            </div>
          </div>
        );
      })}

      <Quote text={'"Do you not know that your bodies are temples of the Holy Spirit? Therefore honor God with your bodies."'} ref="1 Corinthians 6:19-20" />
    </>)}
  </div>);
}
