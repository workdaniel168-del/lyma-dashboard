/* eslint-disable */
import { useState, useEffect, useCallback, useRef } from "react";

// ── CONFIG ────────────────────────────────────────────
const SHEET_ID   = "1hka-pv2KLyJjByIMpMaGFjJPKqdw3eM5nw_49yKx3Fg";
const OWNER_PW   = "lyma2026";
const ADMIN_PW   = "admin2026";
const ALL_STAFF  = ["Edy", "Pak Man", "Bekuk", "Dika"];
const SHIFTS     = { Edy:"06–14", "Pak Man":"20–06", Bekuk:"10–18", Dika:"13–20" };
const POSISI     = { Edy:"Engineering", "Pak Man":"Security", Bekuk:"Gardening", Dika:"Gardening" };
const AV_GRAD    = {
  Edy:     ["#00E896","#00A06A"],
  "Pak Man":["#4DA6FF","#1A6ED4"],
  Bekuk:   ["#FFB830","#CC8A00"],
  Dika:    ["#B87FFF","#7A3FCC"],
};

// ── STORAGE HELPERS ───────────────────────────────────
const LS = {
  get: (k, fb={}) => { try{ return JSON.parse(localStorage.getItem(k)||"null") ?? fb; }catch{ return fb; } },
  set: (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} },
};
const getPW   = n  => LS.get("lyma_pw",{})[n] || "0000";
const setPW   = (n,p) => { const a=LS.get("lyma_pw",{}); a[n]=p; LS.set("lyma_pw",a); };
const getProf = n  => LS.get("lyma_profiles",{})[n] || null;
const setProf = (n,url) => { const a=LS.get("lyma_profiles",{}); a[n]=url; LS.set("lyma_profiles",a); };
const getLogo = () => LS.get("lyma_brand", { name:"Lyma Ops", logo:null });
const setLogo = (v) => LS.set("lyma_brand", v);

// ── COLORS ────────────────────────────────────────────
const C = {
  bg:"#080E1A", s1:"#0F1829", s2:"#162135", s3:"#1D2D45",
  bdr:"rgba(255,255,255,0.07)", bdr2:"rgba(255,255,255,0.13)",
  g:"#00E896", gd:"rgba(0,232,150,0.12)", g3:"rgba(0,232,150,0.06)",
  b:"#4DA6FF", bd:"rgba(77,166,255,0.12)",
  a:"#FFB830", ad:"rgba(255,184,48,0.12)",
  r:"#FF4560", rd:"rgba(255,69,96,0.12)",
  p:"#B87FFF", pd:"rgba(184,127,255,0.12)",
  txt:"#D8EEFF", mid:"#4A6580", dim:"#1C2D45",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${C.bg};color:${C.txt};font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;min-height:100vh;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:${C.s1};}
::-webkit-scrollbar-thumb{background:${C.s3};border-radius:99px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes spin{to{transform:rotate(360deg)}}
.fu{animation:fadeUp .22s ease both;}
input,select{background:${C.s2};border:0.5px solid ${C.bdr2};color:${C.txt};border-radius:10px;padding:10px 13px;font-size:13px;outline:none;width:100%;transition:border .15s;font-family:'Plus Jakarta Sans',sans-serif;}
input:focus,select:focus{border-color:${C.g};}
input::placeholder{color:${C.mid};}
button{cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;}
`;

// ── UTILS ─────────────────────────────────────────────
const today = () => new Date().toLocaleDateString("sv-SE");
const rp    = n  => "Rp "+parseInt(n||0).toLocaleString("id-ID");
const fileToB64 = f => new Promise((res,rej)=>{
  const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(f);
});

async function fetchSheet(name) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(name)}`;
    const res  = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}")+1));
    if(!json.table?.cols) return [];
    const cols = json.table.cols.map(c=>c.label||c.id||"");
    return (json.table.rows||[]).map(r=>{
      const obj={}; (r.c||[]).forEach((cell,i)=>{ obj[cols[i]]=cell?.f??cell?.v??""; }); return obj;
    }).filter(r=>Object.values(r).some(v=>v!==""));
  } catch { return []; }
}

// ── AVATAR ────────────────────────────────────────────
function Avatar({name, size=36, editable=false, onEdit}){
  const [g1,g2] = AV_GRAD[name]||["#888","#444"];
  const photo   = getProf(name);
  const s       = { width:size, height:size, borderRadius:size*0.28, flexShrink:0, overflow:"hidden",
                    background:`linear-gradient(135deg,${g1},${g2})`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:size*0.38, fontWeight:800, color:"#080E1A", position:"relative" };
  return (
    <div style={s} onClick={editable?onEdit:undefined}
      title={editable?"Ganti foto profil":undefined}
      onMouseEnter={editable?e=>{e.currentTarget.querySelector(".av-ov").style.opacity="1";}:undefined}
      onMouseLeave={editable?e=>{e.currentTarget.querySelector(".av-ov").style.opacity="0";}:undefined}
    >
      {photo
        ? <img src={photo} alt={name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"inherit"}}/>
        : <span>{(name||"?")[0]}</span>}
      {editable && <div className="av-ov" style={{
        position:"absolute",inset:0,background:"rgba(0,0,0,.55)",
        display:"flex",alignItems:"center",justifyContent:"center",
        opacity:0,transition:"opacity .15s",borderRadius:"inherit",
        fontSize:size*0.3,cursor:"pointer",
      }}>✏️</div>}
    </div>
  );
}

// ── BADGE ─────────────────────────────────────────────
function Badge({text,color="gray",size="sm"}){
  const M={
    green:{bg:C.gd,fg:C.g,bd:"rgba(0,232,150,.25)"},
    red:{bg:C.rd,fg:C.r,bd:"rgba(255,69,96,.25)"},
    amber:{bg:C.ad,fg:C.a,bd:"rgba(255,184,48,.25)"},
    blue:{bg:C.bd,fg:C.b,bd:"rgba(77,166,255,.25)"},
    purple:{bg:C.pd,fg:C.p,bd:"rgba(184,127,255,.25)"},
    gray:{bg:C.s3,fg:C.mid,bd:C.bdr},
  };
  const m=M[color]||M.gray;
  return <span style={{background:m.bg,color:m.fg,border:`0.5px solid ${m.bd}`,
    fontSize:size==="xs"?10:11,fontWeight:600,padding:size==="xs"?"1px 6px":"2px 8px",
    borderRadius:99,whiteSpace:"nowrap",fontFamily:"'DM Mono',monospace",letterSpacing:"0.02em"}}>{text}</span>;
}

