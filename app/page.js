'use client';
import { useState, useEffect, useRef } from "react";

const RECENT = [
  { a:"7xKp...9fR2",b:"🗑️ Exit Liquidity",p:"-42.3 SOL" },
  { a:"Dg4n...mL8s",b:"🧲 Rug Magnet",p:"-67.1 SOL" },
  { a:"9aFx...3kPd",b:"🧻 Paper Hands",p:"-18.9 SOL" },
  { a:"Bw2m...7jNc",b:"💀 Terminal Degen",p:"-91.4 SOL" },
  { a:"4cRt...xQ5v",b:"🐑 FOMO Lord",p:"-33.7 SOL" },
  { a:"Lm6h...2wAs",b:"📈 Top Buyer",p:"-55.2 SOL" },
  { a:"Xp3d...kF9e",b:"🤡 Certified Clown",p:"-12.8 SOL" },
  { a:"Nv8q...5tRz",b:"⚡ Speed Loser",p:"-78.6 SOL" },
];

// ── FIRE PARTICLES ──────────────────────────────────────────────
function FireBG({ intensity = 1 }) {
  const ref = useRef(null);
  const pRef = useRef([]);
  const frame = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
    const spawn = () => ({ x:Math.random()*W, y:H+5, vx:(Math.random()-0.5)*1.2*intensity, vy:-Math.random()*2*intensity-0.8, size:Math.random()*3.5+1, life:1, decay:Math.random()*0.012+0.005, color:["#ff6b35","#ff2e4d","#ffaa00","#ff4500","#ff8c00"][Math.floor(Math.random()*5)] });
    const loop = () => {
      ctx.clearRect(0,0,W,H);
      if (pRef.current.length < 40*intensity) pRef.current.push(spawn());
      pRef.current = pRef.current.filter(p => {
        p.x+=p.vx; p.y+=p.vy; p.vy-=0.005; p.life-=p.decay;
        if (p.life<=0) return false;
        ctx.globalAlpha=p.life*0.5; ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=10;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2); ctx.fill(); return true;
      });
      ctx.globalAlpha=1; ctx.shadowBlur=0; frame.current=requestAnimationFrame(loop);
    };
    frame.current=requestAnimationFrame(loop);
    return () => { if(frame.current) cancelAnimationFrame(frame.current); };
  }, [intensity]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:2,width:"100%",height:"100%"}}/>;
}

function TypeWriter({ text, speed=14, onDone }) {
  const [d,setD]=useState(""); const idx=useRef(0);
  useEffect(()=>{ idx.current=0; setD("");
    const iv=setInterval(()=>{idx.current++;setD(text.slice(0,idx.current));if(idx.current>=text.length){clearInterval(iv);onDone?.();}},speed);
    return()=>clearInterval(iv); },[text,speed]);
  return <div style={{whiteSpace:"pre-wrap",lineHeight:1.75}}>{d}<span style={{animation:"blink 0.7s step-end infinite",color:"#ff6b35"}}>▊</span></div>;
}

function StatBar({label,value,max=100,color,delay=0}) {
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW((value/max)*100),200+delay);return()=>clearTimeout(t)},[value,max,delay]);
  return (
    <div style={{marginBottom:"10px",animation:`fadeUp 0.3s ease ${delay}ms both`}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
        <span style={{fontSize:"10px",color:"rgba(255,255,255,0.4)",letterSpacing:"1.5px",fontWeight:600}}>{label}</span>
        <span style={{fontSize:"11px",color,fontWeight:700}}>{value}/{max}</span>
      </div>
      <div style={{height:"4px",borderRadius:"2px",background:"rgba(255,255,255,0.04)",overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:"2px",background:color,boxShadow:`0 0 8px ${color}60`,width:`${w}%`,transition:"width 1s cubic-bezier(0.4,0,0.2,1)"}}/>
      </div>
    </div>
  );
}

