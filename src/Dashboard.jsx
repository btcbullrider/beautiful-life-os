import { useState, useEffect, useCallback, useRef } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TODAY = new Date().toISOString().slice(0, 10);
const WEEK_START = (() => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
})();

const DEFAULT_AFFIRMATIONS = [
  "I am a joyful, generous, Spirit-led creator who serves powerfully and lives abundantly.",
  "I surrender outcomes to God and trust His timing completely.",
  "I am the kind of person who shows up daily with coherence — clear thought and elevated emotion.",
  "I create enormous value for others, and abundance flows to me as a natural result.",
  "I remain on my lifeline, unmoved by pendulums, anchored in Christ.",
];

const DEFAULT_CHECKLIST = [
  { id: "silence", label: "Morning Silence", emoji: "🤫", category: "morning" },
  { id: "coherence", label: "Coherence Meditation (10-20 min)", emoji: "🧘", category: "morning" },
  { id: "scripture", label: "Scripture Reading", emoji: "📖", category: "morning" },
  { id: "affirmations", label: "Write Affirmations (10-15x)", emoji: "✍️", category: "morning" },
  { id: "exercise", label: "Move Your Body", emoji: "💪", category: "morning" },
  { id: "deepwork", label: "Deep Work Block", emoji: "⚡", category: "day" },
  { id: "midday", label: "Midday Reset + Prayer", emoji: "🙏", category: "day" },
  { id: "serve", label: "Serve / Connect with People", emoji: "❤️", category: "evening" },
  { id: "sleeptechnique", label: "Goddard Sleep Technique", emoji: "🌙", category: "evening" },
];

const PILLARS = [
  { id: "surrender", name: "Surrender the Outcome", short: "Surrender", color: "#C8A951" },
  { id: "livefromend", name: "Live from the End", short: "Imagination", color: "#6A5A8A" },
  { id: "identity", name: "Become the Person First", short: "Identity", color: "#4A6FA5" },
  { id: "environment", name: "Architect Your Environment", short: "Environment", color: "#5A8A6A" },
  { id: "compound", name: "Compound Daily", short: "Compound", color: "#A57A3A" },
  { id: "give", name: "Give First, Give Freely", short: "Generosity", color: "#A5566A" },
  { id: "rest", name: "Rest in the Mystery", short: "Sabbath", color: "#8A7A6A" },
];

const STORAGE_KEYS = {
  checklist: `checklist:${TODAY}`,
  affirmations: "affirmations:current",
  journal: `journal:${TODAY}`,
  weekReview: `weekreview:${WEEK_START}`,
  streak: "streak:data",
};

// Storage helpers
async function load(key, fallback) {
  try {
    const result = localStorage.getItem(key);
    return result ? JSON.parse(result) : fallback;
  } catch {
    return fallback;
  }
}

async function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Save failed:", e);
  }
}

