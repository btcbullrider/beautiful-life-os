export const getToday = () => new Date().toISOString().slice(0, 10);
export const getWeekStart = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10); };

export let TODAY = getToday();
export let WEEK_START = getWeekStart();

export const refreshDates = () => {
  TODAY = getToday();
  WEEK_START = getWeekStart();
};

export const getSK = () => ({ cl: "cl:today", af: "af:cur", jo: "jo:today", wr: `wr:${WEEK_START}`, wn: `wn:${WEEK_START}`, st: "st:data", ji: "jo:index", hi: "hi:data", ord: "ord:checklist" });

export const ld = async (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
export const sv = async (k, d) => { try { localStorage.setItem(k, JSON.stringify(d)); } catch {} };
