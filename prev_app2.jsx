import { useState, useEffect, useCallback, useRef } from "react";

const getToday = () => new Date().toISOString().slice(0, 10);
const getWeekStart = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10); };
let TODAY = getToday();
let WEEK_START = getWeekStart();
const getSK = () => ({ cl: "cl:today", af: "af:cur", jo: "jo:today", wr: `wr:${WEEK_START}`, wn: `wn:${WEEK_START}`, st: "st:data", ji: "jo:index", hi: "hi:data", ord: "ord:checklist" });
const DEFAULT_AFF = [
  "I am a joyful, generous, Spirit-led creator who serves powerfully and lives abundantly.",
  "I surrender outcomes to God and trust His timing completely.",
  "I am the kind of person who shows up daily with coherence — clear thought and elevated emotion.",
  "I create enormous value for others, and abundance flows to me as a natural result.",
  "I remain on my lifeline, unmoved by pendulums, anchored in Christ.",
];
const CL = [
  { id: "silence", label: "Morning Silence", emoji: "🤫", cat: "morning", desc: "Before your phone, before the world — be still for 60 seconds. This sets your frequency before anything else tries to. \"Be still and know that I am God.\" (Psalm 46:10)" },
  { id: "scripture", label: "Scripture Reading", emoji: "📖", cat: "morning", desc: "Even one chapter. Let the Word recalibrate your mind before the world gets a vote. This is the vine connection — staying rooted in Christ so the rest of the system doesn't become self-help idolatry." },
  { id: "affirmations", label: "Write Affirmations (10-15x)", emoji: "✍️", cat: "morning", desc: "Adams' technique: handwrite your identity declarations 10-15 times. Present tense, first person: \"I am a joyful, Spirit-led creator...\" The repetition programs your reticular activating system to notice opportunities aligned with who you're becoming." },
  { id: "exercise", label: "Move Your Body", emoji: "💪", cat: "morning", desc: "Non-negotiable energy infrastructure. Adams is clear: manage energy, not time. A strong body supports a clear mind, an open heart, and the capacity to serve. A depleted vessel pours nothing." },
  { id: "deepwork1", label: "Deep Work Block #1", emoji: "⚡", cat: "morning", desc: "Your most important task of the day. Zero distractions. This is where talent stacking and systems thinking compound. Set your Deep Work priorities in the Deep Work tab." },
  { id: "deepwork2", label: "Deep Work Block #2", emoji: "⚡", cat: "day", desc: "Your second priority. Protect this time ruthlessly — it's where you create the value that funds everything else." },
  { id: "deepwork3", label: "Deep Work Block #3", emoji: "⚡", cat: "day", desc: "Your third priority. If you complete all three, you've had an extraordinarily productive day. Most people don't finish one." },
  { id: "midday", label: "Midday Reset + Prayer", emoji: "🙏", cat: "day", desc: "A 2-minute recalibration. Pause and check: am I still on my lifeline, or have pendulums (news, drama, anxiety) pulled me off? Realign with a brief prayer of gratitude. Return to coherence." },
  { id: "serve", label: "Serve / Connect with People", emoji: "❤️", cat: "evening", desc: "Evening is for people — family, community, church, friendship. This is where \"give first, give freely\" becomes real. Discipleship isn't a solo practice. The one who serves most, leads most." },
  { id: "journal", label: "Journal / Daily Reflection", emoji: "📔", cat: "evening", desc: "Write freely in the Journal tab. Process your day, pray on paper, notice what's shifting. What are you grateful for? Where did you see God move? What would the future you write?" },
  { id: "sleeptechnique", label: "Goddard Sleep Technique", emoji: "🌙", cat: "evening", desc: "As you fall asleep, vividly enter a first-person scene that implies your deepest desire is already fulfilled. Feel the joy, the gratitude. The hypnagogic state (between waking and sleep) is your most impressionable — let the last thing you feel be the future you're stepping into." },
];
const PIL = [
  { id: "surrender", name: "Surrender the Outcome", short: "Surrender", color: "#C8A951" },
  { id: "livefromend", name: "Live from the End", short: "Imagination", color: "#6A5A8A" },
  { id: "identity", name: "Become the Person First", short: "Identity", color: "#4A6FA5" },
  { id: "environment", name: "Architect Your Environment", short: "Environment", color: "#5A8A6A" },
  { id: "compound", name: "Compound Daily", short: "Compound", color: "#A57A3A" },
  { id: "give", name: "Give First, Give Freely", short: "Generosity", color: "#A5566A" },
  { id: "rest", name: "Rest in the Mystery", short: "Sabbath", color: "#8A7A6A" },
];
const ld = async (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const sv = async (k, d) => { try { localStorage.setItem(k, JSON.stringify(d)); } catch {} };
const TC = { blue: "#4A6FA5", violet: "#6A5A8A", green: "#5A8A6A", amber: "#A57A3A", rose: "#A5566A", gold: "#C8A951" };
const s = (base, extra) => ({ ...base, ...extra });

// Shared
const Div = () => <div style={{ width: 50, height: 1, background: "#C8A951", opacity: 0.25, margin: "3rem auto" }} />;
const SL = ({ children }) => <div style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#C8A951", opacity: 0.7, marginBottom: "0.4rem" }}>{children}</div>;
const SH = ({ children }) => <h2 style={{ fontFamily: "'Georgia',serif", fontSize: "1.8rem", fontWeight: 300, marginBottom: "1rem", lineHeight: 1.2 }}>{children}</h2>;
const SP = ({ children }) => <p style={{ color: "#8A8678", maxWidth: 620, marginBottom: "1rem", fontSize: "0.88rem", lineHeight: 1.7 }}>{children}</p>;
const Quote = ({ text, ref: r }) => (
  <div style={{ borderLeft: "2px solid rgba(200,169,81,0.4)", padding: "1.2rem 1.5rem", margin: "2rem 0", background: "rgba(200,169,81,0.02)" }}>
    <div style={{ fontFamily: "'Georgia',serif", fontSize: "1.1rem", fontWeight: 300, fontStyle: "italic", lineHeight: 1.5 }}>{text}</div>
    <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8678", marginTop: "0.6rem" }}>— {r}</div>
  </div>
);
const Tag = ({ name, col }) => <span style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: 1, border: `1px solid ${TC[col]}40`, color: TC[col] }}>{name}</span>;

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
  const [order, setOrder] = useState(CL.map(c => c.id));
  const [currentDate, setCurrentDate] = useState(TODAY);

  const [joIdx, setJoIdx] = useState([]);

  // Check every 30 seconds if the date has rolled over
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = getToday();
      if (now !== currentDate) {
        // Archive current day's data before resetting
        const SK = getSK();
        const [curCl, curJo] = await Promise.all([ld(SK.cl, null), ld(SK.jo, null)]);
        if (curCl && curCl._date) sv(`cl:${curCl._date}`, curCl);
        if (curJo && curJo._date) {
          sv(`jo:${curJo._date}`, curJo.text || "");
        }
        
        TODAY = now;
        WEEK_START = getWeekStart();
        setCurrentDate(now);
        // Reset daily state
        setChecked({});
        setJournal("");
        setLoaded(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => { (async () => {
    // Always refresh date on mount
    TODAY = getToday();
    WEEK_START = getWeekStart();
    setCurrentDate(TODAY);
    const SK = getSK();
    const [c,a,j,p,w,st,ji,hi,ord] = await Promise.all([ld(SK.cl,{}),ld(SK.af,DEFAULT_AFF),ld(SK.jo,""),ld(SK.wr,{}),ld(SK.wn,""),ld(SK.st,{count:0,lastDate:""}),ld(SK.ji,[]),ld(SK.hi,{}),ld(SK.ord,null)]);
    
    // Reset checklist if it's from a different day (or has no date stamp)
    if (!c || !c._date || c._date !== TODAY) {
      setChecked({});
    } else {
      const { _date, ...checks } = c;
      setChecked(checks);
    }
    
    // Reset journal if it's from a different day
    let localJoIdx = ji || [];
    if (j && typeof j === "object" && j._date === TODAY) {
      setJournal(j.text || "");
    } else if (j && typeof j === "object" && j._date && j._date !== TODAY) {
      // Archive old journal
      sv(`jo:${j._date}`, j.text || "");
      if (!localJoIdx.includes(j._date)) {
        localJoIdx = [...localJoIdx, j._date]; sv(getSK().ji, localJoIdx);
      }
      setJournal("");
    } else if (typeof j === "string" && j.trim()) {
      // Legacy format without _date — treat as old data, archive and reset
      setJournal("");
    } else {
      setJournal("");
    }
    
    setAff(a);setPs(p);setWn(w);setStreak(st);setJoIdx(localJoIdx);setHistory(hi);
    if (ord) {
      // Remove stale IDs not in CL, add missing CL IDs
      const validIds = new Set(CL.map(c => c.id));
      const cleaned = ord.filter(id => validIds.has(id));
      const missing = CL.filter(c => !cleaned.includes(c.id)).map(c => c.id);
      setOrder([...cleaned, ...missing]);
    }
    setLoaded(true);
  })(); }, []);

  const timer = useRef(null);
  const deb = (fn, ms) => (...a) => { clearTimeout(timer.current); timer.current = setTimeout(() => fn(...a), ms); };
  const saveCl = deb((d) => sv(getSK().cl, { ...d, _date: TODAY }), 300);
  const saveJo = deb((t) => { 
    sv(getSK().jo, { text: t, _date: TODAY }); 
    if (t.trim() && !joIdx.includes(TODAY)) { 
      const ni = [...joIdx, TODAY]; setJoIdx(ni); sv(getSK().ji, ni); 
    }
  }, 500);
  const saveWn = deb((t) => sv(getSK().wn, t), 500);

  const tog = (id) => {
    const n = { ...checked, [id]: !checked[id] }; setChecked(n); saveCl(n);
    const done = Object.entries(n).filter(([k,v])=>v && k !== "_date").map(([k])=>k);
    const nh = { ...history, [TODAY]: { count: done.length, total: CL.length, items: done } };
    setHistory(nh); sv(getSK().hi, nh);
    if (done.length === CL.length) {
      const y = new Date(); y.setDate(y.getDate()-1); const ys = y.toISOString().slice(0,10);
      const ns = { count: streak.lastDate===ys||streak.lastDate===TODAY ? streak.count+(streak.lastDate===TODAY?0:1) : 1, lastDate: TODAY };
      setStreak(ns); sv(getSK().st, ns);
    }
  };
  const upPil = (id, score) => { const n = { ...ps, [id]: score }; setPs(n); sv(getSK().wr, n); };
  const saveAf = (nl) => { setAff(nl); sv(getSK().af, nl); };
  const reorder = (newOrder) => { setOrder(newOrder); sv(getSK().ord, newOrder); };
  const cc = Object.entries(checked).filter(([k,v])=>v && k !== "_date").length;
  const prog = CL.length > 0 ? (cc / CL.length) * 100 : 0;
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (!loaded) return <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0D0F14", gap: "1rem" }}><div style={{ fontSize: "2rem", color: "#C8A951" }}>✦</div><div style={{ color: "#8A8678", fontSize: "0.85rem" }}>Loading...</div></div>;

  const tabs = [{ k:"guide",l:"✦ Guide" },{ k:"today",l:"Today" },{ k:"tracker",l:"Tracker" },{ k:"deepwork",l:"Deep Work" },{ k:"energy",l:"Energy" },{ k:"affirmations",l:"Affirmations" },{ k:"journal",l:"Journal" },{ k:"review",l:"Review" }];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0F14", color: "#E8E4DC", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontWeight: 300 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 1.5rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0 1rem", borderBottom: "1px solid rgba(200,169,81,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ fontSize: "1.8rem", color: "#C8A951", opacity: 0.6 }}>✦</div>
            <div><div style={{ fontSize: "1.15rem", fontWeight: 500 }}>Beautiful Life OS</div><div style={{ fontSize: "0.75rem", color: "#8A8678" }}>{dateStr}</div></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(200,169,81,0.06)", border: "1px solid rgba(200,169,81,0.15)", borderRadius: 4, padding: "0.4rem 0.9rem" }}>
            <span style={{ fontSize: "1.3rem", fontWeight: 600, color: "#C8A951" }}>{streak.count}</span>
            <span style={{ fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8678" }}>day streak</span>
          </div>
        </header>
        <nav style={{ display: "flex", paddingTop: "0.8rem", borderBottom: "1px solid rgba(200,169,81,0.08)", overflowX: "auto" }}>
          {tabs.map(t => <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, background: "none", border: "none", borderBottom: tab===t.k ? "2px solid #C8A951" : "2px solid transparent", color: tab===t.k ? "#E8E4DC" : "#6A6A5A", fontSize: "0.78rem", padding: "0.7rem 0.3rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>{t.l}</button>)}
        </nav>
        <main style={{ padding: "1.5rem 0 3rem" }}>
          {tab==="guide" && <GuideTab />}
          {tab==="today" && <TodayTab ck={checked} tog={tog} prog={prog} cc={cc} tot={CL.length} order={order} onReorder={reorder} />}
          {tab==="tracker" && <TrackerTab history={history} streak={streak} />}
          {tab==="deepwork" && <DeepWorkTab />}
          {tab==="energy" && <EnergyTab />}
          {tab==="affirmations" && <AffTab aff={aff} ed={editing} setEd={setEditing} onSave={saveAf} />}
          {tab==="journal" && <JournalTab jo={journal} onChange={v => { setJournal(v); saveJo(v); }} joIdx={joIdx} aff={aff} />}
          {tab==="review" && <ReviewTab ps={ps} upPil={upPil} wn={wn} onWn={v => { setWn(v); saveWn(v); }} />}
        </main>
        <footer style={{ textAlign: "center", padding: "2rem 0 3rem", color: "#5A5A4A", fontSize: "0.72rem", fontStyle: "italic", borderTop: "1px solid rgba(200,169,81,0.06)" }}>The system serves you — you serve Christ.</footer>
      </div>
    </div>
  );
}

function GuideTab() {
  const [op, setOp] = useState(0);
  const pils = [
    { n:"01",t:"Surrender the Outcome, Define the State",tl:"Replace goals with identity + surrender",cards:[
      {h:"Systems over Goals",p:"Adams says goals are for losers; systems are for winners. Don't fixate on \"make $500K\" — build the daily system of a person who creates enormous value. The outcome is a side effect.",tags:[["Adams","blue"],["Clear","amber"]]},
      {h:"Reduce Excess Importance",p:"Zeland's core insight: when you place excessive importance on an outcome, you create balancing forces that push it away. Hold intention lightly. Want it, don't need it. This isn't passivity — it's spiritual physics.",tags:[["Zeland","green"],["Jesus","gold"]]},
      {h:"\"Thy Will Be Done\"",p:"The master key. You bring clarity, conviction, and coherence. Then you release it to God. This is not contradiction — it is the architecture of faith. Jesus prayed with total intention and total surrender simultaneously.",tags:[["Jesus","gold"],["Goddard","violet"]]}
    ]},
    { n:"02",t:"Live from the End",tl:"Assume the feeling of the wish fulfilled",cards:[
      {h:"Neville's Core Technique",p:"Every night before sleep, enter a scene that implies your desire is fulfilled. See it in first person. Feel it. Fall asleep in it. This isn't visualization — it's occupation. You are rehearsing your future memory in the state most receptive to impression.",tags:[["Goddard","violet"],["Dispenza","rose"]]},
      {h:"Affirmations as Identity Declarations",p:"Adams writes his goals 15 times daily — not as wishes but as present-tense declarations. \"I, [name], am a joyful servant of God who creates enormous value.\" This is the electrical thought. Pair it with gratitude and it becomes Dispenza's coherence practice.",tags:[["Adams","blue"],["Dispenza","rose"]]},
      {h:"Biblical Precedent",p:"\"God calls things that are not as though they are.\" (Romans 4:17). This is not deception — it's operating from faith rather than evidence. Goddard simply rediscovered the prayer method Jesus taught.",tags:[["Jesus","gold"],["Goddard","violet"]]}
    ]},
    { n:"03",t:"Become the Person First",tl:"Identity-based transformation",cards:[
      {h:"Identity Precedes Outcome",p:"Clear's deepest insight: you don't rise to the level of your goals, you fall to the level of your identity. Every action is a vote for the type of person you wish to become. Ask: \"What would a joyful, generous, Christ-like person do right now?\"",tags:[["Clear","amber"],["Jesus","gold"]]},
      {h:"Talent Stacking",p:"Adams: you don't need to be world-class at one thing. Combine 3-4 skills where you're in the top 25% to become uniquely valuable. Deep faith + communication + business acumen + genuine love = a category of one.",tags:[["Adams","blue"]]},
      {h:"Walk Your Lifeline",p:"Zeland: reality is infinite parallel tracks. You select your lifeline by matching the energy of the track you want. This is what repentance (metanoia) actually means — a change of mind that changes your trajectory.",tags:[["Zeland","green"],["Jesus","gold"]]}
    ]},
    { n:"04",t:"Architect Your Environment",tl:"Design for automaticity and grace",cards:[
      {h:"Make Good Easy, Make Bad Hard",p:"Clear's 3rd and 4th laws. Your environment is more powerful than your willpower. Place the Bible where you scroll. Remove friction from prayer. Add friction to distraction.",tags:[["Clear","amber"]]},
      {h:"Guard the Pendulums",p:"Zeland warns: pendulums are collective energy structures (media, outrage, trends) that feed on your attention and pull you off your lifeline. \"Be in the world but not of it.\" Curate your inputs — not from fear, from love of your own frequency.",tags:[["Zeland","green"],["Jesus","gold"]]},
      {h:"Energy > Time Management",p:"Adams: manage your energy, not your time. Exercise, diet, sleep, and social inputs are not \"self-care\" — they are the infrastructure of your capacity to serve. A depleted vessel pours nothing.",tags:[["Adams","blue"],["Dispenza","rose"]]}
    ]},
    { n:"05",t:"Compound Daily",tl:"Small, sacred repetitions create exponential results",cards:[
      {h:"The 1% Rule as Spiritual Discipline",p:"1% better every day = 37x better in a year. For a disciple this means faithfulness over intensity. The daily quiet time matters more than the conference mountaintop. \"Well done, good and faithful servant\" — faithful, not spectacular.",tags:[["Clear","amber"],["Jesus","gold"]]},
      {h:"Habit Stacking Your Spiritual Life",p:"After coffee → affirmations. After affirmations → scripture. After scripture → \"feeling the wish fulfilled\" for 5 min. The stack becomes the system. The system becomes the identity. The identity becomes the life.",tags:[["Clear","amber"],["Goddard","violet"],["Dispenza","rose"]]}
    ]},
    { n:"06",t:"Give First, Give Freely",tl:"The paradox that unlocks abundance",cards:[
      {h:"The Generosity Loop",p:"\"Give, and it will be given to you. A good measure, pressed down, shaken together and running over.\" (Luke 6:38) Zeland: generosity reduces importance around money. Goddard: it affirms abundance as your current state.",tags:[["Jesus","gold"],["Zeland","green"],["Goddard","violet"]]},
      {h:"Create Value Before Capturing It",p:"Adams: be so useful people can't ignore you. For the disciple this maps to servanthood — the one who serves most leads most. Impact and income are downstream of genuine generosity with your gifts.",tags:[["Adams","blue"],["Jesus","gold"]]}
    ]},
    { n:"07",t:"Rest in the Mystery",tl:"Sabbath, wonder, and the limits of systems",cards:[
      {h:"The Sabbath Principle",p:"Every system needs an off switch. God rested — not because He was tired, but to model that rest is part of creation, not its interruption. One day a week: no optimization, no affirmations. Just presence, gratitude, worship, and play.",tags:[["Jesus","gold"]]},
      {h:"Hold It All Lightly",p:"The danger of combining all these teachers is turning life into a performance. Zeland warns against importance. Adams warns against passion (he prefers energy). Jesus says look at the lilies — they don't strive. The deepest coherence isn't effort. It's trust.",tags:[["Zeland","green"],["Adams","blue"],["Jesus","gold"]]}
    ]}
  ];
  const rhythm = [
    {t:"5:30a",h:"Wake + Silence",p:"Before your phone, be still. \"Be still and know that I am God.\" Even 60 seconds."},
    {t:"5:45a",h:"Coherence Meditation",p:"Focus on the heart, breathe slowly, cultivate gratitude as if your desired reality is already here. 10–20 min."},
    {t:"6:15a",h:"Scripture + Affirmations",p:"Read scripture. Then write Adams-style affirmations 10–15x as present-tense identity statements rooted in Christ."},
    {t:"6:45a",h:"Move Your Body",p:"Non-negotiable infrastructure. A strong body supports a clear mind and an open heart."},
    {t:"8:00a",h:"Deep Work Block",p:"Your highest-value creation work. Talent stacking + systems = compounding results."},
    {t:"12:00p",h:"Midday Reset",p:"Brief prayer. Check: am I on my lifeline or have pendulums pulled me off? Realign."},
    {t:"6:00p",h:"Serve + Connect",p:"Evening is for people — family, community, church. Discipleship becomes real here."},
    {t:"9:30p",h:"Goddard's Sleep Technique",p:"Fall asleep in the scene that implies your wish fulfilled. The last impression of the day is the future you're stepping into."}
  ];
  const cd = {background:"#14171E",border:"1px solid rgba(200,169,81,0.08)",borderRadius:2,padding:"1.2rem 1.3rem",marginBottom:"0.5rem"};

  return (<div>
    <div style={{textAlign:"center",padding:"2.5rem 0 2rem"}}>
      <div style={{fontSize:"2rem",color:"#C8A951",opacity:0.4,marginBottom:"1rem"}}>✦</div>
      <h1 style={{fontFamily:"'Georgia',serif",fontSize:"2.1rem",fontWeight:300,lineHeight:1.15,marginBottom:"0.8rem"}}>The Beautiful Life<br/><em style={{color:"#C8A951",fontStyle:"italic"}}>Operating System</em></h1>
      <p style={{color:"#8A8678",fontSize:"0.88rem",maxWidth:480,margin:"0 auto",lineHeight:1.6}}>A unified framework for joy, impact, and discipleship — synthesizing systems thinking, imagination, intention, habits, coherence, and the way of Christ.</p>
    </div>
    <Div/>
    <SL>The Unified Insight</SL>
    <SH>All of these teachers point at the same thing</SH>
    <SP>Every framework you're drawn to — Adams, Goddard, Zeland, Clear, Dispenza, and ultimately Jesus — converges on a single architecture: what you hold in mind with clarity and feel in your body with conviction becomes the organizing pattern of your life. Jesus said it plainest: "Whatever you ask in prayer, believe that you have received it, and it will be yours." (Mark 11:24)</SP>
    <SP>The difference is Christ places it all under a higher sovereignty. You are not the source — you are a vessel tuned to receive. That changes everything, because it replaces anxiety with trust.</SP>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:1,background:"rgba(200,169,81,0.1)",border:"1px solid rgba(200,169,81,0.1)",borderRadius:2,overflow:"hidden",margin:"2rem 0"}}>
      {[{icon:"⚡",h:"Electrical Thought",src:"Dispenza · Adams · Clear",p:"Clear intention. A defined image of who you are becoming. Your thought sends a signal into the field — it's the broadcast."},
        {icon:"🧲",h:"Magnetic Emotion",src:"Dispenza · Goddard · Jesus",p:"Elevated feeling — gratitude, love, joy — as if it's already done. Goddard called this \"feeling the wish fulfilled.\" This is the draw."},
        {icon:"✦",h:"Coherent Field",src:"All · Christ",p:"When thought and emotion align, you become a coherent signal. Zeland calls this reducing importance. Jesus calls it faith. \"The kingdom of God is within you.\""}
      ].map((c,i)=><div key={i} style={{background:"#14171E",padding:"1.5rem 1.3rem"}}>
        <div style={{fontSize:"1.4rem",marginBottom:"0.8rem"}}>{c.icon}</div>
        <div style={{fontFamily:"'Georgia',serif",fontSize:"1.1rem",marginBottom:"0.3rem"}}>{c.h}</div>
        <div style={{fontSize:"0.6rem",letterSpacing:"0.12em",textTransform:"uppercase",color:"#C8A951",opacity:0.6,marginBottom:"0.7rem"}}>{c.src}</div>
        <div style={{fontSize:"0.82rem",color:"#8A8678",lineHeight:1.6}}>{c.p}</div>
      </div>)}
    </div>
    <div style={{background:"linear-gradient(135deg,#14171E,#181C26)",border:"1px solid rgba(200,169,81,0.1)",borderRadius:2,padding:"2.5rem 1.5rem",margin:"2rem 0",textAlign:"center"}}>
      <div style={{fontFamily:"'Georgia',serif",fontSize:"1.25rem",fontWeight:300,marginBottom:"0.8rem"}}><span style={{color:"#4A6FA5"}}>Clear Thought</span> + <span style={{color:"#A5566A"}}>Elevated Emotion</span> = <span style={{color:"#C8A951"}}>Coherent Signal</span></div>
      <div style={{fontSize:"0.78rem",color:"#8A8678",maxWidth:520,margin:"0 auto",lineHeight:1.6}}>When the mind (electrical) and heart (magnetic) are coherent, you stop chasing outcomes and start embodying them. Reality reorganizes to match the signal.</div>
    </div>
    <Div/>
    <SL>The Architecture</SL><SH>Seven pillars for a beautiful life</SH>
    <SP>Each pillar draws from multiple teachers but is anchored in one operating principle.</SP>
    <div style={{marginTop:"1.5rem"}}>
      {pils.map((p,i) => {
        const isO = op===i;
        return <div key={i} style={{borderBottom:"1px solid rgba(200,169,81,0.1)"}}>
          <button onClick={()=>setOp(isO?-1:i)} style={{display:"flex",alignItems:"center",gap:"1rem",padding:"1.3rem 0",cursor:"pointer",background:"none",border:"none",width:"100%",textAlign:"left",fontFamily:"inherit",color:"#E8E4DC"}}>
            <div style={{fontFamily:"'Georgia',serif",fontSize:"1.7rem",fontWeight:300,color:"#C8A951",opacity:0.4,minWidth:40}}>{p.n}</div>
            <div style={{flex:1}}><div style={{fontFamily:"'Georgia',serif",fontSize:"1.2rem",marginBottom:"0.1rem"}}>{p.t}</div><div style={{fontSize:"0.73rem",color:"#8A8678"}}>{p.tl}</div></div>
            <div style={{fontSize:"1.1rem",color:"#C8A951",opacity:0.5,transform:isO?"rotate(45deg)":"none",transition:"transform 0.3s"}}>+</div>
          </button>
          {isO && <div style={{paddingBottom:"1.5rem",paddingLeft:52}}>
            {p.cards.map((c,ci)=><div key={ci} style={cd}>
              <div style={{fontSize:"0.9rem",fontWeight:500,marginBottom:"0.3rem"}}>{c.h}</div>
              <div style={{fontSize:"0.82rem",color:"#8A8678",lineHeight:1.6,marginBottom:"0.5rem"}}>{c.p}</div>
              <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>{c.tags.map(([n,col],ti)=><Tag key={ti} name={n} col={col}/>)}</div>
            </div>)}
          </div>}
        </div>;
      })}
    </div>
    <Div/>
    <SL>The Daily Practice</SL><SH>A sample rhythm</SH>
    <SP>Not a rigid schedule — a template. Every element of the framework has a home in your day.</SP>
    <div style={{margin:"1.5rem 0"}}>
      {rhythm.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr",borderBottom:"1px solid rgba(200,169,81,0.06)"}}>
        <div style={{fontFamily:"'Georgia',serif",fontSize:"0.95rem",color:"#C8A951",opacity:0.5,padding:"0.9rem 0.7rem 0.9rem 0",textAlign:"right",borderRight:"1px solid rgba(200,169,81,0.1)"}}>{r.t}</div>
        <div style={{padding:"0.9rem 0 0.9rem 1.1rem"}}><div style={{fontSize:"0.86rem",fontWeight:500,marginBottom:"0.1rem"}}>{r.h}</div><div style={{fontSize:"0.76rem",color:"#8A8678",lineHeight:1.6}}>{r.p}</div></div>
      </div>)}
    </div>
    <Div/>
    <SL>The Guard Rail</SL><SH>Christ as the integrating center</SH>
    <SP>Here's the one thing that keeps all of this from becoming self-help idolatry: Jesus is the vine, you are the branch. You are not manifesting from your own power. You are aligning with the Creator's intention for your life and removing the blocks — fear, doubt, unforgiveness, excess importance — that prevent His power from flowing through you.</SP>
    <SP>Goddard, Zeland, Adams, Clear, and Dispenza all discovered real principles. But principles without a source become self-worship. The Christian framework says: yes, the field is real, yes, coherence matters, yes, imagination is powerful — and it all flows from a God who loved you first and is inviting you to co-create with Him.</SP>
    <Quote text={'"I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing."'} ref="Jesus, John 15:5" />
    <SP>The beautiful life isn't one you manufacture. It's one you receive by becoming coherent with the One who is already broadcasting it toward you.</SP>
    <div style={{textAlign:"center",padding:"3rem 0 1rem",color:"#C8A951",opacity:0.3,fontSize:"1.5rem"}}>✦</div>
  </div>);
}

