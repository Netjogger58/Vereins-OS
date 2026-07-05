// Médico-Convocation: HTML-Generator für Druck/PDF (Texte zentral in shared/convocationText).
// Baut den Brief 1:1 zur Vorlage nach (Header/Fotos als Bilder unter /convocation/).
import {
  type ConvLang, CONV_TEXTS, ADDRESS_HTML, SIGN_NAME, SIGN_TITLE, fmtDate, fmtRdv, escHtml as esc,
} from "@shared/convocationText";
export type { ConvLang };

export interface ConvocationInput {
  name: string;
  lang: ConvLang;
  rdv: Date | null;    // null => leeres RDV-Feld (Sekretär trägt handschriftlich ein)
  today?: Date;
}

export function buildConvocationHtml(inp: ConvocationInput): string {
  const t = CONV_TEXTS[inp.lang];
  const today = inp.today ?? new Date();
  const rdvLine = inp.rdv ? esc(fmtRdv(inp.lang, inp.rdv)) : "&nbsp;";
  const checklist = t.checklist.map((c) => `<div class="chk">!!!! ${esc(c)} !!!!</div>`).join("");
  return `<!doctype html><html lang="${inp.lang.toLowerCase()}"><head><meta charset="utf-8">
<title>Convocation Médico — ${esc(inp.name)}</title>
<style>
  @page { size: A4; margin: 14mm 14mm 10mm; }
  * { box-sizing: border-box; }
  body { font-family: "Calibri", "Segoe UI", Arial, sans-serif; color: #1a2b4a; margin: 0; }
  .sheet { width: 182mm; margin: 0 auto; }
  .header { display: flex; align-items: center; gap: 8mm; }
  .header img { height: 30mm; }
  .date { text-align: right; margin: 4mm 0 0; font-size: 13pt; }
  hr { border: none; border-top: 2px solid #1a2b4a; margin: 3mm 0; }
  .row { display: flex; gap: 6mm; margin: 3mm 0; font-size: 13pt; }
  .row .lbl { width: 34mm; color: #1a2b4a; }
  .row .val { flex: 1; font-weight: 600; }
  .rdv .val { border-bottom: 1px solid #999; min-height: 6mm; }
  .lieu .val { font-weight: 500; }
  .present { font-size: 13pt; margin: 4mm 0 2mm; }
  .boxes { display: flex; gap: 8mm; }
  .box { flex: 1; border: 1px solid #333; border-radius: 2px; padding: 4mm; min-height: 42mm;
         text-align: center; font-weight: 700; }
  .box .chk, .box .jog { background: #fff26a; display: inline-block; padding: 0 4px; margin: 1.5mm 0; }
  .box.right { display: flex; align-items: center; justify-content: center; }
  .box.right .txt { background: #ffd23a; padding: 3mm; line-height: 1.5; }
  .photos { width: 100%; margin: 4mm 0 2mm; }
  .photos img { width: 100%; display: block; }
  .signature { margin: 6mm 0 0; text-align: right; font-size: 12pt; line-height: 1.4; }
  .signature .sig-name { font-weight: 700; }
  .signature .sig-title { font-size: 10.5pt; color: #333; }
  .footer { text-align: center; font-size: 9.5pt; font-weight: 700; color: #1a2b4a; line-height: 1.5; }
  @media screen { body { background: #eee; padding: 8mm 0; } .sheet { background: #fff; padding: 14mm; box-shadow: 0 2px 12px rgba(0,0,0,.2); } }
</style></head>
<body>
  <div class="sheet">
    <img class="hdr" src="/convocation/header.png" style="width:100%;display:block" alt="MERSCH 75 — Convocation au contrôle médico sportif"/>
    <div class="date">${esc(t.merschLe)} ${fmtDate(today)}</div>
    <hr/>
    <div class="row"><div class="lbl">${esc(t.nom)}</div><div class="val">${esc(inp.name)}</div></div>
    <div class="row rdv"><div class="lbl">${esc(t.rdv)}</div><div class="val">${rdvLine}</div></div>
    <div class="row lieu"><div class="lbl">${esc(t.lieu)}</div><div class="val">${ADDRESS_HTML}</div></div>
    <hr/>
    <div class="present">${esc(t.present)}</div>
    <div class="boxes">
      <div class="box left">${checklist}<div class="jog">${esc(t.jogging)}</div></div>
      <div class="box right"><div class="txt">${esc(t.empechement)}</div></div>
    </div>
    <img class="photos" src="/convocation/photos.png" alt="Plan"/>
    <div class="signature">
      <div>${esc(t.signed)}</div>
      <div class="sig-name">${SIGN_NAME}</div>
      <div class="sig-title">${SIGN_TITLE}</div>
    </div>
  </div>
</body></html>`;
}

// Öffnet die Convocation in einem neuen Fenster und startet optional den Druckdialog.
export function openConvocation(inp: ConvocationInput, autoPrint = true) {
  const html = buildConvocationHtml(inp);
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
  if (autoPrint) {
    // Warten bis Bilder geladen sind, dann Druck.
    w.onload = () => setTimeout(() => w.print(), 400);
  }
}
