import { PIL } from "../utils/constants";

export default function ReviewTab({ ps, upPil, wn, onWn }) {
  return (<div>
    <div style={{display:"flex",gap:"1rem",alignItems:"flex-start",marginBottom:"1.5rem",padding:"1.1rem",background:"rgba(200,169,81,0.03)",border:"1px solid rgba(200,169,81,0.08)",borderRadius:3}}>
      <div style={{fontSize:"1.5rem",flexShrink:0}}>📊</div>
      <div><div style={{fontSize:"1rem",fontWeight:500,marginBottom:"0.25rem"}}>Weekly Pillar Review</div>
      <div style={{fontSize:"0.8rem",color:"#8A8678",lineHeight:1.6}}>Rate yourself 1-5 on each pillar. Honest, not harsh. This is calibration, not judgment.</div></div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",marginBottom:"1.5rem"}}>
      {PIL.map(p=>{const sc=ps[p.id]||0; return(
        <div key={p.id} style={{background:"#14171E",border:"1px solid rgba(200,169,81,0.08)",borderRadius:3,padding:"0.9rem 1.1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.7rem"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
            <div><div style={{fontSize:"0.86rem",fontWeight:500}}>{p.short}</div><div style={{fontSize:"0.66rem",color:"#8A8678"}}>{p.name}</div></div>
          </div>
          <div style={{display:"flex",gap:"0.25rem"}}>
            {[1,2,3,4,5].map(n=><button key={n} onClick={()=>upPil(p.id,n)} style={{
              width:30,height:30,border:`1px solid ${n<=sc?p.color:"rgba(255,255,255,0.08)"}`,borderRadius:3,cursor:"pointer",fontSize:"0.78rem",fontWeight:500,fontFamily:"inherit",
              background:n<=sc?p.color:"rgba(255,255,255,0.04)",color:n<=sc?"#0D0F14":"#5A5A5A",display:"flex",alignItems:"center",justifyContent:"center"
            }}>{n}</button>)}
          </div>
        </div>
      );})}
    </div>
    <div style={{display:"flex",justifyContent:"space-around",alignItems:"flex-end",height:90,padding:"0.8rem 0",marginBottom:"1.5rem",borderBottom:"1px solid rgba(200,169,81,0.08)"}}>
      {PIL.map(p=>{const sc=ps[p.id]||0; return(
        <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",flex:1}}>
          <div style={{width:22,height:60,background:"rgba(255,255,255,0.03)",borderRadius:2,overflow:"hidden",display:"flex",alignItems:"flex-end"}}>
            <div style={{width:"100%",borderRadius:2,height:`${(sc/5)*100}%`,background:p.color,opacity:0.7,transition:"height 0.4s"}}/>
          </div>
          <div style={{fontSize:"0.55rem",letterSpacing:"0.06em",textTransform:"uppercase",color:"#6A6A5A"}}>{p.short.slice(0,3)}</div>
        </div>
      );})}
    </div>
    <div style={{fontSize:"0.72rem",color:"#8A8678",marginBottom:"0.4rem"}}>Weekly notes + intentions for next week:</div>
    <textarea value={wn} onChange={e=>onWn(e.target.value)} placeholder="What patterns am I noticing? What needs to shift? What am I celebrating?" rows={6} style={{width:"100%",background:"#14171E",border:"1px solid rgba(200,169,81,0.1)",borderRadius:3,color:"#E8E4DC",fontFamily:"inherit",fontSize:"0.85rem",padding:"0.9rem",resize:"vertical",lineHeight:1.6,outline:"none"}}/>
  </div>);
}
