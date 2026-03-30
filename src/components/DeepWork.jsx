import { useState, useEffect } from "react";
import { ld, sv, TODAY } from "../utils/storage";
import { Quote } from "./shared/UI";
import ProofOfWork from "./ProofOfWork";

export default function DeepWorkTab() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "", why: "", done: false },
    { id: 2, text: "", why: "", done: false },
    { id: 3, text: "", why: "", done: false },
  ]);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(0);
  const [dwIdx, setDwIdx] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [pastData, setPastData] = useState(null);
  const [loadingPast, setLoadingPast] = useState(false);

  const SK_DW = "dw:today";
  const SK_DWI = "dw:index";

  useEffect(() => {
    (async () => {
      const [saved, idx] = await Promise.all([ld(SK_DW, null), ld(SK_DWI, [])]);
      if (saved && saved._date === TODAY) {
        setTasks(saved.tasks); setStep(saved.step);
      } else if (saved && saved._date && saved._date !== TODAY) {
        // Archive yesterday's data under its date key
        sv(`dw:${saved._date}`, saved);
        // Add to index if not there
        if (!idx.includes(saved._date)) {
          const ni = [...idx, saved._date]; sv(SK_DWI, ni); setDwIdx(ni);
        } else { setDwIdx(idx); }
      } else { setDwIdx(idx); }
      setLoaded(true);
    })();
  }, []);

  const persist = (t, s) => {
    sv(SK_DW, { tasks: t, step: s, _date: TODAY });
    if (!dwIdx.includes(TODAY)) {
      const ni = [...dwIdx, TODAY]; setDwIdx(ni); sv(SK_DWI, ni);
    }
  };

  const updateTask = (id, field, value) => {
    const next = tasks.map(t => t.id === id ? { ...t, [field]: value } : t);
    setTasks(next); persist(next, step);
  };
  const toggleDone = (id) => {
    const next = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTasks(next); persist(next, step);
  };
  const lockIn = () => { setStep(1); persist(tasks, 1); };
  const unlock = () => { setStep(0); persist(tasks, 0); };

  const viewPast = async (date) => {
    setLoadingPast(true);
    const entry = await ld(`dw:${date}`, null);
    setPastData(entry);
    setViewing(date);
    setLoadingPast(false);
  };
  const backToToday = () => { setViewing(null); setPastData(null); };

  const allFilled = tasks.every(t => t.text.trim() !== "");
  const doneCount = tasks.filter(t => t.done).length;
  const sortedDates = [...dwIdx].sort().reverse().filter(d => d !== TODAY);
  const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const prompts = [
    { q: "If you could only accomplish ONE thing today that would move the needle most, what would it be?", sub: "Think: what would make today a win even if nothing else got done?" },
    { q: "What's the second most important thing?", sub: "What supports the first, or moves a different key area forward?" },
    { q: "What's the third?", sub: "What would make you feel like today was extraordinary if you finished all three?" },
  ];

  if (!loaded) return <div style={{padding:"2rem",textAlign:"center",color:"#8A8678"}}>Loading...</div>;

  return (<div>
    <div style={{display:"flex",gap:"1rem",alignItems:"flex-start",marginBottom:"1.5rem",padding:"1.1rem",background:"rgba(200,169,81,0.03)",border:"1px solid rgba(200,169,81,0.08)",borderRadius:3}}>
      <div style={{fontSize:"1.5rem",flexShrink:0}}>⚡</div>
      <div>
        <div style={{fontSize:"1rem",fontWeight:500,marginBottom:"0.25rem"}}>Today's Three Deep Work Priorities</div>
        <div style={{fontSize:"0.8rem",color:"#8A8678",lineHeight:1.6}}>
          {viewing ? `Viewing ${fmtDate(viewing)}` : step === 0
            ? "Before you start working — get clear. What are the three things that matter most today?"
            : "Your priorities are locked in. Execute with zero distractions."
          }
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

    {viewing !== null ? (
      /* Past view — read only */
      loadingPast ? <div style={{padding:"2rem",textAlign:"center",color:"#8A8678"}}>Loading...</div> :
      pastData && pastData.tasks ? (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
            <div style={{fontSize:"0.9rem",fontWeight:500}}>{fmtDate(viewing)}</div>
            <button onClick={backToToday} style={{background:"none",border:"1px solid rgba(200,169,81,0.2)",color:"#C8A951",padding:"0.4rem 0.8rem",borderRadius:3,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit"}}>← Back to today</button>
          </div>
          {pastData.tasks.map((task, i) => (
            <div key={task.id} style={{
              display:"flex",alignItems:"flex-start",gap:"0.8rem",padding:"1rem",marginBottom:"0.5rem",
              background: task.done ? "rgba(90,138,106,0.06)" : "#14171E",
              border: `1px solid ${task.done ? "rgba(90,138,106,0.15)" : "rgba(200,169,81,0.08)"}`,
              borderRadius:3
            }}>
              <div style={{width:24,height:24,borderRadius:3,border:`1.5px solid ${task.done?"#5A8A6A":"rgba(200,169,81,0.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",color:"#5A8A6A",background:task.done?"rgba(90,138,106,0.2)":"none",flexShrink:0}}>{task.done&&"✓"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.15rem"}}>
                  <span style={{fontSize:"0.65rem",fontWeight:600,color:"#C8A951",opacity:0.5}}>#{i+1}</span>
                  <span style={{fontSize:"0.9rem",fontWeight:500,opacity:task.done?0.5:1,textDecoration:task.done?"line-through":"none"}}>{task.text}</span>
                </div>
                {task.why && <div style={{fontSize:"0.75rem",color:"#6A6A5A",fontStyle:"italic"}}>{task.why}</div>}
              </div>
            </div>
          ))}
          <div style={{textAlign:"center",marginTop:"1rem",fontSize:"0.75rem",color:"#6A6A5A"}}>
            {pastData.tasks.filter(t=>t.done).length}/3 completed
          </div>
        </div>
      ) : <div style={{padding:"2rem",textAlign:"center",color:"#6A6A5A",fontStyle:"italic"}}>No data found for this date.</div>
    ) : (
      /* Today — normal edit/execute mode */
      <>
        {step === 0 ? (
          <>
            {tasks.map((task, i) => (
              <div key={task.id} style={{marginBottom:"1.2rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.5rem"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(200,169,81,0.1)",border:"1px solid rgba(200,169,81,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",fontWeight:600,color:"#C8A951"}}>{i+1}</div>
                  <div>
                    <div style={{fontSize:"0.88rem",fontWeight:500,color:"#E8E4DC"}}>{prompts[i].q}</div>
                    <div style={{fontSize:"0.7rem",color:"#6A6A5A",fontStyle:"italic"}}>{prompts[i].sub}</div>
                  </div>
                </div>
                <input type="text" value={task.text} onChange={e => updateTask(task.id, "text", e.target.value)} placeholder="What needs to get done..." style={{width:"100%",background:"#14171E",border:"1px solid rgba(200,169,81,0.1)",borderRadius:3,color:"#E8E4DC",fontFamily:"inherit",fontSize:"0.9rem",padding:"0.8rem 1rem",outline:"none",marginBottom:"0.4rem",boxSizing:"border-box"}} />
                <input type="text" value={task.why || ""} onChange={e => updateTask(task.id, "why", e.target.value)} placeholder="Why does this matter? (optional — but it sharpens focus)" style={{width:"100%",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(200,169,81,0.06)",borderRadius:3,color:"#8A8678",fontFamily:"inherit",fontSize:"0.78rem",padding:"0.6rem 1rem",outline:"none",fontStyle:"italic",boxSizing:"border-box"}} />
              </div>
            ))}
            <button onClick={lockIn} disabled={!allFilled} style={{width:"100%",padding:"0.9rem",borderRadius:3,cursor:allFilled?"pointer":"default",fontFamily:"inherit",fontSize:"0.85rem",fontWeight:500,letterSpacing:"0.05em",background:allFilled?"rgba(200,169,81,0.15)":"rgba(255,255,255,0.03)",color:allFilled?"#C8A951":"#4A4A3A",border:allFilled?"1px solid rgba(200,169,81,0.3)":"1px solid rgba(255,255,255,0.05)",transition:"all 0.2s"}}>{allFilled ? "🔒 Lock in my priorities" : "Fill in all 3 to lock in"}</button>
            <div style={{textAlign:"center",marginTop:"0.8rem",fontSize:"0.7rem",color:"#5A5A4A",fontStyle:"italic"}}>Once locked, you commit to these three. No adding. No switching. Just execution.</div>
          </>
        ) : (
          <>
            <div style={{marginBottom:"1.2rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
                <span style={{fontSize:"0.72rem",color:"#8A8678",letterSpacing:"0.1em",textTransform:"uppercase"}}>Deep Work Progress</span>
                <span style={{fontSize:"0.85rem",color:"#C8A951"}}>{doneCount}/3</span>
              </div>
              <div style={{width:"100%",height:4,background:"rgba(255,255,255,0.04)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:2,transition:"width 0.4s",width:`${(doneCount/3)*100}%`,background:doneCount===3?"linear-gradient(90deg,#5A8A6A,#C8A951)":"linear-gradient(90deg,#4A6FA5,#C8A951)"}}/>
              </div>
              {doneCount===3&&<div style={{textAlign:"center",color:"#C8A951",fontSize:"0.8rem",marginTop:"0.8rem",fontStyle:"italic"}}>⚡ All three blocks complete. Extraordinary day.</div>}
            </div>
            {tasks.map((task, i) => (
              <button key={task.id} onClick={() => toggleDone(task.id)} style={{display:"flex",alignItems:"flex-start",gap:"0.8rem",width:"100%",background:task.done?"rgba(90,138,106,0.06)":"#14171E",border:`1px solid ${task.done?"rgba(90,138,106,0.15)":"rgba(200,169,81,0.08)"}`,borderRadius:3,padding:"1rem",marginBottom:"0.5rem",cursor:"pointer",fontFamily:"inherit",textAlign:"left",color:"#E8E4DC",transition:"all 0.2s"}}>
                <div style={{width:24,height:24,borderRadius:3,border:`1.5px solid ${task.done?"#5A8A6A":"rgba(200,169,81,0.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",color:"#5A8A6A",background:task.done?"rgba(90,138,106,0.2)":"none",flexShrink:0,marginTop:"0.1rem"}}>{task.done&&"✓"}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.15rem"}}><span style={{fontSize:"0.65rem",fontWeight:600,color:"#C8A951",opacity:0.5}}>#{i+1}</span><span style={{fontSize:"0.9rem",fontWeight:500,opacity:task.done?0.5:1,textDecoration:task.done?"line-through":"none"}}>{task.text}</span></div>
                  {task.why && <div style={{fontSize:"0.75rem",color:"#6A6A5A",fontStyle:"italic",opacity:task.done?0.4:0.7}}>{task.why}</div>}
                </div>
              </button>
            ))}
            <button onClick={unlock} style={{background:"none",border:"1px solid rgba(255,255,255,0.08)",color:"#6A6A5A",padding:"0.5rem 1rem",borderRadius:3,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit",marginTop:"0.5rem"}}>🔓 Unlock & edit priorities</button>
          </>
        )}
        <ProofOfWork />
        <Quote text={'"Whatever your hand finds to do, do it with all your might."'} ref="Ecclesiastes 9:10" />
      </>
    )}
  </div>);
}
