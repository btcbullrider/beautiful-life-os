import React from "react";

export default function HabitGroup({ 
  catKey, title, emoji, items, habits, onToggle, onReorder, todayKey,
  expanded, setExpanded, dragId, overId, overCat,
  onDragStart, onDragOverItem, onDropOnItem, onDragEnd, onDragOverCat, onDropOnCat 
}) {
  const isCatOver = overCat === catKey && !overId;

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
          marginBottom: "0.35rem",
          opacity: isDragging ? 0.3 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {isOver && <div style={{ height: 2, background: "#C8A951", borderRadius: 1, marginBottom: 4, opacity: 0.6 }} />}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.6rem", width: "100%",
          background: habits[item.id] ? "rgba(90,138,106,0.06)" : "#14171E",
          border: `1px solid ${habits[item.id] ? "rgba(90,138,106,0.15)" : "rgba(200,169,81,0.08)"}`,
          borderRadius: isExp ? "3px 3px 0 0" : 3,
          padding: "0.85rem 0.8rem",
          fontFamily: "inherit", textAlign: "left", color: "#E8E4DC"
        }}>
          <div style={{ cursor: "grab", color: "#4A4A3A", fontSize: "0.85rem", padding: "0 0.15rem", userSelect: "none", flexShrink: 0, display: "flex", alignItems: "center" }}>⋮⋮</div>
          <div onClick={() => onToggle(item.id)} style={{ width: 20, height: 20, borderRadius: 3, border: `1.5px solid ${habits[item.id] ? "#5A8A6A" : "rgba(200,169,81,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "#5A8A6A", background: habits[item.id] ? "rgba(90,138,106,0.2)" : "none", flexShrink: 0, cursor: "pointer" }}>{habits[item.id] && "✓"}</div>
          <span onClick={() => onToggle(item.id)} style={{ fontSize: "1rem", cursor: "pointer" }}>{item.emoji}</span>
          <span onClick={() => onToggle(item.id)} style={{ fontSize: "0.86rem", flex: 1, opacity: habits[item.id] ? 0.5 : 1, textDecoration: habits[item.id] ? "line-through" : "none", cursor: "pointer" }}>{item.label}</span>
          <button onClick={(e) => { e.stopPropagation(); setExpanded(isExp ? null : item.id); }} style={{ background: "none", border: "none", color: "#6A6A5A", fontSize: "0.65rem", cursor: "pointer", fontFamily: "inherit", padding: "0.2rem 0.4rem", borderRadius: 2, letterSpacing: "0.05em", opacity: 0.7 }}>
            {isExp ? "hide" : "what's this?"}
          </button>
        </div>
        {isExp && (
          <div style={{
            background: "rgba(200,169,81,0.03)", border: "1px solid rgba(200,169,81,0.08)", borderTop: "none",
            borderRadius: "0 0 3px 3px", padding: "0.9rem 1rem 0.9rem 3.8rem",
            fontSize: "0.78rem", color: "#8A8678", lineHeight: 1.65
          }}>{item.desc}</div>
        )}
      </div>
    );
  };

  return (
    <div
      onDragOver={e => onDragOverCat(e, catKey)}
      onDrop={e => onDropOnCat(e, catKey)}
      style={{
        marginBottom: "1.2rem",
        padding: "0.6rem",
        borderRadius: 4,
        border: isCatOver ? "1px dashed rgba(200,169,81,0.3)" : "1px dashed transparent",
        background: isCatOver ? "rgba(200,169,81,0.03)" : "none",
        transition: "all 0.2s",
        minHeight: 60,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span>{emoji}</span>
        <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678" }}>{title}</span>
      </div>
      {items.length > 0 ? items.map(renderItem) : (
        <div style={{ padding: "0.8rem", textAlign: "center", fontSize: "0.75rem", color: "#4A4A3A", fontStyle: "italic", border: "1px dashed rgba(200,169,81,0.1)", borderRadius: 3 }}>
          Drag practices here
        </div>
      )}
    </div>
  );
}