// ── STAT ──────────────────────────────────────────────
function Stat({label,value,color="blue",sub}){
  const M={green:C.g,blue:C.b,amber:C.a,red:C.r,purple:C.p};
  return <div style={{background:C.s1,border:`0.5px solid ${C.bdr}`,borderRadius:14,padding:"14px 16px",flex:1,minWidth:80}}>
    <div style={{fontSize:11,color:C.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:6}}>{label}</div>
    <div style={{fontSize:26,fontWeight:800,color:M[color]||M.blue,lineHeight:1,letterSpacing:"-0.02em"}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.mid,marginTop:4,fontFamily:"'DM Mono',monospace"}}>{sub}</div>}
  </div>;
}

// ── CARD ──────────────────────────────────────────────
const Card = ({children,style={}}) =>
  <div style={{background:C.s1,border:`0.5px solid ${C.bdr}`,borderRadius:16,overflow:"hidden",...style}}>{children}</div>;

// ── TABLE ─────────────────────────────────────────────
function TRow({cells,header,alt}){
  return <tr style={{background:header?C.s2:alt?"rgba(255,255,255,.015)":"transparent",borderBottom:`0.5px solid ${C.bdr}`}}>
    {cells.map((cell,i)=>{
      const T=header?"th":"td";
      return <T key={i} style={{padding:"9px 12px",textAlign:"left",whiteSpace:"nowrap",
        fontSize:header?11:13,fontWeight:header?600:400,color:header?C.mid:C.txt,
        textTransform:header?"uppercase":undefined,letterSpacing:header?"0.07em":undefined,
        fontFamily:header?"'DM Mono',monospace":undefined}}>{cell}</T>;
    })}
  </tr>;
}
function Table({cols,rows,empty}){
  return <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
      <thead><TRow cells={cols} header/></thead>
      <tbody>
        {rows.length===0
          ?<tr><td colSpan={cols.length} style={{padding:24,textAlign:"center",color:C.mid}}>{empty||"Belum ada data."}</td></tr>
          :rows.map((r,i)=><TRow key={i} cells={r} alt={i%2===1}/>)}
      </tbody>
    </table>
  </div>;
}

// ── MODAL WRAPPER ─────────────────────────────────────
function Modal({children, onClose}){
  return <div style={{
    position:"fixed",inset:0,zIndex:200,
    background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",
    display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",
  }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div style={{background:C.s1,border:`0.5px solid ${C.bdr2}`,borderRadius:18,
      padding:"1.5rem",width:"100%",maxWidth:380,position:"relative"}}>
      <button onClick={onClose} style={{
        position:"absolute",top:14,right:14,background:"none",border:"none",
        color:C.mid,fontSize:20,lineHeight:1,padding:4,
      }}>×</button>
      {children}
    </div>
  </div>;
}

// ── RESET PASSWORD MODAL ──────────────────────────────
function ResetPWModal({name,onClose}){
  const [cur,setCur]=useState(""); const [nw,setNw]=useState(""); const [nw2,setNw2]=useState("");
  const [err,setErr]=useState(""); const [ok,setOk]=useState(false);
  const go=()=>{
    if(cur!==getPW(name)){setErr("Password lama salah.");return;}
    if(nw.length<4){setErr("Min 4 karakter.");return;}
    if(nw!==nw2){setErr("Konfirmasi tidak cocok.");return;}
    setPW(name,nw); setOk(true); setTimeout(onClose,1500);
  };
  return <Modal onClose={onClose}>
    <div style={{fontSize:15,fontWeight:800,marginBottom:16}}>🔐 Ganti Password</div>
    {ok?<div style={{textAlign:"center",padding:"1rem 0"}}>
      <div style={{fontSize:28,marginBottom:8}}>✅</div>
      <div style={{fontWeight:700,color:C.g}}>Password berhasil diganti!</div>
    </div>:<>
      <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:4}}>Password lama</div>
      <input type="password" value={cur} onChange={e=>{setCur(e.target.value);setErr("");}} placeholder="Password saat ini" style={{marginBottom:10}}/>
      <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:4}}>Password baru</div>
      <input type="password" value={nw} onChange={e=>{setNw(e.target.value);setErr("");}} placeholder="Minimal 4 karakter" style={{marginBottom:10}}/>
      <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:4}}>Konfirmasi password baru</div>
      <input type="password" value={nw2} onChange={e=>{setNw2(e.target.value);setErr("");}} placeholder="Ulangi password baru" style={{marginBottom:12}}
        onKeyDown={e=>e.key==="Enter"&&go()}/>
      {err&&<div style={{color:C.r,fontSize:12,marginBottom:10}}>{err}</div>}
      <button onClick={go} style={{width:"100%",padding:"10px",borderRadius:10,background:C.g,color:"#080E1A",border:"none",fontSize:14,fontWeight:700}}>
        Simpan Password Baru
      </button>
      <div style={{fontSize:11,color:C.mid,textAlign:"center",marginTop:10,fontFamily:"'DM Mono',monospace"}}>Password tersimpan privat di HP kamu</div>
    </>}
  </Modal>;
}

