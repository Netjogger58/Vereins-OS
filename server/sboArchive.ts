/**
 * SBO-Archiv Service
 * Zitt eng eege Kopie vum Handball4All-SBO-Bericht (PDF), well d'FLH d'Berichter
 * net méi zouverlässeg uweist. D'Kopie gëtt lokal/op Hetzner gespäichert an iwwer
 * de statesche Pad /sbo-archiv/... ausgeliwwert. `matches.sboUrl` bleift den
 * Original (Fallback), `matches.sboArchivePath` weist op eis Kopie.
 */

import { storage } from "./storage";
import { extractSboId } from "./flhImport";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Match } from "@shared/schema";

export function getArchiveDir(): string {
  return process.env.SBO_ARCHIVE_DIR
    ? path.resolve(process.env.SBO_ARCHIVE_DIR)
    : path.resolve(process.cwd(), "data", "sbo-archiv");
}

function seasonFolder(season?: string | null): string {
  return (season || "unknown").replace(/[^0-9A-Za-z_-]/g, "-");
}

/** Relativen Pad (season/<sGID>.pdf) fir e Match, oder null wann keng sGID. */
export function archivedRelPath(match: Match): string | null {
  const sboId = match.sboUrl ? extractSboId(match.sboUrl) : null;
  if (!sboId) return null;
  return `${seasonFolder(match.season)}/${sboId}.pdf`;
}

async function fetchPdf(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; M75-Manager/1.0)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000 || buf.subarray(0, 4).toString("latin1") !== "%PDF") {
    throw new Error("kee valabelt PDF (Bericht evtl. net méi verfügbar)");
  }
  return buf;
}

export interface ArchiveResult {
  success: boolean;
  message: string;
  path?: string;
  bytes?: number;
}

/** Archivéiert de SBO-Bericht vun engem eenzege Match. */
export async function archiveMatchSbo(
  matchId: number,
  opts: { force?: boolean } = {},
): Promise<ArchiveResult> {
  const match = await storage.getMatch(matchId);
  if (!match) return { success: false, message: "Spiel net fonnt" };
  if (!match.sboUrl) return { success: false, message: "Kee SBO-Link um Spill" };

  const rel = archivedRelPath(match);
  if (!rel) return { success: false, message: "Keng sGID am SBO-Link" };

  const abs = path.join(getArchiveDir(), rel);
  const servePath = "/sbo-archiv/" + rel;

  if (!opts.force && match.sboArchivePath && fs.existsSync(abs)) {
    return { success: true, message: "Scho archivéiert", path: match.sboArchivePath };
  }

  try {
    const buf = await fetchPdf(match.sboUrl);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, buf);
    await storage.updateMatch(matchId, {
      sboArchivePath: servePath,
      sboArchivedAt: new Date().toISOString(),
    });
    return { success: true, message: `Archivéiert (${buf.length} B)`, path: servePath, bytes: buf.length };
  } catch (error) {
    return { success: false, message: String(error instanceof Error ? error.message : error) };
  }
}

export interface BatchArchiveResult {
  total: number;
  success: number;
  skipped: number;
  failed: number;
  errors: string[];
}

/** Archivéiert d'SBO-Berichter vu villen Matcher (mat Rate-Limiting). */
export async function batchArchiveSbo(
  filter: { teamId?: number; season?: string; competition?: string } = {},
  opts: { force?: boolean } = {},
  onProgress?: (current: number, total: number, message: string) => void,
): Promise<BatchArchiveResult> {
  const matches = (await storage.listMatches(filter)).filter((m) => !!m.sboUrl);
  const result: BatchArchiveResult = { total: matches.length, success: 0, skipped: 0, failed: 0, errors: [] };

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    if (onProgress) onProgress(i + 1, matches.length, `${m.homeTeam} - ${m.awayTeam}`);

    if (!opts.force && m.sboArchivePath) {
      const abs = path.join(getArchiveDir(), archivedRelPath(m) || "");
      if (fs.existsSync(abs)) { result.skipped++; continue; }
    }

    if (i > 0) await new Promise((r) => setTimeout(r, 1200)); // freundlech zu FLH-Server

    const r = await archiveMatchSbo(m.id, opts);
    if (r.success && r.bytes) result.success++;
    else if (r.success) result.skipped++;
    else { result.failed++; result.errors.push(`${m.homeTeam} - ${m.awayTeam}: ${r.message}`); }
  }

  return result;
}
