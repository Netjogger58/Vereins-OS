/**
 * FLH (Fédération Luxembourgeoise de Handball) Import Service
 * Scrapes player statistics from handball4all.de / spo.handball4all.de
 */

import { storage } from "./storage";
import type { InsertMatch, InsertMatchGoal, InsertMatchPenalty } from "@shared/schema";

export interface FLHPlayerStat {
  number?: number;
  name: string;
  goals: number;
  assists: number;
  penalties: number; // 2-minute penalties
  fieldGoals: number;
  penaltyGoals: number;
  sevenMeters: number;
  isMersch75: boolean;
}

export interface FLHMatchData {
  sboId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  competition: string;
  homePlayers: FLHPlayerStat[];
  awayPlayers: FLHPlayerStat[];
  venue?: string;
}

/**
 * Extract sGID from handball4all URL
 */
export function extractSboId(url: string): string | null {
  const match = url.match(/sGID=(\d+)/);
  return match ? match[1] : null;
}

/**
 * Parse FLH HTML content and extract match data
 * Note: This is a parser for the HTML structure of handball4all.de
 */
export function parseFLHHtml(html: string, url: string): FLHMatchData | null {
  const sboId = extractSboId(url) || "unknown";
  
  try {
    // Extract team names
    const homeTeamMatch = html.match(/<h1[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?(\d+):(\d+)[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);
    const teamMatch = html.match(/<div[^>]*class="team-name[^"]*"[^>]*>([^<]+)<\/div>/gi);
    
    let homeTeam = "Unknown";
    let awayTeam = "Unknown";
    let homeScore = 0;
    let awayScore = 0;
    
    if (homeTeamMatch) {
      homeTeam = homeTeamMatch[1].trim();
      awayTeam = homeTeamMatch[4].trim();
      homeScore = parseInt(homeTeamMatch[2]) || 0;
      awayScore = parseInt(homeTeamMatch[3]) || 0;
    }
    
    // Detect if Mersch75 is playing
    const isMerschHome = homeTeam.toLowerCase().includes("mersch");
    const isMerschAway = awayTeam.toLowerCase().includes("mersch");
    const competition = detectCompetition(html, homeTeam, awayTeam);
    
    // Parse player statistics
    const homePlayers = parsePlayerTable(html, "home", isMerschHome);
    const awayPlayers = parsePlayerTable(html, "away", isMerschAway);
    
    // Extract date
    const dateMatch = html.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    let matchDate = new Date().toISOString().slice(0, 10);
    if (dateMatch) {
      matchDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    }
    
    // Extract venue
    const venueMatch = html.match(/Ort:\s*([^<\n]+)/i) || html.match(/Location:\s*([^<\n]+)/i);
    const venue = venueMatch ? venueMatch[1].trim() : undefined;
    
    return {
      sboId,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      matchDate,
      competition,
      homePlayers,
      awayPlayers,
      venue,
    };
  } catch (error) {
    console.error("Failed to parse FLH HTML:", error);
    return null;
  }
}

/**
 * Parse player statistics table from FLH HTML
 */
function parsePlayerTable(html: string, side: "home" | "away", isMersch75: boolean): FLHPlayerStat[] {
  const players: FLHPlayerStat[] = [];
  
  try {
    // Look for table rows with player data
    // FLH typically uses tables with player statistics
    const tableRegex = side === "home" 
      ? /<table[^>]*>[\s\S]*?Heim[\s\S]*?<\/table>/
      : /<table[^>]*>[\s\S]*?Gast[\s\S]*?<\/table>/;
    
    const tableMatch = html.match(tableRegex);
    if (!tableMatch) return players;
    
    const tableHtml = tableMatch[0];
    
    // Extract rows
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];
      
      // Skip header rows
      if (rowHtml.includes("<th") || rowHtml.includes("Nummer")) continue;
      
      // Extract cells
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g;
      const cells: string[] = [];
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        // Clean HTML tags from content
        const content = cellMatch[1].replace(/<[^>]*>/g, "").trim();
        cells.push(content);
      }
      
      if (cells.length >= 4) {
        const number = parseInt(cells[0]) || undefined;
        const name = cells[1];
        const goals = parseInt(cells[2]) || 0;
        const assists = parseInt(cells[3]) || 0;
        
        players.push({
          number,
          name,
          goals,
          assists,
          penalties: 0, // Will be extracted from separate table
          fieldGoals: 0,
          penaltyGoals: 0,
          sevenMeters: 0,
          isMersch75,
        });
      }
    }
  } catch (error) {
    console.error(`Failed to parse ${side} player table:`, error);
  }
  
  return players;
}

/**
 * Detect competition from match data
 */