// ════════════════════════════════════════
// TODAY TAB
// ════════════════════════════════════════
function TodayTab({ ck, tog, prog, cc, tot, order, onReorder }) {
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

function DailyDevotional() {
  // 31 unique devotionals — one for each day of the month, cycling monthly
  const devotionals = [
    { verse: "Whatever you ask in prayer, believe that you have received it, and it will be yours.", ref: "Mark 11:24", devotion: "This is the master instruction. Not \"believe that you might receive\" — believe that you HAVE received. Past tense. Goddard and Dispenza both point here: the feeling of the wish fulfilled is prayer in its highest form." },
    { verse: "Be still, and know that I am God.", ref: "Psalm 46:10", devotion: "Stillness isn't inactivity — it's the posture of reception. Before you broadcast any signal into the field, quiet yourself enough to receive. The coherent signal starts in silence." },
    { verse: "As a man thinks in his heart, so is he.", ref: "Proverbs 23:7", devotion: "Scripture said it thousands of years before Dispenza or Clear. Your inner state — what you think AND feel simultaneously — is literally who you are. Change the inner state first. The outer follows." },
    { verse: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13", devotion: "Not through your own willpower. Not through affirmations alone. Through Christ. The system works because the Source is infinite. Your job is coherence. His job is everything else." },
    { verse: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.", ref: "Romans 12:2", devotion: "Zeland calls them pendulums. Paul calls it \"the pattern of this world.\" Same warning: the collective will pull you into its frequency if you let it. Renew your mind daily — that's what this whole system is for." },
    { verse: "The kingdom of God is within you.", ref: "Luke 17:21", devotion: "Not above you, not ahead of you, not in some distant future — within you. The coherent field, the imagination, the faith that moves mountains. It's all already inside. Your practice is simply removing the blocks." },
    { verse: "Faith is the substance of things hoped for, the evidence of things not seen.", ref: "Hebrews 11:1", devotion: "Faith isn't wishful thinking — it has substance. It IS the evidence. When your thought and emotion cohere around something unseen, you're not pretending. You're operating at a higher level of reality than your five senses." },
    { verse: "Therefore I tell you, do not worry about your life. Look at the birds of the air; they do not sow or reap, yet your heavenly Father feeds them.", ref: "Matthew 6:25-26", devotion: "Worry is incoherence. It's electrical thought pointed at what you want plus magnetic emotion soaked in fear. Jesus says drop the fear entirely. Trust is the ultimate state of reduced importance." },
    { verse: "Delight yourself in the Lord, and he will give you the desires of your heart.", ref: "Psalm 37:4", devotion: "The sequence matters. Delight first — not as a strategy to get things, but as the state itself. When you delight in God, your desires align with His. Then they're not requests anymore. They're co-creations." },
    { verse: "God calls into being things that were not.", ref: "Romans 4:17", devotion: "This is the biblical basis for everything Goddard taught. Speaking and feeling things into existence isn't New Age — it's the oldest creative act. God spoke, and it was. You are made in that image." },
    { verse: "Commit your works to the Lord, and your plans will be established.", ref: "Proverbs 16:3", devotion: "Adams says build systems. Clear says build identity. Jesus says commit it all to the Lord. These aren't contradictions — they're layers. Build the system, embody the identity, then surrender the outcome. Your plans establish themselves." },
    { verse: "The thief comes only to steal and kill and destroy; I have come that they may have life, and have it to the full.", ref: "John 10:10", devotion: "Life to the FULL. Not life barely survived. Not life endured. Christ's explicit promise is abundance — in joy, in purpose, in impact. If your faith feels like deprivation, something is misaligned." },
    { verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", ref: "Romans 8:28", devotion: "Even the setbacks. Even the days you miss every practice. Even the confusion. All of it is being worked for your good. This is the deepest form of reduced importance — trusting that the detours are part of the route." },
    { verse: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", ref: "Psalm 51:10", devotion: "Coherence requires a clean signal. Unforgiveness, bitterness, hidden resentment — these create static. David knew: you have to ask for the clean heart before the signal clears. Today, let something go." },
    { verse: "I am the vine; you are the branches. Apart from me you can do nothing.", ref: "John 15:5", devotion: "The guard rail for the whole system. Every technique, every habit stack, every affirmation — it works because you're connected to the Vine. Disconnect, and it all becomes noise. Stay connected, and fruit is inevitable." },
    { verse: "The Lord is my shepherd, I lack nothing.", ref: "Psalm 23:1", devotion: "Read that again slowly. I lack NOTHING. This isn't future tense. It's the state Goddard would call \"the wish fulfilled.\" When you truly feel that you lack nothing, you've entered the frequency where abundance lives." },
    { verse: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", ref: "Matthew 6:33", devotion: "The priority stack is clear: Kingdom first, everything else second. Not because God is withholding — because when the priority is right, the signal is coherent, and everything else organizes around it naturally." },
    { verse: "For where your treasure is, there your heart will be also.", ref: "Matthew 6:21", devotion: "What you invest attention in becomes your magnetic center. Your heart follows your treasure — not the other way around. So be intentional about where you place your attention today. That's where your life is heading." },
    { verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9", devotion: "Courage isn't the absence of fear — it's coherence in the presence of it. When you feel the pull to shrink back from your calling, remember: the One who called you is with you. Step forward anyway." },
    { verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", ref: "Galatians 6:9", devotion: "Clear's 1% compound rule is a spiritual law. The harvest is coming, but it has a \"proper time.\" Your job isn't to force the timeline — it's to not give up. Faithfulness is the cheat code." },
    { verse: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5", devotion: "Your rational mind will never fully understand how thought and emotion create reality. That's okay. Trust doesn't require understanding. It requires surrender — which is exactly the state where coherence is highest." },
    { verse: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28", devotion: "If your system is feeling heavy — if the affirmations feel forced, if the habits feel like chains — stop. Come to rest. Pillar 7 exists for a reason. The deepest coherence isn't effort. It's trust." },
    { verse: "If anyone is in Christ, the new creation has come: The old has gone, the new is here!", ref: "2 Corinthians 5:17", devotion: "Identity shift — the core of Clear's framework — is a biblical promise. In Christ, you are already the new creation. You're not becoming someone new. You're living into who you already are." },
    { verse: "Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us.", ref: "Ephesians 3:20", devotion: "Immeasurably more than you can IMAGINE. Your boldest Goddard visualization, your most audacious affirmation — God says He can exceed it. Don't shrink your imagination. Expand it, then let God outdo it." },
    { verse: "I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.", ref: "John 16:33", devotion: "Jesus doesn't promise no resistance. He promises He's already overcome it. Zeland would call this the ultimate lifeline — walking a path where the outcome is already secured, even when the terrain is rough." },
    { verse: "The light shines in the darkness, and the darkness has not overcome it.", ref: "John 1:5", devotion: "Your coherent signal — thought + emotion + faith — is light. And no amount of darkness can extinguish it. On the hard days, remember: you don't have to fight the darkness. You just have to keep shining." },
    { verse: "Give, and it will be given to you. A good measure, pressed down, shaken together and running over.", ref: "Luke 6:38", devotion: "The generosity loop isn't metaphor — it's mechanics. Giving reduces importance around scarcity, affirms abundance as your current state, and opens channels you didn't know existed. Give first today." },
    { verse: "He who began a good work in you will carry it on to completion until the day of Christ Jesus.", ref: "Philippians 1:6", devotion: "You didn't start this journey. God did. And He finishes what He starts. On the days you feel like you're failing at the system, remember: the system isn't carrying you. He is." },
    { verse: "Blessed is the one who perseveres under trial because, having stood the test, that person will receive the crown of life.", ref: "James 1:12", devotion: "The crown doesn't go to the one who never struggled. It goes to the one who persevered. Every day you show up — even imperfectly — you're standing the test. Keep going." },
    { verse: "You did not choose me, but I chose you and appointed you so that you might go and bear fruit — fruit that will last.", ref: "John 15:16", devotion: "You were chosen before you built any system. Before the first affirmation, before the first meditation. He chose you. Your practices don't earn His love — they align you with a calling He already placed on your life." },
    { verse: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.", ref: "Philippians 4:19", devotion: "ALL your needs. According to HIS riches — which are infinite. Not according to your effort, your streak count, or your coherence score. According to His glory. Rest in that today." },
  ];

  const dayOfMonth = new Date().getDate();
  const d = devotionals[(dayOfMonth - 1) % devotionals.length];

  return (
    <div style={{ marginTop: "2rem", background: "rgba(200,169,81,0.03)", border: "1px solid rgba(200,169,81,0.1)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ padding: "0.6rem 1rem", borderBottom: "1px solid rgba(200,169,81,0.08)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.85rem" }}>📜</span>
        <span style={{ fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#C8A951", opacity: 0.7 }}>Today's Devotional</span>
      </div>
      <div style={{ padding: "1.2rem 1.2rem" }}>
        <div style={{ borderLeft: "2px solid rgba(200,169,81,0.4)", padding: "0 0 0 1.2rem", marginBottom: "1rem" }}>
          <div style={{ fontFamily: "'Georgia',serif", fontSize: "1.05rem", fontWeight: 300, fontStyle: "italic", lineHeight: 1.55, color: "#D4CFC4" }}>"{d.verse}"</div>
          <div style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8678", marginTop: "0.5rem" }}>— {d.ref}</div>
        </div>
        <div style={{ fontSize: "0.82rem", color: "#8A8678", lineHeight: 1.7 }}>{d.devotion}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// DEEP WORK TAB
// ════════════════════════════════════════
function DeepWorkTab() {
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
      step === 0 ? (
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
          <Quote text={'"Whatever your hand finds to do, do it with all your might."'} ref="Ecclesiastes 9:10" />
        </>
      )
    )}
  </div>);
}

// ════════════════════════════════════════
// ENERGY TAB
// ════════════════════════════════════════
function EnergyTab() {
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

// ════════════════════════════════════════
// AFFIRMATIONS TAB
// ════════════════════════════════════════
function AffTab({ aff, ed, setEd, onSave }) {
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

// ════════════════════════════════════════
// JOURNAL TAB
// ════════════════════════════════════════
function JournalTab({ jo, onChange, joIdx, aff }) {
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

// ════════════════════════════════════════
// TRACKER TAB — heatmap, streaks, PRs, awards
// ════════════════════════════════════════
function TrackerTab({ history, streak }) {
  // Compute stats
  const days = Object.keys(history).sort();
  const perfectDays = days.filter(d => history[d].count === history[d].total);
  const totalPerfect = perfectDays.length;

  // Longest perfect streak
  const calcLongestStreak = (datelist) => {
    if (!datelist.length) return 0;
    const sorted = [...datelist].sort();
    let max = 1, cur = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i-1]+"T12:00:00");
      const curr = new Date(sorted[i]+"T12:00:00");
      const diff = (curr - prev) / 86400000;
      if (diff === 1) { cur++; max = Math.max(max, cur); }
      else { cur = 1; }
    }
    return Math.max(max, cur);
  };
  const longestStreak = calcLongestStreak(perfectDays);

  // Per-practice streaks (current)
  const calcPracticeStreak = (practiceId) => {
    const sorted = [...days].sort().reverse();
    let count = 0;
    for (const d of sorted) {
      if (history[d].items && history[d].items.includes(practiceId)) count++;
      else break;
    }
    return count;
  };
  // Per-practice longest streak
  const calcPracticeLongest = (practiceId) => {
    const sorted = [...days].sort();
    if (!sorted.length) return 0;
    let max = 0, cur = 0, lastDate = null;
    for (const d of sorted) {
      if (history[d].items && history[d].items.includes(practiceId)) {
        if (lastDate) {
          const diff = (new Date(d+"T12:00:00") - new Date(lastDate+"T12:00:00")) / 86400000;
          cur = diff === 1 ? cur + 1 : 1;
        } else { cur = 1; }
        max = Math.max(max, cur);
        lastDate = d;
      } else { cur = 0; lastDate = null; }
    }
    return max;
  };

  const practiceStats = CL.map(c => ({
    ...c,
    current: calcPracticeStreak(c.id),
    best: calcPracticeLongest(c.id),
    totalDays: days.filter(d => history[d].items && history[d].items.includes(c.id)).length
  }));

  // Awards system
  const getAward = (streak) => {
    if (streak >= 365) return { icon: "👑", title: "Year of the Lord", desc: "365 perfect days", color: "#C8A951" };
    if (streak >= 100) return { icon: "🔥", title: "Refined by Fire", desc: "100 perfect days", color: "#E8743A" };
    if (streak >= 60) return { icon: "⚡", title: "Lightning Rod", desc: "60 perfect days", color: "#4A6FA5" };
    if (streak >= 30) return { icon: "🌊", title: "Living Water", desc: "30 perfect days", color: "#4A8FA5" };
    if (streak >= 14) return { icon: "🌿", title: "Deep Roots", desc: "14 perfect days", color: "#5A8A6A" };
    if (streak >= 7) return { icon: "🕊️", title: "Sabbath Complete", desc: "7 perfect days", color: "#A09ABB" };
    if (streak >= 3) return { icon: "🌱", title: "Mustard Seed", desc: "3 perfect days", color: "#7A9A6A" };
    if (streak >= 1) return { icon: "✦", title: "First Fruits", desc: "Day 1 complete", color: "#C8A951" };
    return null;
  };

  const allAwards = [
    { need: 1, ...getAward(1) },
    { need: 3, ...getAward(3) },
    { need: 7, ...getAward(7) },
    { need: 14, ...getAward(14) },
    { need: 30, ...getAward(30) },
    { need: 60, ...getAward(60) },
    { need: 100, ...getAward(100) },
    { need: 365, ...getAward(365) },
  ];

  const currentAward = getAward(streak.count);
  const nextAward = allAwards.find(a => a.need > streak.count);

  // Heatmap: last 12 weeks
  const heatmapWeeks = 12;
  const heatmapDays = [];
  const today = new Date();
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() - (heatmapWeeks * 7 - 1) - startDay.getDay());
  for (let i = 0; i < heatmapWeeks * 7; i++) {
    const d = new Date(startDay);
    d.setDate(d.getDate() + i);
    const ds = d.toISOString().slice(0, 10);
    const isFuture = d > today;
    const entry = history[ds];
    heatmapDays.push({ date: ds, day: d.getDay(), isFuture, count: entry ? entry.count : 0, total: entry ? entry.total : CL.length, perfect: entry ? entry.count === entry.total : false });
  }

  const weeks = [];
  for (let i = 0; i < heatmapDays.length; i += 7) weeks.push(heatmapDays.slice(i, i + 7));

  const getHeatColor = (day) => {
    if (day.isFuture) return "rgba(255,255,255,0.02)";
    if (day.count === 0) return "rgba(255,255,255,0.04)";
    if (day.perfect) return "#C8A951";
    const ratio = day.count / day.total;
    if (ratio >= 0.7) return "rgba(200,169,81,0.5)";
    if (ratio >= 0.4) return "rgba(200,169,81,0.25)";
    return "rgba(200,169,81,0.12)";
  };

  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const d = new Date(week[0].date + "T12:00:00");
    if (d.getMonth() !== lastMonth) {
      monthLabels.push({ idx: wi, label: d.toLocaleDateString("en-US", { month: "short" }) });
      lastMonth = d.getMonth();
    }
  });

  return (<div>
    {/* Current Award Banner */}
    {currentAward && (
      <div style={{ textAlign: "center", padding: "1.5rem", marginBottom: "1.5rem", background: `linear-gradient(135deg, ${currentAward.color}10, ${currentAward.color}05)`, border: `1px solid ${currentAward.color}30`, borderRadius: 3 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{currentAward.icon}</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 500, color: currentAward.color, marginBottom: "0.15rem" }}>{currentAward.title}</div>
        <div style={{ fontSize: "0.75rem", color: "#8A8678" }}>{streak.count} day streak — {currentAward.desc}</div>
        {nextAward && <div style={{ fontSize: "0.7rem", color: "#6A6A5A", marginTop: "0.5rem" }}>{nextAward.need - streak.count} days until "{nextAward.title}" {nextAward.icon}</div>}
      </div>
    )}

    {/* Stats row */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(200,169,81,0.1)", borderRadius: 2, overflow: "hidden", marginBottom: "1.5rem" }}>
      {[
        { label: "Current Streak", value: streak.count, sub: "days" },
        { label: "Longest Streak", value: longestStreak, sub: "PR" },
        { label: "Perfect Days", value: totalPerfect, sub: "total" },
      ].map((s, i) => (
        <div key={i} style={{ background: "#14171E", padding: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#C8A951" }}>{s.value}</div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A8678" }}>{s.label}</div>
          <div style={{ fontSize: "0.55rem", color: "#5A5A4A" }}>{s.sub}</div>
        </div>
      ))}
    </div>

    {/* Heatmap */}
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678", marginBottom: "0.8rem" }}>Last {heatmapWeeks} weeks</div>
      <div style={{ position: "relative" }}>
        {/* Month labels */}
        <div style={{ display: "flex", paddingLeft: 28, marginBottom: "0.3rem" }}>
          {weeks.map((_, wi) => {
            const ml = monthLabels.find(m => m.idx === wi);
            return <div key={wi} style={{ flex: 1, fontSize: "0.55rem", color: "#6A6A5A" }}>{ml ? ml.label : ""}</div>;
          })}
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {/* Day labels */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 4, justifyContent: "space-around" }}>
            {["", "M", "", "W", "", "F", ""].map((l, i) => <div key={i} style={{ height: 12, fontSize: "0.5rem", color: "#5A5A4A", display: "flex", alignItems: "center" }}>{l}</div>)}
          </div>
          {/* Grid */}
          <div style={{ display: "flex", gap: 2, flex: 1 }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                {week.map((day, di) => (
                  <div key={di} title={day.isFuture ? "" : `${day.date}: ${day.count}/${day.total}`} style={{
                    aspectRatio: "1", borderRadius: 2, background: getHeatColor(day),
                    border: day.date === TODAY ? "1.5px solid #C8A951" : "none",
                    minHeight: 12
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <span style={{ fontSize: "0.5rem", color: "#5A5A4A" }}>Less</span>
          {["rgba(255,255,255,0.04)", "rgba(200,169,81,0.12)", "rgba(200,169,81,0.25)", "rgba(200,169,81,0.5)", "#C8A951"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: 1, background: c }} />
          ))}
          <span style={{ fontSize: "0.5rem", color: "#5A5A4A" }}>More</span>
        </div>
      </div>
    </div>

    {/* Per-practice streaks */}
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678", marginBottom: "0.6rem" }}>Practice Streaks</div>
      {practiceStats.map(p => {
        const isPR = p.current > 0 && p.current >= p.best;
        return (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.7rem 0.9rem", background: "#14171E", border: `1px solid ${isPR && p.current > 1 ? "rgba(200,169,81,0.2)" : "rgba(200,169,81,0.06)"}`, borderRadius: 3, marginBottom: "0.3rem" }}>
            <span style={{ fontSize: "0.95rem", width: 28, textAlign: "center" }}>{p.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 400 }}>{p.label}</div>
              <div style={{ fontSize: "0.65rem", color: "#6A6A5A" }}>{p.totalDays} total days</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: isPR && p.current > 1 ? "#C8A951" : "#8A8678" }}>
                {p.current}{isPR && p.current > 1 && " 🔥"}
              </div>
              <div style={{ fontSize: "0.55rem", color: "#5A5A4A" }}>best: {p.best}</div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Awards showcase */}
    <div>
      <div style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8A8678", marginBottom: "0.6rem" }}>Awards</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
        {allAwards.map((a, i) => {
          const earned = longestStreak >= a.need || streak.count >= a.need;
          return (
            <div key={i} style={{
              padding: "1rem", borderRadius: 3, textAlign: "center",
              background: earned ? `${a.color}10` : "rgba(255,255,255,0.02)",
              border: `1px solid ${earned ? a.color + "30" : "rgba(255,255,255,0.05)"}`,
              opacity: earned ? 1 : 0.4
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem", filter: earned ? "none" : "grayscale(1)" }}>{a.icon}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: earned ? a.color : "#5A5A4A" }}>{a.title}</div>
              <div style={{ fontSize: "0.6rem", color: "#6A6A5A" }}>{a.desc}</div>
            </div>
          );
        })}
      </div>
    </div>

    <Quote text={'"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."'} ref="Galatians 6:9" />
  </div>);
}

// ════════════════════════════════════════
// WEEKLY REVIEW TAB
// ════════════════════════════════════════
function ReviewTab({ ps, upPil, wn, onWn }) {
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