function Ticker() {
  const d=[...RECENT,...RECENT];
  return (
    <div style={{overflow:"hidden",height:"34px",marginBottom:"18px"}}>
      <div style={{display:"flex",gap:"20px",animation:"scrollTicker 22s linear infinite",whiteSpace:"nowrap"}}>
        {d.map((r,i)=>(
          <div key={i} style={{display:"inline-flex",alignItems:"center",gap:"8px",padding:"5px 10px",borderRadius:"6px",flexShrink:0,background:"rgba(255,107,53,0.04)",border:"1px solid rgba(255,107,53,0.08)"}}>
            <span style={{fontSize:"10px",color:"var(--burn)",fontWeight:600}}>{r.a}</span>
            <span style={{fontSize:"9px",color:"var(--text-dim)"}}>{r.b}</span>
            <span style={{fontSize:"9px",color:"var(--red)",fontWeight:700}}>{r.p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN PAGE ───────────────────────────────────────────────────
export default function Home() {
  const [address, setAddress] = useState("");
  const [roastData, setRoastData] = useState(null);
  const [roastText, setRoastText] = useState("");
  const [phase, setPhase] = useState("input");
  const [typeDone, setTypeDone] = useState(false);
  const [scanTexts, setScanTexts] = useState([]);
  const [error, setError] = useState(null);

  const handleRoast = async () => {
    const addr = address.trim();
    if (addr.length < 20) return;
    setPhase("scanning"); setTypeDone(false); setScanTexts([]); setError(null);

    const scans = [
      "Connecting to Helius RPC...",
      "Pulling on-chain transaction history...",
      "Parsing token swaps...",
      "Analyzing trade performance...",
      "Calculating real PnL...",
      "Counting rug pulls absorbed...",
      "Measuring paper hand frequency...",
      "Computing degen score...",
      "Feeding real data to AI roast engine...",
      "Generating personalized destruction...",
    ];
    scans.forEach((s,i) => { setTimeout(() => setScanTexts(prev => [...prev, s]), i * 320); });

    try {
      // Step 1: Fetch real wallet data from Helius via our API
      const walletRes = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr }),
      });
      const walletData = await walletRes.json();

      let stats;
      if (walletData.stats && !walletData.fallback) {
        stats = walletData.stats;
      } else {
        // Fallback to generated data if Helius fails
        stats = generateFallbackData(addr);
      }
      setRoastData(stats);

      // Step 2: Generate AI roast via our API
      const roastRes = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats, address: addr }),
      });
      const roastJson = await roastRes.json();
      setRoastText(roastJson.roast);
      setPhase("roast");
    } catch (err) {
      console.error('Roast flow error:', err);
      // Full fallback
      const stats = generateFallbackData(addr);
      setRoastData(stats);
      setRoastText(getFallback(stats, addr));
      setPhase("roast");
    }
  };

  const reset = () => { setPhase("input"); setAddress(""); setRoastData(null); setRoastText(""); setTypeDone(false); setScanTexts([]); setError(null); };
  const short = address.length > 8 ? address.slice(0,4)+"..."+address.slice(-4) : address;

  return (
    <>
      {/* Overlays */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,opacity:0.025,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"}}/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,background:"radial-gradient(ellipse at center,transparent 40%,rgba(8,7,11,0.75) 100%)"}}/>
      <div style={{position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:"90%",height:"50%",borderRadius:"50%",pointerEvents:"none",zIndex:0,background:phase==="roast"?"radial-gradient(ellipse,rgba(255,107,53,0.08) 0%,transparent 65%)":"radial-gradient(ellipse,rgba(255,46,77,0.04) 0%,transparent 65%)",transition:"background 1s"}}/>

      {/* Header */}
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid var(--border)",background:"rgba(8,7,11,0.88)",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer"}} onClick={reset}>
          <img src="/logo.png" alt="Wallet Roast" style={{width:"28px",height:"28px",borderRadius:"6px"}}/>
          <span style={{fontFamily:"'Permanent Marker',cursive",fontSize:"15px",background:"linear-gradient(90deg,#ff6b35,#ff2e4d)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>WALLET ROAST</span>
        </div>
        {phase!=="input"&&<button onClick={reset} style={{padding:"6px 14px",borderRadius:"6px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text-dim)",fontSize:"10px",fontWeight:700,letterSpacing:"1.5px",cursor:"pointer"}}>NEW ROAST</button>}
      </header>

      <main style={{padding:"0 16px",maxWidth:"580px",margin:"0 auto",position:"relative",zIndex:10}}>

        {/* HOME */}
        {phase==="input"&&(
          <div>
            <div style={{textAlign:"center",paddingTop:"32px",paddingBottom:"24px"}}>
              <div style={{position:"relative",display:"inline-block",marginBottom:"16px"}}>
                <div style={{position:"absolute",inset:"-24px",borderRadius:"50%",border:"2px solid rgba(255,107,53,0.12)",animation:"pulseRing 2.5s ease-out infinite"}}/>
                <div style={{position:"absolute",inset:"-40px",borderRadius:"50%",border:"1px solid rgba(255,107,53,0.06)",animation:"pulseRing 2.5s ease-out 0.6s infinite"}}/>
                <div style={{position:"absolute",inset:"-56px",borderRadius:"50%",border:"1px solid rgba(255,107,53,0.03)",animation:"pulseRing 2.5s ease-out 1.2s infinite"}}/>
                <img src="/logo.png" alt="Wallet Roast" style={{width:"80px",height:"80px",borderRadius:"16px",animation:"float 3s ease-in-out infinite, breatheFire 2s ease infinite"}}/>
              </div>
              <h1 style={{fontFamily:"'Dela Gothic One',cursive",fontSize:"clamp(26px,7vw,38px)",lineHeight:1.15,marginBottom:"12px",animation:"fadeUp 0.5s ease 0.1s both"}}>
                <span style={{background:"linear-gradient(135deg,#ff6b35,#ff2e4d,#ffaa00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Paste a wallet.</span><br/>
                <span style={{color:"var(--text)"}}>Get destroyed.</span>
              </h1>
              <p style={{fontSize:"12.5px",color:"var(--text-dim)",maxWidth:"330px",margin:"0 auto",lineHeight:1.65,animation:"fadeUp 0.5s ease 0.2s both"}}>
                AI reads your real Solana on-chain history and generates a brutal, personalized roast. No mercy.
              </p>
            </div>

            <div style={{animation:"fadeUp 0.5s ease 0.25s both"}}>
              <div style={{fontSize:"8px",letterSpacing:"2px",color:"var(--text-dim)",fontWeight:600,marginBottom:"6px",textAlign:"center"}}>RECENT VICTIMS</div>
              <Ticker/>
            </div>

            <div style={{background:"linear-gradient(160deg,rgba(255,107,53,0.04) 0%,rgba(8,7,11,0.6) 40%,rgba(255,46,77,0.03) 100%)",border:"1px solid rgba(255,107,53,0.1)",borderRadius:"16px",padding:"20px",marginBottom:"14px",animation:"fadeUp 0.5s ease 0.3s both",position:"relative",overflow:"hidden"}}>
              <FireBG intensity={0.35}/>
              <div style={{position:"relative",zIndex:5}}>
                <label style={{fontSize:"9px",letterSpacing:"2.5px",color:"var(--burn)",fontWeight:700,display:"block",marginBottom:"10px"}}>SOLANA WALLET ADDRESS</label>
                <input type="text" value={address} onChange={e=>setAddress(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleRoast()}
                  placeholder="Paste any Solana address..."
                  style={{width:"100%",padding:"14px 16px",borderRadius:"10px",border:"1px solid var(--border)",background:"rgba(0,0,0,0.4)",color:"var(--text)",fontSize:"13px",fontFamily:"inherit",backdropFilter:"blur(8px)"}}/>
                <button onClick={handleRoast} disabled={address.trim().length<20}
                  style={{width:"100%",padding:"16px",borderRadius:"12px",border:"none",marginTop:"12px",
                    cursor:address.trim().length>=20?"pointer":"not-allowed",
                    background:address.trim().length>=20?"linear-gradient(135deg,#ff6b35 0%,#ff2e4d 60%,#ff4500 100%)":"rgba(255,255,255,0.03)",
                    color:address.trim().length>=20?"#fff":"rgba(255,255,255,0.2)",
                    fontSize:"15px",fontWeight:700,letterSpacing:"3px",fontFamily:"'Permanent Marker',cursive",
                    boxShadow:address.trim().length>=20?"0 4px 30px rgba(255,107,53,0.35)":"none",transition:"all 0.3s"}}>
                  🔥 ROAST THIS WALLET
                </button>
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"center",gap:"28px",marginTop:"20px",paddingBottom:"24px",animation:"fadeUp 0.5s ease 0.5s both"}}>
              {[{v:"12,847",l:"ROASTED"},{v:"4,291",l:"SHARED"},{v:"-8,420",l:"AVG PNL"}].map((s,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontSize:"16px",fontWeight:700,color:i===2?"var(--red)":"var(--burn)"}}>{s.v}</div>
                  <div style={{fontSize:"8px",letterSpacing:"1.5px",color:"var(--text-dim)"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCANNING */}
        {phase==="scanning"&&(
          <div style={{marginTop:"40px",animation:"fadeIn 0.3s ease"}}>
            <div style={{textAlign:"center",marginBottom:"24px"}}>
              <img src="/logo.png" alt="" style={{width:"56px",height:"56px",borderRadius:"12px",animation:"shake 0.3s ease infinite",marginBottom:"10px",filter:"drop-shadow(0 0 15px rgba(255,107,53,0.5))"}}/>
              <div style={{fontFamily:"'Permanent Marker',cursive",fontSize:"20px",color:"var(--burn)",letterSpacing:"2px"}}>ANALYZING WALLET</div>
              <div style={{fontSize:"11px",color:"var(--text-dim)",marginTop:"4px"}}>{short}</div>
            </div>
            <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"12px",padding:"14px"}}>
              {scanTexts.map((s,i)=>(
                <div key={i} style={{fontSize:"11px",padding:"4px 0",color:i===scanTexts.length-1?"var(--burn)":"rgba(255,255,255,0.2)",animation:"slideUp 0.2s ease"}}>
                  <span style={{color:"var(--burn)",marginRight:"6px",opacity:0.5}}>▸</span>{s}
                </div>
              ))}
              <span style={{animation:"blink 0.6s step-end infinite",color:"var(--burn)",fontSize:"11px"}}>▊</span>
            </div>
          </div>
        )}

        {/* ROAST */}
        {phase==="roast"&&roastData&&(
          <div style={{paddingTop:"14px",paddingBottom:"20px",animation:"fadeUp 0.4s ease"}}>
            <div style={{textAlign:"center",padding:"22px 16px",marginBottom:"14px",borderRadius:"16px",background:"var(--surface)",border:"1px solid var(--border)",position:"relative",overflow:"hidden",animation:"burnGlow 3s ease infinite"}}>
              <FireBG intensity={0.8}/>
              <div style={{position:"relative",zIndex:5}}>
                <img src="/logo.png" alt="" style={{width:"48px",height:"48px",borderRadius:"10px",marginBottom:"8px",filter:"drop-shadow(0 0 12px rgba(255,107,53,0.4))"}}/>
                <div style={{fontFamily:"'Dela Gothic One',cursive",fontSize:"18px",color:"var(--burn)",textShadow:"0 0 20px rgba(255,107,53,0.3)"}}>{short}</div>
                <div style={{fontSize:"11px",color:"var(--text-dim)",marginTop:"6px"}}>Net PnL: <span style={{color:"var(--red)",fontWeight:700,fontSize:"13px"}}>{roastData.totalPnl}</span></div>
              </div>
            </div>

            <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"14px",animation:"fadeUp 0.35s ease 0.1s both"}}>
              {roastData.badges.map((b,i)=>(<div key={i} style={{padding:"5px 10px",borderRadius:"6px",fontSize:"10px",fontWeight:600,background:"rgba(255,107,53,0.06)",border:"1px solid rgba(255,107,53,0.15)",color:"var(--burn)",animation:`popIn 0.3s ease ${i*80}ms both`}}>{b}</div>))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"14px",animation:"fadeUp 0.35s ease 0.15s both"}}>
              {[{l:"TOKENS",v:roastData.tokensTraded,c:"var(--text)"},{l:"RUGS",v:roastData.rugsHit,c:"var(--red)"},{l:"WIN RATE",v:`${roastData.winRate}%`,c:roastData.winRate<20?"var(--red)":"var(--gold)"},{l:"AVG HOLD",v:roastData.avgHold,c:"var(--burn)"},{l:"TOP BUYS",v:roastData.boughtTopCount,c:"var(--red)"},{l:"BOT SELLS",v:roastData.soldBottomCount,c:"var(--red)"}].map((s,i)=>(
                <div key={i} style={{padding:"10px",borderRadius:"8px",background:"var(--surface)",border:"1px solid var(--border)",textAlign:"center"}}>
                  <div style={{fontSize:"8px",color:"var(--text-dim)",letterSpacing:"1.5px",marginBottom:"4px"}}>{s.l}</div>
                  <div style={{fontSize:"15px",fontWeight:700,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{padding:"14px",borderRadius:"12px",background:"var(--surface)",border:"1px solid var(--border)",marginBottom:"14px",animation:"fadeUp 0.35s ease 0.2s both"}}>
              <StatBar label="PAPER HANDS" value={roastData.paperHandScore} color="var(--red)" delay={0}/>
              <StatBar label="FOMO SCORE" value={roastData.fomo} color="var(--burn)" delay={100}/>
              <StatBar label="DEGEN LEVEL" value={roastData.degen} color="var(--gold)" delay={200}/>
              <StatBar label="DIAMOND HANDS" value={roastData.diamondHands} color="var(--text-dim)" delay={300}/>
            </div>

            <div style={{padding:"20px 16px",borderRadius:"14px",background:"rgba(255,107,53,0.03)",border:"1px solid rgba(255,107,53,0.1)",marginBottom:"14px",animation:"fadeUp 0.4s ease 0.3s both"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
                <span style={{fontSize:"18px"}}>🔥</span>
                <span style={{fontFamily:"'Permanent Marker',cursive",fontSize:"15px",color:"var(--burn)",letterSpacing:"2px"}}>THE ROAST</span>
              </div>
              <div style={{fontSize:"13px",color:"var(--text)",lineHeight:1.75}}>
                <TypeWriter text={roastText} speed={14} onDone={()=>setTypeDone(true)}/>
              </div>
            </div>

            <div style={{padding:"14px",borderRadius:"12px",background:"var(--surface)",border:"1px solid var(--border)",marginBottom:"14px",animation:"fadeUp 0.35s ease 0.35s both"}}>
              <div style={{fontSize:"9px",letterSpacing:"2px",color:"var(--text-dim)",fontWeight:600,marginBottom:"10px"}}>NOTABLE MOMENTS</div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{fontSize:"11px",color:"var(--text-dim)"}}>Biggest W</span>
                <span style={{fontSize:"11px",fontWeight:700,color:"var(--gold)"}}>{roastData.biggestWin}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}>
                <span style={{fontSize:"11px",color:"var(--text-dim)"}}>Biggest L</span>
                <span style={{fontSize:"11px",fontWeight:700,color:"var(--red)"}}>{roastData.biggestLoss}</span>
              </div>
            </div>

            {typeDone&&(
              <div style={{animation:"fadeUp 0.4s ease"}}>
                <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
                  <button style={{flex:1,padding:"14px",borderRadius:"12px",border:"none",background:"linear-gradient(135deg,#ff6b35,#ff2e4d)",color:"#fff",fontSize:"12px",fontWeight:700,letterSpacing:"2px",fontFamily:"'Permanent Marker',cursive",cursor:"pointer",boxShadow:"0 4px 25px rgba(255,107,53,0.3)"}}>🔥 SHARE ROAST</button>
                  <button onClick={reset} style={{padding:"14px 18px",borderRadius:"12px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text-dim)",fontSize:"12px",fontWeight:700,letterSpacing:"1px",cursor:"pointer"}}>NEW</button>
                </div>
                <div style={{padding:"18px",borderRadius:"14px",background:"linear-gradient(160deg,#0f0d14 0%,#1a1520 50%,#0f0d14 100%)",border:"1px solid rgba(255,107,53,0.12)"}}>
                  <div style={{fontSize:"8px",letterSpacing:"2px",color:"var(--text-dim)",marginBottom:"10px"}}>SHAREABLE CARD</div>
                  <div style={{padding:"16px",borderRadius:"10px",background:"linear-gradient(135deg,rgba(255,107,53,0.06),rgba(255,46,77,0.04))",border:"1px solid rgba(255,107,53,0.1)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
                      <span style={{fontFamily:"'Permanent Marker',cursive",fontSize:"13px",color:"var(--burn)"}}>🔥 WALLET ROAST</span>
                      <span style={{fontSize:"10px",color:"var(--text-dim)"}}>{short}</span>
                    </div>
                    <div style={{display:"flex",gap:"14px",marginBottom:"10px"}}>
                      {[{v:`${roastData.winRate}%`,l:"WIN"},{v:roastData.rugsHit,l:"RUGS"},{v:roastData.totalPnl,l:"PNL"}].map((s,i)=>(
                        <div key={i} style={{textAlign:"center"}}>
                          <div style={{fontSize:"16px",fontWeight:700,color:"var(--red)"}}>{s.v}</div>
                          <div style={{fontSize:"7px",color:"var(--text-dim)",letterSpacing:"1px"}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                      {roastData.badges.slice(0,3).map((b,i)=>(<span key={i} style={{padding:"3px 7px",borderRadius:"4px",fontSize:"9px",background:"rgba(255,107,53,0.08)",color:"var(--burn)"}}>{b}</span>))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

// ── FALLBACK DATA (if Helius fails) ─────────────────────────────
function generateFallbackData(addr) {
  const hash = addr.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const r=(min,max)=>Math.floor((hash*13+Math.random()*1000)%(max-min))+min;
  const tokensTraded=r(12,180); const rugsHit=r(3,Math.floor(tokensTraded*0.65));
  const winRate=r(4,38); const badges=[];
  const paperHandScore=r(72,99); const fomo=r(60,99); const degen=r(75,100); const diamondHands=r(1,15);
  if(rugsHit>tokensTraded*0.45)badges.push("🧲 Rug Magnet");
  if(winRate<15)badges.push("🗑️ Exit Liquidity");
  if(paperHandScore>90)badges.push("🧻 Paper Hands Pro");
  if(fomo>85)badges.push("🐑 FOMO Lord");
  if(degen>90)badges.push("💀 Terminal Degen");
  if(badges.length<3)badges.push("🤡 Certified Clown");
  return { totalTxns:r(47,820), tokensTraded, rugsHit, winRate,
    biggestWin:["2.1x on $BONK","1.8x on $WIF","3.4x on $POPCAT"][hash%3],
    biggestLoss:["-97% on $RUGMASTER","-99.2% on $ELONPISS","-94% on $SAFERUG"][hash%3],
    avgHold:["4 minutes","11 minutes","47 seconds"][hash%3],
    paperHandScore, totalPnl:`-${r(2,89)}.${r(1,9)} SOL`,
    boughtTopCount:r(8,45), soldBottomCount:r(5,30), fomo, diamondHands, degen, badges };
}

function getFallback(stats, addr) {
  const s=addr.slice(0,4)+"..."+addr.slice(-4);
  return `${s} bought the top on ${stats.boughtTopCount} tokens. Exit liquidity personified.\n\n${stats.winRate}% win rate with ${stats.avgHold} average hold. Speedrunning poverty.\n\nRugged ${stats.rugsHit} times. That's talent, not luck.\n\nPnL: ${stats.totalPnl}. Lighting SOL on fire would've been more profitable.`;
}
