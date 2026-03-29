import { useState } from "react";

const TEAL = "#006B6B";
const TEAL_LIGHT = "#e6f4f4";
const TEAL_MID = "#b2d8d8";
const GOLD = "#c8922a";
const RED = "#b33030";

const schemes = {
  SHB: {
    name: "Silver Housing Bonus (SHB)",
    color: "#1a6e3c",
    bg: "#e8f5ee",
    border: "#1a6e3c",
    summary: "Sell current flat, buy 3-room or smaller HDB flat. Receive cash bonus up to $40,000.",
    details: [
      "Cash bonus up to $30,000 (3-room flat) or up to $40,000 (2-room or smaller flat)",
      "Commit net increase of up to $60,000 in CPF RA (can come from CPF housing refunds — no mandatory cash top-up)",
      "Join CPF LIFE for monthly payouts",
      "Lump sum from remaining sale proceeds after CPF top-up",
      "Cannot combine with LBS bonus (but can use LBS proceeds without LBS bonus)",
    ],
    note: "Best for: Seniors willing to move to a smaller flat and want a cash bonus + higher CPF LIFE payouts.",
    link: "https://www.hdb.gov.sg/managing-my-home/retirement-planning/monetising-flat-for-retirement/silver-housing-bonus",
  },
  LBS: {
    name: "Lease Buyback Scheme (LBS)",
    color: "#1a4e8c",
    bg: "#e8eef8",
    border: "#1a4e8c",
    summary: "Stay in your flat. Sell tail-end of lease to HDB. Receive LBS bonus + CPF LIFE payouts.",
    details: [
      "LBS bonus: up to $30,000 (3-room or smaller), $15,000 (4-room), $7,500 (5-room or bigger)",
      "Retain lease based on youngest owner's age (covers to age 95)",
      "Net proceeds top up CPF RA; join CPF LIFE for monthly income for life",
      "Any cash above CPF requirements: up to $100,000 as lump sum",
      "Cannot sell or sublet flat after joining LBS",
    ],
    note: "Best for: Seniors who want to stay in their flat and convert excess lease into retirement income.",
    link: "https://www.hdb.gov.sg/managing-my-home/retirement-planning/monetising-flat-for-retirement/lease-buyback-scheme-lbs",
  },
  RENT_FLAT: {
    name: "Rent Out Entire Flat",
    color: "#7a3e8c",
    bg: "#f3eaf8",
    border: "#7a3e8c",
    summary: "Move out and rent your whole flat for monthly rental income.",
    details: [
      "Monthly rental income from tenants",
      "Must move out and live elsewhere (e.g. with family)",
      "Need to buy or have another place to stay",
      "Ensure tenants do not further sublet or misuse flat",
      "Subject to HDB conditions for renting out flat",
    ],
    note: "Best for: Seniors who can live with family and want maximum rental income from the whole flat.",
    link: "https://www.hdb.gov.sg/managing-my-home/retirement-planning",
  },
  RENT_ROOM: {
    name: "Rent Out Spare Bedroom(s)",
    color: "#8c5a1a",
    bg: "#f8f0e8",
    border: "#8c5a1a",
    summary: "Stay in your flat and rent out one or more spare bedrooms for monthly income.",
    details: [
      "Monthly rental income while staying in your flat",
      "No need to move out",
      "Must continue to occupy the flat",
      "Total number of persons in flat must not exceed 6",
      "Tenants cannot further sublet the room",
    ],
    note: "Best for: Seniors with spare rooms who want rental income while staying in a familiar home.",
    link: "https://www.hdb.gov.sg/managing-my-home/retirement-planning",
  },
};