// ── UPLOAD FOTO PROFIL MODAL ──────────────────────────
function PhotoModal({name,onClose,onSave}){
  const ref=useRef(); const [prev,setPrev]=useState(getProf(name));
  const [loading,setLoading]=useState(false);
  const pick=async e=>{
    const f=e.target.files?.[0]; if(!f) return;
    setLoading(true);
    const b64=await fileToB64(f);
    setPrev(b64); setLoading(false);
  };
  const save=()=>{ setProf(name,prev); onSave(prev); onClose(); };
  const del=()=>{ setProf(name,null); onSave(null); onClose(); };
  return <Modal onClose={onClose}>
    <div style={{fontSize:15,fontWeight:800,marginBottom:16}}>📸 Foto Profil — {name}</div>
    <div style={{textAlign:"center",marginBottom:16}}>
      <div style={{width:80,height:80,borderRadius:22,margin:"0 auto 10px",overflow:"hidden",
        background:`linear-gradient(135deg,${AV_GRAD[name]?.[0]||"#888"},${AV_GRAD[name]?.[1]||"#444"})`,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:800,color:"#080E1A"}}>
        {prev?<img src={prev} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="preview"/>
          :<span>{(name||"?")[0]}</span>}
      </div>
      {loading&&<div style={{fontSize:12,color:C.mid}}>Loading...</div>}
    </div>
    <input type="file" accept="image/*" ref={ref} onChange={pick} style={{display:"none"}}/>
    <button onClick={()=>ref.current.click()} style={{
      width:"100%",padding:"10px",borderRadius:10,border:`0.5px solid ${C.bdr2}`,
      background:C.s2,color:C.txt,fontSize:13,marginBottom:8,fontWeight:600,
    }}>📂 Pilih Foto dari HP</button>
    <button onClick={save} style={{width:"100%",padding:"10px",borderRadius:10,background:C.g,color:"#080E1A",border:"none",fontSize:14,fontWeight:700,marginBottom:8}}>
      Simpan Foto
    </button>
    {getProf(name)&&<button onClick={del} style={{width:"100%",padding:"8px",borderRadius:10,border:`0.5px solid ${C.rd}`,background:"none",color:C.r,fontSize:12}}>
      Hapus Foto
    </button>}
  </Modal>;
}