function detectCompetition(html: string, homeTeam: string, awayTeam: string): string {
  const text = (homeTeam + " " + awayTeam).toLowerCase();
  
  if (text.includes("herren") || text.includes("h-pro")) return "H-PRO";
  if (text.includes("damen") || text.includes("d-pro") || text.includes("dame")) return "D-PRO";
  if (text.includes("u15") || text.includes("u 15")) return "U15";
  if (text.includes("u13") || text.includes("u 13")) return "U13";
  if (text.includes("u11") || text.includes("u 11")) return "U11";
  if (text.includes("u9") || text.includes("u 9")) return "U9";
  if (text.includes("u7") || text.includes("u 7")) return "U7";
  if (text.includes("pokal") || text.includes("cup")) return "Pokal";
  
  // Try to extract from HTML
  const compMatch = html.match(/(H-PRO|D-PRO|U\d+|Pokal)/i);
  if (compMatch) return compMatch[1].toUpperCase();
  
  return "Unknown";
}

/**
 * Import match from FLH URL and save to database
 */
export async function importMatchFromFLH(
  url: string, 
  teamId: number, 
  season: string,
  htmlContent?: string
): Promise<{ success: boolean; matchId?: number; message: string }> {
  try {
    // Fetch HTML if not provided
    let html = htmlContent;
    if (!html) {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (!response.ok) {
        return { success: false, message: `Failed to fetch: ${response.status}` };
      }
      html = await response.text();
    }
    
    // Parse data
    const data = parseFLHHtml(html, url);
    if (!data) {
      return { success: false, message: "Failed to parse match data" };
    }
    
    // Create match
    const now = new Date().toISOString();
    const match: InsertMatch = {
      teamId,
      competition: data.competition,
      matchDate: data.matchDate,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      sboUrl: url,
      venue: data.venue,
      season,
      status: "finished",
      isHome: data.homeTeam.toLowerCase().includes("mersch"),
      createdAt: now,
      updatedAt: now,
    };
    
    const savedMatch = await storage.createMatch(match);
    
    // Import goals and penalties
    await importPlayerStats(savedMatch.id, data.homePlayers, "home", url);
    await importPlayerStats(savedMatch.id, data.awayPlayers, "away", url);
    
    return { 
      success: true, 
      matchId: savedMatch.id, 
      message: `Imported ${data.homeTeam} vs ${data.awayTeam} (${data.homeScore}:${data.awayScore})` 
    };
  } catch (error) {
    console.error("FLH import failed:", error);
    return { success: false, message: String(error) };
  }
}

/**
 * Import player statistics into database
 */
async function importPlayerStats(
  matchId: number, 
  players: FLHPlayerStat[], 
  side: "home" | "away",
  sourceUrl: string
): Promise<void> {
  const now = new Date().toISOString();
  
  for (const player of players) {
    // Find matching member by name (fuzzy match)
    const member = await findMemberByName(player.name);
    
    // Create goals record
    if (player.goals > 0 || player.assists > 0) {
      const goal: InsertMatchGoal = {
        matchId,
        playerId: member?.id || null,
        playerName: player.name,
        teamSide: side,
        goalType: "field", // Default, can be refined later
        assistPlayerId: null,
        isOwnGoal: false,
        sourceUrl,
        importedAt: now,
        createdAt: now,
      };
      
      await storage.createMatchGoal(goal);
    }
    
    // Create penalties record
    if (player.penalties > 0) {
      const penalty: InsertMatchPenalty = {
        matchId,
        playerId: member?.id || null,
        playerName: player.name,
        teamSide: side,
        minute: 0, // Not always available in FLH reports
        duration: 2,
        sourceUrl,
        createdAt: now,
      };
      
      await storage.createMatchPenalty(penalty);
    }
  }
}

/**
 * Find member by name (fuzzy matching)
 */
async function findMemberByName(name: string): Promise<{ id: number } | null> {
  try {
    // Simple name matching - can be improved with fuzzy logic
    const members = await storage.listMembers();
    const normalizedName = name.toLowerCase().trim();
    
    for (const member of members) {
      const fullName = member.name.toLowerCase();
      if (fullName.includes(normalizedName) || normalizedName.includes(fullName)) {
        return { id: member.id };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Batch import multiple FLH URLs
 */
export async function batchImportFLH(
  urls: string[], 
  teamId: number, 
  season: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = { success: 0, failed: 0, errors: [] as string[] };
  
  for (const url of urls) {
    const result = await importMatchFromFLH(url, teamId, season);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push(`${url}: ${result.message}`);
    }
    
    // Rate limiting - be nice to FLH servers
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return results;
}
