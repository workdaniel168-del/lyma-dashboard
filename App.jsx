import { useState, useEffect, useCallback } from "react";

const SHEET_ID = "1hka-pv2KLyJjByIMpMaGFjJPKqdw3eM5nw_49yKx3Fg";
const PASSWORDS = { owner: "lyma2026", admin: "admin2026" };
const ALL_STAFF = ["Edy", "Pak Man", "Bekuk", "Diki"];

function getToday() {
  return new Date().toLocaleDateString("sv-SE");
}

async function fetchSheet(name) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    const text = await res.text();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    const json = JSON.parse(text.substring(start, end));
    if (!json.table?.cols) return [];
    const cols = json.table.cols.map(c => c.label || c.id || "");
    return (json.table.rows || []).map(r => {
      const obj = {};
      (r.c || []).forEach((cell, i) => { obj[cols[i]] = cell?.f ?? cell?.v ?? ""; });
      return obj;
    }).filter(r => Object.values(r).some(v => v !== ""));
  } catch { return []; }
}

const rp = n => "Rp " + parseInt(n || 0).toLocaleString("id-ID");

const Badge = ({ text, color }) => {
  const colors = {
    green: { bg: "#EAF3DE", fg: "#3B6D11" },
    red: { bg: "#FCEBEB", fg: "#A32D2D" },
    amber: { bg: "#FAEEDA", fg: "#854F0B" },
    blue: { bg: "#E6F1FB", fg: "#185FA5" },
    gray: { bg: "#F1EFE8", fg: "#5F5E5A" },
    purple: { bg: "#EEEDFE", fg: "#534AB7" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ background: c.bg, color: c.fg, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    green: { bg: "#EAF3DE", fg: "#3B6D11" },
    red: { bg: "#FCEBEB", fg: "#A32D2D" },
    amber: { bg: "#FAEEDA", fg: "#854F0B" },
    blue: { bg: "#E6F1FB", fg: "#185FA5" },
    gray: { bg: "#F1EFE8", fg: "#5F5E5A" },
    purple: { bg: "#EEEDFE", fg: "#534AB7" },
  };
  const c = colors[color] || colors.gray;
  return (
    <div style={{ background: c.bg, borderRadius: 10, padding: "14px 18px", textAlign: "center", minWidth: 90 }}>
      <div style={{ fontSize: 28, fontWeight: 500, color: c.fg }}>{value}</div>
      <div style={{ fontSize: 11, color: c.fg, marginTop: 2 }}>{label}</div>
    </div>
  );
};

const Table = ({ cols, rows, emptyMsg }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {cols.map((c, i) => (
            <th key={i} style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1.5px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)", fontWeight: 500, whiteSpace: "nowrap" }}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={cols.length} style={{ padding: 20, textAlign: "center", color: "var(--color-text-secondary)" }}>{emptyMsg || "Belum ada data."}</td></tr>
        ) : rows.map((r, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)" }}>
            {r.map((cell, j) => (
              <td key={j} style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)", verticalAlign: "middle" }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState(null);
  const [pw, setPw] = useState("");
  const [selected, setSelected] = useState("");
  const [err, setErr] = useState("");

  const handleOwnerAdmin = (role) => {
    if (pw === PASSWORDS[role]) { onLogin({ role, name: role === "owner" ? "Owner" : "Admin" }); }
    else { setErr("Password salah."); }
  };

  return (
    <div style={{ minHeight: 420, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: "var(--color-text-primary)" }}>Lyma Ops</div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginTop: 4 }}>Live Dashboard</div>
      </div>

      {!mode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
          <button onClick={() => setMode("owner")} style={{ padding: "12px 0", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            Owner
          </button>
          <button onClick={() => setMode("admin")} style={{ padding: "12px 0", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            Admin
          </button>
          <button onClick={() => setMode("karyawan")} style={{ padding: "12px 0", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            Karyawan
          </button>
        </div>
      ) : mode === "karyawan" ? (
        <div style={{ width: "100%", maxWidth: 300 }}>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>Pilih nama kamu:</div>
          {ALL_STAFF.map(n => (
            <button key={n} onClick={() => onLogin({ role: "karyawan", name: n })}
              style={{ display: "block", width: "100%", padding: "10px 0", marginBottom: 8, borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", cursor: "pointer", fontSize: 14 }}>
              {n}
            </button>
          ))}
          <button onClick={() => setMode(null)} style={{ fontSize: 12, color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>
            Kembali
          </button>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 300 }}>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "capitalize" }}>
            Password {mode}:
          </div>
          <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && handleOwnerAdmin(mode)}
            placeholder="Masukkan password" style={{ width: "100%", marginBottom: 8 }} />
          {err && <div style={{ color: "#A32D2D", fontSize: 12, marginBottom: 8 }}>{err}</div>}
          <button onClick={() => handleOwnerAdmin(mode)}
            style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            Masuk
          </button>
          <button onClick={() => { setMode(null); setPw(""); setErr(""); }}
            style={{ fontSize: 12, color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", marginTop: 8, display: "block" }}>
            Kembali
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const isPrivileged = session?.role === "owner" || session?.role === "admin";

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const sheets = isPrivileged
        ? ["Absen Masuk", "Laporan Closing", "Rekap Harian KPI", "Master Inventaris", "Log Transfer", "Request & Reimburse"]
        : ["Absen Masuk", "Laporan Closing", "Rekap Harian KPI", "Master Inventaris", "Log Transfer"];
      const results = await Promise.all(sheets.map(fetchSheet));
      const d = {};
      sheets.forEach((s, i) => { d[s] = results[i]; });
      setData(d);
      setLastUpdate(new Date().toLocaleTimeString("id-ID"));
    } catch { }
    setLoading(false);
  }, [session, isPrivileged]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData, session]);

  if (!session) return <LoginScreen onLogin={s => { setSession(s); setTab("overview"); }} />;

  const today = getToday();
  const absenHari = (data["Absen Masuk"] || []).filter(r => String(r["Tanggal"]).startsWith(today));
  const closingHari = (data["Laporan Closing"] || []).filter(r => String(r["Tanggal"]).startsWith(today));
  const allTransfer = (data["Log Transfer"] || []);
  const recentTransfer = allTransfer.slice(-20).reverse();
  const inventaris = (data["Master Inventaris"] || []);
  const requests = (data["Request & Reimburse"] || []);
  const pendingReq = requests.filter(r => r["Status"] === "PENDING");
  const lowStock = inventaris.filter(r => String(r["Status\nStok"] || r["Status Stok"] || r["STATUS STOK"] || "").includes("LOW") || String(r["Status\nStok"] || r["Status Stok"] || r["STATUS STOK"] || "").includes("HABIS"));

  const sudahMasuk = absenHari.map(r => r["Nama"]);
  const sudahClosing = closingHari.map(r => r["Nama"]);
  const belumMasuk = ALL_STAFF.filter(n => !sudahMasuk.includes(n));
  const belumClosing = ALL_STAFF.filter(n => !sudahClosing.includes(n));
  const kpiTercapai = closingHari.filter(r => String(r["KPI Status"]).includes("TERCAPAI")).length;

  const TABS = isPrivileged
    ? [
        { id: "overview", label: "Overview" },
        { id: "absensi", label: "Absensi" },
        { id: "kpi", label: "KPI" },
        { id: "inventaris", label: "Inventaris" },
        { id: "transfer", label: "Transfer" },
        { id: "request", label: `Request${pendingReq.length > 0 ? ` (${pendingReq.length})` : ""}` },
      ]
    : [
        { id: "overview", label: "Hari Ini" },
        { id: "kpi", label: "KPI Saya" },
        { id: "inventaris", label: "Stok" },
        { id: "transfer", label: "Transfer" },
      ];

  const myAbsen = absenHari.filter(r => r["Nama"] === session.name);
  const myClosing = closingHari.filter(r => r["Nama"] === session.name);

  return (
    <div style={{ padding: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Lyma Ops</span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 8, textTransform: "capitalize" }}>
            {session.role === "karyawan" ? session.name : session.role}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lastUpdate && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Update: {lastUpdate}</span>}
          <button onClick={loadData} disabled={loading}
            style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", cursor: "pointer" }}>
            {loading ? "..." : "Refresh"}
          </button>
          <button onClick={() => setSession(null)}
            style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", cursor: "pointer", color: "var(--color-text-secondary)" }}>
            Keluar
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "6px 14px", borderRadius: 20, border: tab === t.id ? "1.5px solid var(--color-border-primary)" : "0.5px solid var(--color-border-tertiary)", background: tab === t.id ? "var(--color-background-secondary)" : "transparent", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 500 : 400, whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 12 }}>
            {today} — {new Date().toLocaleDateString("id-ID", { weekday: "long" })}
          </div>

          {isPrivileged ? (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                <StatCard label="Absen Masuk" value={`${sudahMasuk.length}/${ALL_STAFF.length}`} color="blue" />
                <StatCard label="Sudah Closing" value={`${sudahClosing.length}/${ALL_STAFF.length}`} color="purple" />
                <StatCard label="KPI Tercapai" value={`${kpiTercapai}/${closingHari.length || "-"}`} color="green" />
                <StatCard label="Transfer Hari Ini" value={allTransfer.filter(r => String(r["Tanggal"]).startsWith(today)).length} color="blue" />
                <StatCard label="Pending Request" value={pendingReq.length} color={pendingReq.length > 0 ? "amber" : "gray"} />
                <StatCard label="Low Stock" value={lowStock.length} color={lowStock.length > 0 ? "red" : "gray"} />
              </div>

              {belumMasuk.length > 0 && (
                <div style={{ background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#854F0B" }}>
                  Belum absen masuk: <strong>{belumMasuk.join(", ")}</strong>
                </div>
              )}
              {belumClosing.length > 0 && (
                <div style={{ background: "#FCEBEB", border: "0.5px solid #F7C1C1", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#A32D2D" }}>
                  Belum closing: <strong>{belumClosing.join(", ")}</strong>
                </div>
              )}
              {lowStock.length > 0 && (
                <div style={{ background: "#FAEEDA", border: "0.5px solid #FAC775", borderRadius: 8, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#854F0B" }}>
                  Low stock: {lowStock.map(r => r["Nama Barang"] || r["NAMA BARANG"] || "-").join(", ")}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Status tim hari ini</div>
                <Table
                  cols={["Nama", "Shift", "Absen Masuk", "Jam Masuk", "Closing", "KPI"]}
                  rows={ALL_STAFF.map(nama => {
                    const masuk = absenHari.find(r => r["Nama"] === nama);
                    const closing = closingHari.find(r => r["Nama"] === nama);
                    const shifts = { Edy: "06–14", Bekuk: "10–18", Diki: "13–20", "Pak Man": "20–06" };
                    return [
                      nama,
                      shifts[nama] || "-",
                      masuk ? <Badge text="Sudah" color="green" /> : <Badge text="Belum" color="amber" />,
                      masuk ? masuk["Jam Masuk"] : "-",
                      closing ? <Badge text="Sudah" color="green" /> : <Badge text="Belum" color="gray" />,
                      closing
                        ? (String(closing["KPI Status"]).includes("TERCAPAI")
                          ? <Badge text="Tercapai" color="green" />
                          : <Badge text="Gagal" color="red" />)
                        : "-",
                    ];
                  })}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>
                Halo, <strong>{session.name}</strong>! Ini status kamu hari ini.
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <StatCard label="Absen Masuk" value={myAbsen.length > 0 ? "Sudah" : "Belum"} color={myAbsen.length > 0 ? "green" : "amber"} />
                <StatCard label="Closing" value={myClosing.length > 0 ? "Sudah" : "Belum"} color={myClosing.length > 0 ? "green" : "amber"} />
                <StatCard label="KPI" value={myClosing.length > 0 ? (String(myClosing[0]["KPI Status"]).includes("TERCAPAI") ? "OK" : "Gagal") : "-"}
                  color={myClosing.length > 0 ? (String(myClosing[0]["KPI Status"]).includes("TERCAPAI") ? "green" : "red") : "gray"} />
              </div>
              {myAbsen.length > 0 && (
                <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 16px", marginBottom: 10, fontSize: 13 }}>
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>Absen Masuk</div>
                  <div style={{ color: "var(--color-text-secondary)" }}>Jam masuk: {myAbsen[0]["Jam Masuk"]} — {myAbsen[0]["Status Masuk"]}</div>
                </div>
              )}
              {myClosing.length > 0 && (
                <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 16px", fontSize: 13 }}>
                  <div style={{ fontWeight: 500, marginBottom: 6 }}>Laporan Closing</div>
                  <div style={{ color: "var(--color-text-secondary)" }}>Jam pulang: {myClosing[0]["Jam Pulang"]} · Durasi: {myClosing[0]["Durasi"]} · Progress: {myClosing[0]["Progress %"]}%</div>
                  <div style={{ marginTop: 6 }}>
                    {String(myClosing[0]["KPI Status"]).includes("TERCAPAI")
                      ? <Badge text="KPI Tercapai" color="green" />
                      : <Badge text="KPI Gagal" color="red" />}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "absensi" && isPrivileged && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Absen Masuk — {today}</div>
          <Table
            cols={["Nama", "Posisi", "Jam Masuk", "Status", "Listrik", "Air", "Pagar", "Catatan"]}
            rows={absenHari.map(r => [
              r["Nama"] || "-",
              r["Posisi"] || "-",
              r["Jam Masuk"] || "-",
              <Badge text={r["Status Masuk"] || "-"} color={String(r["Status Masuk"]).includes("Tepat") ? "green" : String(r["Status Masuk"]).includes("TELAT") ? "amber" : "gray"} />,
              <Badge text={r["Listrik"] || "-"} color={r["Listrik"] === "Normal" ? "green" : "red"} />,
              <Badge text={r["Air"] || "-"} color={r["Air"] === "Normal" ? "green" : "red"} />,
              <Badge text={r["Pagar"] || "-"} color={r["Pagar"] === "OK" ? "green" : "amber"} />,
              r["Catatan"] || "-",
            ])}
            emptyMsg="Belum ada absen masuk hari ini."
          />
        </div>
      )}

      {tab === "kpi" && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
            {isPrivileged ? `Rekap KPI — ${today}` : `KPI Saya — ${today}`}
          </div>
          <Table
            cols={isPrivileged
              ? ["Nama", "Masuk", "Pulang", "Durasi", "Progress %", "KPI", "Joblist"]
              : ["Masuk", "Pulang", "Durasi", "Progress %", "KPI", "Keamanan", "Catatan"]}
            rows={(isPrivileged ? closingHari : myClosing).map(r => {
              const kpiOK = String(r["KPI Status"]).includes("TERCAPAI");
              if (isPrivileged) return [
                r["Nama"] || "-",
                r["Jam Masuk"] || "-",
                r["Jam Pulang"] || "-",
                r["Durasi"] || "-",
                `${r["Progress %"] || 0}%`,
                <Badge text={kpiOK ? "Tercapai" : "Gagal"} color={kpiOK ? "green" : "red"} />,
                String(r["Joblist"] || "-").substring(0, 60) + (String(r["Joblist"] || "").length > 60 ? "…" : ""),
              ];
              return [
                r["Jam Masuk"] || "-",
                r["Jam Pulang"] || "-",
                r["Durasi"] || "-",
                `${r["Progress %"] || 0}%`,
                <Badge text={kpiOK ? "Tercapai" : "Gagal"} color={kpiOK ? "green" : "red"} />,
                r["Keamanan"] || "-",
                r["Catatan"] || "-",
              ];
            })}
            emptyMsg="Belum ada data closing hari ini."
          />
        </div>
      )}

      {tab === "inventaris" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Master Inventaris</div>
            {isPrivileged && lowStock.length > 0 && <Badge text={`${lowStock.length} low stock`} color="amber" />}
          </div>
          <Table
            cols={["Kategori", "Nama Barang", "Lokasi", "Stok", "Satuan", "Kondisi", "Status"]}
            rows={inventaris.slice(0, 50).map(r => {
              const stokStr = String(r["Status\nStok"] || r["Status Stok"] || r["STATUS STOK"] || "");
              const isLow = stokStr.includes("LOW");
              const isHabis = stokStr.includes("HABIS");
              return [
                r["Kategori"] || "-",
                r["Nama Barang"] || r["NAMA BARANG"] || "-",
                r["Lokasi"] || r["LOKASI"] || "-",
                r["Stok"] ?? r["STOK"] ?? "-",
                r["Satuan"] || r["SATUAN"] || "-",
                r["Kondisi"] || r["KONDISI"] || "-",
                <Badge text={isHabis ? "Habis" : isLow ? "Low" : "OK"} color={isHabis ? "red" : isLow ? "amber" : "green"} />,
              ];
            })}
            emptyMsg="Data inventaris belum tersedia."
          />
          {inventaris.length > 50 && (
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8, textAlign: "center" }}>
              Menampilkan 50 dari {inventaris.length} item. Lihat semua di Master Sheet.
            </div>
          )}
        </div>
      )}

      {tab === "transfer" && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Log Transfer Terbaru</div>
          <Table
            cols={["Tanggal", "Petugas", "Barang", "Dari", "Ke", "Jumlah", "Kondisi"]}
            rows={recentTransfer.map(r => [
              String(r["Tanggal"]).substring(0, 10),
              r["Petugas"] || "-",
              r["Nama Barang"] || "-",
              r["Dari Lokasi"] || "-",
              r["Ke Lokasi"] || "-",
              `${r["Jumlah"] || "-"} ${r["Satuan"] || ""}`,
              <Badge text={r["Kondisi"] || "-"} color={r["Kondisi"] === "Baik" ? "green" : "amber"} />,
            ])}
            emptyMsg="Belum ada data transfer."
          />
        </div>
      )}

      {tab === "request" && isPrivileged && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
            Request & Reimburse
            {pendingReq.length > 0 && <Badge text={`${pendingReq.length} pending`} color="amber" />}
          </div>
          <Table
            cols={["Tanggal", "Nama", "Keperluan", "Jenis", "Estimasi", "Urgensi", "Status"]}
            rows={[...requests].reverse().slice(0, 30).map(r => [
              String(r["Tanggal"]).substring(0, 10),
              r["Nama"] || "-",
              String(r["Keperluan"] || "-").substring(0, 40),
              r["Jenis"] || "-",
              rp(r["Harga Est."] || 0),
              <Badge text={r["Urgensi"] || "-"} color={r["Urgensi"] === "Tinggi" ? "red" : r["Urgensi"] === "Sedang" ? "amber" : "green"} />,
              <Badge text={r["Status"] || "-"} color={r["Status"] === "PENDING" ? "amber" : r["Status"] === "APPROVED" ? "green" : "red"} />,
            ])}
            emptyMsg="Belum ada request."
          />
        </div>
      )}

      <div style={{ marginTop: 24, paddingTop: 12, borderTop: "0.5px solid var(--color-border-tertiary)", fontSize: 11, color: "var(--color-text-secondary)", display: "flex", justifyContent: "space-between" }}>
        <span>Lyma Ops System</span>
        <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noreferrer"
          style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
          Buka Master Sheet
        </a>
      </div>
    </div>
  );
}