const questions = [
  {
    id: "q1",
    text: "Are you a Singapore Citizen, aged 55 or above (for SHB) or 65 or above (for LBS)?",
    sub: "At least one owner must meet the age & citizenship requirement.",
    yes: "q2",
    no: "ineligible_age",
  },
  {
    id: "q2",
    text: "Is your gross monthly household income $14,000 or less?",
    sub: "This applies to SHB, LBS, and renting conditions.",
    yes: "q3",
    no: "rent_only",
  },
  {
    id: "q3",
    text: "Have you fulfilled the Minimum Occupation Period (MOP) — at least 5 years in this flat?",
    sub: "MOP applies to both SHB and LBS.",
    yes: "q4",
    no: "wait_mop",
  },
  {
    id: "q4",
    text: "Do you want to stay in your current flat (not move out)?",
    sub: "SHB requires you to sell and move; LBS and renting allow you to stay.",
    yes: "q5_stay",
    no: "q5_move",
  },
  {
    id: "q5_stay",
    text: "Do you want to convert part of your flat's lease into retirement income (rather than rent out rooms)?",
    sub: "LBS sells the tail-end lease to HDB. Renting out rooms keeps your lease intact.",
    yes: "q6_lbs",
    no: "q6_rent_room",
  },
  {
    id: "q5_move",
    text: "Are you willing to sell your flat and buy a smaller HDB flat (3-room or smaller)?",
    sub: "SHB requires right-sizing to 3-room or smaller. If not, you could rent out the whole flat instead.",
    yes: "q6_shb",
    no: "q6_rent_flat",
  },
  {
    id: "q6_shb",
    text: "Is your current property an HDB flat, or a private property with Annual Value (AV) of $31,000 or less?",
    sub: "From Dec 2025: SHB extended to private properties with AV up to $31,000.",
    yes: "q7_shb",
    no: "ineligible_shb",
  },
  {
    id: "q7_shb",
    text: "Do you not currently own any other private residential property?",
    sub: "You must not concurrently own another private property to qualify for SHB.",
    yes: "result_SHB",
    no: "ineligible_shb_property",
  },
  {
    id: "q6_lbs",
    text: "Is your flat an HDB flat (not short-lease, HUDC, or Executive Condominium), and does it have at least 20 years of remaining lease?",
    sub: "LBS requires at least 20 years remaining lease after the sale.",
    yes: "q7_lbs",
    no: "ineligible_lbs",
  },
  {
    id: "q7_lbs",
    text: "Are ALL owners aged 65 or above?",
    sub: "For LBS, every owner must be at least 65.",
    yes: "result_LBS",
    no: "lbs_age_fail",
  },
  {
    id: "q6_rent_room",
    text: "Does your flat have a spare bedroom (you'll continue living there)?",
    sub: "You need a spare room — you must remain resident in the flat.",
    yes: "result_RENT_ROOM",
    no: "no_spare_room",
  },
  {
    id: "q6_rent_flat",
    text: "Do you have another place to stay (e.g. family member's home)?",
    sub: "Renting out the whole flat requires you to move out.",
    yes: "result_RENT_FLAT",
    no: "no_options",
  },
];

const terminals = {
  ineligible_age: {
    type: "error",
    title: "Not Yet Eligible",
    msg: "You must be at least 55 (for SHB) or 65 (for LBS), and a Singapore Citizen. Check back when you meet the age requirement.",
  },
  rent_only: {
    type: "warning",
    title: "Income Ceiling Exceeded",
    msg: "SHB and LBS have a $14,000/month gross household income ceiling. You may still be able to rent out your flat or rooms — these have no income ceiling. Consult HDB for details.",
    options: ["RENT_ROOM", "RENT_FLAT"],
  },
  wait_mop: {
    type: "warning",
    title: "MOP Not Yet Met",
    msg: "You need to have lived in your flat for at least 5 years before accessing most monetisation schemes. You may still rent out spare bedrooms (check HDB rules for your flat type).",
  },
  ineligible_shb: {
    type: "warning",
    title: "Not Eligible for SHB",
    msg: "SHB requires your current property to be an HDB flat or private property with AV of $31,000 or less (from Dec 2025). Consider LBS (if you stay) or renting.",
    options: ["LBS", "RENT_ROOM"],
  },
  ineligible_shb_property: {
    type: "warning",
    title: "Private Property Ownership",
    msg: "You cannot hold another private residential property concurrently when applying for SHB. Consider other options.",
    options: ["RENT_ROOM", "RENT_FLAT"],
  },
  ineligible_lbs: {
    type: "warning",
    title: "LBS Flat Conditions Not Met",
    msg: "LBS requires a standard HDB flat (not short-lease, HUDC, or EC) with at least 20 years remaining lease. Consider renting out spare rooms instead.",
    options: ["RENT_ROOM"],
  },
  lbs_age_fail: {
    type: "warning",
    title: "LBS Age Requirement",
    msg: "All owners must be at least 65 for LBS. If you are between 55–64, consider the Silver Housing Bonus (SHB) by right-sizing, or rent out spare bedrooms in the meantime.",
    options: ["SHB", "RENT_ROOM"],
  },
  no_spare_room: {
    type: "info",
    title: "No Spare Bedroom",
    msg: "Without a spare bedroom, renting out a room isn't viable. You could consider LBS (sell tail-end lease and stay) or SHB (right-size to smaller flat).",
    options: ["LBS", "SHB"],
  },
  no_options: {
    type: "info",
    title: "Limited Options",
    msg: "Renting your whole flat requires you to move out. If that's not possible, consider renting a room (if you have one) or LBS (if eligible).",
    options: ["RENT_ROOM", "LBS"],
  },
};

const terminalColors = { error: RED, warning: GOLD, info: TEAL };

function SchemeCard({ id }) {
  const s = schemes[id];
  return (
    <div style={{ border: `2px solid ${s.border}`, borderRadius: 12, padding: 18, marginBottom: 12, background: s.bg }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: s.color, marginBottom: 6 }}>{s.name}</div>
      <div style={{ fontSize: 13.5, color: "#333", marginBottom: 8 }}>{s.summary}</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {s.details.map((d, i) => (
          <li key={i} style={{ fontSize: 13, color: "#444", marginBottom: 3 }}>{d}</li>
        ))}
      </ul>
      <div style={{ marginTop: 10, fontSize: 12.5, color: s.color, fontStyle: "italic" }}>{s.note}</div>
      <a href={s.link} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: s.color, textDecoration: "underline" }}>
        HDB Official Page ↗
      </a>
    </div>
  );
}

