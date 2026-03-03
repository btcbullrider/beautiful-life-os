import { useState } from "react";
import { Div, SL, SH, SP, Quote, Tag } from "./shared/UI";

export default function GuideTab() {
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
