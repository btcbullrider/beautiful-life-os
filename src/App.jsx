import { useState, useEffect, useRef } from "react";
import { CL, DEFAULT_AFF } from "./utils/constants";
import { getToday, getSK, ld, sv, TODAY, WEEK_START, refreshDates } from "./utils/storage";
import { calcCurrentStreak } from "./utils/streaks";
import GuideTab from "./components/Guide";
import TodayTab from "./components/Today";
import TrackerTab from "./components/Tracker";
import DeepWorkTab from "./components/DeepWork";
import AffTab from "./components/Affirmations";
import CoachTab from "./components/Coach";
import ReviewTab from "./components/Review";

export default function App() {
  const [tab, setTab] = useState("guide");
  const [loaded, setLoaded] = useState(false);
  const [checked, setChecked] = useState({});
  const [aff, setAff] = useState(DEFAULT_AFF);
  const [editing, setEditing] = useState(false);
  const [journal, setJournal] = useState("");
  const [ps, setPs] = useState({});
  const [wn, setWn] = useState("");
  const [streak, setStreak] = useState({ count: 0, lastDate: "" });
  const [history, setHistory] = useState({});
  const [removedHabits, setRemovedHabits] = useState([]);
  const [order, setOrder] = useState(CL.map(c => ({ id: c.id, cat: c.cat })));
  const [currentDate, setCurrentDate] = useState(TODAY);
  const [joIdx, setJoIdx] = useState([]);
  const [weeklyReviews, setWeeklyReviews] = useState({});

  // Check every 30 seconds if the date has rolled over
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = getToday();
      if (now !== currentDate) {
        const SK = getSK();
        const [curCl, curJo] = await Promise.all([ld(SK.cl, null), ld(SK.jo, null)]);
        if (curCl && curCl._date) sv(`cl:${curCl._date}`, curCl);
        if (curJo && curJo._date) {
          sv(`jo:${curJo._date}`, curJo.text || "");
        }
        refreshDates();
        setCurrentDate(now);
        setChecked({});
        setJournal("");
        setLoaded(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    (async () => {
      refreshDates();
      setCurrentDate(getToday());
      const SK = getSK();
      const [c, a, j, p, w, st, ji, hi, ord, wrvs] = await Promise.all([ld(SK.cl, {}), ld(SK.af, DEFAULT_AFF), ld(SK.jo, ""), ld(SK.wr, {}), ld(SK.wn, ""), ld(SK.st, { count: 0, lastDate: "" }), ld(SK.ji, []), ld(SK.hi, {}), ld(SK.ord, null), ld("weeklyReviews", {})]);

      if (!c || !c._date || c._date !== getToday()) {
        setChecked({});
      } else {
        const { _date, ...checks } = c;
        setChecked(checks);
      }

      let localJoIdx = ji || [];
      if (j && typeof j === "object" && j._date === getToday()) {
        setJournal(j.text || "");
      } else if (j && typeof j === "object" && j._date && j._date !== getToday()) {
        sv(`jo:${j._date}`, j.text || "");
        if (!localJoIdx.includes(j._date)) {
          localJoIdx = [...localJoIdx, j._date]; sv(getSK().ji, localJoIdx);
        }
        setJournal("");
      } else {
        setJournal("");
      }

      setAff(a); setPs(p); setWn(w); setStreak(st); setJoIdx(localJoIdx); setHistory(hi); setWeeklyReviews(wrvs);
      const rmHabits = await ld("removed_habits", []);
      setRemovedHabits(rmHabits);
      if (ord) {
        const validIds = new Set(CL.map(c => c.id));
        let cleaned = [];
        if (ord.length > 0 && typeof ord[0] === 'string') {
          cleaned = ord.filter(id => validIds.has(id)).map(id => ({ id, cat: CL.find(c => c.id === id).cat }));
        } else {
          cleaned = ord.filter(o => o && validIds.has(o.id));
        }
        const cleanedIds = cleaned.map(o => o.id);
        const missing = CL.filter(c => !cleanedIds.includes(c.id)).map(c => ({ id: c.id, cat: c.cat }));
        setOrder([...cleaned, ...missing]);
      }
      setLoaded(true);
    })();
  }, []);

  const timer = useRef(null);
  const deb = (fn, ms) => (...a) => { clearTimeout(timer.current); timer.current = setTimeout(() => fn(...a), ms); };
  const saveCl = deb((d) => sv(getSK().cl, { ...d, _date: getToday() }), 300);
  const saveJo = deb((t) => {
    sv(getSK().jo, { text: t, _date: getToday() });
    if (t.trim() && !joIdx.includes(getToday())) {
      const ni = [...joIdx, getToday()]; setJoIdx(ni); sv(getSK().ji, ni);
    }
  }, 500);
  const saveWn = deb((t) => sv(getSK().wn, t), 500);

  const tog = (id) => {
    const n = { ...checked, [id]: !checked[id] }; setChecked(n); saveCl(n);
    const done = Object.entries(n).filter(([k, v]) => v && k !== "_date" && CL.find(c => c.id === k)).map(([k]) => k);
    const nh = { ...history, [getToday()]: { count: done.length, total: CL.length, items: done } };
    setHistory(nh); sv(getSK().hi, nh);
    if (done.length === CL.length) {
      const y = new Date(); y.setDate(y.getDate() - 1); const ys = y.toISOString().slice(0, 10);
      const td = getToday();
      const ns = { count: streak.lastDate === ys || streak.lastDate === td ? streak.count + (streak.lastDate === td ? 0 : 1) : 1, lastDate: td };
      setStreak(ns); sv(getSK().st, ns);
    }
  };

  const updateHistoryItem = (date, id, isDone) => {
    const entry = history[date] || { count: 0, total: CL.length, items: [] };
    let newItems = [...(entry.items || [])];
    if (isDone) {
      if (!newItems.includes(id)) newItems.push(id);
    } else {
      newItems = newItems.filter(i => i !== id);
    }
    newItems = newItems.filter(i => CL.find(c => c.id === i));
    const nh = { ...history, [date]: { ...entry, count: newItems.length, total: CL.length, items: newItems } };
    setHistory(nh); sv(getSK().hi, nh);
    if (date === getToday()) {
      const n = { ...checked, [id]: isDone };
      setChecked(n); saveCl(n);
    }
  };

  const upPil = (id, score) => { const n = { ...ps, [id]: score }; setPs(n); sv(getSK().wr, n); };
  const saveAf = (nl) => { setAff(nl); sv(getSK().af, nl); };
  const reorder = (newOrder) => { setOrder(newOrder); sv(getSK().ord, newOrder); };
  const cc = Object.entries(checked).filter(([k, v]) => v && k !== "_date" && CL.find(c => c.id === k)).length;
  const prog = CL.length > 0 ? (cc / CL.length) * 100 : 0;
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // Derive current streak from history (any activity = streak day)
  const derivedStreak = calcCurrentStreak(history);

  if (!loaded) return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0D0F14", gap: "1rem" }}><div style={{ fontSize: "2rem", color: "#C8A951" }}>✦</div><div style={{ color: "#8A8678", fontSize: "0.85rem" }}>Loading...</div></div>;

  const tabs = [{ k: "guide", l: "✦ Guide" }, { k: "today", l: "Today" }, { k: "tracker", l: "Tracker" }, { k: "deepwork", l: "Deep Work" }, { k: "affirmations", l: "Affirmations" }, { k: "coach", l: "Coach" }, { k: "review", l: "Review" }];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0F14", color: "#E8E4DC", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontWeight: 300 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0 1rem", borderBottom: "1px solid rgba(200,169,81,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ fontSize: "1.8rem", color: "#C8A951", opacity: 0.6 }}>✦</div>
            <div><div style={{ fontSize: "1.15rem", fontWeight: 500 }}>Beautiful Life OS</div><div style={{ fontSize: "0.75rem", color: "#8A8678" }}>{dateStr}</div></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(200,169,81,0.06)", border: "1px solid rgba(200,169,81,0.15)", borderRadius: 4, padding: "0.4rem 0.9rem" }}>
            <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "#C8A951" }}>{derivedStreak}</span>
            <span style={{ fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8678" }}>day streak</span>
          </div>
        </header>
        <nav style={{ display: "flex", paddingTop: "0.8rem", borderBottom: "1px solid rgba(200,169,81,0.08)", overflowX: "auto" }}>
          {tabs.map(t => <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, background: "none", border: "none", borderBottom: tab === t.k ? "2px solid #C8A951" : "2px solid transparent", color: tab === t.k ? "#E8E4DC" : "#6A6A5A", fontSize: "0.78rem", padding: "0.7rem 0.3rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>{t.l}</button>)}
        </nav>
        <main style={{ padding: "1.5rem 0 3rem" }}>
          {tab === "guide" && <GuideTab />}
          {tab === "today" && <TodayTab ck={checked} tog={tog} prog={prog} cc={cc} tot={CL.length} order={order} onReorder={reorder} jo={journal} onChangeJo={v => { setJournal(v); saveJo(v); }} removedHabits={removedHabits} />}
          {tab === "tracker" && <TrackerTab history={history} updateHistoryItem={updateHistoryItem} />}
          {tab === "deepwork" && <DeepWorkTab />}
          {tab === "affirmations" && <AffTab aff={aff} ed={editing} setEd={setEditing} onSave={saveAf} />}
          {tab === "coach" && (() => {
            const coachData = { habits: { [getToday()]: checked }, energy: {}, journal: { [getToday()]: journal }, affirmations: aff, affirmationsDone: { [getToday()]: false }, weeklyReviews: weeklyReviews };
            try {
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k.startsWith("en:") && k !== "en:today") { const jd = JSON.parse(localStorage.getItem(k)); if (jd && jd.ratings) coachData.energy[k.replace("en:", "")] = jd.ratings; }
                if (k === "en:today") { const jd = JSON.parse(localStorage.getItem(k)); if (jd && jd.ratings) coachData.energy[getToday()] = jd.ratings; }
                if (k.startsWith("jo:") && k !== "jo:today" && k !== "jo:index") { const jd = JSON.parse(localStorage.getItem(k)); coachData.journal[k.replace("jo:", "")] = typeof jd === "string" ? jd : (jd.text || ""); }
                if (k === "jo:today") { const jd = JSON.parse(localStorage.getItem(k)); coachData.journal[getToday()] = typeof jd === "string" ? jd : (jd.text || ""); }
              }
            } catch (e) { }
            return <CoachTab data={{ ...coachData, removedHabits }} persist={(d) => { if (d.affirmations) saveAf(d.affirmations); if (d.habits?.[getToday()]) setChecked(d.habits[getToday()]); if (d.removedHabits) { setRemovedHabits(d.removedHabits); sv("removed_habits", d.removedHabits); } }} history={history} />;
          })()}
          {tab === "review" && <ReviewTab ps={ps} upPil={upPil} wn={wn} onWn={v => { setWn(v); saveWn(v); }} history={history} weeklyReviews={weeklyReviews} setWeeklyReviews={setWeeklyReviews} aff={aff} />}
        </main>
        <footer style={{ textAlign: "center", padding: "2rem 0 3rem", color: "#5A5A4A", fontSize: "0.72rem", fontStyle: "italic", borderTop: "1px solid rgba(200,169,81,0.06)" }}>The system serves you — you serve Christ.</footer>
      </div>
    </div>
  );
}
