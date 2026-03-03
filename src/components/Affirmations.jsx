import { useState } from "react";

export default function AffTab({ aff, ed, setEd, onSave }) {
  const [draft, setDraft] = useState(aff);
  const startEdit = () => { setDraft([...aff]); setEd(true); };
  const doSave = () => { onSave(draft.filter(a=>a.trim()!=="")); setEd(false); };
  const upD = (i,v) => { const n=[...draft]; n[i]=v; setDraft(n); };
  const iS = {flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(200,169,81,0.12)",borderRadius:2,color:"#E8E4DC",fontFamily:"inherit",fontSize:"0.85rem",padding:"0.5rem 0.7rem",resize:"vertical",lineHeight:1.5,outline:"none"};
  return (<div>
    <div style={{display:"flex",gap:"1rem",alignItems:"flex-start",marginBottom:"1.5rem",padding:"1.1rem",background:"rgba(200,169,81,0.03)",border:"1px solid rgba(200,169,81,0.08)",borderRadius:3}}>
      <div style={{fontSize:"1.5rem",flexShrink:0}}>✍️</div>
      <div><div style={{fontSize:"1rem",fontWeight:500,marginBottom:"0.25rem"}}>Your Identity Declarations</div>
      <div style={{fontSize:"0.8rem",color:"#8A8678",lineHeight:1.6}}>Write these 10-15 times each morning. Present tense. First person. As if it's already true.</div></div>
    </div>
    {!ed ? (<>
      <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",marginBottom:"1rem"}}>
        {aff.map((a,i)=><div key={i} style={{display:"flex",gap:"1rem",padding:"0.9rem 1.1rem",background:"#14171E",border:"1px solid rgba(200,169,81,0.08)",borderRadius:3}}>
          <div style={{color:"#C8A951",opacity:0.4,fontSize:"0.78rem",fontWeight:500,minWidth:22,paddingTop:"0.1rem"}}>{String(i+1).padStart(2,"0")}</div>
          <div style={{fontSize:"0.88rem",lineHeight:1.6,color:"#C8C0B0"}}>{a}</div>
        </div>)}
      </div>
      <button onClick={startEdit} style={{background:"none",border:"1px solid rgba(200,169,81,0.2)",color:"#C8A951",padding:"0.55rem 1.1rem",borderRadius:3,cursor:"pointer",fontSize:"0.78rem",fontFamily:"inherit"}}>Edit Affirmations</button>
    </>) : (<>
      <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",marginBottom:"0.8rem"}}>
        {draft.map((a,i)=><div key={i} style={{display:"flex",gap:"0.7rem",alignItems:"flex-start",padding:"0.7rem",background:"#14171E",border:"1px solid rgba(200,169,81,0.1)",borderRadius:3}}>
          <div style={{color:"#C8A951",opacity:0.4,fontSize:"0.78rem",minWidth:22,paddingTop:"0.55rem"}}>{String(i+1).padStart(2,"0")}</div>
          <textarea value={a} onChange={e=>upD(i,e.target.value)} rows={2} placeholder="I am..." style={iS}/>
          <button onClick={()=>setDraft(draft.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:"#A5566A",fontSize:"1.2rem",cursor:"pointer",fontFamily:"inherit"}}>×</button>
        </div>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={()=>setDraft([...draft,""])} style={{background:"none",border:"1px dashed rgba(200,169,81,0.2)",color:"#8A8678",padding:"0.45rem 0.9rem",borderRadius:3,cursor:"pointer",fontSize:"0.75rem",fontFamily:"inherit"}}>+ Add</button>
        <div style={{display:"flex",gap:"0.4rem"}}>
          <button onClick={()=>setEd(false)} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",color:"#8A8678",padding:"0.45rem 0.9rem",borderRadius:3,cursor:"pointer",fontSize:"0.75rem",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={doSave} style={{background:"rgba(200,169,81,0.15)",border:"1px solid rgba(200,169,81,0.3)",color:"#C8A951",padding:"0.45rem 1rem",borderRadius:3,cursor:"pointer",fontSize:"0.75rem",fontWeight:500,fontFamily:"inherit"}}>Save</button>
        </div>
      </div>
    </>)}
  </div>);
}
