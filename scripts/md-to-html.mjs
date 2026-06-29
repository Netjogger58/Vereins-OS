// Minimaler Markdown -> HTML Konverter (genug für den Statusbericht)
// Nutzung: node scripts/md-to-html.mjs <input.md> <output.html> "Titel"
import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath, titleArg] = process.argv;
const src = readFileSync(inPath, "utf8");
const title = titleArg || "Bericht";

const esc = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Inline-Formatierung
function inline(text) {
  let t = esc(text);
  // inline code
  t = t.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  // bold
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic (einfach)
  t = t.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  // links [text](url)
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return t;
}

const lines = src.split(/\r?\n/);
const html = [];
let i = 0;
let inCode = false;
let codeBuf = [];

function flushList(stack) {
  while (stack.length) {
    html.push(stack.pop() === "ol" ? "</ol>" : "</ul>");
  }
}

let listStack = [];

function closeLists() {
  flushList(listStack);
  listStack = [];
}

while (i < lines.length) {
  let line = lines[i];

  // Code-Fences
  if (/^```/.test(line)) {
    if (!inCode) {
      closeLists();
      inCode = true;
      codeBuf = [];
    } else {
      inCode = false;
      html.push(`<pre><code>${esc(codeBuf.join("\n"))}</code></pre>`);
    }
    i++;
    continue;
  }
  if (inCode) {
    codeBuf.push(line);
    i++;
    continue;
  }

  // Tabellen
  if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s:|-]*$/.test(lines[i + 1])) {
    closeLists();
    const header = line.split("|").slice(1, -1).map((c) => c.trim());
    i += 2; // skip separator
    const rows = [];
    while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
      rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
      i++;
    }
    html.push("<table>");
    html.push("<thead><tr>" + header.map((h) => `<th>${inline(h)}</th>`).join("") + "</tr></thead>");
    html.push("<tbody>");
    for (const r of rows) {
      html.push("<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>");
    }
    html.push("</tbody></table>");
    continue;
  }

  // Horizontale Linie
  if (/^---+\s*$/.test(line)) {
    closeLists();
    html.push("<hr/>");
    i++;
    continue;
  }

  // Überschriften
  const h = line.match(/^(#{1,6})\s+(.*)$/);
  if (h) {
    closeLists();
    const lvl = h[1].length;
    html.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
    i++;
    continue;
  }

  // Blockquote
  if (/^>\s?/.test(line)) {
    closeLists();
    const quote = [];
    while (i < lines.length && /^>\s?/.test(lines[i])) {
      quote.push(lines[i].replace(/^>\s?/, ""));
      i++;
    }
    html.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`);
    continue;
  }

  // Listen
  const ul = line.match(/^(\s*)[-*]\s+(.*)$/);
  const ol = line.match(/^(\s*)\d+\.\s+(.*)$/);
  if (ul || ol) {
    const type = ul ? "ul" : "ol";
    if (listStack[listStack.length - 1] !== type) {
      if (listStack.length) flushList(listStack);
      listStack = [type];
      html.push(type === "ol" ? "<ol>" : "<ul>");
    }
    html.push(`<li>${inline((ul || ol)[2])}</li>`);
    i++;
    continue;
  }

  // Leerzeile
  if (/^\s*$/.test(line)) {
    closeLists();
    i++;
    continue;
  }

  // Absatz
  closeLists();
  const para = [line];
  i++;
  while (
    i < lines.length &&
    !/^\s*$/.test(lines[i]) &&
    !/^```/.test(lines[i]) &&
    !/^#{1,6}\s/.test(lines[i]) &&
    !/^>\s?/.test(lines[i]) &&
    !/^---+\s*$/.test(lines[i]) &&
    !/^\s*[-*]\s+/.test(lines[i]) &&
    !/^\s*\d+\.\s+/.test(lines[i]) &&
    !/^\s*\|.*\|\s*$/.test(lines[i])
  ) {
    para.push(lines[i]);
    i++;
  }
  html.push(`<p>${inline(para.join(" "))}</p>`);
}
closeLists();

const doc = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>
  :root { --blue:#002F65; --yellow:#FFDE00; --ink:#1c2530; --muted:#5b6675; --line:#e4e8ee; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: var(--ink); line-height: 1.55; font-size: 12px; margin: 0; padding: 0;
  }
  .wrap { max-width: 820px; margin: 0 auto; padding: 8px 0; }
  h1 { font-size: 24px; color: var(--blue); border-bottom: 4px solid var(--yellow); padding-bottom: 8px; margin: 24px 0 12px; }
  h2 { font-size: 18px; color: var(--blue); margin: 26px 0 8px; border-bottom: 1px solid var(--line); padding-bottom: 4px; }
  h3 { font-size: 14px; color: var(--ink); margin: 18px 0 6px; }
  p { margin: 8px 0; }
  a { color: var(--blue); }
  code { font-family: "SF Mono", Menlo, Consolas, monospace; background: #f2f4f7; padding: 1px 5px; border-radius: 4px; font-size: 0.9em; }
  pre { background: #0f1b2d; color: #e7eef7; padding: 12px 14px; border-radius: 8px; overflow-x: auto; font-size: 11px; line-height: 1.45; }
  pre code { background: transparent; color: inherit; padding: 0; }
  blockquote { margin: 10px 0; padding: 8px 14px; background: #fffbe6; border-left: 4px solid var(--yellow); color: #4a4a2e; border-radius: 0 6px 6px 0; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
  th, td { border: 1px solid var(--line); padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: var(--blue); color: #fff; font-weight: 600; }
  tr:nth-child(even) td { background: #f7f9fc; }
  ul, ol { margin: 8px 0; padding-left: 22px; }
  li { margin: 3px 0; }
  hr { border: none; border-top: 1px solid var(--line); margin: 18px 0; }
  @page { size: A4; margin: 16mm 14mm; }
  h1, h2, h3 { page-break-after: avoid; }
  table, pre, blockquote { page-break-inside: avoid; }
</style>
</head>
<body><div class="wrap">
${html.join("\n")}
</div></body>
</html>`;

writeFileSync(outPath, doc, "utf8");
console.log("HTML geschrieben:", outPath);