// Debounce hook
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// ─── MAIN APP ───
export default function Dashboard() {
  const [tab, setTab] = useState("today");
  const [loaded, setLoaded] = useState(false);

  // State
  const [checked, setChecked] = useState({});
  const [affirmations, setAffirmations] = useState(DEFAULT_AFFIRMATIONS);
  const [editingAff, setEditingAff] = useState(false);
  const [journal, setJournal] = useState("");
  const [pillarScores, setPillarScores] = useState({});
  const [weekNotes, setWeekNotes] = useState("");
  const [streak, setStreak] = useState({ count: 0, lastDate: "" });

  // Load all data on mount
  useEffect(() => {
    (async () => {
      const [ch, af, jo, ps, wn, st] = await Promise.all([
        load(STORAGE_KEYS.checklist, {}),
        load(STORAGE_KEYS.affirmations, DEFAULT_AFFIRMATIONS),
        load(STORAGE_KEYS.journal, ""),
        load(STORAGE_KEYS.weekReview, {}),
        load(`weeknotes:${WEEK_START}`, ""),
        load(STORAGE_KEYS.streak, { count: 0, lastDate: "" }),
      ]);
      setChecked(ch);
      setAffirmations(af);
      setJournal(jo);
      setPillarScores(ps);
      setWeekNotes(wn);
      setStreak(st);
      setLoaded(true);
    })();
  }, []);

  // Save helpers
  const saveChecklist = useDebounce((data) => save(STORAGE_KEYS.checklist, data), 300);
  const saveJournal = useDebounce((text) => save(STORAGE_KEYS.journal, text), 500);
  const saveWeekNotes = useDebounce((text) => save(`weeknotes:${WEEK_START}`, text), 500);

  const toggleCheck = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    saveChecklist(next);

    // Update streak
    const completedCount = Object.values(next).filter(Boolean).length;
    if (completedCount === DEFAULT_CHECKLIST.length) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      const newStreak = {
        count: streak.lastDate === yStr || streak.lastDate === TODAY ? streak.count + (streak.lastDate === TODAY ? 0 : 1) : 1,
        lastDate: TODAY,
      };
      setStreak(newStreak);
      save(STORAGE_KEYS.streak, newStreak);
    }
  };

  const updatePillar = (id, score) => {
    const next = { ...pillarScores, [id]: score };
    setPillarScores(next);
    save(STORAGE_KEYS.weekReview, next);
  };

  const saveAffirmations = (newList) => {
    setAffirmations(newList);
    save(STORAGE_KEYS.affirmations, newList);
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalChecklist = DEFAULT_CHECKLIST.length;
  const progress = totalChecklist > 0 ? (completedCount / totalChecklist) * 100 : 0;

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (!loaded) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingText}>✦</div>
        <div style={{ color: "#8A8678", fontSize: "0.85rem" }}>Loading your operating system...</div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>✦</div>
          <div>
            <div style={styles.headerTitle}>Beautiful Life OS</div>
            <div style={styles.headerDate}>{todayFormatted}</div>
          </div>
        </div>
        <div style={styles.streakBadge}>
          <span style={styles.streakNum}>{streak.count}</span>
          <span style={styles.streakLabel}>day streak</span>
        </div>
      </header>

      {/* Tabs */}
      <nav style={styles.tabs}>
        {[
          { key: "today", label: "Today" },
          { key: "affirmations", label: "Affirmations" },
          { key: "journal", label: "Journal" },
          { key: "review", label: "Weekly Review" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...styles.tab,
              ...(tab === t.key ? styles.tabActive : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={styles.main}>
        {tab === "today" && (
          <TodayTab
            checked={checked}
            toggleCheck={toggleCheck}
            progress={progress}
            completedCount={completedCount}
            total={totalChecklist}
          />
        )}
        {tab === "affirmations" && (
          <AffirmationsTab
            affirmations={affirmations}
            editing={editingAff}
            setEditing={setEditingAff}
            onSave={saveAffirmations}
          />
        )}
        {tab === "journal" && (
          <JournalTab
            journal={journal}
            onChange={(v) => { setJournal(v); saveJournal(v); }}
          />
        )}
        {tab === "review" && (
          <ReviewTab
            pillarScores={pillarScores}
            updatePillar={updatePillar}
            weekNotes={weekNotes}
            onNotesChange={(v) => { setWeekNotes(v); saveWeekNotes(v); }}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        The system serves you — you serve Christ.
      </footer>
    </div>
  );
}

// ─── TODAY TAB ───
function TodayTab({ checked, toggleCheck, progress, completedCount, total }) {
  const categories = [
    { key: "morning", label: "Morning Rhythm", emoji: "☀️" },
    { key: "day", label: "Daytime", emoji: "⚡" },
    { key: "evening", label: "Evening", emoji: "🌙" },
  ];

  return (
    <div>
      {/* Progress bar */}
      <div style={styles.progressWrap}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Daily Coherence</span>
          <span style={styles.progressCount}>{completedCount}/{total}</span>
        </div>
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progress}%`,
              background: progress === 100
                ? "linear-gradient(90deg, #5A8A6A, #C8A951)"
                : "linear-gradient(90deg, #4A6FA5, #C8A951)",
            }}
          />
        </div>
        {progress === 100 && (
          <div style={styles.completeMsg}>
            ✦ All practices complete. Well done, faithful servant.
          </div>
        )}
      </div>

      {categories.map((cat) => (
        <div key={cat.key} style={styles.checkCategory}>
          <div style={styles.catHeader}>
            <span>{cat.emoji}</span>
            <span style={styles.catLabel}>{cat.label}</span>
          </div>
          {DEFAULT_CHECKLIST.filter((c) => c.category === cat.key).map((item) => (
            <button
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              style={{
                ...styles.checkItem,
                ...(checked[item.id] ? styles.checkItemDone : {}),
              }}
            >
              <div
                style={{
                  ...styles.checkbox,
                  ...(checked[item.id] ? styles.checkboxDone : {}),
                }}
              >
                {checked[item.id] && "✓"}
              </div>
              <span style={styles.checkEmoji}>{item.emoji}</span>
              <span
                style={{
                  ...styles.checkLabel,
                  ...(checked[item.id] ? styles.checkLabelDone : {}),
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      ))}

      <div style={styles.verseBox}>
        <div style={styles.verseText}>
          "Whatever you ask in prayer, believe that you have received it, and it will be yours."
        </div>
        <div style={styles.verseRef}>— Mark 11:24</div>
      </div>
    </div>
  );
}

// ─── AFFIRMATIONS TAB ───
function AffirmationsTab({ affirmations, editing, setEditing, onSave }) {
  const [draft, setDraft] = useState(affirmations);

  const startEdit = () => {
    setDraft([...affirmations]);
    setEditing(true);
  };

  const handleSave = () => {
    const cleaned = draft.filter((a) => a.trim() !== "");
    onSave(cleaned);
    setEditing(false);
  };

  const updateDraft = (i, val) => {
    const next = [...draft];
    next[i] = val;
    setDraft(next);
  };

  const addDraft = () => setDraft([...draft, ""]);
  const removeDraft = (i) => setDraft(draft.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={styles.sectionIntro}>
        <div style={styles.sectionIcon}>✍️</div>
        <div>
          <div style={styles.sectionTitle}>Your Identity Declarations</div>
          <div style={styles.sectionDesc}>
            Write these 10-15 times each morning. Present tense. First person. As if it's already true.
            This is Adams' affirmation method + Goddard's "feeling the wish fulfilled" + Dispenza's coherence — all in one practice.
          </div>
        </div>
      </div>

      {!editing ? (
        <>
          <div style={styles.affList}>
            {affirmations.map((a, i) => (
              <div key={i} style={styles.affItem}>
                <div style={styles.affNum}>{String(i + 1).padStart(2, "0")}</div>
                <div style={styles.affText}>{a}</div>
              </div>
            ))}
          </div>
          <button onClick={startEdit} style={styles.editBtn}>
            Edit Affirmations
          </button>
        </>
      ) : (
        <>
          <div style={styles.affList}>
            {draft.map((a, i) => (
              <div key={i} style={styles.affEditRow}>
                <div style={styles.affNum}>{String(i + 1).padStart(2, "0")}</div>
                <textarea
                  value={a}
                  onChange={(e) => updateDraft(i, e.target.value)}
                  style={styles.affTextarea}
                  rows={2}
                  placeholder="I am..."
                />
                <button onClick={() => removeDraft(i)} style={styles.removeBtn}>×</button>
              </div>
            ))}
          </div>
          <div style={styles.editActions}>
            <button onClick={addDraft} style={styles.addBtn}>+ Add Affirmation</button>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setEditing(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSave} style={styles.saveBtn}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── JOURNAL TAB ───
function JournalTab({ journal, onChange }) {
  const prompts = [
    "What am I grateful for right now?",
    "Where did I see God move today?",
    "What state am I choosing to embody?",
    "What pendulums tried to pull me off my lifeline?",
    "What would the future me — already living in the wish fulfilled — write?",
  ];

  return (
    <div>
      <div style={styles.sectionIntro}>
        <div style={styles.sectionIcon}>📔</div>
        <div>
          <div style={styles.sectionTitle}>Daily Reflection</div>
          <div style={styles.sectionDesc}>
            Write freely. This is your space to process, pray on paper, and notice what's shifting.
            Your entries are saved automatically.
          </div>
        </div>
      </div>

      <div style={styles.promptsWrap}>
        <div style={styles.promptsLabel}>Reflection prompts (click to insert):</div>
        <div style={styles.promptsList}>
          {prompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onChange(journal + (journal ? "\n\n" : "") + p + "\n")}
              style={styles.promptBtn}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={journal}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Begin writing..."
        style={styles.journalArea}
        rows={16}
      />
    </div>
  );
}

// ─── WEEKLY REVIEW TAB ───
function ReviewTab({ pillarScores, updatePillar, weekNotes, onNotesChange }) {
  return (
    <div>
      <div style={styles.sectionIntro}>
        <div style={styles.sectionIcon}>📊</div>
        <div>
          <div style={styles.sectionTitle}>Weekly Pillar Review</div>
          <div style={styles.sectionDesc}>
            Rate yourself 1-5 on each pillar. Be honest, not harsh. This isn't judgment — it's calibration.
            "Where am I strong? Where am I drifting?"
          </div>
        </div>
      </div>

      <div style={styles.pillarsGrid}>
        {PILLARS.map((p) => {
          const score = pillarScores[p.id] || 0;
          return (
            <div key={p.id} style={styles.pillarCard}>
              <div style={styles.pillarCardHeader}>
                <div
                  style={{
                    ...styles.pillarDot,
                    background: p.color,
                  }}
                />
                <div>
                  <div style={styles.pillarName}>{p.short}</div>
                  <div style={styles.pillarFull}>{p.name}</div>
                </div>
              </div>
              <div style={styles.scoreRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => updatePillar(p.id, n)}
                    style={{
                      ...styles.scoreBtn,
                      background: n <= score ? p.color : "rgba(255,255,255,0.04)",
                      color: n <= score ? "#0D0F14" : "#5A5A5A",
                      borderColor: n <= score ? p.color : "rgba(255,255,255,0.08)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual summary */}
      <div style={styles.summaryBar}>
        {PILLARS.map((p) => {
          const score = pillarScores[p.id] || 0;
          return (
            <div key={p.id} style={styles.summaryCol}>
              <div style={styles.summaryBarTrack}>
                <div
                  style={{
                    ...styles.summaryBarFill,
                    height: `${(score / 5) * 100}%`,
                    background: p.color,
                  }}
                />
              </div>
              <div style={styles.summaryLabel}>{p.short.slice(0, 3)}</div>
            </div>
          );
        })}
      </div>

      <div style={styles.weekNotesLabel}>Weekly notes + intentions for next week:</div>
      <textarea
        value={weekNotes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="What patterns am I noticing? What needs to shift? What am I celebrating?"
        style={styles.weekNotesArea}
        rows={6}
      />
    </div>
  );
}

// ─── STYLES ───
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0D0F14",
    color: "#E8E4DC",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    fontWeight: 300,
    maxWidth: "720px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0F14",
    gap: "1rem",
  },
  loadingText: {
    fontSize: "2rem",
    color: "#C8A951",
    animation: "pulse 2s ease infinite",
  },
  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2rem 0 1.5rem",
    borderBottom: "1px solid rgba(200,169,81,0.1)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "1rem" },
  logo: { fontSize: "1.8rem", color: "#C8A951", opacity: 0.6 },
  headerTitle: {
    fontSize: "1.2rem",
    fontWeight: 500,
    letterSpacing: "-0.01em",
  },
  headerDate: { fontSize: "0.78rem", color: "#8A8678", marginTop: "0.1rem" },
  streakBadge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(200,169,81,0.06)",
    border: "1px solid rgba(200,169,81,0.15)",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
  },
  streakNum: { fontSize: "1.4rem", fontWeight: 600, color: "#C8A951" },
  streakLabel: { fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8678" },
  // Tabs
  tabs: {
    display: "flex",
    gap: "0",
    padding: "1rem 0 0",
    borderBottom: "1px solid rgba(200,169,81,0.08)",
  },
  tab: {
    flex: 1,
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#6A6A5A",
    fontSize: "0.8rem",
    fontWeight: 400,
    letterSpacing: "0.05em",
    padding: "0.8rem 0",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  tabActive: {
    color: "#E8E4DC",
    borderBottomColor: "#C8A951",
  },
  // Main
  main: { padding: "1.5rem 0 3rem" },
  // Progress
  progressWrap: { marginBottom: "2rem" },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  progressLabel: { fontSize: "0.75rem", color: "#8A8678", letterSpacing: "0.1em", textTransform: "uppercase" },
  progressCount: { fontSize: "0.85rem", color: "#C8A951" },
  progressTrack: {
    width: "100%",
    height: "4px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.4s ease",
  },
  completeMsg: {
    textAlign: "center",
    color: "#C8A951",
    fontSize: "0.8rem",
    marginTop: "0.8rem",
    fontStyle: "italic",
  },
  // Checklist
  checkCategory: { marginBottom: "1.5rem" },
  catHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.6rem",
  },
  catLabel: {
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#8A8678",
  },
  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    width: "100%",
    background: "#14171E",
    border: "1px solid rgba(200,169,81,0.08)",
    borderRadius: "3px",
    padding: "0.9rem 1rem",
    marginBottom: "0.4rem",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    textAlign: "left",
    color: "#E8E4DC",
  },
  checkItemDone: {
    background: "rgba(90,138,106,0.06)",
    borderColor: "rgba(90,138,106,0.15)",
  },
  checkbox: {
    width: "20px",
    height: "20px",
    borderRadius: "3px",
    border: "1.5px solid rgba(200,169,81,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    color: "#5A8A6A",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  checkboxDone: {
    background: "rgba(90,138,106,0.2)",
    borderColor: "#5A8A6A",
  },
  checkEmoji: { fontSize: "1rem" },
  checkLabel: { fontSize: "0.88rem", fontWeight: 400 },
  checkLabelDone: { opacity: 0.5, textDecoration: "line-through" },
  // Verse
  verseBox: {
    borderLeft: "2px solid rgba(200,169,81,0.3)",
    padding: "1.2rem 1.5rem",
    marginTop: "2rem",
    background: "rgba(200,169,81,0.02)",
  },
  verseText: {
    fontSize: "1rem",
    fontStyle: "italic",
    lineHeight: 1.5,
    color: "#C8C0B0",
  },
  verseRef: {
    fontSize: "0.7rem",
    letterSpacing: "0.1em",
    color: "#8A8678",
    marginTop: "0.5rem",
  },
  // Section intro
  sectionIntro: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    padding: "1.2rem",
    background: "rgba(200,169,81,0.03)",
    border: "1px solid rgba(200,169,81,0.08)",
    borderRadius: "3px",
  },
  sectionIcon: { fontSize: "1.6rem", flexShrink: 0 },
  sectionTitle: { fontSize: "1.05rem", fontWeight: 500, marginBottom: "0.3rem" },
  sectionDesc: { fontSize: "0.82rem", color: "#8A8678", lineHeight: 1.6 },
  // Affirmations
  affList: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" },
  affItem: {
    display: "flex",
    gap: "1rem",
    padding: "1rem 1.2rem",
    background: "#14171E",
    border: "1px solid rgba(200,169,81,0.08)",
    borderRadius: "3px",
    alignItems: "flex-start",
  },
  affNum: { color: "#C8A951", opacity: 0.4, fontSize: "0.8rem", fontWeight: 500, minWidth: "24px", paddingTop: "0.1rem" },
  affText: { fontSize: "0.9rem", lineHeight: 1.6, color: "#C8C0B0" },
  affEditRow: {
    display: "flex",
    gap: "0.8rem",
    alignItems: "flex-start",
    padding: "0.8rem",
    background: "#14171E",
    border: "1px solid rgba(200,169,81,0.1)",
    borderRadius: "3px",
  },
  affTextarea: {
    flex: 1,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(200,169,81,0.12)",
    borderRadius: "2px",
    color: "#E8E4DC",
    fontFamily: "inherit",
    fontSize: "0.88rem",
    padding: "0.6rem 0.8rem",
    resize: "vertical",
    lineHeight: 1.5,
    outline: "none",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#A5566A",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "0.3rem",
    fontFamily: "inherit",
  },
  editBtn: {
    background: "none",
    border: "1px solid rgba(200,169,81,0.2)",
    color: "#C8A951",
    padding: "0.6rem 1.2rem",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
    transition: "all 0.2s",
  },
  editActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.5rem",
  },
  addBtn: {
    background: "none",
    border: "1px dashed rgba(200,169,81,0.2)",
    color: "#8A8678",
    padding: "0.5rem 1rem",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontFamily: "inherit",
  },
  cancelBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#8A8678",
    padding: "0.5rem 1rem",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontFamily: "inherit",
  },
  saveBtn: {
    background: "rgba(200,169,81,0.15)",
    border: "1px solid rgba(200,169,81,0.3)",
    color: "#C8A951",
    padding: "0.5rem 1.2rem",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: 500,
    fontFamily: "inherit",
  },
  // Journal
  promptsWrap: { marginBottom: "1rem" },
  promptsLabel: {
    fontSize: "0.7rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#8A8678",
    marginBottom: "0.5rem",
  },
  promptsList: { display: "flex", flexWrap: "wrap", gap: "0.4rem" },
  promptBtn: {
    background: "rgba(106,90,138,0.08)",
    border: "1px solid rgba(106,90,138,0.15)",
    color: "#A09ABB",
    padding: "0.4rem 0.8rem",
    borderRadius: "2px",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "all 0.2s",
  },
  journalArea: {
    width: "100%",
    background: "#14171E",
    border: "1px solid rgba(200,169,81,0.1)",
    borderRadius: "3px",
    color: "#E8E4DC",
    fontFamily: "inherit",
    fontSize: "0.9rem",
    padding: "1.2rem",
    resize: "vertical",
    lineHeight: 1.7,
    outline: "none",
    minHeight: "300px",
  },
  // Weekly Review
  pillarsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "0.5rem",
    marginBottom: "2rem",
  },
  pillarCard: {
    background: "#14171E",
    border: "1px solid rgba(200,169,81,0.08)",
    borderRadius: "3px",
    padding: "1rem 1.2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pillarCardHeader: { display: "flex", alignItems: "center", gap: "0.8rem" },
  pillarDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  pillarName: { fontSize: "0.9rem", fontWeight: 500 },
  pillarFull: { fontSize: "0.7rem", color: "#8A8678" },
  scoreRow: { display: "flex", gap: "0.3rem" },
  scoreBtn: {
    width: "32px",
    height: "32px",
    border: "1px solid",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 500,
    fontFamily: "inherit",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Summary bar chart
  summaryBar: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: "100px",
    padding: "1rem 0",
    marginBottom: "2rem",
    borderBottom: "1px solid rgba(200,169,81,0.08)",
  },
  summaryCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem",
    flex: 1,
  },
  summaryBarTrack: {
    width: "24px",
    height: "70px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "2px",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
  },
  summaryBarFill: {
    width: "100%",
    borderRadius: "2px",
    transition: "height 0.4s ease",
    opacity: 0.7,
  },
  summaryLabel: {
    fontSize: "0.6rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6A6A5A",
  },
  weekNotesLabel: {
    fontSize: "0.75rem",
    color: "#8A8678",
    letterSpacing: "0.05em",
    marginBottom: "0.5rem",
  },
  weekNotesArea: {
    width: "100%",
    background: "#14171E",
    border: "1px solid rgba(200,169,81,0.1)",
    borderRadius: "3px",
    color: "#E8E4DC",
    fontFamily: "inherit",
    fontSize: "0.88rem",
    padding: "1rem",
    resize: "vertical",
    lineHeight: 1.6,
    outline: "none",
  },
  // Footer
  footer: {
    textAlign: "center",
    padding: "2rem 0 3rem",
    color: "#5A5A4A",
    fontSize: "0.75rem",
    fontStyle: "italic",
    borderTop: "1px solid rgba(200,169,81,0.06)",
  },
};
