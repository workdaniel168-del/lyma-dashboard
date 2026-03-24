/* eslint-disable */
import { useState, useEffect, useCallback } from "react";

const SHEET_ID = "1hka-pv2KLyJjByIMpMaGFjJPKqdw3eM5nw_49yKx3Fg";
const PASSWORDS = { owner: "lyma2026", admin: "admin2026" };
const ALL_STAFF = ["Edy", "Pak Man", "Bekuk", "Diki"];
const SHIFTS = { Edy:"06–14", "Pak Man":"20–06", Bekuk:"10–18", Diki:"13–20" };
const POSISI = { Edy:"Engineering", "Pak Man":"Security", Bekuk:"Gardening", Diki:"Gardening" };

const S = {
  bg:"#080E1A", s1:"#0F1829", s2:"#162135", s3:"#1D2D45",
  bdr:"rgba(255,255,255,0.07)", bdr2:"rgba(255,255,255,0.12)",
  g:"#00E896", g2:"rgba(0,232,150,0.12)", g3:"rgba(0,232,150,0.06)",
  b:"#4DA6FF", b2:"rgba(77,166,255,0.12)",
  a:"#FFB830", a2:"rgba(255,184,48,0.12)",
  r:"#FF4560", r2:"rgba(255,69,96,0.12)",
  p:"#B87FFF", p2:"rgba(184,127,255,0.12)",
  txt:"#D8EEFF", mid:"#4A6580", dim:"#1C2D42",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${S.bg};color:${S.txt};font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;min-height:100vh;-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:${S.s1};}
  ::-webkit-scrollbar-thumb{background:${S.s3};border-radius:99px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  .fade-up{animation:fadeUp 0.25s ease both;}
  .mono{font-family:'DM Mono',monospace;}
`;

function getToday(){ return new Date().toLocaleDateString("sv-SE"); }
function rp(n){ return "Rp "+parseInt(n||0).toLocaleString("id-ID"); }

async function fetchSheet(name) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}")+1));
    if(!json.table?.cols) return [];
    const cols = json.table.cols.map(c=>c.label||c.id||"");
    return (json.table.rows||[]).map(r=>{
      const obj={};
      (r.c||[]).forEach((cell,i)=>{ obj[cols[i]]=cell?.f??cell?.v??""; });
      return obj;
    }).filter(r=>Object.values(r).some(v=>v!==""));
  } catch{ return []; }
}

// ── COMPONENTS ────────────────────────────────────────
const Badge = ({text,color="gray",size="sm"})=>{
  const C={
    green:{bg:S.g2,fg:S.g,bd:`rgba(0,232,150,0.25)`},
    red:{bg:S.r2,fg:S.r,bd:`rgba(255,69,96,0.25)`},
    amber:{bg:S.a2,fg:S.a,bd:`rgba(255,184,48,0.25)`},
    blue:{bg:S.b2,fg:S.b,bd:`rgba(77,166,255,0.25)`},
    purple:{bg:S.p2,fg:S.p,bd:`rgba(184,127,255,0.25)`},
    gray:{bg:S.s3,fg:S.mid,bd:S.bdr},
  };
  const c=C[color]||C.gray;
  return <span style={{
    background:c.bg,color:c.fg,border:`0.5px solid ${c.bd}`,
    fontSize:size==="xs"?10:11,fontWeight:600,
    padding:size==="xs"?"1px 6px":"2px 8px",
    borderRadius:99,whiteSpace:"nowrap",
    fontFamily:"'DM Mono',monospace",letterSpacing:"0.02em"
  }}>{text}</span>;
};

const Stat = ({label,value,color="blue",sub})=>{
  const C={green:S.g,blue:S.b,amber:S.a,red:S.r,purple:S.p};
  return <div style={{background:S.s1,border:`0.5px solid ${S.bdr}`,borderRadius:14,padding:"14px 16px",flex:1,minWidth:80}}>
    <div style={{fontSize:11,color:S.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:6}}>{label}</div>
    <div style={{fontSize:26,fontWeight:800,color:C[color]||C.blue,lineHeight:1,letterSpacing:"-0.02em"}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:S.mid,marginTop:4,fontFamily:"'DM Mono',monospace"}}>{sub}</div>}
  </div>;
};

const Card = ({children,style={}})=><div style={{
  background:S.s1,border:`0.5px solid ${S.bdr}`,
  borderRadius:16,overflow:"hidden",...style
}}>{children}</div>;

const Row = ({cells,header,striped})=><tr style={{
  background:header?S.s2:striped?"rgba(255,255,255,0.015)":"transparent",
  borderBottom:`0.5px solid ${S.bdr}`,
}}>
  {cells.map((cell,i)=>{
    const Tag=header?"th":"td";
    return <Tag key={i} style={{
      padding:"9px 12px",textAlign:"left",whiteSpace:"nowrap",
      fontSize:header?11:13,
      fontWeight:header?600:400,
      color:header?S.mid:S.txt,
      textTransform:header?"uppercase":undefined,
      letterSpacing:header?"0.07em":undefined,
      fontFamily:header?"'DM Mono',monospace":undefined,
    }}>{cell}</Tag>;
  })}
</tr>;

const Table = ({cols,rows,empty})=><div style={{overflowX:"auto"}}>
  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
    <thead><Row cells={cols} header/></thead>
    <tbody>
      {rows.length===0
        ? <tr><td colSpan={cols.length} style={{padding:24,textAlign:"center",color:S.mid}}>{empty||"Belum ada data."}</td></tr>
        : rows.map((r,i)=><Row key={i} cells={r} striped={i%2===1}/>)
      }
    </tbody>
  </table>
</div>;

// ── AVATAR ────────────────────────────────────────────
const AV_COLORS = {
  Edy:["#00E896","#00A06A"],
  "Pak Man":["#4DA6FF","#1A6ED4"],
  Bekuk:["#FFB830","#CC8A00"],
  Diki:["#B87FFF","#7A3FCC"],
};
const Avatar = ({name,size=36})=>{
  const [c1,c2]=AV_COLORS[name]||["#666","#333"];
  return <div style={{
    width:size,height:size,borderRadius:size*0.28,flexShrink:0,
    background:`linear-gradient(135deg,${c1},${c2})`,
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:size*0.38,fontWeight:800,color:"#080E1A",
  }}>{(name||"?")[0]}</div>;
};

// ── LOGIN ─────────────────────────────────────────────
function Login({onLogin}){
  const [mode,setMode]=useState(null);
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");

  const go=(role)=>{
    if(role==="karyawan") return;
    if(pw===PASSWORDS[role]) onLogin({role,name:role==="owner"?"Owner":"Admin"});
    else setErr("Password salah.");
  };

  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem",background:S.bg}}>
    <div style={{width:"100%",maxWidth:360,animation:"fadeUp 0.3s ease"}}>
      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{
          width:56,height:56,borderRadius:16,margin:"0 auto 12px",
          background:`linear-gradient(135deg,${S.g},${S.b})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:22,fontWeight:800,color:"#080E1A",
        }}>L</div>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.03em"}}>Lyma Ops</div>
        <div style={{fontSize:12,color:S.mid,fontFamily:"'DM Mono',monospace",marginTop:4}}>OPERATIONAL DASHBOARD</div>
      </div>

      {!mode ? <>
        <div style={{fontSize:11,color:S.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:10}}>Masuk sebagai</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[["owner","👑","Owner","Full access"],["admin","🛡️","Admin","No gaji"],["karyawan","👷","Karyawan","Data sendiri"]].map(([r,ico,lbl,hint])=>
            <button key={r} onClick={()=>r==="karyawan"?setMode("k"):setMode(r)} style={{
              display:"flex",alignItems:"center",gap:12,
              padding:"12px 14px",borderRadius:12,
              border:`0.5px solid ${S.bdr2}`,background:S.s1,
              cursor:"pointer",textAlign:"left",transition:"all 0.15s",
              color:S.txt,
            }}
            onMouseEnter={e=>{e.currentTarget.style.border=`0.5px solid ${S.g}`;e.currentTarget.style.background=S.s2;}}
            onMouseLeave={e=>{e.currentTarget.style.border=`0.5px solid ${S.bdr2}`;e.currentTarget.style.background=S.s1;}}
            >
              <span style={{fontSize:20}}>{ico}</span>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{lbl}</div>
              <div style={{fontSize:11,color:S.mid,fontFamily:"'DM Mono',monospace",marginTop:1}}>{hint}</div></div>
              <span style={{color:S.mid,fontSize:16}}>›</span>
            </button>
          )}
        </div>
      </> : mode==="k" ? <>
        <div style={{fontSize:11,color:S.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:10}}>Pilih nama kamu</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {ALL_STAFF.map(n=><button key={n} onClick={()=>onLogin({role:"karyawan",name:n})} style={{
            display:"flex",alignItems:"center",gap:12,
            padding:"11px 14px",borderRadius:12,
            border:`0.5px solid ${S.bdr2}`,background:S.s1,
            cursor:"pointer",transition:"all 0.15s",color:S.txt,
          }}
          onMouseEnter={e=>{e.currentTarget.style.border=`0.5px solid ${S.g}`;}}
          onMouseLeave={e=>{e.currentTarget.style.border=`0.5px solid ${S.bdr2}`;}}
          >
            <Avatar name={n} size={32}/>
            <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{n}</div>
            <div style={{fontSize:11,color:S.mid,fontFamily:"'DM Mono',monospace"}}>{POSISI[n]} · {SHIFTS[n]}</div></div>
          </button>)}
        </div>
        <button onClick={()=>setMode(null)} style={{background:"none",border:"none",color:S.mid,fontSize:12,cursor:"pointer",marginTop:12,display:"block"}}>← Kembali</button>
      </> : <>
        <div style={{fontSize:11,color:S.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:10,textTransform:"capitalize"}}>Password {mode}</div>
        <input type="password" value={pw} placeholder="Masukkan password"
          onChange={e=>{setPw(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&go(mode)}
          style={{
            width:"100%",padding:"11px 14px",borderRadius:10,
            border:`0.5px solid ${S.bdr2}`,background:S.s2,
            color:S.txt,fontSize:14,outline:"none",marginBottom:8,
          }}/>
        {err&&<div style={{color:S.r,fontSize:12,marginBottom:8}}>{err}</div>}
        <button onClick={()=>go(mode)} style={{
          width:"100%",padding:"11px",borderRadius:10,
          background:S.g,color:"#080E1A",border:"none",
          fontSize:14,fontWeight:700,cursor:"pointer",
        }}>Masuk →</button>
        <button onClick={()=>{setMode(null);setPw("");setErr("");}} style={{background:"none",border:"none",color:S.mid,fontSize:12,cursor:"pointer",marginTop:10,display:"block"}}>← Kembali</button>
      </>}
    </div>
  </div>;
}

