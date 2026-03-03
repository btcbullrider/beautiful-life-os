import { useState } from "react";
import { ld, TODAY } from "../utils/storage";

export default function JournalTab({ jo, onChange, joIdx, aff }) {
  const [viewing, setViewing] = useState(null);
  const [pastEntry, setPastEntry] = useState("");
  const [loadingPast, setLoadingPast] = useState(false);

  const viewPast = async (date) => {
    setLoadingPast(true);
    const entry = await ld(`jo:${date}`, "");
    // Handle both old format (plain string) and new format (object with text)
    const text = (entry && typeof entry === "object") ? (entry.text || "") : (entry || "");
    setPastEntry(text);
    setViewing(date);
    setLoadingPast(false);
  };
  const backToToday = () => { setViewing(null); setPastEntry(""); };

  // Core prompts that are always present
  const corePrompts = [
    "What am I grateful for right now?",
    "Where did I see God move today?",
    "What pendulums tried to pull me off my lifeline?",
  ];

  // Dynamic prompts generated from current affirmations
  const affPrompts = (aff || []).filter(a => a.trim()).map(a => {
    const clean = a.replace(/^I am /i, "").replace(/^I /i, "").replace(/\.$/, "");
    return `How did I live out "${a.length > 60 ? a.slice(0, 57) + "..." : a}" today?`;
  });

  const allPrompts = [...corePrompts, ...affPrompts];
  const sortedDates = [...joIdx].sort().reverse().filter(d => d !== TODAY);

  const fmtDate = (d) => {
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (<div>
    <div style={{display:"flex",gap:"1rem",alignItems:"flex-start",marginBottom:"1.5rem",padding:"1.1rem",background:"rgba(200,169,81,0.03)",border:"1px solid rgba(200,169,81,0.08)",borderRadius:3}}>
      <div style={{fontSize:"1.5rem",flexShrink:0}}>📔</div>
      <div><div style={{fontSize:"1rem",fontWeight:500,marginBottom:"0.25rem"}}>Daily Reflection</div>
      <div style={{fontSize:"0.8rem",color:"#8A8678",lineHeight:1.6}}>Write freely. Process, pray on paper, notice what's shifting. Saves automatically.</div></div>
    </div>

    {/* History browser */}
    {sortedDates.length > 0 && (
      <div style={{marginBottom:"1.2rem"}}>
        <div style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#8A8678",marginBottom:"0.4rem"}}>Past entries:</div>
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

    {viewing === null ? (<>
      {/* Today's editor */}
      <div style={{marginBottom:"1rem"}}>
        <div style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#8A8678",marginBottom:"0.4rem"}}>Core prompts:</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",marginBottom:"0.6rem"}}>
          {corePrompts.map((p,i)=><button key={"c"+i} onClick={()=>onChange(jo+(jo?"\n\n":"")+p+"\n")} style={{background:"rgba(106,90,138,0.08)",border:"1px solid rgba(106,90,138,0.15)",color:"#A09ABB",padding:"0.35rem 0.7rem",borderRadius:2,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit",textAlign:"left"}}>{p}</button>)}
        </div>
        {affPrompts.length > 0 && (<>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"#C8A951",opacity:0.6,marginBottom:"0.4rem"}}>From your affirmations:</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>
            {affPrompts.map((p,i)=><button key={"a"+i} onClick={()=>onChange(jo+(jo?"\n\n":"")+p+"\n")} style={{background:"rgba(200,169,81,0.05)",border:"1px solid rgba(200,169,81,0.15)",color:"#C8A951",padding:"0.35rem 0.7rem",borderRadius:2,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit",textAlign:"left",opacity:0.85}}>{p}</button>)}
          </div>
        </>)}
      </div>
      <textarea value={jo} onChange={e=>onChange(e.target.value)} placeholder="Begin writing..." rows={16} style={{width:"100%",background:"#14171E",border:"1px solid rgba(200,169,81,0.1)",borderRadius:3,color:"#E8E4DC",fontFamily:"inherit",fontSize:"0.88rem",padding:"1.1rem",resize:"vertical",lineHeight:1.7,outline:"none",minHeight:300}}/>
    </>) : (<>
      {/* Past entry viewer */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.8rem"}}>
        <div style={{fontSize:"0.9rem",fontWeight:500}}>{fmtDate(viewing)}</div>
        <button onClick={backToToday} style={{background:"none",border:"1px solid rgba(200,169,81,0.2)",color:"#C8A951",padding:"0.4rem 0.8rem",borderRadius:3,cursor:"pointer",fontSize:"0.72rem",fontFamily:"inherit"}}>← Back to today</button>
      </div>
      {loadingPast ? (
        <div style={{padding:"2rem",textAlign:"center",color:"#8A8678",fontSize:"0.85rem"}}>Loading...</div>
      ) : pastEntry ? (
        <div style={{background:"#14171E",border:"1px solid rgba(200,169,81,0.08)",borderRadius:3,padding:"1.2rem",minHeight:200,whiteSpace:"pre-wrap",fontSize:"0.88rem",lineHeight:1.7,color:"#C8C0B0"}}>{pastEntry}</div>
      ) : (
        <div style={{padding:"2rem",textAlign:"center",color:"#6A6A5A",fontSize:"0.85rem",fontStyle:"italic"}}>No entry found for this date.</div>
      )}
    </>)}
  </div>);
}
