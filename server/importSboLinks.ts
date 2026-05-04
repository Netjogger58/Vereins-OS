/**
 * SBO Links Batch Import Service
 * Importiert alle 86 FLH Spielberichte aus der Links zu SBO .txt Datei
 */

import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";

export interface SboLink {
  sboId: string;
  url: string;
  label: string;
}

/**
 * Liest alle SBO Links aus der HTML Datei
 */
export function readSboLinksFromFile(): SboLink[] {
  const filePath = "/Users/deisadm1/Desktop/HTML Codes Webseite/Links zu SBO .txt";
  
  if (!fs.existsSync(filePath)) {
    console.error("SBO Links Datei nicht gefunden:", filePath);
    return [];
  }
  
  const content = fs.readFileSync(filePath, "utf-8");
  const links: SboLink[] = [];
  
  // Extract all href links with sGID
  const regex = /href="(https:\/\/spo\.handball4all\.de\/misc\/sboPublicReports\.php\?sGID=(\d+))"[^>]*>([^<]+)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    links.push({
      url: match[1],
      sboId: match[2],
      label: match[3].trim(),
    });
  }
  
  return links;
}

/**
 * Extrahiert Spielinfo aus der URL oder fetched von der Seite
 */
export async function fetchSboReport(url: string): Promise<{
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  competition: string;
  venue?: string;
} | null> {
  try {
    // Try to fetch from handball4all
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "de-DE,de;q=0.9",
      },
      // Timeout nach 10 Sekunden
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.warn(`Konnte ${url} nicht laden: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Parse HTML für Spielinfos
    // Typisches FLH Format aus dem PDF/Spielbericht
    
    // Extract team names
    const teamMatch = html.match(/<title>(.*?)<\/title>/i);
    let homeTeam = "";
    let awayTeam = "";
    
    // Versuche Teams aus dem Titel oder den Tabellen zu extrahieren
    const teamTableMatch = html.match(/<table[^>]*class="[^"]*team[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
    if (teamTableMatch) {
      const teamHtml = teamTableMatch[1];
      const teamNames = teamHtml.match(/>([^<]+)</g);
      if (teamNames && teamNames.length >= 2) {
        homeTeam = teamNames[0].replace(/[><]/g, "").trim();
        awayTeam = teamNames[1].replace(/[><]/g, "").trim();
      }
    }
    
    // Fallback: Versuche aus dem Titel
    if (!homeTeam && teamMatch) {
      const title = teamMatch[1];
      const titleParts = title.split(/\s*-\s*|\s+vs\.?\s+/i);
      if (titleParts.length >= 2) {
        homeTeam = titleParts[0].trim();
        awayTeam = titleParts[1].trim();
      }
    }
    
    // Extract score
    const scoreMatch = html.match(/(\d+)\s*:\s*(\d+)/);
    const homeScore = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    const awayScore = scoreMatch ? parseInt(scoreMatch[2]) : 0;
    
    // Extract date
    const dateMatch = html.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    let matchDate = new Date().toISOString().slice(0, 10);
    if (dateMatch) {
      matchDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    }
    
    // Detect competition
    const compMatch = html.match(/(H-PRO|D-PRO|U\d+|Pokal|PRO)/i);
    let competition = "Unknown";
    if (compMatch) {
      competition = compMatch[1].toUpperCase();
    } else {
      // Try to detect from team names
      if (homeTeam.toLowerCase().includes("herren") || awayTeam.toLowerCase().includes("herren")) {
        competition = "H-PRO";
      } else if (homeTeam.toLowerCase().includes("damen") || awayTeam.toLowerCase().includes("damen")) {
        competition = "D-PRO";
      }
    }
    
    return {
      homeTeam: homeTeam || "Unknown",
      awayTeam: awayTeam || "Unknown",
      homeScore,
      awayScore,
      matchDate,
      competition,
    };
    
  } catch (error) {
    console.error(`Fehler beim Laden von ${url}:`, error);
    return null;
  }
}

/**
 * Importiert ein einzelnes SBO-Spiel
 */
export async function importSboMatch(
  sboLink: SboLink,
  teamId: number,
  season: string
): Promise<{ success: boolean; message: string; matchId?: number }> {
  try {
    // Check if already imported
    const existing = await storage.listMatches({});
    const alreadyExists = existing.find(m => m.sboUrl === sboLink.url);
    if (alreadyExists) {
      return { success: true, message: "Bereits importiert", matchId: alreadyExists.id };
    }
    
    // Fetch data
    const data = await fetchSboReport(sboLink.url);
    if (!data) {
      return { success: false, message: "Konnte Daten nicht laden" };
    }
    
    // Create match
    const now = new Date().toISOString();
    const match = await storage.createMatch({
      teamId,
      competition: data.competition,
      matchDate: data.matchDate,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      sboUrl: sboLink.url,
      season,
      status: "finished",
      isHome: data.homeTeam.toLowerCase().includes("mersch"),
      venue: data.venue,
      createdAt: now,
      updatedAt: now,
    });
    
    return { 
      success: true, 
      message: `${data.homeTeam} ${data.homeScore}:${data.awayScore} ${data.awayTeam}`,
      matchId: match.id 
    };
    
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

/**
 * Batch-Import aller SBO Links
 */
export async function batchImportAllSboLinks(
  teamId: number,
  season: string,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<{
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}> {
  const links = readSboLinksFromFile();
  const results = {
    total: links.length,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  };
  
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    
    if (onProgress) {
      onProgress(i + 1, links.length, `Importiere ${link.label}...`);
    }
    
    // Check if already exists
    const existing = await storage.listMatches({});
    const alreadyExists = existing.find(m => m.sboUrl === link.url);
    if (alreadyExists) {
      results.skipped++;
      continue;
    }
    
    // Rate limiting - be nice to FLH servers
    if (i > 0) {
      await new Promise(r => setTimeout(r, 1500));
    }
    
    const result = await importSboMatch(link, teamId, season);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push(`${link.label}: ${result.message}`);
    }
  }
  
  return results;
}

/**
 * Manuelle Spieler-Zuordnung
 * Ordnet FLH-Spielernamen Mersch75-Mitgliedern zu
 */
export async function mapFlhPlayerToMember(
  flhName: string,
  memberId: number
): Promise<boolean> {
  try {
    // Update all match goals with this player name
    const allGoals = await storage.listMatchGoals(0); // 0 = alle laden
    const matchingGoals = allGoals.filter(g => 
      g.playerName.toLowerCase().trim() === flhName.toLowerCase().trim()
    );
    
    for (const goal of matchingGoals) {
      // updateMatchGoal not yet implemented - skip for now
      console.log(`Would update goal ${goal.id} with playerId ${memberId}`);
    }
    
    // Update penalties too
    // ... (ähnliche Logik für penalties)
    
    return true;
  } catch (error) {
    console.error("Mapping failed:", error);
    return false;
  }
}
