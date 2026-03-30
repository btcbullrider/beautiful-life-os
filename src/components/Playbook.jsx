export default function PlaybookTab() {
  const sections = [
    {
      title: "DIAGNOSE FIRST",
      color: "#f97316",
      items: [
        { label: "ATTENTION", detail: "Not enough people seeing content → Hooks + content volume" },
        { label: "LEADS", detail: "Not enough interest → Warm outreach → Content → Cold → Paid" },
        { label: "NURTURE", detail: "Interested but not converting → Speed + Availability + Personalization" },
        { label: "REVENUE", detail: "Clients not staying → Crazy Eight + Pricing + Retention" },
        { label: "BRAND", detail: "Right people don't recognize the standard → Association model" },
        { label: "CAPACITY", detail: "Peter is the bottleneck → Systems + delegation" },
      ]
    },
    {
      title: "GRAND SLAM OFFER",
      color: "#22c55e",
      items: [
        { label: "Dream outcome", detail: "Close institutional capital faster, avoid IR mistakes" },
        { label: "Proof", detail: "14 years IR, S&P 500 REIT (NYSE: DOC), live published briefs" },
        { label: "Speed", detail: "2-week analysis vs. months of trial-and-error" },
        { label: "Effort", detail: "Zero — Peter works, client receives intelligence" },
      ]
    },
    {
      title: "CORE FOUR (Lead Channels)",
      color: "#3b82f6",
      items: [
        { label: "1. Warm outreach", detail: "Fastest path. Zero cost. Highest conversion. Start here." },
        { label: "2. Free content", detail: "X posts + briefs + YouTube. Compounding asset." },
        { label: "3. Cold outreach", detail: "Filing insight as opener. Earn the conversation." },
        { label: "4. Paid ads", detail: "After retainer model is proven. Unit economics first." },
      ]
    },
    {
      title: "CRAZY EIGHT (LTV Levers)",
      color: "#a855f7",
      items: [
        { label: "1", detail: "Raise prices — biggest lever" },
        { label: "2", detail: "Decrease costs" },
        { label: "3", detail: "Increase purchase frequency" },
        { label: "4", detail: "Cross-sell adjacent problem" },
        { label: "5", detail: "Upsell quantity" },
        { label: "6", detail: "Upsell quality (faster, more personal)" },
        { label: "7", detail: "Downsell quantity" },
        { label: "8", detail: "Downsell quality" },
      ]
    },
    {
      title: "FAST CASH PLAY",
      color: "#eab308",
      items: [
        { label: "What", detail: "IR Audit Sprint — 3 spots, 2-week deliverable, time-bounded" },
        { label: "How", detail: "Beehiiv + direct DM. 5-7 message sequence over 7 days." },
        { label: "When", detail: "Every 90 days" },
        { label: "LTV math", detail: "$5,000/mo retainer × 12 months = $60,000 LTV" },
      ]
    },
    {
      title: "MASTER PRINCIPLES",
      color: "#64748b",
      items: [
        { label: "Constraint-first", detail: "One thing is always the bottleneck. Fix it." },
        { label: "Volume", detail: "Volume negates luck. More briefs, more outreach, more content." },
        { label: "Hook rule", detail: "80% of prep time on the hook. Statements dominate (47.9%)." },
        { label: "Pricing rule", detail: "2x price = 6x profit at 10% margins. Undercharging is the mistake." },
        { label: "Brand", detail: "Direct response funds today. Brand funds the next decade." },
      ]
    },
  ];

  return (
    <div style={{ padding: "16px", maxWidth: "680px", margin: "0 auto", fontFamily: "inherit" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px", color: "#f1f5f9" }}>
        Growth Playbook
      </h2>
      <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "20px" }}>
        Diagnose the constraint. Apply the framework. One action.
      </p>
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: "20px" }}>
          <div style={{
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            color: section.color,
            marginBottom: "8px",
            textTransform: "uppercase"
          }}>
            {section.title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {section.items.map((item) => (
              <div key={item.label} style={{
                display: "flex",
                gap: "10px",
                padding: "8px 10px",
                background: "#1e293b",
                borderRadius: "6px",
                borderLeft: `3px solid ${section.color}`,
              }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#f1f5f9", minWidth: "110px", flexShrink: 0 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