// ── BRAND MODAL (Owner: edit nama & logo) ─────────────
function BrandModal({onClose,onSave}){
  const brand=getLogo();
  const [name,setName]=useState(brand.name||"Lyma Ops");
  const [logo,setLogo_]=useState(brand.logo||null);
  const [loading,setLoading]=useState(false);
  const ref=useRef();
  const pickLogo=async e=>{
    const f=e.target.files?.[0]; if(!f) return;
    setLoading(true);
    const b64=await fileToB64(f);
    setLogo_(b64); setLoading(false);
  };
  const save=()=>{ setLogo({name,logo}); onSave({name,logo}); onClose(); };
  return <Modal onClose={onClose}>
    <div style={{fontSize:15,fontWeight:800,marginBottom:16}}>⚙️ Edit Brand Lyma</div>
    <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:4}}>Nama Sistem</div>
    <input value={name} onChange={e=>setName(e.target.value)} placeholder="Lyma Ops" style={{marginBottom:14}}/>
    <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:6}}>Logo (Opsional)</div>
    <div style={{textAlign:"center",marginBottom:10}}>
      {logo
        ?<img src={logo} style={{width:56,height:56,borderRadius:14,objectFit:"cover",marginBottom:6}} alt="logo"/>
        :<div style={{width:56,height:56,borderRadius:14,margin:"0 auto 6px",
          background:`linear-gradient(135deg,${C.g},${C.b})`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#080E1A"}}>L</div>}
      {loading&&<div style={{fontSize:12,color:C.mid}}>Loading...</div>}
    </div>
    <input type="file" accept="image/*" ref={ref} onChange={pickLogo} style={{display:"none"}}/>
    <button onClick={()=>ref.current.click()} style={{
      width:"100%",padding:"9px",borderRadius:10,border:`0.5px solid ${C.bdr2}`,
      background:C.s2,color:C.txt,fontSize:13,marginBottom:8,fontWeight:600,
    }}>📂 Upload Logo</button>
    {logo&&<button onClick={()=>setLogo_(null)} style={{
      width:"100%",padding:"7px",borderRadius:10,border:`0.5px solid ${C.rd}`,
      background:"none",color:C.r,fontSize:12,marginBottom:10,
    }}>Hapus Logo</button>}
    <button onClick={save} style={{width:"100%",padding:"10px",borderRadius:10,background:C.g,color:"#080E1A",border:"none",fontSize:14,fontWeight:700}}>
      Simpan
    </button>
  </Modal>;
}

// ── LOGIN ─────────────────────────────────────────────
function Login({onLogin}){
  const [mode,setMode]=useState(null);
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const brand=getLogo();

  const goPriv=role=>{
    const correct=role==="owner"?OWNER_PW:ADMIN_PW;
    if(pw===correct) onLogin({role,name:role==="owner"?"Owner":"Admin"});
    else setErr("Password salah.");
  };

  const goKaryawan=name=>{ setMode({type:"kpw",name}); setPw(""); setErr(""); };

  if(mode?.type==="kpw"){
    const {name}=mode;
    return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem",background:C.bg}}>
      <div style={{width:"100%",maxWidth:340}} className="fu">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <Avatar name={name} size={60}/>
          </div>
          <div style={{fontSize:20,fontWeight:800}}>{name}</div>
          <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginTop:4}}>{POSISI[name]} · Shift {SHIFTS[name]}</div>
        </div>
        <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:5}}>Password kamu</div>
        <input type="password" value={pw} placeholder="Password (default: 0000)"
          onChange={e=>{setPw(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&(pw===getPW(name)?onLogin({role:"karyawan",name}):setErr("Password salah."))}
          style={{marginBottom:10}}/>
        {err&&<div style={{color:C.r,fontSize:12,marginBottom:10}}>{err}</div>}
        <button onClick={()=>pw===getPW(name)?onLogin({role:"karyawan",name}):setErr("Password salah.")} style={{
          width:"100%",padding:"11px",borderRadius:10,background:C.g,color:"#080E1A",border:"none",fontSize:14,fontWeight:700,marginBottom:8,
        }}>Masuk →</button>
        <div style={{textAlign:"center",fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:8}}>Password default: 0000</div>
        <button onClick={()=>{setMode(null);setPw("");setErr("");}} style={{background:"none",border:"none",color:C.mid,fontSize:12,display:"block",margin:"0 auto"}}>← Kembali</button>
      </div>
    </div>;
  }

  return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem",background:C.bg}}>
    <div style={{width:"100%",maxWidth:360}} className="fu">
      <div style={{textAlign:"center",marginBottom:28}}>
        {brand.logo
          ?<img src={brand.logo} style={{width:52,height:52,borderRadius:14,objectFit:"cover",margin:"0 auto 12px",display:"block"}} alt="logo"/>
          :<div style={{width:52,height:52,borderRadius:14,margin:"0 auto 12px",background:`linear-gradient(135deg,${C.g},${C.b})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#080E1A"}}>L</div>}
        <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.03em"}}>{brand.name||"Lyma Ops"}</div>
        <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginTop:4}}>OPERATIONAL DASHBOARD</div>
      </div>

      {!mode?<>
        <div style={{fontSize:11,color:C.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:8}}>Management</div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
          {[["owner","👑","Owner","View only — pantau tim"],["admin","🛡️","Admin","Full access + data gaji"]].map(([r,ico,lbl,hint])=>
            <button key={r} onClick={()=>setMode(r)} style={{
              display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,
              border:`0.5px solid ${C.bdr2}`,background:C.s1,textAlign:"left",color:C.txt,transition:"border .15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.g}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.bdr2}
            >
              <span style={{fontSize:20}}>{ico}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700}}>{lbl}</div>
                <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginTop:1}}>{hint}</div>
              </div>
              <span style={{color:C.mid}}>›</span>
            </button>
          )}
        </div>
        <div style={{fontSize:11,color:C.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:8}}>Karyawan</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {ALL_STAFF.map(n=>{
            const [g1]=AV_GRAD[n]||["#888"];
            return <button key={n} onClick={()=>goKaryawan(n)} style={{
              display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"14px 10px",
              borderRadius:12,border:`0.5px solid ${C.bdr2}`,background:C.s1,transition:"border .15s",
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=g1}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.bdr2}
            >
              <Avatar name={n} size={38}/>
              <div style={{fontSize:13,fontWeight:700,color:C.txt}}>{n}</div>
              <div style={{fontSize:10,color:C.mid,fontFamily:"'DM Mono',monospace"}}>{SHIFTS[n]}</div>
            </button>;
          })}
        </div>
      </>:mode==="owner"||mode==="admin"?<>
        <button onClick={()=>{setMode(null);setPw("");setErr("");}} style={{background:"none",border:"none",color:C.mid,fontSize:12,marginBottom:14,display:"block"}}>← Kembali</button>
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:30}}>{mode==="owner"?"👑":"🛡️"}</div>
          <div style={{fontSize:16,fontWeight:800,marginTop:6,textTransform:"capitalize"}}>{mode}</div>
          <div style={{fontSize:11,color:C.mid,marginTop:4,fontFamily:"'DM Mono',monospace"}}>
            {mode==="owner"?"View only — pantau semua tim":"Full access — termasuk data gaji"}
          </div>
        </div>
        <input type="password" value={pw} placeholder="Password" onChange={e=>{setPw(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&goPriv(mode)} style={{marginBottom:10}}/>
        {err&&<div style={{color:C.r,fontSize:12,marginBottom:10}}>{err}</div>}
        <button onClick={()=>goPriv(mode)} style={{width:"100%",padding:"11px",borderRadius:10,background:C.g,color:"#080E1A",border:"none",fontSize:14,fontWeight:700}}>
          Masuk →
        </button>
      </>:null}
    </div>
  </div>;
}

// ── GAJI VIEW (Admin only) ────────────────────────────
function GajiView({closingData}){
  const GAJI={
    Edy:{pokok:4500000,bonus:0,posisi:"Engineering"},
    "Pak Man":{pokok:3800000,bonus:0,posisi:"Security"},
    Bekuk:{pokok:3320000,bonus:500000,posisi:"Gardening"},
    Dika:{pokok:3320000,bonus:500000,posisi:"Gardening"},
  };
  const now=new Date();
  const bln=now.getMonth()+1; const thn=now.getFullYear();
  const prefix=`${thn}-${String(bln).padStart(2,"0")}`;
  const hk=(() => { let n=0,tot=new Date(thn,bln,0).getDate(); for(let d=1;d<=tot;d++) if(new Date(thn,bln-1,d).getDay()!==0) n++; return n; })();

  return <div>
    <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>Data Gaji — {new Date().toLocaleDateString("id-ID",{month:"long",year:"numeric"})}</div>
    <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace",marginBottom:14}}>Hari kerja bulan ini: {hk} hari</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
      {ALL_STAFF.map(nama=>{
        const g=GAJI[nama]||{pokok:0,bonus:0}; 
        const hadir=closingData.filter(r=>String(r["Tanggal"]).startsWith(prefix)&&r["Nama"]===nama).length;
        const gajiProp=Math.round((g.pokok/hk)*hadir);
        const bonus=hadir>=hk?g.bonus:0;
        const total=gajiProp+bonus;
        const [g1,g2]=AV_GRAD[nama]||["#888","#444"];
        return <Card key={nama}>
          <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:`0.5px solid ${C.bdr}`}}>
            <Avatar name={nama} size={36}/>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700}}>{nama}</div>
              <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace"}}>{g.posisi}</div>
            </div>
            <Badge text={`${hadir}/${hk} hari`} color={hadir>=hk?"green":hadir>0?"amber":"gray"}/>
          </div>
          <div style={{padding:"10px 14px"}}>
            {[["Gaji Pokok",rp(g.pokok),C.txt],["Proporsional",rp(gajiProp),C.b],
              ["Bonus",rp(g.bonus),hadir>=hk?C.g:C.mid],["Total",rp(total),C.g]].map(([lbl,val,col],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",
                borderBottom:i<3?`0.5px solid ${C.bdr}`:"none",
                borderTop:i===3?`1px solid ${C.bdr2}`:"none",marginTop:i===3?4:0}}>
                <span style={{fontSize:12,color:i===3?C.txt:C.mid}}>{lbl}</span>
                <span style={{fontSize:12,fontWeight:i===3?800:500,color:col,fontFamily:"'DM Mono',monospace"}}>{val}</span>
              </div>
            ))}
          </div>
        </Card>;
      })}
    </div>
  </div>;
}

// ── MAIN APP ──────────────────────────────────────────
export default function App(){
  const [session,setSession]     = useState(null);
  const [tab,setTab]             = useState("overview");
  const [data,setData]           = useState({});
  const [loading,setLoading]     = useState(false);
  const [upd,setUpd]             = useState(null);
  const [showResetPW,setRPW]     = useState(false);
  const [showPhoto,setPhoto]     = useState(false);
  const [showBrand,setBrand]     = useState(false);
  const [brand,setBrandState]    = useState(getLogo());
  const [_tick,setTick]          = useState(0); // force re-render after photo update

  const isAdmin  = session?.role==="admin";
  const isOwner  = session?.role==="owner";
  const isPriv   = isAdmin||isOwner;
  const isKary   = session?.role==="karyawan";

  const load=useCallback(async()=>{
    if(!session) return;
    setLoading(true);
    const sheets=isPriv
      ?["Absen Masuk","Laporan Closing","Master Inventaris","Log Transfer","Request & Reimburse"]
      :["Absen Masuk","Laporan Closing","Master Inventaris","Log Transfer"];
    const res=await Promise.all(sheets.map(fetchSheet));
    const d={}; sheets.forEach((s,i)=>{d[s]=res[i];}); setData(d);
    setUpd(new Date().toLocaleTimeString("id-ID")); setLoading(false);
  },[session,isPriv]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{
    if(!session) return;
    const t=setInterval(load,5*60*1000); return()=>clearInterval(t);
  },[load,session]);

  if(!session) return <><style>{CSS}</style><Login onLogin={s=>{setSession(s);setTab("overview");}}/></>;

  const tod      = today();
  const absen    = (data["Absen Masuk"]||[]).filter(r=>String(r["Tanggal"]).startsWith(tod));
  const closing  = (data["Laporan Closing"]||[]);
  const closTod  = closing.filter(r=>String(r["Tanggal"]).startsWith(tod));
  const inv      = data["Master Inventaris"]||[];
  const transfer = data["Log Transfer"]||[];
  const req      = data["Request & Reimburse"]||[];
  const pending  = req.filter(r=>r["Status"]==="PENDING");
  const lowStk   = inv.filter(r=>{const s=String(r["Status\nStok"]||r["Status Stok"]||r["STATUS STOK"]||"");return s.includes("LOW")||s.includes("HABIS");});
  const belumMasuk  = ALL_STAFF.filter(n=>!absen.find(r=>r["Nama"]===n));
  const belumClose  = ALL_STAFF.filter(n=>!closTod.find(r=>r["Nama"]===n));
  const kpiOK    = closTod.filter(r=>String(r["KPI Status"]).includes("TERCAPAI")).length;
  const myAbsen  = absen.filter(r=>r["Nama"]===session.name);
  const myClose  = closTod.filter(r=>r["Nama"]===session.name);

  // Tab config per role
  // Owner = view only (no gaji, no approve)
  // Admin = full access including gaji
  const TABS = isAdmin
    ? [{id:"overview",l:"Overview"},{id:"absensi",l:"Absensi"},{id:"kpi",l:"KPI"},
       {id:"gaji",l:"Gaji"},{id:"inventaris",l:"Inventaris"},{id:"transfer",l:"Transfer"},
       {id:"request",l:"Request",b:pending.length}]
    : isOwner
    ? [{id:"overview",l:"Overview"},{id:"absensi",l:"Absensi"},{id:"kpi",l:"KPI"},
       {id:"inventaris",l:"Inventaris"},{id:"transfer",l:"Transfer"}]
    : [{id:"overview",l:"Hari Ini"},{id:"kpi",l:"KPI Saya"},
       {id:"inventaris",l:"Stok"},{id:"transfer",l:"Transfer"}];

  const roleColor = isAdmin?C.p:isOwner?C.g:AV_GRAD[session.name]?.[0]||C.b;

  return <>
    <style>{CSS}</style>

    {showResetPW && <ResetPWModal name={session.name} onClose={()=>setRPW(false)}/>}
    {showPhoto   && <PhotoModal  name={session.name} onClose={()=>setPhoto(false)} onSave={()=>setTick(t=>t+1)}/>}
    {showBrand   && <BrandModal  onClose={()=>setBrand(false)} onSave={v=>{setBrandState(v);setTick(t=>t+1);}}/>}

    {/* ── HEADER ── */}
    <div style={{
      position:"sticky",top:0,zIndex:100,
      background:"rgba(8,14,26,0.93)",backdropFilter:"blur(20px)",
      borderBottom:`0.5px solid ${C.bdr}`,
      padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:isAdmin||isOwner?"pointer":"default"}}
        onClick={(isAdmin||isOwner)?()=>setBrand(true):undefined}
        title={isAdmin||isOwner?"Edit nama & logo":""}
      >
        {brand.logo
          ?<img src={brand.logo} style={{width:32,height:32,borderRadius:9,objectFit:"cover",flexShrink:0}} alt="logo"/>
          :<div style={{width:32,height:32,borderRadius:9,flexShrink:0,
            background:`linear-gradient(135deg,${C.g},${C.b})`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#080E1A"}}>L</div>}
        <div>
          <div style={{fontSize:15,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1.1,display:"flex",alignItems:"center",gap:5}}>
            {brand.name||"Lyma Ops"}
            {(isAdmin||isOwner)&&<span style={{fontSize:9,color:C.mid,fontFamily:"'DM Mono',monospace"}}>✏️</span>}
          </div>
          <div style={{fontSize:10,color:C.mid,fontFamily:"'DM Mono',monospace",marginTop:1}}>
            <span style={{color:roleColor,fontWeight:600}}>{isKary?session.name:session.role.toUpperCase()}</span>
            {" · "}{tod}
          </div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <div style={{display:"flex",alignItems:"center",gap:5,background:C.g3,border:`0.5px solid rgba(0,232,150,.2)`,padding:"3px 9px",borderRadius:99,fontSize:10,fontFamily:"'DM Mono',monospace",color:C.g}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.g,animation:"pulse 2s infinite"}}/>
          {loading?"sync":"live"}
        </div>
        <button onClick={load} disabled={loading} title="Refresh data" style={{background:C.s2,border:`0.5px solid ${C.bdr}`,color:C.mid,borderRadius:8,padding:"5px 10px",fontSize:11,fontFamily:"'DM Mono',monospace"}}>↻</button>
        {isKary&&<>
          <button onClick={()=>setPhoto(true)} title="Ganti foto profil" style={{background:C.s2,border:`0.5px solid ${C.bdr}`,color:C.mid,borderRadius:8,padding:"5px 8px",fontSize:13}}>📸</button>
          <button onClick={()=>setRPW(true)}   title="Ganti password"   style={{background:C.s2,border:`0.5px solid ${C.bdr}`,color:C.mid,borderRadius:8,padding:"5px 8px",fontSize:13}}>🔐</button>
        </>}
        <button onClick={()=>setSession(null)} style={{background:"none",border:`0.5px solid ${C.bdr}`,color:C.mid,borderRadius:8,padding:"5px 10px",fontSize:11}}>Keluar</button>
      </div>
    </div>

    {/* ── NAV TABS ── */}
    <div style={{display:"flex",background:C.s1,borderBottom:`0.5px solid ${C.bdr}`,overflowX:"auto",scrollbarWidth:"none"}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{
        padding:"11px 16px",whiteSpace:"nowrap",fontSize:13,fontWeight:600,background:"none",border:"none",
        color:tab===t.id?C.g:C.mid,borderBottom:`2px solid ${tab===t.id?C.g:"transparent"}`,
        transition:"all .15s",flexShrink:0,display:"flex",alignItems:"center",gap:5,
      }}>
        {t.l}
        {t.b>0&&<span style={{background:C.r,color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99,fontFamily:"'DM Mono',monospace"}}>{t.b}</span>}
      </button>)}
    </div>

    {/* ── PAGES ── */}
    <div style={{padding:"16px 20px",maxWidth:1100,margin:"0 auto"}} className="fu" key={tab}>

      {/* OVERVIEW */}
      {tab==="overview"&&<div>
        {isPriv&&(belumMasuk.length>0||belumClose.length>0||lowStk.length>0)&&<div style={{marginBottom:14}}>
          {belumMasuk.length>0&&<div style={{background:"rgba(255,184,48,.08)",border:`0.5px solid rgba(255,184,48,.25)`,borderRadius:11,padding:"9px 14px",marginBottom:6,fontSize:13,display:"flex",alignItems:"center",gap:8}}>
            ⏰ <span>Belum absen: <strong style={{color:C.a}}>{belumMasuk.join(", ")}</strong></span>
          </div>}
          {belumClose.length>0&&<div style={{background:"rgba(255,69,96,.08)",border:`0.5px solid rgba(255,69,96,.25)`,borderRadius:11,padding:"9px 14px",marginBottom:6,fontSize:13,display:"flex",alignItems:"center",gap:8}}>
            🚨 <span>Belum closing: <strong style={{color:C.r}}>{belumClose.join(", ")}</strong></span>
          </div>}
          {lowStk.length>0&&<div style={{background:"rgba(255,69,96,.06)",border:`0.5px solid rgba(255,69,96,.2)`,borderRadius:11,padding:"9px 14px",fontSize:13,display:"flex",alignItems:"center",gap:8}}>
            📦 <span>Low stock: <strong style={{color:C.r}}>{lowStk.map(r=>r["Nama Barang"]||"-").join(", ")}</strong></span>
          </div>}
        </div>}

        {isPriv?<>
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            <Stat label="Absen Masuk"  value={`${absen.length}/4`}    color="blue"/>
            <Stat label="Sudah Closing" value={`${closTod.length}/4`} color="purple"/>
            <Stat label="KPI Tercapai" value={`${kpiOK}/${closTod.length||0}`} color="green"/>
            {isAdmin&&<Stat label="Pending Req" value={pending.length} color={pending.length>0?"amber":"blue"}/>}
            <Stat label="Low Stock"    value={lowStk.length}           color={lowStk.length>0?"red":"blue"}/>
          </div>
          {isOwner&&<div style={{background:C.ad,border:`0.5px solid rgba(255,184,48,.3)`,borderRadius:10,padding:"9px 14px",marginBottom:14,fontSize:12,color:C.a,display:"flex",alignItems:"center",gap:6}}>
            👑 <span>Mode Owner — View Only. Login sebagai <strong>Admin</strong> untuk akses penuh termasuk gaji & approve request.</span>
          </div>}
          <div style={{fontSize:11,color:C.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:10}}>Status tim hari ini</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10,marginBottom:16}}>
            {ALL_STAFF.map(nama=>{
              const m=absen.find(r=>r["Nama"]===nama);
              const cl=closTod.find(r=>r["Nama"]===nama);
              const ok=cl&&String(cl["KPI Status"]).includes("TERCAPAI");
              return <Card key={nama} style={{transition:"transform .15s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:`0.5px solid ${C.bdr}`}}>
                  <Avatar name={nama} size={36}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700}}>{nama}</div>
                    <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace"}}>{POSISI[nama]} · {SHIFTS[nama]}</div>
                  </div>
                  <Badge text={m?(ok?"KPI ✓":cl?"Closing":"Hadir"):"Belum"} color={m?(ok?"green":cl?"blue":"amber"):"gray"}/>
                </div>
                <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between"}}>
                  <div style={{fontSize:12}}><span style={{color:C.mid,fontFamily:"'DM Mono',monospace"}}>Masuk </span><span style={{color:m?C.g:C.mid,fontWeight:600}}>{m?m["Jam Masuk"]:"—"}</span></div>
                  <div style={{fontSize:12}}><span style={{color:C.mid,fontFamily:"'DM Mono',monospace"}}>Close </span><span style={{color:cl?C.b:C.mid,fontWeight:600}}>{cl?cl["Jam Pulang"]||cl["Jam Keluar"]||"✓":"—"}</span></div>
                  <div style={{fontSize:12}}><span style={{color:C.mid,fontFamily:"'DM Mono',monospace"}}>Prog </span><span style={{color:C.a,fontWeight:600}}>{cl?cl["Progress %"]||cl["Progress Akhir"]||"—":"—"}%</span></div>
                </div>
              </Card>;
            })}
          </div>
        </>:<>
          <div style={{fontSize:11,color:C.mid,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'DM Mono',monospace",marginBottom:10}}>Status kamu hari ini</div>
          <Card style={{marginBottom:12}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`0.5px solid ${C.bdr}`}}>
              <Avatar name={session.name} size={44} editable onEdit={()=>setPhoto(true)}/>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:800}}>{session.name}</div>
                <div style={{fontSize:11,color:C.mid,fontFamily:"'DM Mono',monospace"}}>{POSISI[session.name]} · Shift {SHIFTS[session.name]}</div>
              </div>
              <div style={{marginLeft:"auto"}}>
                {myAbsen.length>0
                  ?myClose.length>0
                    ?<Badge text={String(myClose[0]["KPI Status"]).includes("TERCAPAI")?"KPI Tercapai ✓":"KPI Gagal"} color={String(myClose[0]["KPI Status"]).includes("TERCAPAI")?"green":"red"}/>
                    :<Badge text="Sudah Hadir" color="amber"/>
                  :<Badge text="Belum Absen" color="gray"/>}
              </div>
            </div>
            <div style={{padding:"12px 16px",display:"flex",gap:24,flexWrap:"wrap"}}>
              {[["Jam Masuk",myAbsen[0]?.["Jam Masuk"]||"—",C.g],
                ["Jam Pulang",myClose[0]?.["Jam Pulang"]||myClose[0]?.["Jam Keluar"]||"—",C.b],
                ["Progress",(myClose[0]?.["Progress %"]||(myClose[0]?.["Progress Akhir"]))
                  ?((myClose[0]?.["Progress %"]||myClose[0]?.["Progress Akhir"])+"%"):"—",C.a],
              ].map(([lbl,val,col])=><div key={lbl}>
                <div style={{fontSize:10,color:C.mid,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.07em"}}>{lbl}</div>
                <div style={{fontSize:20,fontWeight:800,color:col,marginTop:2}}>{val}</div>
              </div>)}
            </div>
          </Card>
          <div style={{background:C.s2,border:`0.5px solid ${C.bdr}`,borderRadius:12,padding:"10px 14px",fontSize:12,color:C.mid,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>🔐 Password & foto profil kamu tersimpan privat</span>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setPhoto(true)} style={{background:"none",border:`0.5px solid ${C.bdr2}`,color:C.b,borderRadius:8,padding:"4px 10px",fontSize:11}}>📸 Foto</button>
              <button onClick={()=>setRPW(true)}   style={{background:"none",border:`0.5px solid ${C.bdr2}`,color:C.b,borderRadius:8,padding:"4px 10px",fontSize:11}}>🔐 PW</button>
            </div>
          </div>
        </>}
        <div style={{paddingTop:12,marginTop:10,borderTop:`0.5px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:C.dim}}>Update: {upd||"—"}</span>
          <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer"
            style={{fontSize:11,color:C.mid,textDecoration:"none",fontFamily:"'DM Mono',monospace"}}>Master Sheet →</a>
        </div>
      </div>}

      {/* ABSENSI */}
      {tab==="absensi"&&isPriv&&<div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Absen Masuk — {tod}</div>
        <Card>
          <Table cols={["Nama","Shift","Jam Masuk","Status","Listrik","Air","Pagar","Catatan"]}
            rows={absen.map(r=>[
              <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={r["Nama"]} size={26}/><span style={{fontWeight:600}}>{r["Nama"]}</span></div>,
              <span style={{color:C.mid,fontFamily:"'DM Mono',monospace",fontSize:12}}>{SHIFTS[r["Nama"]]||"—"}</span>,
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Masuk"]}</span>,
              <Badge text={String(r["Status Masuk"]).includes("TELAT")?"Telat":"Tepat"} color={String(r["Status Masuk"]).includes("TELAT")?"amber":"green"}/>,
              <Badge text={r["Listrik"]||"—"} color={r["Listrik"]==="Normal"?"green":"red"}/>,
              <Badge text={r["Air"]||"—"}     color={r["Air"]==="Normal"?"green":"red"}/>,
              <Badge text={r["Pagar"]||"—"}   color={r["Pagar"]==="OK"?"green":"amber"}/>,
              <span style={{color:C.mid,fontSize:12}}>{r["Catatan"]||"—"}</span>,
            ])} empty="Belum ada absen masuk hari ini."/>
        </Card>
      </div>}

      {/* KPI */}
      {tab==="kpi"&&<div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>{isPriv?`Rekap KPI — ${tod}`:`KPI Saya — ${tod}`}</div>
        <Card>
          <Table cols={isPriv?["Nama","Masuk","Pulang","Progress","KPI","Joblist"]:["Masuk","Pulang","Progress","KPI","Catatan"]}
            rows={(isPriv?closTod:myClose).map(r=>{
              const ok=String(r["KPI Status"]).includes("TERCAPAI");
              const prog=parseFloat(r["Progress %"]||r["Progress Akhir"]||0);
              if(isPriv) return [
                <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={r["Nama"]} size={24}/><span style={{fontWeight:600}}>{r["Nama"]}</span></div>,
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Masuk"]||"—"}</span>,
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Pulang"]||r["Jam Keluar"]||"—"}</span>,
                <div style={{display:"flex",alignItems:"center",gap:6,minWidth:80}}>
                  <div style={{width:48,height:4,background:C.s3,borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",background:ok?C.g:C.a,borderRadius:99,width:`${prog}%`}}/>
                  </div>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:ok?C.g:C.a}}>{prog}%</span>
                </div>,
                <Badge text={ok?"Tercapai":"Gagal"} color={ok?"green":"red"}/>,
                <span style={{color:C.mid,fontSize:12}}>{String(r["Joblist"]||r["Ringkasan"]||"—").substring(0,50)}</span>,
              ];
              return [
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Masuk"]||"—"}</span>,
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jam Pulang"]||"—"}</span>,
                <span style={{color:ok?C.g:C.a,fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:600}}>{prog}%</span>,
                <Badge text={ok?"Tercapai":"Gagal"} color={ok?"green":"red"}/>,
                <span style={{color:C.mid,fontSize:12}}>{r["Catatan"]||"—"}</span>,
              ];
            })} empty="Belum ada data closing hari ini."/>
        </Card>
      </div>}

      {/* GAJI (Admin only) */}
      {tab==="gaji"&&isAdmin&&<GajiView closingData={closing}/>}

      {/* INVENTARIS */}
      {tab==="inventaris"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700}}>Master Inventaris</div>
          {lowStk.length>0&&<Badge text={`${lowStk.length} low stock`} color="amber"/>}
        </div>
        <Card>
          <Table cols={["Kategori","Nama Barang","Stok","Satuan","Kondisi","Status"]}
            rows={inv.slice(0,60).map(r=>{
              const st=String(r["Status\nStok"]||r["Status Stok"]||r["STATUS STOK"]||"");
              const isL=st.includes("LOW"),isO=st.includes("HABIS");
              return [
                <span style={{color:C.mid,fontSize:12}}>{r["Kategori"]||"—"}</span>,
                <span style={{fontWeight:600}}>{r["Nama Barang"]||r["NAMA BARANG"]||"—"}</span>,
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:isO?C.r:isL?C.a:C.g,fontWeight:600}}>{r["Stok"]??r["Stok Akhir"]??"-"}</span>,
                <span style={{color:C.mid,fontSize:12}}>{r["Satuan"]||"pcs"}</span>,
                <span style={{color:C.mid,fontSize:12}}>{r["Kondisi"]||"—"}</span>,
                <Badge text={isO?"Habis":isL?"Low Stock":"OK"} color={isO?"red":isL?"amber":"green"} size="xs"/>,
              ];
            })} empty="Data inventaris belum tersedia."/>
        </Card>
        {inv.length>60&&<div style={{fontSize:11,color:C.mid,textAlign:"center",marginTop:8,fontFamily:"'DM Mono',monospace"}}>Menampilkan 60 dari {inv.length} item</div>}
      </div>}

      {/* TRANSFER */}
      {tab==="transfer"&&<div>
        <div style={{fontSize:13,fontWeight:700,marginBottom:12}}>Log Transfer Barang</div>
        <Card>
          <Table cols={["Tanggal","Petugas","Barang","Dari","Ke","Jml","Kondisi"]}
            rows={[...transfer].reverse().slice(0,30).map(r=>[
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.mid}}>{String(r["Tanggal"]).substring(0,10)}</span>,
              <div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={r["Petugas"]||r["Nama Petugas"]||""} size={22}/><span style={{fontWeight:600,fontSize:12}}>{r["Petugas"]||r["Nama Petugas"]||"—"}</span></div>,
              <span style={{fontWeight:600}}>{r["Nama Barang"]||"—"}</span>,
              <span style={{color:C.r,fontSize:12}}>{r["Dari Lokasi"]||r["Dari Area"]||"—"}</span>,
              <span style={{color:C.g,fontSize:12}}>{r["Ke Lokasi"]||r["Ke Area"]||"—"}</span>,
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>{r["Jumlah"]||"—"}</span>,
              <Badge text={r["Kondisi"]||"—"} color={r["Kondisi"]==="Baik"?"green":"amber"} size="xs"/>,
            ])} empty="Belum ada data transfer."/>
        </Card>
      </div>}

      {/* REQUEST (Admin only) */}
      {tab==="request"&&isAdmin&&<div>
        {pending.length>0&&<>
          <div style={{fontSize:13,fontWeight:700,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            Pending <Badge text={`${pending.length} menunggu`} color="amber"/>
          </div>
          <div style={{marginBottom:16}}>
            {pending.map((r,i)=><Card key={i} style={{marginBottom:8}}>
              <div style={{padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`0.5px solid ${C.bdr}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Avatar name={r["Nama"]||""} size={28}/>
                  <div><span style={{fontWeight:700,fontSize:13}}>{r["Nama"]}</span><span style={{color:C.mid,fontSize:11,fontFamily:"'DM Mono',monospace",marginLeft:6}}>{r["Tanggal"]}</span></div>
                </div>
                <Badge text={r["Urgensi"]||"—"} color={r["Urgensi"]==="Tinggi"?"red":r["Urgensi"]==="Sedang"?"amber":"green"}/>
              </div>
              <div style={{padding:"10px 14px"}}>
                <div style={{fontWeight:700,marginBottom:4}}>📦 {r["Keperluan"]||"—"}</div>
                <div style={{fontSize:12,color:C.mid}}>{r["Jenis"]||""} · Est. <span style={{color:C.a,fontFamily:"'DM Mono',monospace"}}>{rp(r["Harga Est."]||0)}</span></div>
                <div style={{fontSize:11,color:C.b,marginTop:8,padding:"6px 10px",background:C.bd,borderRadius:8}}>Update status APPROVED/REJECTED di tab Request & Reimburse di Google Sheets</div>
              </div>
            </Card>)}
          </div>
        </>}
        <div style={{fontSize:13,fontWeight:700,marginBottom:10}}>Semua Request</div>
        <Card>
          <Table cols={["Tgl","Nama","Keperluan","Jenis","Est. Harga","Urgensi","Status"]}
            rows={[...req].reverse().slice(0,30).map(r=>[
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.mid}}>{String(r["Tanggal"]).substring(0,10)}</span>,
              <span style={{fontWeight:600,fontSize:12}}>{r["Nama"]||"—"}</span>,
              <span style={{fontSize:12}}>{String(r["Keperluan"]||"—").substring(0,35)}</span>,
              <span style={{color:C.mid,fontSize:12}}>{r["Jenis"]||"—"}</span>,
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.a}}>{rp(r["Harga Est."]||0)}</span>,
              <Badge text={r["Urgensi"]||"—"} color={r["Urgensi"]==="Tinggi"?"red":r["Urgensi"]==="Sedang"?"amber":"green"} size="xs"/>,
              <Badge text={r["Status"]||"—"} color={r["Status"]==="PENDING"?"amber":r["Status"]==="APPROVED"?"green":"red"} size="xs"/>,
            ])} empty="Belum ada request."/>
        </Card>
      </div>}

    </div>
  </>;
}
