// Médico-Convocation per E-Mail + zuverlässige Bestätigung (Klick-Link statt Lesebestätigung).
import { randomBytes } from "node:crypto";
import { sqlite } from "./storage";
import {
  type ConvLang, CONV_TEXTS, CONV_LANGS, ADDRESS_LINES, SIGN_NAME, SIGN_TITLE,
  fmtDate, fmtRdv, escHtml,
} from "@shared/convocationText";

// Idempotente Spalten-Migrationen (bestehende DBs nachrüsten).
function addColumn(table: string, col: string, def: string) {
  try { sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch { /* existiert bereits */ }
}

// ── Lazy Setup: `sqlite` ist erst nach initDatabase() verfügbar (Modul-Import passiert vorher). ──
type Stmt = ReturnType<typeof sqlite.prepare>;
let _ready = false;
let _stmtInsert: Stmt, _stmtByToken: Stmt, _stmtMarkSent: Stmt, _stmtMarkConfirmed: Stmt, _stmtMarkDeclined: Stmt;

function ensure() {
  if (_ready) return;
  // Tabelle (idempotent)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS medico_convocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      member_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      lang TEXT NOT NULL,
      rdv TEXT,
      created_at TEXT NOT NULL,
      sent_at TEXT,
      send_error TEXT,
      confirmed_at TEXT,
      confirmed_ip TEXT
    );
  `);
  addColumn("medico_convocations", "status", "TEXT DEFAULT 'pending'");
  addColumn("medico_convocations", "declined_at", "TEXT");
  addColumn("members", "medico_result", "TEXT");
  addColumn("members", "medico_result_date", "TEXT");

  _stmtInsert = sqlite.prepare(
    `INSERT INTO medico_convocations (token, member_id, name, email, lang, rdv, created_at)
     VALUES (@token, @memberId, @name, @email, @lang, @rdv, @createdAt)`
  );
  _stmtByToken = sqlite.prepare("SELECT * FROM medico_convocations WHERE token = ?");
  _stmtMarkSent = sqlite.prepare("UPDATE medico_convocations SET sent_at = ?, send_error = ? WHERE token = ?");
  _stmtMarkConfirmed = sqlite.prepare("UPDATE medico_convocations SET confirmed_at = ?, confirmed_ip = ?, status = 'confirmed' WHERE token = ? AND confirmed_at IS NULL AND declined_at IS NULL");
  _stmtMarkDeclined = sqlite.prepare("UPDATE medico_convocations SET declined_at = ?, confirmed_ip = ?, status = 'declined' WHERE token = ? AND confirmed_at IS NULL AND declined_at IS NULL");
  _ready = true;
}

export type ConvResponse = "confirm" | "decline";
export interface ConvocationRecord {
  id: number; token: string; member_id: number | null; name: string; email: string;
  lang: string; rdv: string | null; created_at: string; sent_at: string | null;
  send_error: string | null; confirmed_at: string | null; confirmed_ip: string | null;
  status: string | null; declined_at: string | null;
}

export function normalizeLang(l: string | null | undefined): ConvLang {
  const up = String(l || "").toUpperCase();
  return (CONV_LANGS as string[]).includes(up) ? (up as ConvLang) : "FR";
}

export function createConvocation(input: { memberId?: number | null; name: string; email: string; lang: ConvLang; rdv: string | null }): string {
  ensure();
  const token = randomBytes(24).toString("hex");
  _stmtInsert.run({
    token, memberId: input.memberId ?? null, name: input.name, email: input.email,
    lang: input.lang, rdv: input.rdv ?? null, createdAt: new Date().toISOString(),
  });
  return token;
}

export function getConvocation(token: string): ConvocationRecord | undefined {
  ensure();
  return _stmtByToken.get(token) as ConvocationRecord | undefined;
}
export function markSent(token: string, error?: string) { ensure(); _stmtMarkSent.run(new Date().toISOString(), error ?? null, token); }
export function markConfirmed(token: string, ip: string): boolean {
  ensure();
  const info = _stmtMarkConfirmed.run(new Date().toISOString(), ip, token);
  return info.changes > 0;
}
export function markDeclined(token: string, ip: string): boolean {
  ensure();
  const info = _stmtMarkDeclined.run(new Date().toISOString(), ip, token);
  return info.changes > 0;
}

// ── E-Mail-HTML (email-sicher: Tabellen + Inline-Styles) ──
export function buildConvocationEmailHtml(opts: { name: string; lang: ConvLang; rdv: Date | null; confirmUrl: string; baseUrl: string }): string {
  const t = CONV_TEXTS[opts.lang];
  const today = new Date();
  const rdvLine = opts.rdv ? escHtml(fmtRdv(opts.lang, opts.rdv)) : "—";
  const intro = escHtml(t.emailIntro).replace(/\n/g, "<br/>");
  const checklist = t.checklist.map((c) => `<li>${escHtml(c)}</li>`).join("");
  const address = ADDRESS_LINES.map(escHtml).join("<br/>");
  const navy = "#1a2b4a";
  return `<!doctype html><html lang="${opts.lang.toLowerCase()}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f2f4f7;font-family:Arial,Helvetica,sans-serif;color:${navy};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f7;padding:16px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:0;"><img src="${opts.baseUrl}/convocation/header.png" width="600" style="display:block;width:100%;height:auto;" alt="MERSCH 75 — Convocation Médico"/></td></tr>
        <tr><td style="padding:20px 28px 4px;">
          <div style="text-align:right;font-size:13px;color:#555;">${escHtml(t.merschLe)} ${fmtDate(today)}</div>
          <p style="font-size:15px;line-height:1.5;margin:8px 0 16px;">${intro}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">
            <tr><td style="padding:4px 0;width:130px;color:#555;">${escHtml(t.nom)}</td><td style="padding:4px 0;font-weight:bold;">${escHtml(opts.name)}</td></tr>
            <tr><td style="padding:4px 0;color:#555;">${escHtml(t.rdv)}</td><td style="padding:4px 0;font-weight:bold;">${rdvLine}</td></tr>
            <tr><td style="padding:4px 0;color:#555;vertical-align:top;">${escHtml(t.lieu)}</td><td style="padding:4px 0;">${address}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:12px 28px;">
          <div style="font-weight:bold;margin-bottom:6px;">${escHtml(t.present)}</div>
          <ul style="margin:0 0 10px 18px;padding:0;font-size:14px;line-height:1.6;">${checklist}<li>${escHtml(t.jogging)}</li></ul>
          <div style="background:#fff5cc;border-radius:6px;padding:10px 12px;font-size:13px;">${escHtml(t.empechement)}</div>
        </td></tr>
        <tr><td align="center" style="padding:10px 28px 6px;">
          <a href="${opts.confirmUrl}?a=confirm" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:bold;font-size:16px;padding:14px 28px;border-radius:8px;">${escHtml(t.confirmBtn)}</a>
          <div style="font-size:12px;color:#777;margin:8px 0 12px;">${escHtml(t.confirmHint)}</div>
          <a href="${opts.confirmUrl}?a=decline" style="display:inline-block;background:#fff;color:#b91c1c;border:1px solid #b91c1c;text-decoration:none;font-weight:bold;font-size:14px;padding:9px 20px;border-radius:8px;">${escHtml(t.declineBtn)}</a>
        </td></tr>
        <tr><td style="padding:8px 28px 22px;">
          <img src="${opts.baseUrl}/convocation/photos.png" width="544" style="display:block;width:100%;height:auto;" alt="Plan"/>
          <div style="text-align:right;margin-top:14px;font-size:13px;line-height:1.4;">
            ${escHtml(t.signed)}<br/><strong>${escHtml(SIGN_NAME)}</strong><br/>
            <span style="font-size:12px;color:#555;">${escHtml(SIGN_TITLE)}</span>
          </div>
        </td></tr>
      </table>
      <div style="font-size:11px;color:#aab;max-width:600px;margin-top:10px;">HB Mersch 75 · info@mersch75.lu</div>
    </td></tr>
  </table>
</body></html>`;
}

// ── Antwort-Seite (nach Klick auf Bestätigen/Absagen) ──
export function buildConfirmationPage(lang: ConvLang, kind: ConvResponse, already: boolean): string {
  const t = CONV_TEXTS[lang];
  const confirmed = kind === "confirm";
  const title = escHtml(confirmed ? t.confirmedTitle : t.declinedTitle);
  const body = escHtml(confirmed ? t.confirmedBody : t.declinedBody);
  const icon = confirmed ? "✅" : "📅";
  return `<!doctype html><html lang="${lang.toLowerCase()}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f2f4f7;color:#1a2b4a;">
  <div style="max-width:520px;margin:60px auto;background:#fff;border-radius:12px;padding:36px;text-align:center;box-shadow:0 2px 16px rgba(0,0,0,.08);">
    <div style="font-size:56px;line-height:1;">${icon}</div>
    <h1 style="font-size:22px;margin:16px 0 8px;">${title}</h1>
    <p style="font-size:15px;color:#555;line-height:1.5;">${body}</p>
    ${already ? `<p style="font-size:13px;color:#999;margin-top:16px;">(schonn beäntwert)</p>` : ""}
  </div>
</body></html>`;
}
