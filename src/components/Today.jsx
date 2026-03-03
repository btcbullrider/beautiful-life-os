import { useState } from "react";
import { CL } from "../utils/constants";
import DailyDevotional from "./DailyDevotional";

export default function TodayTab({ ck, tog, prog, cc, tot, order, onReorder }) {
  const [expanded, setExpanded] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [overCat, setOverCat] = useState(null);

  const cats = [{k:"morning",l:"Morning Rhythm",e:"☀️"},{k:"day",l:"Daytime",e:"⚡"},{k:"evening",l:"Evening",e:"🌙"}];

  // Build ordered items per category
  const getItemsForCat = (catKey) => {
    const fromOrder = order
      .map(id => CL.find(c => c.id === id))
      .filter(Boolean)
      .filter(c => c.cat === catKey);
    // Add any new CL items not in saved order
    const missing = CL.filter(c => c.cat === catKey && !order.includes(c.id));
    return [...fromOrder, ...missing];
  };

  const onDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragOverItem = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragId) setOverId(id);
  };
  const onDragOverCat = (e, catKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCat(catKey);
  };
  const onDropOnItem = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); setOverCat(null); return; }
    // Get target's category
    const targetItem = CL.find(c => c.id === targetId);
    const dragItem = CL.find(c => c.id === dragId);
    if (targetItem && dragItem) dragItem.cat = targetItem.cat;
    // Reorder
    const newOrder = [...order];
    const fromIdx = newOrder.indexOf(dragId);
    const toIdx = newOrder.indexOf(targetId);
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, dragId);
    onReorder(newOrder);
    setDragId(null); setOverId(null); setOverCat(null);
  };
  const onDropOnCat = (e, catKey) => {
    e.preventDefault();
    if (!dragId) { setDragId(null); setOverId(null); setOverCat(null); return; }
    const dragItem = CL.find(c => c.id === dragId);
    if (dragItem) dragItem.cat = catKey;
    // Move to end of that category's items in order
    const newOrder = order.filter(id => id !== dragId);
    const catItems = newOrder.filter(id => { const it = CL.find(c => c.id === id); return it && it.cat === catKey; });
    const lastCatItem = catItems[catItems.length - 1];
    if (lastCatItem) {
      const insertIdx = newOrder.indexOf(lastCatItem) + 1;
      newOrder.splice(insertIdx, 0, dragId);
    } else {
      // Empty category — find where this cat section should be
      const catOrder = ["morning","day","evening"];
      const catIdx = catOrder.indexOf(catKey);
      let insertIdx = newOrder.length;
      for (let ci = catIdx + 1; ci < catOrder.length; ci++) {
        const firstInNext = newOrder.find(id => { const it = CL.find(c => c.id === id); return it && it.cat === catOrder[ci]; });
        if (firstInNext) { insertIdx = newOrder.indexOf(firstInNext); break; }
      }
      newOrder.splice(insertIdx, 0, dragId);
    }
    onReorder(newOrder);
    setDragId(null); setOverId(null); setOverCat(null);
  };
  const onDragEnd = () => { setDragId(null); setOverId(null); setOverCat(null); };

  const renderItem = (item) => {
    const isExp = expanded === item.id;
    const isDragging = dragId === item.id;
    const isOver = overId === item.id && dragId !== item.id;
    return (
      <div
        key={item.id}
        draggable
        onDragStart={e => onDragStart(e, item.id)}
        onDragOver={e => onDragOverItem(e, item.id)}
        onDrop={e => onDropOnItem(e, item.id)}
        onDragEnd={onDragEnd}
        style={{
          marginBottom:"0.35rem",
          opacity: isDragging ? 0.3 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {isOver && <div style={{height:2,background:"#C8A951",borderRadius:1,marginBottom:4,opacity:0.6}}/>}
        <div style={{
          display:"flex",alignItems:"center",gap:"0.6rem",width:"100%",
          background:ck[item.id]?"rgba(90,138,106,0.06)":"#14171E",
          border:`1px solid ${ck[item.id]?"rgba(90,138,106,0.15)":"rgba(200,169,81,0.08)"}`,
          borderRadius: isExp ? "3px 3px 0 0" : 3,
          padding:"0.85rem 0.8rem",
          fontFamily:"inherit",textAlign:"left",color:"#E8E4DC"
        }}>
          <div style={{cursor:"grab",color:"#4A4A3A",fontSize:"0.85rem",padding:"0 0.15rem",userSelect:"none",flexShrink:0,display:"flex",alignItems:"center"}}>⋮⋮</div>
          <div onClick={()=>tog(item.id)} style={{width:20,height:20,borderRadius:3,border:`1.5px solid ${ck[item.id]?"#5A8A6A":"rgba(200,169,81,0.25)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",color:"#5A8A6A",background:ck[item.id]?"rgba(90,138,106,0.2)":"none",flexShrink:0,cursor:"pointer"}}>{ck[item.id]&&"✓"}</div>
          <span onClick={()=>tog(item.id)} style={{fontSize:"1rem",cursor:"pointer"}}>{item.emoji}</span>
          <span onClick={()=>tog(item.id)} style={{fontSize:"0.86rem",flex:1,opacity:ck[item.id]?0.5:1,textDecoration:ck[item.id]?"line-through":"none",cursor:"pointer"}}>{item.label}</span>
          <button onClick={(e)=>{e.stopPropagation();setExpanded(isExp?null:item.id);}} style={{background:"none",border:"none",color:"#6A6A5A",fontSize:"0.65rem",cursor:"pointer",fontFamily:"inherit",padding:"0.2rem 0.4rem",borderRadius:2,letterSpacing:"0.05em",opacity:0.7}}>
            {isExp ? "hide" : "what's this?"}
          </button>
        </div>
        {isExp && (
          <div style={{
            background:"rgba(200,169,81,0.03)",border:"1px solid rgba(200,169,81,0.08)",borderTop:"none",
            borderRadius:"0 0 3px 3px",padding:"0.9rem 1rem 0.9rem 3.8rem",
            fontSize:"0.78rem",color:"#8A8678",lineHeight:1.65
          }}>{item.desc}</div>
        )}
      </div>
    );
  };

  return (<div>
    <div style={{marginBottom:"2rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}>
        <span style={{fontSize:"0.72rem",color:"#8A8678",letterSpacing:"0.1em",textTransform:"uppercase"}}>Daily Coherence</span>
        <span style={{fontSize:"0.85rem",color:"#C8A951"}}>{cc}/{tot}</span>
      </div>
      <div style={{width:"100%",height:4,background:"rgba(255,255,255,0.04)",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:2,transition:"width 0.4s",width:`${prog}%`,background:prog===100?"linear-gradient(90deg,#5A8A6A,#C8A951)":"linear-gradient(90deg,#4A6FA5,#C8A951)"}}/>
      </div>
      {prog===100&&<div style={{textAlign:"center",color:"#C8A951",fontSize:"0.8rem",marginTop:"0.8rem",fontStyle:"italic"}}>✦ All practices complete. Well done, faithful servant.</div>}
    </div>

    {cats.map(cat => {
      const items = getItemsForCat(cat.k);
      const isCatOver = overCat === cat.k && !overId;
      return (
        <div
          key={cat.k}
          onDragOver={e => onDragOverCat(e, cat.k)}
          onDrop={e => onDropOnCat(e, cat.k)}
          style={{
            marginBottom:"1.2rem",
            padding:"0.6rem",
            borderRadius:4,
            border: isCatOver ? "1px dashed rgba(200,169,81,0.3)" : "1px dashed transparent",
            background: isCatOver ? "rgba(200,169,81,0.03)" : "none",
            transition: "all 0.2s",
            minHeight: 60,
          }}
        >
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
            <span>{cat.e}</span>
            <span style={{fontSize:"0.68rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"#8A8678"}}>{cat.l}</span>
          </div>
          {items.length > 0 ? items.map(renderItem) : (
            <div style={{padding:"0.8rem",textAlign:"center",fontSize:"0.75rem",color:"#4A4A3A",fontStyle:"italic",border:"1px dashed rgba(200,169,81,0.1)",borderRadius:3}}>
              Drag practices here
            </div>
          )}
        </div>
      );
    })}

    <DailyDevotional />
  </div>);
}