export default function App() {
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState("q1");

  const qMap = Object.fromEntries(questions.map((q) => [q.id, q]));

  function answer(next) {
    setHistory((h) => [...h, current]);
    setCurrent(next);
  }

  function goBack() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrent(prev);
  }

  function restart() {
    setHistory([]);
    setCurrent("q1");
  }

  const isResult = current.startsWith("result_");
  const isTerminal = current in terminals;
  const question = qMap[current];

  const resultScheme = isResult ? current.replace("result_", "") : null;
  const terminal = isTerminal ? terminals[current] : null;

  return (
    <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", maxWidth: 640, margin: "0 auto", padding: "24px 16px", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: TEAL, borderRadius: 12, padding: "20px 24px", marginBottom: 24, color: "#fff" }}>
        <div style={{ fontSize: 11, letterSpacing: 1, opacity: 0.8, marginBottom: 4, textTransform: "uppercase" }}>HDB Retirement Planning</div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>Housing Monetisation Options</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>Answer a few questions to find the right scheme for you</div>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        {history.length > 0 && (
          <button onClick={goBack} style={{ background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`, borderRadius: 8, padding: "6px 14px", fontSize: 13, color: TEAL, cursor: "pointer", fontWeight: 600 }}>
            ← Back
          </button>
        )}
        <button onClick={restart} style={{ background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#555", cursor: "pointer" }}>
          ↺ Restart
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "#888" }}>Step {history.length + 1}</span>
      </div>

      {/* Question */}
      {question && !isResult && !isTerminal && (
        <div style={{ border: `1.5px solid ${TEAL_MID}`, borderRadius: 12, padding: 24, marginBottom: 16, background: TEAL_LIGHT }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>{question.text}</div>
          {question.sub && <div style={{ fontSize: 13, color: "#555", marginBottom: 20 }}>{question.sub}</div>}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => answer(question.yes)}
              style={{ flex: 1, background: TEAL, color: "#fff", border: "none", borderRadius: 10, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              ✓ Yes
            </button>
            <button
              onClick={() => answer(question.no)}
              style={{ flex: 1, background: "#fff", color: "#555", border: "1.5px solid #ccc", borderRadius: 10, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              ✗ No
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {isResult && resultScheme && (
        <div>
          <div style={{ background: "#e8f8ef", border: "2px solid #1a6e3c", borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a6e3c", marginBottom: 4 }}>✅ Recommended Option</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{schemes[resultScheme].name}</div>
          </div>
          <SchemeCard id={resultScheme} />
          <div style={{ fontSize: 12.5, color: "#888", marginTop: 12, lineHeight: 1.6 }}>
            ⚠️ This is a general guide only. Eligibility is subject to HDB's assessment at time of application. Use HDB's{" "}
            <a href="https://services2.hdb.gov.sg/webapp/BF21HMO/BF21PHMOStart.jsp" target="_blank" rel="noreferrer" style={{ color: TEAL }}>
              Enquire Housing Monetisation Options e-Service
            </a>{" "}
            for a personalised assessment.
          </div>
        </div>
      )}

      {/* Terminal */}
      {isTerminal && terminal && (
        <div style={{ border: `2px solid ${terminalColors[terminal.type]}`, borderRadius: 12, padding: 20, marginBottom: 16, background: terminal.type === "error" ? "#fdeaea" : terminal.type === "warning" ? "#fdf5e6" : TEAL_LIGHT }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: terminalColors[terminal.type], marginBottom: 8 }}>
            {terminal.type === "error" ? "❌" : terminal.type === "warning" ? "⚠️" : "ℹ️"} {terminal.title}
          </div>
          <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6 }}>{terminal.msg}</div>
          {terminal.options && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 10 }}>Possible alternatives to explore:</div>
              {terminal.options.map((id) => <SchemeCard key={id} id={id} />)}
            </div>
          )}
          <div style={{ fontSize: 12, color: "#888", marginTop: 10 }}>
            Consider speaking with HDB directly at any HDB branch or via{" "}
            <a href="https://www.hdb.gov.sg" target="_blank" rel="noreferrer" style={{ color: TEAL }}>hdb.gov.sg</a>.
          </div>
        </div>
      )}

      {/* Scheme overview at bottom */}
      {!isResult && !isTerminal && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>The 4 Options at a Glance</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(schemes).map(([id, s]) => (
              <div key={id} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: s.color }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: "#555", marginTop: 3 }}>{s.summary}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "#aaa", marginTop: 12, textAlign: "center" }}>
            Updated for Dec 2025 SHB enhancements • Source: HDB
          </div>
        </div>
      )}
    </div>
  );
}