// ── MAIN APP ──────────────────────────────────────────
export default function App(){
  const [session,setSession]=useState(null);
  const [tab,setTab]=useState("overview");
  const [data,setData]=useState({});
  const [loading,setLoading]=useState(false);
  const [upd,setUpd]=useState(null);

  const priv=session?.role==="owner"||session?.role==="admin";

  const load=useCallback(async()=>{
    if(!session) return;
    setLoading(true);
    const sheets=priv
      ?["Absen Masuk","Laporan Closing","Master Inventaris","Log Transfer","Request & Reimburse"]
      :["Absen Masuk","Laporan Closing","Master Inventaris","Log Transfer"];
    const res=await Promise.all(sheets.map(fetchSheet));
    const d={};sheets.forEach((s,i)=>{d[s]=res[i];});
    setData(d);setUpd(new Date().toLocaleTimeString("id-ID"));
    setLoading(false);
  },[session,priv]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{
    if(!session) return;
    const t=setInterval(load,5*60*1000);return()=>clearInterval(t);
  },[load,session]);

  if(!session) return <><style>{CSS}</style><Login onLogin={s=>{setSession(s);setTab("overview");}}/></>;

  const today=getToday();
  const absen=(data["Absen Masuk"]||[]).filter(r=>String(r["Tanggal"]).startsWith(today));
  const closing=(data["Laporan Closing"]||[]).filter(r=>String(r["Tanggal"]).startsWith(today));
  const inv=data["Master Inventaris"]||[];
  const transfer=data["Log Transfer"]||[];
  const req=data["Request & Reimburse"]||[];
  const pending=req.filter(r=>r["Status"]==="PENDING");
  const lowStk=inv.filter(r=>{const s=String(r["Status\nStok"]||r["Status Stok"]||r["STATUS STOK"]||"");return s.includes("LOW")||s.includes("HABIS");});
  const belumMasuk=ALL_STAFF.filter(n=>!absen.find(r=>r["Nama"]===n));
  const belumClose=ALL_STAFF.filter(n=>!closing.find(r=>r["Nama"]===n));
  const kpiOK=closing.filter(r=>String(r["KPI Status"]).includes("TERCAPAI")).length;
  const myAbsen=absen.filter(r=>r["Nama"]===session.name);
  const myClose=closing.filter(r=>r["Nama"]===session.name);

  const TABS=priv
    ?[{id:"overview",label:"Overview"},{id:"absensi",label:"Absensi"},
      {id:"kpi",label:"KPI"},{id:"inventaris",label:"Inventaris"},
      {id:"transfer",label:"Transfer"},
      {id:"request",label:"Request",badge:pending.length}]
    :[{id:"overview",label:"Hari Ini"},{id:"kpi",label:"KPI Saya"},
      {id:"inventaris",label:"Stok"},{id:"transfer",label:"Transfer"}];

  return <>
    <style>{CSS}</style>

    {/* HEADER */}
    <div style={{
      position:"sticky",top:0,zIndex:100,
      background:"rgba(8,14,26,0.92)",backdropFilter:"blur(20px)",
      borderBottom:`0.5px solid ${S.bdr}`,
      padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{
          width:32,height:32,borderRadius:9,flexShrink:0,
          background:`linear-gradient(135deg,${S.g},${S.b})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:14,fontWeight:800,color:"#080E1A",
        }}>L</div>
        <div>
          <div style={{fontSize:15,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1.1}}>Lyma Ops</div>
          <div style={{fontSize:10,color:S.mid,fontFamily:"'DM Mono',monospace",marginTop:1,textTransform:"capitalize"}}>{session.role==="karyawan"?session.name:session.role} · {today}</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {upd&&<span style={{fontSize:10,color:S.mid,fontFamily:"'DM Mono',monospace",display:"none"}}></span>}
        <div style={{
          display:"flex",alignItems:"center",gap:5,
          background:S.g3,border:`0.5px solid rgba(0,232,150,0.2)`,
          padding:"4px 10px",borderRadius:99,
          fontSize:10,fontFamily:"'DM Mono',monospace",color:S.g,
        }}>
          <div style={{width:5,height:5,borderRadius:"50%",background:S.g,animation:"pulse 2s infinite"}}/>
          {loading?"sync...":"live"}
        </div>
        <button onClick={load} disabled={loading} style={{
          background:S.s2,border:`0.5px solid ${S.bdr}`,color:S.mid,
          borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",
          fontFamily:"'DM Mono',monospace",
        }}>↻</button>
        <button onClick={()=>setSession(null)} style={{
          background:"none",border:`0.5px solid ${S.bdr}`,color:S.mid,
          borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",
        }}>Keluar</button>
      </div>
    </div>

    {/* NAV */}
    <div style={{
      display:"flex",background:S.s1,borderBottom:`0.5px solid ${S.bdr}`,
      overflowX:"auto",scrollbarWidth:"none",
    }}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{
        padding:"11px 16px",whiteSpace:"nowrap",fontSize:13,fontWeight:600,
        background:"none",border:"none",cursor:"pointer",
        color:tab===t.id?S.g:S.mid,
        borderBottom:`2px solid ${tab===t.id?S.g:"transparent"}`,
        transition:"all 0.15s",flexShrink:0,
        display:"flex",alignItems:"center",gap:6,
      }}>
        {t.label}
        {t.badge>0&&<span style={{
          background:S.r,color:"#fff",fontSize:9,fontWeight:700,
          padding:"1px 5px",borderRadius:99,fontFamily:"'DM Mono',monospace",
        }}>{t.badge}</span>}
      </button>)}
    </div>

    {/* PAGES */}
    <div style={{padding:"16px 20px",maxWidth:1100,margin:"0 auto"}} className="fade-up">

      {/* ── OVERVIEW ── */}
      {tab==="overview"&&<div>
        {/* Alerts */}
        {priv&&(belumMasuk.length>0||belumClose.length>0||lowStk.length>0)&&<div style={{marginBottom:14}}>
          {belumMasuk.length>0&&<div style={{
            background:"rgba(255,184,48,0.08)",border:`0.5px solid rgba(255,184,48,0.25)`,
            borderRadius:11,padding:"9px 14px",marginBottom:6,fontSize:13,
            display:"flex",alignItems:"center",gap:8,
          }}>
            <span style={{fontSize:15}}>⏰</span>
            <span>Belum absen masuk: <strong style={{color:S.a}}>{belumMasuk.join(", ")}</strong></span>
          </div>}
          {belumClose.length>0&&<div style={{
            background:"rgba(255,69,96,0.08)",border:`0.5px solid rgba(255,69,96,0.25)`,
            borderRadius:11,padding:"9px 14px",marginBottom:6,fontSize:13,
            display:"flex",alignItems:"center",gap:8,
          }}>
            <span style={{fontSize:15}}>🚨</span>
            <span>Belum closing: <strong style={{color:S.r}}>{belumClose.join(", ")}</strong></span>
          </div>}
          {lowStk.length>0&&<div style={{
            background:"rgba(255,69,96,0.06)",border:`0.5px solid rgba(255,69,96,0.2)`,
            borderRadius:11,padding:"9px 14px",marginBottom:6,fontSize:13,
            display:"flex",alignItems:"center",gap:8,
          }}>
            <span style={{fontSize:15}}>📦</span>
            <span>Low stock: <strong style={{color:S.r}}>{lowStk.map(r=>r["Nama Barang"]||"-").join(", ")}</strong></span>
          </div>}
        </div>}

        {priv?<>
          {/* Stats */}
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            <Stat label="Absen Masuk" value={`${absen.length}/4`} color="blue"/>
            <Stat label="Sudah Closing" value={`${closing.length}/4`} color="purple"/>
            <Stat label="KPI Tercapai" value={`${kpiOK}/${closing.length||0}`} color="green"/>
            <Stat label="Pending Req" value={pending.length} color={pending.length>0?"amber":"blue"}/>
            <Stat label="Low Stock" value={lowStk.length} color={lowStk.length>0?"red":"blue"}/>
          </div>

          {/* Tim cards */}
          <div style={{fontSize:11,color:S.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:10}}>Status tim hari ini</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10,marginBottom:16}}>
            {ALL_STAFF.map(nama=>{
              const m=absen.find(r=>r["Nama"]===nama);
              const c=closing.find(r=>r["Nama"]===nama);
              const kpiOk=c&&String(c["KPI Status"]).includes("TERCAPAI");
              const hadir=!!m;
              const sudahClose=!!c;
              return <Card key={nama} style={{transition:"transform 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="none"}
              >
                <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:`0.5px solid ${S.bdr}`}}>
                  <Avatar name={nama}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700}}>{nama}</div>
                    <div style={{fontSize:11,color:S.mid,fontFamily:"'DM Mono',monospace"}}>{POSISI[nama]} · {SHIFTS[nama]}</div>
                  </div>
                  <Badge text={hadir?(kpiOk?"KPI ✓":sudahClose?"Closing":"Hadir"):"Belum"} color={hadir?(kpiOk?"green":sudahClose?"blue":"amber"):"gray"}/>
                </div>
                <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between"}}>
                  <div style={{fontSize:12}}>
                    <span style={{color:S.mid,fontFamily:"'DM Mono',monospace"}}>Masuk </span>
                    <span style={{color:m?S.g:S.mid,fontWeight:600}}>{m?m["Jam Masuk"]:"—"}</span>
                  </div>
                  <div style={{fontSize:12}}>
                    <span style={{color:S.mid,fontFamily:"'DM Mono',monospace"}}>Close </span>
                    <span style={{color:c?S.b:S.mid,fontWeight:600}}>{c?c["Jam Pulang"]||c["Jam Keluar"]||"✓":"—"}</span>
                  </div>
                  <div style={{fontSize:12}}>
                    <span style={{color:S.mid,fontFamily:"'DM Mono',monospace"}}>Prog </span>
                    <span style={{color:S.a,fontWeight:600}}>{c?c["Progress %"]||c["Progress Akhir"]||"—":m?"—":"—"}%</span>
                  </div>
                </div>
              </Card>;
            })}
          </div>
        </>:<>
          {/* Karyawan view */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:S.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:10}}>Status kamu hari ini</div>
            <Card>
              <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`0.5px solid ${S.bdr}`}}>
                <Avatar name={session.name} size={44}/>
                <div>
                  <div style={{fontSize:16,fontWeight:800}}>{session.name}</div>
                  <div style={{fontSize:11,color:S.mid,fontFamily:"'DM Mono',monospace"}}>{POSISI[session.name]} · Shift {SHIFTS[session.name]}</div>
                </div>
                <div style={{marginLeft:"auto"}}>
                  {myAbsen.length>0
                    ? myClose.length>0
                      ? <Badge text={String(myClose[0]["KPI Status"]).includes("TERCAPAI")?"KPI Tercapai ✓":"KPI Gagal"} color={String(myClose[0]["KPI Status"]).includes("TERCAPAI")?"green":"red"}/>
                      : <Badge text="Sudah Hadir" color="amber"/>
                    : <Badge text="Belum Absen" color="gray"/>}
                </div>
              </div>
              <div style={{padding:"12px 16px",display:"flex",gap:20,flexWrap:"wrap"}}>
                {[
                  ["Jam Masuk",myAbsen[0]?.["Jam Masuk"]||"—",S.g],
                  ["Jam Pulang",myClose[0]?.["Jam Pulang"]||myClose[0]?.["Jam Keluar"]||"—",S.b],
                  ["Progress",myClose[0]?.["Progress %"]||myClose[0]?.["Progress Akhir"]?(myClose[0]?.["Progress %"]||myClose[0]?.["Progress Akhir"])+"%":"—",S.a],
                ].map(([lbl,val,c])=><div key={lbl}>
                  <div style={{fontSize:10,color:S.mid,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.07em"}}>{lbl}</div>
                  <div style={{fontSize:18,fontWeight:800,color:c,marginTop:2}}>{val}</div>
                </div>)}
              </div>
            </Card>
          </div>
        </>}

        <div style={{paddingTop:12,borderTop:`0.5px solid ${S.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:S.dim}}>Lyma Ops System</span>
          <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer"
            style={{fontSize:11,color:S.mid,textDecoration:"none",fontFamily:"'DM Mono',monospace"}}>
            Buka Master Sheet →
          </a>
        </div>
      </div>}

      {/* ── ABSENSI ── */}
      {tab==="absensi"&&priv&&<div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Absen Masuk — {today}</div>
        <Card>
          <Table
            cols={["Nama","Shift","Jam Masuk","Status","Listrik","Air","Pagar","Catatan"]}
            rows={absen.map(r=>[
              <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={r["Nama"]} size={26}/><span style={{fontWeight:600}}>{r["Nama"]}</span></div>,
              <span style={{color:S.mid,fontFamily:"'DM Mono',monospace",fontSize:12}}>{SHIFTS[r["Nama"]]||"—"}</span>,
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Masuk"]}</span>,
              <Badge text={String(r["Status Masuk"]).includes("TELAT")?"Telat":String(r["Status Masuk"]).includes("Tepat")?"Tepat":"—"} color={String(r["Status Masuk"]).includes("TELAT")?"amber":String(r["Status Masuk"]).includes("Tepat")?"green":"gray"}/>,
              <Badge text={r["Listrik"]||"—"} color={r["Listrik"]==="Normal"?"green":"red"}/>,
              <Badge text={r["Air"]||"—"} color={r["Air"]==="Normal"?"green":"red"}/>,
              <Badge text={r["Pagar"]||"—"} color={r["Pagar"]==="OK"?"green":"amber"}/>,
              <span style={{color:S.mid,fontSize:12}}>{r["Catatan"]||"—"}</span>,
            ])}
            empty="Belum ada absen masuk hari ini."
          />
        </Card>
      </div>}

      {/* ── KPI ── */}
      {tab==="kpi"&&<div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>{priv?`Rekap KPI — ${today}`:`KPI Saya — ${today}`}</div>
        <Card>
          <Table
            cols={priv?["Nama","Masuk","Pulang","Progress","KPI","Joblist"]:["Masuk","Pulang","Progress","KPI","Catatan"]}
            rows={(priv?closing:myClose).map(r=>{
              const ok=String(r["KPI Status"]).includes("TERCAPAI");
              if(priv) return [
                <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={r["Nama"]} size={24}/><span style={{fontWeight:600}}>{r["Nama"]}</span></div>,
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Masuk"]||"—"}</span>,
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Pulang"]||r["Jam Keluar"]||"—"}</span>,
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:50,height:4,background:S.s3,borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",background:ok?S.g:S.a,borderRadius:99,width:`${r["Progress %"]||0}%`}}/>
                  </div>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:ok?S.g:S.a}}>{r["Progress %"]||0}%</span>
                </div>,
                <Badge text={ok?"Tercapai":"Gagal"} color={ok?"green":"red"}/>,
                <span style={{color:S.mid,fontSize:12}}>{String(r["Joblist"]||"—").substring(0,50)}</span>,
              ];
              return [
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Masuk"]||"—"}</span>,
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Pulang"]||"—"}</span>,
                <span style={{color:ok?S.g:S.a,fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600}}>{r["Progress %"]||0}%</span>,
                <Badge text={ok?"Tercapai":"Gagal"} color={ok?"green":"red"}/>,
                <span style={{color:S.mid,fontSize:12}}>{r["Catatan"]||"—"}</span>,
              ];
            })}
            empty="Belum ada data closing hari ini."
          />
        </Card>
      </div>}

      {/* ── INVENTARIS ── */}
      {tab==="inventaris"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700}}>Master Inventaris</div>
          {lowStk.length>0&&<Badge text={`${lowStk.length} low stock`} color="amber"/>}
        </div>
        <Card>
          <Table
            cols={["Kategori","Nama Barang","Stok","Satuan","Kondisi","Status"]}
            rows={inv.slice(0,60).map(r=>{
              const stok=String(r["Status\nStok"]||r["Status Stok"]||r["STATUS STOK"]||"");
              const isLow=stok.includes("LOW"),isOut=stok.includes("HABIS");
              return [
                <span style={{color:S.mid,fontSize:12}}>{r["Kategori"]||"—"}</span>,
                <span style={{fontWeight:600}}>{r["Nama Barang"]||r["NAMA BARANG"]||"—"}</span>,
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:isOut?S.r:isLow?S.a:S.g,fontWeight:600}}>{r["Stok"]??r["STOK"]??r["Stok Akhir"]??"-"}</span>,
                <span style={{color:S.mid,fontSize:12}}>{r["Satuan"]||"pcs"}</span>,
                <span style={{color:S.mid,fontSize:12}}>{r["Kondisi"]||"—"}</span>,
                <Badge text={isOut?"Habis":isLow?"Low Stock":"OK"} color={isOut?"red":isLow?"amber":"green"} size="xs"/>,
              ];
            })}
            empty="Data inventaris belum tersedia."
          />
        </Card>
        {inv.length>60&&<div style={{fontSize:11,color:S.mid,textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace"}}>Menampilkan 60 dari {inv.length} item</div>}
      </div>}

      {/* ── TRANSFER ── */}
      {tab==="transfer"&&<div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Log Transfer Barang</div>
        <Card>
          <Table
            cols={["Tanggal","Petugas","Barang","Dari","Ke","Jml","Kondisi"]}
            rows={[...transfer].reverse().slice(0,30).map(r=>[
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:S.mid}}>{String(r["Tanggal"]).substring(0,10)}</span>,
              <div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={r["Petugas"]||r["Nama Petugas"]||""} size={22}/><span style={{fontWeight:600,fontSize:12}}>{r["Petugas"]||r["Nama Petugas"]||"—"}</span></div>,
              <span style={{fontWeight:600}}>{r["Nama Barang"]||"—"}</span>,
              <span style={{color:S.r,fontSize:12}}>{r["Dari Lokasi"]||r["Dari Area"]||"—"}</span>,
              <span style={{color:S.g,fontSize:12}}>{r["Ke Lokasi"]||r["Ke Area"]||"—"}</span>,
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jumlah"]||"—"}</span>,
              <Badge text={r["Kondisi"]||"—"} color={r["Kondisi"]==="Baik"?"green":"amber"} size="xs"/>,
            ])}
            empty="Belum ada data transfer."
          />
        </Card>
      </div>}

      {/* ── REQUEST ── */}
      {tab==="request"&&priv&&<div>
        {pending.length>0&&<>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            Pending <Badge text={`${pending.length} menunggu`} color="amber"/>
          </div>
          <div style={{marginBottom:16}}>
            {pending.map((r,i)=><Card key={i} style={{marginBottom:8}}>
              <div style={{padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`0.5px solid ${S.bdr}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Avatar name={r["Nama"]||""} size={28}/>
                  <div>
                    <span style={{fontWeight:700,fontSize:13}}>{r["Nama"]}</span>
                    <span style={{color:S.mid,fontSize:11,fontFamily:"'DM Mono',monospace",marginLeft:6}}>{r["Tanggal"]}</span>
                  </div>
                </div>
                <Badge text={r["Urgensi"]||"—"} color={r["Urgensi"]==="Tinggi"?"red":r["Urgensi"]==="Sedang"?"amber":"green"}/>
              </div>
              <div style={{padding:"10px 14px"}}>
                <div style={{fontWeight:700,marginBottom:4}}>📦 {r["Keperluan"]||"—"}</div>
                <div style={{fontSize:12,color:S.mid}}>{r["Jenis"]||""} · Est. <span style={{color:S.a,fontFamily:"'DM Mono',monospace"}}>{rp(r["Harga Est."]||0)}</span></div>
                <div style={{fontSize:11,color:S.b,marginTop:8,padding:"6px 10px",background:S.b2,borderRadius:8}}>Update status APPROVED/REJECTED langsung di tab Request & Reimburse di Google Sheets</div>
              </div>
            </Card>)}
          </div>
        </>}
        <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Semua Request</div>
        <Card>
          <Table
            cols={["Tgl","Nama","Keperluan","Jenis","Est. Harga","Urgensi","Status"]}
            rows={[...req].reverse().slice(0,30).map(r=>[
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:S.mid}}>{String(r["Tanggal"]).substring(0,10)}</span>,
              <span style={{fontWeight:600,fontSize:12}}>{r["Nama"]||"—"}</span>,
              <span style={{fontSize:12}}>{String(r["Keperluan"]||"—").substring(0,35)}</span>,
              <span style={{color:S.mid,fontSize:12}}>{r["Jenis"]||"—"}</span>,
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:S.a}}>{rp(r["Harga Est."]||0)}</span>,
              <Badge text={r["Urgensi"]||"—"} color={r["Urgensi"]==="Tinggi"?"red":r["Urgensi"]==="Sedang"?"amber":"green"} size="xs"/>,
              <Badge text={r["Status"]||"—"} color={r["Status"]==="PENDING"?"amber":r["Status"]==="APPROVED"?"green":"red"} size="xs"/>,
            ])}
            empty="Belum ada request."
          />
        </Card>
      </div>}

    </div>
  </>;
}
