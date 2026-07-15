import {
  users,
  teams,
  trainerCodes,
  type TrainerCode,
  type InsertTrainerCode,
  members,
  attendance,
  announcements,
  events,
  availability,
  meetings,
  accounts,
  transactions,
  playerFlags,
  memberFunctions,
  type MemberFunction,
  type InsertMemberFunction,
  memberCategories,
  type MemberCategory,
  type InsertMemberCategory,
  type User,
  type InsertUser,
  type Team,
  type InsertTeam,
  type Member,
  type InsertMember,
  type Attendance,
  type InsertAttendance,
  type Announcement,
  type InsertAnnouncement,
  type Event,
  type InsertEvent,
  type Availability,
  type InsertAvailability,
  type Meeting,
  type InsertMeeting,
  type Account,
  type InsertAccount,
  type Transaction,
  type InsertTransaction,
  type PlayerFlag,
  type InsertPlayerFlag,
  nominations,
  type Nomination,
  type InsertNomination,
  chatMessages,
  type ChatMessage,
  type InsertChatMessage,
  auditLogs,
  type AuditLog,
  type InsertAuditLog,
  feeRules,
  type FeeRule,
  type InsertFeeRule,
  memberFees,
  type MemberFee,
  type InsertMemberFee,
  feePayments,
  type FeePayment,
  type InsertFeePayment,
  memberCards,
  type MemberCard,
  type InsertMemberCard,
  activityLogs,
  type ActivityLog,
  type InsertActivityLog,
  userNotifications,
  type UserNotification,
  type InsertUserNotification,
  documentSignatures,
  type DocumentSignature,
  type InsertDocumentSignature,
  sepaMandates,
  type SepaMandate,
  type InsertSepaMandate,
  matchLineups,
  type MatchLineup,
  type InsertMatchLineup,
  trainingAttendance,
  type TrainingAttendance,
  type InsertTrainingAttendance,
  familyLinks,
  type FamilyLink,
  type InsertFamilyLink,
  documentExpiries,
  type DocumentExpiry,
  type InsertDocumentExpiry,
  emailSettings,
  type EmailSettings,
  type InsertEmailSettings,
  emails,
  type Email,
  type InsertEmail,
  documents,
  type Document,
  type InsertDocument,
  registrations,
  type Registration,
  type InsertRegistration,
  trainingSchedules,
  type TrainingSchedule,
  type InsertTrainingSchedule,
  generatedEvents,
  type GeneratedEvent,
  type InsertGeneratedEvent,
  matches,
  type Match,
  type InsertMatch,
  matchPenalties,
  type MatchPenalty,
  type InsertMatchPenalty,
  standings,
  type Standing,
  type InsertStanding,
  matchGoals,
  type MatchGoal,
  type InsertMatchGoal,
  magicLinks,
  type MagicLink,
  type InsertMagicLink,
  // ARCHIVE FEATURES
  archiveSeasons,
  archiveTeams,
  archiveMembers,
  archiveMatches,
  archiveEvents,
  archiveExports,
  type ArchiveSeason,
  type InsertArchiveSeason,
  type ArchiveTeam,
  type InsertArchiveTeam,
  type ArchiveMember,
  type InsertArchiveMember,
  type ArchiveMatch,
  type InsertArchiveMatch,
  type ArchiveEvent,
  type InsertArchiveEvent,
  type ArchiveExport,
  type InsertArchiveExport,
  // 10 NEUE FEATURES
  carpools,
  carpoolPassengers,
  type Carpool,
  type InsertCarpool,
  type CarpoolPassenger,
  type InsertCarpoolPassenger,
  referees,
  refereeAssignments,
  type Referee,
  type InsertReferee,
  type RefereeAssignment,
  type InsertRefereeAssignment,
  inventoryItems,
  inventoryLoans,
  type InventoryItem,
  type InsertInventoryItem,
  type InventoryLoan,
  type InsertInventoryLoan,
  injuries,
  rehabSessions,
  type Injury,
  type InsertInjury,
  type RehabSession,
  type InsertRehabSession,
  polls,
  pollOptions,
  pollVotes,
  type Poll,
  type InsertPoll,
  type PollOption,
  type InsertPollOption,
  type PollVote,
  type InsertPollVote,
  opponents,
  opponentHistory,
  type Opponent,
  type InsertOpponent,
  type OpponentHistory,
  type InsertOpponentHistory,
  matchReports,
  type MatchReport,
  type InsertMatchReport,
  dutyRosters,
  dutySwaps,
  type DutyRoster,
  type InsertDutyRoster,
  type DutySwap,
  type InsertDutySwap,
  fanContent,
  liveTicker,
  type FanContent,
  type InsertFanContent,
  type LiveTicker,
  type InsertLiveTicker,
  externalCalendars,
  calendarSyncLogs,
  type ExternalCalendar,
  type InsertExternalCalendar,
  type CalendarSyncLog,
  type InsertCalendarSyncLog,
  sponsors,
  galleryPhotos,
  duties,
  facilities,
  facilityBookings,
  shopProducts,
  shopOrders,
  waitlistEntries,
  budgetItems,
  newsletters,
  gdprConsents,
  gdprDeletionRequests,
  websitePages,
  type Sponsor,
  type InsertSponsor,
  type GalleryPhoto,
  type InsertGalleryPhoto,
  type Duty,
  type InsertDuty,
  type Facility,
  type InsertFacility,
  type FacilityBooking,
  type InsertFacilityBooking,
  type ShopProduct,
  type InsertShopProduct,
  type ShopOrder,
  type InsertShopOrder,
  type WaitlistEntry,
  type InsertWaitlistEntry,
  type BudgetItem,
  type InsertBudgetItem,
  type Newsletter,
  type InsertNewsletter,
  type GdprConsent,
  type InsertGdprConsent,
  type GdprDeletionRequest,
  type InsertGdprDeletionRequest,
  type WebsitePage,
  type InsertWebsitePage,
  eventRsvps,
  type EventRsvp,
  type InsertEventRsvp,
  qrCheckins,
  lineups,
  flhSyncLogs,
  sepaTransactions,
  type QrCheckin,
  type InsertQrCheckin,
  type Lineup,
  type InsertLineup,
  type FlhSyncLog,
  type InsertFlhSyncLog,
  type SepaTransaction,
  type InsertSepaTransaction,
  budgets,
  type Budget,
  type InsertBudget,
  invoices,
  invoicePayments,
  type Invoice,
  type InsertInvoice,
  type InvoicePayment,
  type InsertInvoicePayment,
  donations,
  type Donation,
  type InsertDonation,
  exercises,
  exerciseMedia,
  type Exercise,
  type InsertExercise,
  type ExerciseMedia,
  type InsertExerciseMedia,
  matchEvents,
  type MatchEvent,
  type InsertMatchEvent,
  trialRegistrations,
  type TrialRegistration,
  type InsertTrialRegistration,
} from "@shared/schema";
import { isActiveClubMember } from "@shared/memberStatus";
import "dotenv/config";
import { drizzle as drizzleSqlite, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import Database from "better-sqlite3";
import { Client as PgClient } from "pg";

type AnyDrizzleDatabase = BetterSQLite3Database;
import * as waitlistService from "./services/waitlist.service";
import * as gdprService from "./services/gdpr.service";

const isoToday = () => new Date().toISOString().slice(0, 10);
import { eq, and, or, like, desc, asc, sql, isNull, gte, lte, inArray, type SQL } from "drizzle-orm";
import bcrypt from "bcryptjs";

export let sqlite: any;
export let db: BetterSQLite3Database = undefined as unknown as BetterSQLite3Database;

export async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const client = new PgClient({ connectionString: databaseUrl });
    await client.connect();
    db = drizzlePg(client) as unknown as BetterSQLite3Database;
    console.log("[db] PostgreSQL verbunden");
    return;
  }
  const dbPath = process.env.SQLITE_PATH || "data.db";
  sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  db = drizzleSqlite(sqlite);
  init();
  runMigrations();
  console.log(`[db] SQLite initialisiert: ${dbPath}`);
}

// Create tables (idempotent)
function init() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trusted_devices (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      last_used INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      team_id INTEGER,
      phone TEXT,
      country_code TEXT DEFAULT '+352',
      photo_url TEXT,
      qualifications TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      ical_token TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      trainer_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS trainer_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      user_id INTEGER,
      all_teams INTEGER NOT NULL DEFAULT 0,
      team_ids TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      birthdate TEXT,
      address TEXT,
      team_id INTEGER,
      license_number TEXT,
      membership_status TEXT NOT NULL DEFAULT 'active',
      photo_url TEXT,
      face_descriptor TEXT,
      user_id INTEGER,
      card_id TEXT,
      club_function TEXT,
      nationality TEXT,
      internal_category TEXT,
      flh_category TEXT,
      team_category TEXT,
      pass_number TEXT,
      matricule TEXT,
      medico_next TEXT,
      join_date TEXT,
      raw_data TEXT
    );
    CREATE TABLE IF NOT EXISTS member_functions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      function TEXT NOT NULL,
      code INTEGER,
      qualification TEXT,
      team_id INTEGER,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS member_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      cat_code INTEGER NOT NULL,
      kind TEXT NOT NULL DEFAULT 'surclassement',
      note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      present INTEGER NOT NULL,
      status TEXT,
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      target_role TEXT NOT NULL DEFAULT 'all',
      target_team_id INTEGER,
      pinned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      team_id INTEGER,
      date TEXT NOT NULL,
      time TEXT,
      end_time TEXT,
      location TEXT,
      description TEXT,
      jitsi_room TEXT
    );
    CREATE TABLE IF NOT EXISTS availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      available INTEGER NOT NULL,
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      jitsi_room TEXT NOT NULL,
      agenda TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      author_id INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'intern',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS player_flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      flag TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS nominations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      nominated_by_id INTEGER NOT NULL,
      response TEXT,
      reason TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'LOW',
      ip_address TEXT NOT NULL,
      path TEXT NOT NULL,
      method TEXT NOT NULL,
      user_id INTEGER,
      user_agent TEXT,
      details TEXT,
      timestamp TEXT NOT NULL,
      email_alert_sent INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity);
    CREATE INDEX IF NOT EXISTS idx_audit_ip ON audit_logs(ip_address);
    
    -- Fee Module Tables
    CREATE TABLE IF NOT EXISTS fee_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      applies_to_teams TEXT,
      min_age INTEGER,
      max_age INTEGER,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS member_fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      fee_rule_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      paid_amount REAL NOT NULL DEFAULT 0,
      due_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS fee_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_fee_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'transfer',
      reference TEXT,
      notes TEXT,
      created_by_id INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_member_fees_member ON member_fees(member_id);
    CREATE INDEX IF NOT EXISTS idx_member_fees_year ON member_fees(year);
    CREATE INDEX IF NOT EXISTS idx_fee_payments_fee ON fee_payments(member_fee_id);
    
    -- Email Module
    CREATE TABLE IF NOT EXISTS email_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      smtp_host TEXT NOT NULL,
      smtp_port INTEGER NOT NULL DEFAULT 587,
      smtp_user TEXT NOT NULL,
      smtp_password TEXT NOT NULL,
      smtp_secure INTEGER NOT NULL DEFAULT 0,
      from_name TEXT NOT NULL DEFAULT 'M75 Manager',
      from_email TEXT NOT NULL,
      reply_to TEXT,
      enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_email TEXT NOT NULL,
      to_name TEXT,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      template TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      sent_at TEXT,
      created_at TEXT NOT NULL,
      user_id INTEGER,
      member_id INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
    CREATE INDEX IF NOT EXISTS idx_emails_user ON emails(user_id);
    
    -- Documents Module
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      tags TEXT,
      member_id INTEGER,
      uploaded_by_id INTEGER NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'private',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_documents_member ON documents(member_id);
    CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
    
    -- Registrations Module
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      birthdate TEXT,
      address TEXT,
      team_id INTEGER,
      parent_name TEXT,
      parent_email TEXT,
      parent_phone TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      processed_by_id INTEGER,
      processed_at TEXT,
      processed_notes TEXT,
      member_id INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
    CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);

    -- Training Schedules Module
    CREATE TABLE IF NOT EXISTS training_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT NOT NULL,
      hall TEXT,
      season_start TEXT NOT NULL,
      season_end TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_training_schedules_team ON training_schedules(team_id);
    CREATE INDEX IF NOT EXISTS idx_training_schedules_active ON training_schedules(active);

    -- Generated Events (Tracking)
    CREATE TABLE IF NOT EXISTS generated_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      generated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_generated_events_schedule ON generated_events(schedule_id);

    -- Matches Module (Spiele & Ergebnisse)
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      competition TEXT NOT NULL,
      match_type TEXT NOT NULL DEFAULT 'league',
      match_date TEXT NOT NULL,
      match_time TEXT,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      sbo_url TEXT,
      rtl_url TEXT,
      venue TEXT,
      is_home INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'scheduled',
      notes TEXT,
      season TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_matches_team ON matches(team_id);
    CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
    CREATE INDEX IF NOT EXISTS idx_matches_season ON matches(season);

    -- Match Goals (Torschützen)
    CREATE TABLE IF NOT EXISTS match_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      player_id INTEGER,
      player_name TEXT NOT NULL,
      team_side TEXT NOT NULL,
      minute INTEGER,
      goal_type TEXT DEFAULT 'field',
      assist_player_id INTEGER,
      assist_player_name TEXT,
      is_own_goal INTEGER DEFAULT 0,
      source_url TEXT,
      imported_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_match_goals_match ON match_goals(match_id);
    CREATE INDEX IF NOT EXISTS idx_match_goals_player ON match_goals(player_id);

    -- Match Penalties (Zeitstrafen)
    CREATE TABLE IF NOT EXISTS match_penalties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      player_id INTEGER,
      player_name TEXT NOT NULL,
      team_side TEXT NOT NULL,
      minute INTEGER NOT NULL,
      duration INTEGER NOT NULL DEFAULT 2,
      reason TEXT,
      source_url TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_match_penalties_match ON match_penalties(match_id);

    -- Standings (Tabellen)
    CREATE TABLE IF NOT EXISTS standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      competition TEXT NOT NULL,
      season TEXT NOT NULL,
      position INTEGER NOT NULL,
      team_name TEXT NOT NULL,
      played INTEGER NOT NULL DEFAULT 0,
      won INTEGER NOT NULL DEFAULT 0,
      drawn INTEGER NOT NULL DEFAULT 0,
      lost INTEGER NOT NULL DEFAULT 0,
      goals_for INTEGER NOT NULL DEFAULT 0,
      goals_against INTEGER NOT NULL DEFAULT 0,
      goal_difference INTEGER NOT NULL DEFAULT 0,
      points INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_standings_competition ON standings(competition, season);
    
    -- Archive Tables (Saison-Archiv)
    CREATE TABLE IF NOT EXISTS archive_seasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      description TEXT,
      active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      archived_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS archive_teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      trainer_name TEXT,
      trainer_qualifications TEXT,
      final_rank INTEGER,
      matches_played INTEGER,
      matches_won INTEGER,
      matches_drawn INTEGER,
      matches_lost INTEGER,
      goals_for INTEGER,
      goals_against INTEGER,
      points INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS archive_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      birthdate TEXT,
      license_number TEXT,
      position TEXT,
      goals INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      yellow_cards INTEGER DEFAULT 0,
      red_cards INTEGER DEFAULT 0,
      matches_played INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS archive_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      opponent TEXT NOT NULL,
      venue TEXT,
      location TEXT,
      home_goals INTEGER,
      away_goals INTEGER,
      result TEXT,
      scorers TEXT,
      notes TEXT,
      match_report TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS archive_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      team_id INTEGER,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      description TEXT,
      attendance TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS archive_exports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      export_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT,
      file_data TEXT,
      exported_by INTEGER,
      exported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      download_count INTEGER DEFAULT 0,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sponsors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      level TEXT DEFAULT "bronze",
      contract_start TEXT,
      contract_end TEXT,
      logo_url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS gallery_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      album TEXT NOT NULL DEFAULT "general",
      title TEXT,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      uploaded_by INTEGER,
      event_id INTEGER,
      match_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS duties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT,
      location TEXT,
      assigned_to INTEGER,
      team_id INTEGER,
      event_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      capacity INTEGER,
      location TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS facility_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      booked_by INTEGER,
      team_id INTEGER,
      purpose TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      qr_code TEXT UNIQUE,
      purchase_date TEXT,
      purchase_price INTEGER,
      condition TEXT DEFAULT 'good',
      location TEXT,
      total_quantity INTEGER NOT NULL DEFAULT 1,
      available_quantity INTEGER NOT NULL DEFAULT 1,
      maintenance_interval INTEGER,
      last_maintenance TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS inventory_loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      loaned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      due_date TEXT,
      returned_at TEXT,
      condition TEXT,
      checked_out_by INTEGER,
      checked_in_by INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'single',
      anonymous INTEGER NOT NULL DEFAULT 0,
      team_id INTEGER,
      created_by INTEGER NOT NULL,
      starts_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ends_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS poll_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id INTEGER NOT NULL,
      option_text TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS poll_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id INTEGER NOT NULL,
      option_id INTEGER NOT NULL,
      user_id INTEGER,
      voted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS opponents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      short_name TEXT,
      logo_url TEXT,
      venue TEXT,
      contact_person TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      notes TEXT,
      strengths TEXT,
      weaknesses TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS opponent_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opponent_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      our_score INTEGER NOT NULL,
      their_score INTEGER NOT NULL,
      result TEXT NOT NULL,
      match_notes TEXT,
      key_players TEXT,
      tactics TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS carpools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      departure_time TEXT NOT NULL,
      departure_location TEXT NOT NULL,
      available_seats INTEGER NOT NULL DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'open',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS carpool_passengers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carpool_id INTEGER NOT NULL,
      passenger_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      season TEXT,
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      paid_amount REAL NOT NULL DEFAULT 0,
      paid_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS invoice_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      paid_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      note TEXT
    );
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_name TEXT NOT NULL,
      donor_email TEXT,
      amount REAL NOT NULL,
      campaign TEXT,
      note TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      receipt_sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'technique',
      tags TEXT,
      min_age INTEGER,
      max_age INTEGER,
      duration_minutes INTEGER,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS exercise_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT,
      media_type TEXT NOT NULL DEFAULT 'image',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS match_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      minute INTEGER,
      player_id INTEGER,
      description TEXT,
      team_side TEXT NOT NULL DEFAULT 'home',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS trial_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_name TEXT NOT NULL,
      age INTEGER,
      parent_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      team_category TEXT,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS shop_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT DEFAULT "clothing",
      sizes TEXT,
      stock INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS shop_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      size TEXT,
      status TEXT DEFAULT "pending",
      total_price REAL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS waitlist_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      team_id INTEGER NOT NULL,
      position TEXT,
      notes TEXT,
      status TEXT DEFAULT "waiting",
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS budget_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      description TEXT,
      planned_amount REAL NOT NULL DEFAULT 0,
      actual_amount REAL DEFAULT 0,
      year INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS newsletters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      template TEXT,
      status TEXT DEFAULT "draft",
      sent_at TEXT,
      recipient_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS gdpr_consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      consent_type TEXT NOT NULL,
      consented INTEGER NOT NULL DEFAULT 1,
      consented_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS website_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      published INTEGER DEFAULT 0,
      updated_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT "pending",
      guests INTEGER DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS qr_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      member_id INTEGER,
      user_id INTEGER,
      checkin_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      method TEXT DEFAULT "qr",
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS member_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      card_number TEXT NOT NULL UNIQUE,
      qr_code_data TEXT NOT NULL,
      valid_from TEXT NOT NULL,
      valid_until TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      issued_by INTEGER
    );
    CREATE TABLE IF NOT EXISTS lineups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      formation TEXT NOT NULL,
      notes TEXT,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS flh_sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sync_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT "pending",
      records_processed INTEGER DEFAULT 0,
      records_failed INTEGER DEFAULT 0,
      error_message TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sepa_mandates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      mandate_reference TEXT NOT NULL UNIQUE,
      iban TEXT NOT NULL,
      bic TEXT,
      account_holder TEXT NOT NULL,
      signed_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT "active",
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sepa_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mandate_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT "EUR",
      description TEXT NOT NULL,
      execution_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT "pending",
      sepa_xml TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ─── Lightweight migrations (idempotent) ────────────────
// SQLite CREATE TABLE IF NOT EXISTS does not add new columns to existing tables,
// so we add them defensively here for already-existing databases.
function safeAddColumn(table: string, column: string, definition: string) {
  try {
    const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!cols.some((c) => c.name === column)) {
      sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  } catch (e) {
    console.error(`[migrate] failed to add ${table}.${column}:`, e);
  }
}

function runMigrations() {
  safeAddColumn("members", "card_id", "TEXT");
  safeAddColumn("members", "club_function", "TEXT");
  safeAddColumn("members", "nationality", "TEXT");
  safeAddColumn("members", "internal_category", "TEXT");
  safeAddColumn("members", "flh_category", "TEXT");
  safeAddColumn("members", "team_category", "TEXT");
  safeAddColumn("members", "pass_number", "TEXT");
  safeAddColumn("members", "matricule", "TEXT");
  safeAddColumn("members", "medico_next", "TEXT");
  safeAddColumn("members", "join_date", "TEXT");
  safeAddColumn("members", "raw_data", "TEXT");
  // Kategorien-Neuordnung (siehe docs/kategorien-neuordnung.md)
  safeAddColumn("members", "cat_code", "INTEGER");
  safeAddColumn("members", "licence_status", "TEXT");
  safeAddColumn("members", "transfer_status", "TEXT");
  safeAddColumn("members", "member_type", "TEXT DEFAULT 'spieler'");
  safeAddColumn("members", "contact_info_type", "TEXT");
  safeAddColumn("members", "family_code", "TEXT");
  safeAddColumn("members", "first_name", "TEXT");
  safeAddColumn("members", "last_name", "TEXT");
  safeAddColumn("members", "birth_name", "TEXT");
  safeAddColumn("member_functions", "team_id", "INTEGER");
  // Anwesenheit: Status (present | absent | excused | unexcused); für Altdaten aus present ableiten
  safeAddColumn("attendance", "status", "TEXT");
  try {
    sqlite.exec(
      `UPDATE attendance SET status = CASE WHEN present = 1 THEN 'present' ELSE 'unexcused' END WHERE status IS NULL`
    );
  } catch (e) {
    console.error("[migrate] failed to backfill attendance.status:", e);
  }
  // Kalender: wer den Termin angelegt hat (darf ihn löschen)
  safeAddColumn("events", "created_by_id", "INTEGER");
  // SBO-Archiv (lokal/Hetzner Kopie vum SBO-PDF)
  safeAddColumn("matches", "sbo_archive_path", "TEXT");
  safeAddColumn("matches", "sbo_archived_at", "TEXT");
  // Archiv-Snapshot (siehe docs/saison-archivierung.md §2)
  safeAddColumn("archive_members", "cat_code", "INTEGER");
  safeAddColumn("archive_members", "functions", "TEXT");
  safeAddColumn("archive_members", "categories", "TEXT");
  safeAddColumn("archive_members", "membership_status", "TEXT");
  safeAddColumn("archive_members", "licence_status", "TEXT");
  safeAddColumn("archive_members", "member_type", "TEXT");
  safeAddColumn("archive_members", "snapshot_json", "TEXT");
  // Unique index for card_id (allows multiple NULLs)
  try {
    sqlite.exec(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_members_card_id ON members(card_id) WHERE card_id IS NOT NULL`
    );
  } catch (e) {
    console.error("[migrate] failed to create idx_members_card_id:", e);
  }
  // Finanzen: Kategorien + Saison (siehe FINANCE_CATEGORIES)
  safeAddColumn("transactions", "category", "TEXT");
  safeAddColumn("transactions", "season", "TEXT");
  try {
    sqlite.exec(`CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL
    )`);
  } catch (e) {
    console.error("[migrate] failed to create budgets:", e);
  }
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone?(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;

  // Teams
  listTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, data: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<void>;

  // Trainer-Codes
  listTrainerCodes(): Promise<TrainerCode[]>;
  getTrainerCode(id: number): Promise<TrainerCode | undefined>;
  getTrainerCodeByCode(code: string): Promise<TrainerCode | undefined>;
  getTrainerCodeByUser(userId: number): Promise<TrainerCode | undefined>;
  createTrainerCode(data: InsertTrainerCode): Promise<TrainerCode>;
  updateTrainerCode(id: number, data: Partial<InsertTrainerCode>): Promise<TrainerCode | undefined>;
  deleteTrainerCode(id: number): Promise<void>;

  // Members
  listMembers(): Promise<Member[]>;
  listMembersByTeam(teamId: number): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  getMemberByUserId(userId: number): Promise<Member | undefined>;
  getMemberByCardId(cardId: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, data: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: number): Promise<void>;

  // Attendance
  listAttendanceByTeamDate(teamId: number, date: string): Promise<Attendance[]>;
  listAttendanceByMember(memberId: number): Promise<Attendance[]>;
  upsertAttendance(a: InsertAttendance): Promise<Attendance>;
  deleteAttendance(memberId: number, date: string): Promise<void>;
  getAttendanceSummaryByTeam(teamId: number): Promise<{ memberId: number; present: number; total: number }[]>;

  // Announcements
  listAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(a: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, data: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<void>;

  // Events
  listEvents(): Promise<Event[]>;
  listEventsByTeam(teamId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(e: InsertEvent): Promise<Event>;
  updateEvent(id: number, data: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<void>;

  // Availability
  listAvailabilityByEvent(eventId: number): Promise<Availability[]>;
  upsertAvailability(a: InsertAvailability): Promise<Availability>;

  // Meetings
  listMeetings(): Promise<Meeting[]>;
  createMeeting(m: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, data: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<void>;

  // Accounts
  listAccounts(): Promise<Account[]>;
  createAccount(a: InsertAccount): Promise<Account>;

  // Transactions
  listTransactions(): Promise<Transaction[]>;
  createTransaction(t: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;

  // Saison-Budgets (Prévisioun, z.B. 2026-27)
  listSeasonBudgets(season?: string): Promise<Budget[]>;
  createSeasonBudget(b: InsertBudget): Promise<Budget>;
  deleteSeasonBudget(id: number): Promise<void>;

  // Player Flags
  listPlayerFlagsByMember(memberId: number): Promise<PlayerFlag[]>;
  listPlayerFlags(): Promise<PlayerFlag[]>;
  createPlayerFlag(f: InsertPlayerFlag): Promise<PlayerFlag>;
  deletePlayerFlag(id: number): Promise<void>;

  // Nominations
  listNominationsByEvent(eventId: number): Promise<Nomination[]>;
  listNominationsByMember(memberId: number): Promise<Nomination[]>;
  listNominationsByTeam(teamId: number): Promise<Nomination[]>;
  createNomination(n: InsertNomination): Promise<Nomination>;
  updateNominationResponse(id: number, response: string, reason?: string): Promise<Nomination | undefined>;
  deleteNomination(id: number): Promise<void>;

  // Chat
  listChatMessages(teamId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(m: InsertChatMessage): Promise<ChatMessage>;

  // Audit Logs (Security)
  listAuditLogs(options?: { severity?: string; limit?: number; startDate?: string; endDate?: string }): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  markAuditLogEmailSent(id: number): Promise<void>;
  getUnsentCriticalAlerts(): Promise<AuditLog[]>;

  // Fee Rules (Beitragsregeln)
  listFeeRules(): Promise<FeeRule[]>;
  getFeeRule(id: number): Promise<FeeRule | undefined>;
  createFeeRule(rule: InsertFeeRule): Promise<FeeRule>;
  updateFeeRule(id: number, data: Partial<InsertFeeRule>): Promise<FeeRule | undefined>;
  deleteFeeRule(id: number): Promise<void>;

  // Member Fees (Beitragszuordnung)
  listMemberFees(memberId?: number, year?: number): Promise<MemberFee[]>;
  getMemberFee(id: number): Promise<MemberFee | undefined>;
  createMemberFee(fee: InsertMemberFee): Promise<MemberFee>;
  updateMemberFee(id: number, data: Partial<InsertMemberFee>): Promise<MemberFee | undefined>;
  deleteMemberFee(id: number): Promise<void>;
  getMemberFeeSummary(memberId: number): Promise<{ totalOpen: number; totalPaid: number; totalAmount: number }>;

  // Fee Payments (Zahlungseingänge)
  listFeePayments(memberFeeId: number): Promise<FeePayment[]>;
  createFeePayment(payment: InsertFeePayment): Promise<FeePayment>;
  deleteFeePayment(id: number): Promise<void>;

  // Email Settings
  getEmailSettings(): Promise<EmailSettings | undefined>;
  saveEmailSettings(settings: InsertEmailSettings): Promise<EmailSettings>;

  // Emails
  listEmails(options?: { status?: string; userId?: number; limit?: number }): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  markEmailSent(id: number, error?: string): Promise<void>;
  getPendingEmails(): Promise<Email[]>;

  // Documents
  listDocuments(options?: { memberId?: number; category?: string; visibility?: string }): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: number, data: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<void>;

  // Registrations
  listRegistrations(status?: string): Promise<Registration[]>;
  getRegistration(id: number): Promise<Registration | undefined>;
  createRegistration(reg: InsertRegistration): Promise<Registration>;
  updateRegistration(id: number, data: Partial<InsertRegistration>): Promise<Registration | undefined>;
  approveRegistration(id: number, processedById: number, notes?: string): Promise<Registration | undefined>;
  rejectRegistration(id: number, processedById: number, reason: string): Promise<Registration | undefined>;

  // Statistics
  getMemberStatistics(): Promise<{ total: number; byCategory: Record<string, number>; byTeam: Record<string, number> }>;
  getFinancialStatistics(year: number): Promise<{ totalIncome: number; totalExpense: number; balance: number; monthlyData: any[] }>;
  getFeeStatistics(year: number): Promise<{ totalExpected: number; totalPaid: number; totalOpen: number; byStatus: Record<string, number> }>;
  getAttendanceStatistics(teamId?: number, month?: string): Promise<{ averageAttendance: number; totalRecords: number; byMember: any[] }>;

  // Training Schedules
  listTrainingSchedules(teamId?: number): Promise<TrainingSchedule[]>;
  getTrainingSchedule(id: number): Promise<TrainingSchedule | undefined>;
  createTrainingSchedule(schedule: InsertTrainingSchedule): Promise<TrainingSchedule>;
  updateTrainingSchedule(id: number, data: Partial<InsertTrainingSchedule>): Promise<TrainingSchedule | undefined>;
  deleteTrainingSchedule(id: number): Promise<void>;
  generateEventsFromSchedules(startDate: string, endDate: string, teamId?: number): Promise<number>;

  // Matches (Spiele)
  listMatches(options?: { teamId?: number; season?: string; status?: string; competition?: string }): Promise<Match[]>;
  getMatch(id: number): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, data: Partial<InsertMatch>): Promise<Match | undefined>;
  deleteMatch(id: number): Promise<void>;
  
  // Match Goals (Torschützen)
  listMatchGoals(matchId: number): Promise<MatchGoal[]>;
  createMatchGoal(goal: InsertMatchGoal): Promise<MatchGoal>;
  deleteMatchGoal(id: number): Promise<void>;
  
  // Match Penalties (Zeitstrafen)
  listMatchPenalties(matchId: number): Promise<MatchPenalty[]>;
  createMatchPenalty(penalty: InsertMatchPenalty): Promise<MatchPenalty>;
  deleteMatchPenalty(id: number): Promise<void>;
  
  // Player Statistics (Spielerstatistiken)
  getPlayerStatistics(playerId: number, season?: string): Promise<{ 
    goals: number; 
    assists: number; 
    matches: number;
    penalties: number;
    fieldGoals: number;
    penaltyGoals: number;
    sevenMeters: number;
  }>;
  getTopScorers(competition?: string, season?: string, limit?: number): Promise<Array<{
    playerId: number | null;
    playerName: string;
    teamName: string;
    goals: number;
    assists: number;
    matches: number;
  }>>;
  
  // Standings (Tabellen)
  listStandings(competition: string, season: string): Promise<Standing[]>;
  updateStanding(standing: InsertStanding): Promise<Standing>;
  calculateStandings(competition: string, season: string): Promise<void>;

  // Magic Links (Passwordless Login)
  createMagicLink(link: InsertMagicLink): Promise<MagicLink>;
  getMagicLinkByToken(token: string): Promise<MagicLink | undefined>;
  markMagicLinkUsed(id: number): Promise<void>;
  cleanupExpiredMagicLinks(): Promise<number>;

  // Member Cards (QR-Code Ausweise)
  createMemberCard(card: InsertMemberCard): Promise<MemberCard>;
  getMemberCardByUserId(userId: number): Promise<MemberCard | undefined>;
  getMemberCardByCardNumber(cardNumber: string): Promise<MemberCard | undefined>;
  listMemberCards(): Promise<MemberCard[]>;
  deactivateMemberCard(id: number): Promise<void>;

  // Activity Logs (Audit)
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  listActivityLogs(options?: { userId?: number; entityType?: string; limit?: number }): Promise<ActivityLog[]>;

  // User Notifications
  createNotification(notification: InsertUserNotification): Promise<UserNotification>;
  listNotifications(userId: number): Promise<UserNotification[]>;
  markNotificationRead(id: number): Promise<void>;
  getUnreadNotificationsCount(userId: number): Promise<number>;

  // Document Signatures
  createSignature(signature: InsertDocumentSignature): Promise<DocumentSignature>;
  getSignatureByDocument(documentId: number): Promise<DocumentSignature | undefined>;

  // SEPA Mandates

  // Match Lineups (Spielaufstellung)
  createMatchLineup(lineup: InsertMatchLineup): Promise<MatchLineup>;
  getMatchLineup(matchId: number): Promise<MatchLineup[]>;
  updateLineupConfirmation(id: number, confirmed: boolean): Promise<void>;

  // Training Attendance
  createAttendance(attendance: InsertTrainingAttendance): Promise<TrainingAttendance>;
  getAttendanceBySchedule(scheduleId: number): Promise<TrainingAttendance[]>;
  getAttendanceByUser(userId: number, startDate?: string, endDate?: string): Promise<TrainingAttendance[]>;

  // Family Links
  createFamilyLink(link: InsertFamilyLink): Promise<FamilyLink>;
  getFamilyMembers(parentId: number): Promise<FamilyLink[]>;
  getChildrenOfParent(parentId: number): Promise<User[]>;

  // Document Expiries
  createDocumentExpiry(expiry: InsertDocumentExpiry): Promise<DocumentExpiry>;
  getExpiringDocuments(days: number): Promise<DocumentExpiry[]>;
  markReminderSent(id: number): Promise<void>;

  // ─── 1. CARPOOL (Fahrgemeinschaften) ──────────────────────
  createCarpool(carpool: InsertCarpool): Promise<Carpool>;
  getCarpoolByEvent(eventId: number): Promise<Carpool[]>;
  joinCarpool(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger>;
  leaveCarpool(carpoolId: number, userId: number): Promise<void>;
  listCarpools(): Promise<Carpool[]>;

  // ─── 2. REFEREES (Schiedsrichter) ─────────────────────────
  createReferee(referee: InsertReferee): Promise<Referee>;
  getReferee(id: number): Promise<Referee | undefined>;
  listReferees(active?: boolean): Promise<Referee[]>;
  assignReferee(assignment: InsertRefereeAssignment): Promise<RefereeAssignment>;
  getRefereeAssignments(matchId?: number): Promise<RefereeAssignment[]>;
  markRefereePaid(assignmentId: number): Promise<void>;

  // ─── 3. INVENTORY (Material-Inventar) ───────────────────
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  listInventoryItems(category?: string): Promise<InventoryItem[]>;
  loanItem(loan: InsertInventoryLoan): Promise<InventoryLoan>;
  returnItem(loanId: number, condition?: string): Promise<void>;
  getItemLoans(itemId?: number, userId?: number): Promise<InventoryLoan[]>;

  // ─── 4. INJURIES (Verletzungen & Reha) ───────────────────
  createInjury(injury: InsertInjury): Promise<Injury>;
  getInjury(id: number): Promise<Injury | undefined>;
  listInjuries(userId?: number, status?: string): Promise<Injury[]>;
  updateInjuryStatus(id: number, status: string, clearance?: boolean): Promise<void>;
  addRehabSession(session: InsertRehabSession): Promise<RehabSession>;
  getRehabSessions(injuryId: number): Promise<RehabSession[]>;

  // ─── 5. POLLS (Umfragen & Abstimmungen) ──────────────────
  createPoll(poll: InsertPoll, options: InsertPollOption[]): Promise<Poll>;
  getPoll(id: number): Promise<Poll | undefined>;
  listPolls(teamId?: number, status?: string): Promise<Poll[]>;
  vote(vote: InsertPollVote): Promise<PollVote>;
  getPollResults(pollId: number): Promise<{ optionId: number; count: number }[]>;
  closePoll(id: number): Promise<void>;

  // ─── 6. OPPONENTS (Gegner-Analyse) ────────────────────────
  createOpponent(opponent: InsertOpponent): Promise<Opponent>;
  getOpponent(id: number): Promise<Opponent | undefined>;
  getOpponentByName(name: string): Promise<Opponent | undefined>;
  listOpponents(): Promise<Opponent[]>;
  updateOpponentAnalysis(id: number, strengths: string, weaknesses: string): Promise<void>;
  addOpponentHistory(history: InsertOpponentHistory): Promise<OpponentHistory>;
  getOpponentHistory(opponentId: number): Promise<OpponentHistory[]>;
  getOpponentStats(opponentId: number): Promise<{ wins: number; losses: number; draws: number }>;

  // ─── 7. MATCH REPORTS (Spielberichte) ─────────────────────
  createMatchReport(report: InsertMatchReport): Promise<MatchReport>;
  getMatchReport(matchId: number): Promise<MatchReport | undefined>;
  listMatchReports(status?: string): Promise<MatchReport[]>;
  submitReport(id: number, submittedTo: string): Promise<void>;
  generateReportPdf(matchId: number): Promise<string>; // Returns PDF URL

  // ─── 8. DUTY ROSTER (Dienstplan) ──────────────────────────
  createDutyRoster(roster: InsertDutyRoster): Promise<DutyRoster>;
  getDutyRoster(eventId?: number, userId?: number): Promise<DutyRoster[]>;
  confirmDuty(rosterId: number): Promise<void>;
  completeDuty(rosterId: number): Promise<void>;
  requestSwap(swap: InsertDutySwap): Promise<DutySwap>;
  respondToSwap(swapId: number, accept: boolean): Promise<void>;
  getDutySwaps(userId?: number): Promise<DutySwap[]>;

  // ─── 9. FAN ZONE (Öffentlicher Bereich) ─────────────────
  createFanContent(content: InsertFanContent): Promise<FanContent>;
  publishContent(id: number): Promise<void>;
  listFanContent(type?: string, published?: boolean): Promise<FanContent[]>;
  getPublicContent(): Promise<FanContent[]>;
  addLiveTickerEntry(entry: InsertLiveTicker): Promise<LiveTicker>;
  getLiveTicker(matchId: number): Promise<LiveTicker[]>;

  // ─── 10. EXTERNAL CALENDARS (Sync) ──────────────────────
  createExternalCalendar(calendar: InsertExternalCalendar): Promise<ExternalCalendar>;
  getExternalCalendars(userId: number): Promise<ExternalCalendar[]>;
  updateSyncToken(id: number, token: string): Promise<void>;
  logCalendarSync(log: InsertCalendarSyncLog): Promise<CalendarSyncLog>;
  getCalendarSyncLogs(calendarId: number): Promise<CalendarSyncLog[]>;

  // ─── 11. ARCHIVE (Saison-Archiv) ────────────────────────
  // Archive Seasons
  createArchiveSeason(season: InsertArchiveSeason): Promise<ArchiveSeason>;
  getArchiveSeasons(): Promise<ArchiveSeason[]>;
  getArchiveSeason(id: number): Promise<ArchiveSeason | undefined>;
  updateArchiveSeason(id: number, data: Partial<InsertArchiveSeason>): Promise<ArchiveSeason | undefined>;
  deleteArchiveSeason(id: number): Promise<void>;

  // Archive Teams
  createArchiveTeam(team: InsertArchiveTeam): Promise<ArchiveTeam>;
  getArchiveTeams(seasonId: number): Promise<ArchiveTeam[]>;
  getArchiveTeam(id: number): Promise<ArchiveTeam | undefined>;
  updateArchiveTeam(id: number, data: Partial<InsertArchiveTeam>): Promise<ArchiveTeam | undefined>;
  deleteArchiveTeam(id: number): Promise<void>;

  // Archive Members
  createArchiveMember(member: InsertArchiveMember): Promise<ArchiveMember>;
  getArchiveMembers(seasonId: number, teamId?: number): Promise<ArchiveMember[]>;
  getArchiveMember(id: number): Promise<ArchiveMember | undefined>;
  updateArchiveMember(id: number, data: Partial<InsertArchiveMember>): Promise<ArchiveMember | undefined>;
  deleteArchiveMember(id: number): Promise<void>;

  // Archive Matches
  createArchiveMatch(match: InsertArchiveMatch): Promise<ArchiveMatch>;
  getArchiveMatches(seasonId: number, teamId?: number): Promise<ArchiveMatch[]>;
  getArchiveMatch(id: number): Promise<ArchiveMatch | undefined>;
  updateArchiveMatch(id: number, data: Partial<InsertArchiveMatch>): Promise<ArchiveMatch | undefined>;
  deleteArchiveMatch(id: number): Promise<void>;

  // Archive Events
  createArchiveEvent(event: InsertArchiveEvent): Promise<ArchiveEvent>;
  getArchiveEvents(seasonId: number, teamId?: number): Promise<ArchiveEvent[]>;
  getArchiveEvent(id: number): Promise<ArchiveEvent | undefined>;
  updateArchiveEvent(id: number, data: Partial<InsertArchiveEvent>): Promise<ArchiveEvent | undefined>;
  deleteArchiveEvent(id: number): Promise<void>;

  // Archive Exports
  
  // === NEW FEATURE STORAGE METHODS ===

  // Sponsors
  listSponsors(): Promise<Sponsor[]>;
  getSponsor(id: number): Promise<Sponsor | undefined>;
  createSponsor(data: InsertSponsor): Promise<Sponsor>;
  updateSponsor(id: number, data: Partial<InsertSponsor>): Promise<Sponsor | undefined>;
  deleteSponsor(id: number): Promise<void>;

  // Gallery Photos
  listGalleryPhotos(album?: string): Promise<GalleryPhoto[]>;
  createGalleryPhoto(data: InsertGalleryPhoto): Promise<GalleryPhoto>;
  deleteGalleryPhoto(id: number): Promise<void>;

  // Duties
  listDuties(teamId?: number): Promise<Duty[]>;
  getDuty(id: number): Promise<Duty | undefined>;
  createDuty(data: InsertDuty): Promise<Duty>;
  updateDuty(id: number, data: Partial<InsertDuty>): Promise<Duty | undefined>;
  deleteDuty(id: number): Promise<void>;

  // Facilities
  listFacilities(): Promise<Facility[]>;
  getFacility(id: number): Promise<Facility | undefined>;
  createFacility(data: InsertFacility): Promise<Facility>;
  updateFacility(id: number, data: Partial<InsertFacility>): Promise<Facility | undefined>;
  deleteFacility(id: number): Promise<void>;

  // Facility Bookings
  listFacilityBookings(facilityId?: number, date?: string): Promise<FacilityBooking[]>;
  createFacilityBooking(data: InsertFacilityBooking): Promise<FacilityBooking>;
  deleteFacilityBooking(id: number): Promise<void>;

  // Shop Products
  listShopProducts(category?: string): Promise<ShopProduct[]>;
  getShopProduct(id: number): Promise<ShopProduct | undefined>;
  createShopProduct(data: InsertShopProduct): Promise<ShopProduct>;
  updateShopProduct(id: number, data: Partial<InsertShopProduct>): Promise<ShopProduct | undefined>;
  deleteShopProduct(id: number): Promise<void>;

  // Shop Orders
  listShopOrders(userId?: number): Promise<ShopOrder[]>;
  createShopOrder(data: InsertShopOrder): Promise<ShopOrder>;
  updateShopOrder(id: number, data: Partial<InsertShopOrder>): Promise<ShopOrder | undefined>;

  // Waitlist
  listWaitlistEntries(teamId?: number): Promise<WaitlistEntry[]>;
  createWaitlistEntry(data: InsertWaitlistEntry): Promise<WaitlistEntry>;
  updateWaitlistEntry(id: number, data: Partial<InsertWaitlistEntry>): Promise<WaitlistEntry | undefined>;
  deleteWaitlistEntry(id: number): Promise<void>;
  convertWaitlistEntryToMember(id: number): Promise<Member | undefined>;

  // Budget
  listBudgetItems(year?: number): Promise<BudgetItem[]>;
  createBudgetItem(data: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: number, data: Partial<InsertBudgetItem>): Promise<BudgetItem | undefined>;
  deleteBudgetItem(id: number): Promise<void>;

  // Newsletter
  listNewsletters(): Promise<Newsletter[]>;
  getNewsletter(id: number): Promise<Newsletter | undefined>;
  createNewsletter(data: InsertNewsletter): Promise<Newsletter>;
  updateNewsletter(id: number, data: Partial<InsertNewsletter>): Promise<Newsletter | undefined>;
  deleteNewsletter(id: number): Promise<void>;

  // GDPR
  listGdprConsents(userId?: number): Promise<GdprConsent[]>;
  createGdprConsent(data: InsertGdprConsent): Promise<GdprConsent>;
  listGdprDeletionRequests(status?: string): Promise<GdprDeletionRequest[]>;
  createGdprDeletionRequest(data: InsertGdprDeletionRequest): Promise<GdprDeletionRequest>;
  updateGdprDeletionRequest(id: number, data: Partial<InsertGdprDeletionRequest>): Promise<GdprDeletionRequest | undefined>;
  getMemberDataExport(userId: number): Promise<any>;

  // Website Pages
  listWebsitePages(): Promise<WebsitePage[]>;
  getWebsitePageBySlug(slug: string): Promise<WebsitePage | undefined>;
  createWebsitePage(data: InsertWebsitePage): Promise<WebsitePage>;
  updateWebsitePage(id: number, data: Partial<InsertWebsitePage>): Promise<WebsitePage | undefined>;
  deleteWebsitePage(id: number): Promise<void>;

  createArchiveExport(archiveExport: InsertArchiveExport): Promise<ArchiveExport>;
  listQrCheckins(eventId: number): Promise<QrCheckin[]>;
  createQrCheckin(data: InsertQrCheckin): Promise<QrCheckin>;
  listLineups(matchId: number): Promise<Lineup[]>;
  createLineup(data: InsertLineup): Promise<Lineup>;
  updateLineup(id: number, data: Partial<InsertLineup>): Promise<Lineup | undefined>;
  deleteLineup(id: number): Promise<void>;
  listFlhSyncLogs(): Promise<FlhSyncLog[]>;
  createFlhSyncLog(data: InsertFlhSyncLog): Promise<FlhSyncLog>;
  updateFlhSyncLog(id: number, data: Partial<InsertFlhSyncLog>): Promise<FlhSyncLog | undefined>;
  listSepaMandates(): Promise<SepaMandate[]>;
  getSepaMandateByMember(memberId: number): Promise<SepaMandate | undefined>;
  createSepaMandate(data: InsertSepaMandate): Promise<SepaMandate>;
  updateSepaMandate(id: number, data: Partial<InsertSepaMandate>): Promise<SepaMandate | undefined>;
  listSepaTransactions(mandateId?: number): Promise<SepaTransaction[]>;
  createSepaTransaction(data: InsertSepaTransaction): Promise<SepaTransaction>;
  updateSepaTransaction(id: number, data: Partial<InsertSepaTransaction>): Promise<SepaTransaction | undefined>;
  // Event RSVPs
  listEventRsvps(eventId: number): Promise<EventRsvp[]>;
  getEventRsvp(eventId: number, userId: number): Promise<EventRsvp | undefined>;
  createEventRsvp(data: InsertEventRsvp): Promise<EventRsvp>;
  updateEventRsvp(id: number, data: Partial<InsertEventRsvp>): Promise<EventRsvp | undefined>;
  getArchiveExports(seasonId?: number): Promise<ArchiveExport[]>;
  getArchiveExport(id: number): Promise<ArchiveExport | undefined>;
  incrementExportDownload(id: number): Promise<void>;

  // Import/Export
  exportSeasonToJson(seasonId: number): Promise<string>; // Returns JSON string
  importSeasonFromJson(jsonData: string): Promise<ArchiveSeason>;
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHIVE IMPLEMENTATIONEN
// ═══════════════════════════════════════════════════════════════════════════

// Diese Klasse erweitert DatabaseStorage um Archive-Methoden
// Die Implementierungen werden unten in die DatabaseStorage Klasse eingefügt

export class DatabaseStorage implements IStorage {
  async getUser(id: number) { return db.select().from(users).where(eq(users.id, id)).get(); }
  async getUserByEmail(email: string) { return db.select().from(users).where(eq(users.email, email)).get(); }
  async getUserByPhone(phone: string) { 
    // Phone is stored in the phone column of users table
    return db.select().from(users).where(eq(users.phone, phone)).get(); 
  }
  async createUser(u: InsertUser) { return db.insert(users).values(u).returning().get(); }
  async updateUser(id: number, data: Partial<InsertUser>) {
    return db.update(users).set(data).where(eq(users.id, id)).returning().get();
  }
  async listUsers() { return db.select().from(users).all(); }

  async listTeams() { return db.select().from(teams).all(); }
  async getTeam(id: number) { return db.select().from(teams).where(eq(teams.id, id)).get(); }
  async createTeam(t: InsertTeam) { return db.insert(teams).values(t).returning().get(); }

  // ─── Trainer-Codes ───────────────────────────────────
  async listTrainerCodes() { return db.select().from(trainerCodes).orderBy(desc(trainerCodes.createdAt)).all(); }
  async getTrainerCode(id: number) { return db.select().from(trainerCodes).where(eq(trainerCodes.id, id)).get(); }
  async getTrainerCodeByCode(code: string) { return db.select().from(trainerCodes).where(eq(trainerCodes.code, code)).get(); }
  async getTrainerCodeByUser(userId: number) { return db.select().from(trainerCodes).where(eq(trainerCodes.userId, userId)).get(); }
  async createTrainerCode(data: InsertTrainerCode) { return db.insert(trainerCodes).values(data).returning().get(); }
  async updateTrainerCode(id: number, data: Partial<InsertTrainerCode>) {
    return db.update(trainerCodes).set(data).where(eq(trainerCodes.id, id)).returning().get();
  }
  async deleteTrainerCode(id: number) { db.delete(trainerCodes).where(eq(trainerCodes.id, id)).run(); }
  async updateTeam(id: number, data: Partial<InsertTeam>) {
    return db.update(teams).set(data).where(eq(teams.id, id)).returning().get();
  }
  async deleteTeam(id: number) { db.delete(teams).where(eq(teams.id, id)).run(); }

  async listMembers() { return db.select().from(members).all(); }
  async listMembersByTeam(teamId: number) {
    return db.select().from(members).where(eq(members.teamId, teamId)).all();
  }
  async getMember(id: number) { return db.select().from(members).where(eq(members.id, id)).get(); }
  async getMemberByUserId(userId: number) { return db.select().from(members).where(eq(members.userId, userId)).get(); }
  async getMemberByCardId(cardId: string) { return db.select().from(members).where(eq(members.cardId, cardId)).get(); }
  async createMember(m: InsertMember) { return db.insert(members).values(m).returning().get(); }
  async updateMember(id: number, data: Partial<InsertMember>) {
    return db.update(members).set(data).where(eq(members.id, id)).returning().get();
  }
  async deleteMember(id: number) { db.delete(members).where(eq(members.id, id)).run(); }

  async listAttendanceByTeamDate(teamId: number, date: string) {
    return db.select().from(attendance).where(and(eq(attendance.teamId, teamId), eq(attendance.date, date))).all();
  }
  async listAttendanceByMember(memberId: number) {
    return db.select().from(attendance).where(eq(attendance.memberId, memberId)).all();
  }
  async upsertAttendance(a: InsertAttendance) {
    const existing = db.select().from(attendance)
      .where(and(eq(attendance.memberId, a.memberId), eq(attendance.date, a.date)))
      .get();
    if (existing) {
      return db.update(attendance).set(a).where(eq(attendance.id, existing.id)).returning().get()!;
    }
    return db.insert(attendance).values(a).returning().get()!;
  }
  async deleteAttendance(memberId: number, date: string) {
    db.delete(attendance).where(and(eq(attendance.memberId, memberId), eq(attendance.date, date))).run();
  }
  // Zähler pro Mitglied für ein Team: total = nur anwesend gezählte Einheiten
  // (so erscheint bei automatisch als 'unexcused' eingetragenen Spielern 0/0 statt 0/1).
  async getAttendanceSummaryByTeam(teamId: number): Promise<{ memberId: number; present: number; total: number }[]> {
    const rows = sqlite.prepare(
      `SELECT member_id AS memberId,
              SUM(CASE WHEN status = 'present' OR (status IS NULL AND present = 1) THEN 1 ELSE 0 END) AS present,
              SUM(CASE WHEN status = 'present' OR (status IS NULL AND present = 1) THEN 1 ELSE 0 END) AS total
       FROM attendance WHERE team_id = ? GROUP BY member_id`
    ).all(teamId) as { memberId: number; present: number; total: number }[];
    return rows;
  }

  async listAnnouncements() {
    return db.select().from(announcements).orderBy(desc(announcements.pinned), desc(announcements.createdAt)).all();
  }
  async createAnnouncement(a: InsertAnnouncement) { return db.insert(announcements).values(a).returning().get(); }
  async updateAnnouncement(id: number, data: Partial<InsertAnnouncement>) {
    return db.update(announcements).set(data).where(eq(announcements.id, id)).returning().get();
  }
  async deleteAnnouncement(id: number) { db.delete(announcements).where(eq(announcements.id, id)).run(); }

  async listEvents() { return db.select().from(events).orderBy(asc(events.date), asc(events.time)).all(); }
  async listEventsByTeam(teamId: number) {
    return db.select().from(events).where(eq(events.teamId, teamId)).orderBy(asc(events.date)).all();
  }
  async getEvent(id: number) { return db.select().from(events).where(eq(events.id, id)).get(); }
  async createEvent(e: InsertEvent) { return db.insert(events).values(e).returning().get(); }
  async updateEvent(id: number, data: Partial<InsertEvent>) {
    return db.update(events).set(data).where(eq(events.id, id)).returning().get();
  }
  async deleteEvent(id: number) { db.delete(events).where(eq(events.id, id)).run(); }

  async listAvailabilityByEvent(eventId: number) {
    return db.select().from(availability).where(eq(availability.eventId, eventId)).all();
  }
  async upsertAvailability(a: InsertAvailability) {
    const existing = db.select().from(availability)
      .where(and(eq(availability.memberId, a.memberId), eq(availability.eventId, a.eventId)))
      .get();
    if (existing) {
      return db.update(availability).set(a).where(eq(availability.id, existing.id)).returning().get()!;
    }
    return db.insert(availability).values(a).returning().get()!;
  }

  async listMeetings() { return db.select().from(meetings).orderBy(desc(meetings.date)).all(); }
  async createMeeting(m: InsertMeeting) { return db.insert(meetings).values(m).returning().get(); }
  async updateMeeting(id: number, data: Partial<InsertMeeting>) {
    return db.update(meetings).set(data).where(eq(meetings.id, id)).returning().get();
  }
  async deleteMeeting(id: number) { db.delete(meetings).where(eq(meetings.id, id)).run(); }

  async listAccounts() { return db.select().from(accounts).all(); }
  async createAccount(a: InsertAccount) { return db.insert(accounts).values(a).returning().get(); }
  async getAccountById(id: number) { return db.select().from(accounts).where(eq(accounts.id, id)).get(); }

  async listTransactions() { return db.select().from(transactions).orderBy(desc(transactions.date)).all(); }
  async createTransaction(t: InsertTransaction) {
    const tx = db.insert(transactions).values(t).returning().get()!;
    // Update account balance
    const acc = db.select().from(accounts).where(eq(accounts.id, t.accountId)).get();
    if (acc) {
      const delta = t.type === "income" ? t.amount : -t.amount;
      db.update(accounts).set({ balance: acc.balance + delta }).where(eq(accounts.id, t.accountId)).run();
    }
    return tx;
  }
  async deleteTransaction(id: number) {
    const tx = db.select().from(transactions).where(eq(transactions.id, id)).get();
    if (tx) {
      const acc = db.select().from(accounts).where(eq(accounts.id, tx.accountId)).get();
      if (acc) {
        const delta = tx.type === "income" ? -tx.amount : tx.amount;
        db.update(accounts).set({ balance: acc.balance + delta }).where(eq(accounts.id, tx.accountId)).run();
      }
      db.delete(transactions).where(eq(transactions.id, id)).run();
    }
  }

  // ─── Invoices & Payments ────────────────────────────────
  async listInvoices(status?: string) {
    if (status) return db.select().from(invoices).where(eq(invoices.status, status)).orderBy(desc(invoices.createdAt)).all();
    return db.select().from(invoices).orderBy(desc(invoices.createdAt)).all();
  }
  async createInvoice(i: InsertInvoice) { return db.insert(invoices).values(i).returning().get(); }
  async getInvoice(id: number) { return db.select().from(invoices).where(eq(invoices.id, id)).get(); }
  async updateInvoice(id: number, data: Partial<InsertInvoice>) { return db.update(invoices).set(data).where(eq(invoices.id, id)).returning().get(); }
  async deleteInvoice(id: number) { db.delete(invoicePayments).where(eq(invoicePayments.invoiceId, id)).run(); db.delete(invoices).where(eq(invoices.id, id)).run(); }
  async addInvoicePayment(p: InsertInvoicePayment) { return db.insert(invoicePayments).values(p).returning().get(); }
  async getInvoicePayments(invoiceId: number) { return db.select().from(invoicePayments).where(eq(invoicePayments.invoiceId, invoiceId)).orderBy(desc(invoicePayments.paidAt)).all(); }

  // ─── Donations ──────────────────────────────────────────
  async listDonations(campaign?: string) {
    if (campaign) return db.select().from(donations).where(eq(donations.campaign, campaign)).orderBy(desc(donations.date)).all();
    return db.select().from(donations).orderBy(desc(donations.date)).all();
  }
  async createDonation(d: InsertDonation) { return db.insert(donations).values(d).returning().get(); }
  async updateDonation(id: number, data: Partial<InsertDonation>) { return db.update(donations).set(data).where(eq(donations.id, id)).returning().get(); }
  async deleteDonation(id: number) { db.delete(donations).where(eq(donations.id, id)).run(); }

  // ─── Training Exercises ─────────────────────────────────
  async listExercises() { return db.select().from(exercises).orderBy(desc(exercises.createdAt)).all(); }
  async createExercise(e: InsertExercise) { return db.insert(exercises).values(e).returning().get(); }
  async getExercise(id: number) { return db.select().from(exercises).where(eq(exercises.id, id)).get(); }
  async deleteExercise(id: number) { db.delete(exerciseMedia).where(eq(exerciseMedia.exerciseId, id)).run(); db.delete(exercises).where(eq(exercises.id, id)).run(); }
  async listExerciseMedia(exerciseId: number) { return db.select().from(exerciseMedia).where(eq(exerciseMedia.exerciseId, exerciseId)).all(); }
  async addExerciseMedia(m: InsertExerciseMedia) { return db.insert(exerciseMedia).values(m).returning().get(); }

  // ─── Live Match Events ──────────────────────────────────
  async listMatchEvents(matchId: number) { return db.select().from(matchEvents).where(eq(matchEvents.matchId, matchId)).orderBy(asc(matchEvents.minute), asc(matchEvents.createdAt)).all(); }
  async createMatchEvent(e: InsertMatchEvent) { return db.insert(matchEvents).values(e).returning().get(); }
  async deleteMatchEvent(id: number) { db.delete(matchEvents).where(eq(matchEvents.id, id)).run(); }

  // ─── Trial Registrations ────────────────────────────────
  async listTrialRegistrations(status?: string) {
    if (status) return db.select().from(trialRegistrations).where(eq(trialRegistrations.status, status)).orderBy(desc(trialRegistrations.createdAt)).all();
    return db.select().from(trialRegistrations).orderBy(desc(trialRegistrations.createdAt)).all();
  }
  async createTrialRegistration(r: InsertTrialRegistration) { return db.insert(trialRegistrations).values(r).returning().get(); }
  async updateTrialRegistration(id: number, data: Partial<TrialRegistration>) { return db.update(trialRegistrations).set(data).where(eq(trialRegistrations.id, id)).returning().get(); }

  // ─── iCal lookup ────────────────────────────────────────
  async getUserByIcalToken(token: string) { return db.select().from(users).where(eq(users.icalToken, token)).get(); }

  async listSeasonBudgets(season?: string) {
    if (season) return db.select().from(budgets).where(eq(budgets.season, season)).all();
    return db.select().from(budgets).all();
  }
  async createSeasonBudget(b: InsertBudget) { return db.insert(budgets).values(b).returning().get(); }
  async deleteSeasonBudget(id: number) { db.delete(budgets).where(eq(budgets.id, id)).run(); }

  async listPlayerFlagsByMember(memberId: number) {
    return db.select().from(playerFlags).where(eq(playerFlags.memberId, memberId)).all();
  }
  async listPlayerFlags() { return db.select().from(playerFlags).all(); }
  async createPlayerFlag(f: InsertPlayerFlag) { return db.insert(playerFlags).values(f).returning().get(); }
  async deletePlayerFlag(id: number) { db.delete(playerFlags).where(eq(playerFlags.id, id)).run(); }

  // ── Nominations ──────────────────────────────────────────
  async listNominationsByEvent(eventId: number) {
    return db.select().from(nominations).where(eq(nominations.eventId, eventId)).orderBy(asc(nominations.createdAt)).all();
  }
  async listNominationsByTeam(teamId: number) {
    // Alle Nominierungen für aktuelle/zukünftige Events dieses Teams
    const evs = db.select({ id: events.id }).from(events).where(and(eq(events.teamId, teamId), gte(events.date, isoToday()))).all();
    const ids = evs.map(e => e.id);
    if (!ids.length) return [];
    return db.select().from(nominations).where(inArray(nominations.eventId, ids)).all();
  }
  async listNominationsByMember(memberId: number) {
    return db.select().from(nominations).where(eq(nominations.memberId, memberId)).orderBy(desc(nominations.createdAt)).all();
  }
  async createNomination(n: InsertNomination) {
    return db.insert(nominations).values(n).returning().get()!;
  }
  async updateNominationResponse(id: number, response: string, reason?: string) {
    return db.update(nominations).set({ response, reason: reason ?? null }).where(eq(nominations.id, id)).returning().get();
  }
  async deleteNomination(id: number) { db.delete(nominations).where(eq(nominations.id, id)).run(); }

  // ── Chat ─────────────────────────────────────────────────
  async listChatMessages(teamId: number, limit = 50) {
    return db.select().from(chatMessages).where(eq(chatMessages.teamId, teamId)).orderBy(asc(chatMessages.createdAt)).all().slice(-limit);
  }
  async createChatMessage(m: InsertChatMessage) {
    return db.insert(chatMessages).values(m).returning().get()!;
  }

  // ── Audit Logs (Security) ────────────────────────────────
  async listAuditLogs(options: { severity?: string; limit?: number; startDate?: string; endDate?: string } = {}) {
    const whereConditions = [];
    
    if (options.severity) {
      whereConditions.push(eq(auditLogs.severity, options.severity));
    }
    if (options.startDate) {
      whereConditions.push(gte(auditLogs.timestamp, options.startDate));
    }
    if (options.endDate) {
      whereConditions.push(lte(auditLogs.timestamp, options.endDate));
    }
    
    if (whereConditions.length === 0) {
      return db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).all().slice(0, options.limit || 100);
    } else if (whereConditions.length === 1) {
      return db.select().from(auditLogs).where(whereConditions[0]).orderBy(desc(auditLogs.timestamp)).all().slice(0, options.limit || 100);
    } else {
      return db.select().from(auditLogs).where(and(...whereConditions as [any, any])).orderBy(desc(auditLogs.timestamp)).all().slice(0, options.limit || 100);
    }
  }
  
  async createAuditLog(log: InsertAuditLog) {
    return db.insert(auditLogs).values(log).returning().get()!;
  }
  
  async markAuditLogEmailSent(id: number) {
    db.update(auditLogs).set({ emailAlertSent: true }).where(eq(auditLogs.id, id)).run();
  }
  
  async getUnsentCriticalAlerts() {
    return db.select().from(auditLogs)
      .where(and(
        eq(auditLogs.emailAlertSent, false),
        eq(auditLogs.severity, "CRITICAL")
      ))
      .orderBy(desc(auditLogs.timestamp))
      .all();
  }

  // ── Fee Rules (Beitragsregeln) ───────────────────────────
  async listFeeRules() {
    return db.select().from(feeRules).where(eq(feeRules.active, true)).orderBy(asc(feeRules.name)).all();
  }
  async getFeeRule(id: number) {
    return db.select().from(feeRules).where(eq(feeRules.id, id)).get();
  }
  async createFeeRule(rule: InsertFeeRule) {
    return db.insert(feeRules).values(rule).returning().get()!;
  }
  async updateFeeRule(id: number, data: Partial<InsertFeeRule>) {
    return db.update(feeRules).set(data).where(eq(feeRules.id, id)).returning().get();
  }
  async deleteFeeRule(id: number) {
    db.delete(feeRules).where(eq(feeRules.id, id)).run();
  }

  // ── Member Fees (Beitragszuordnung) ──────────────────────
  async listMemberFees(memberId?: number, year?: number) {
    const whereConditions = [];
    if (memberId) {
      whereConditions.push(eq(memberFees.memberId, memberId));
    }
    if (year) {
      whereConditions.push(eq(memberFees.year, year));
    }
    
    if (whereConditions.length === 0) {
      return db.select().from(memberFees).orderBy(desc(memberFees.year), desc(memberFees.createdAt)).all();
    } else if (whereConditions.length === 1) {
      return db.select().from(memberFees).where(whereConditions[0]).orderBy(desc(memberFees.year), desc(memberFees.createdAt)).all();
    } else {
      return db.select().from(memberFees).where(and(...whereConditions as [any, any])).orderBy(desc(memberFees.year), desc(memberFees.createdAt)).all();
    }
  }
  async getMemberFee(id: number) {
    return db.select().from(memberFees).where(eq(memberFees.id, id)).get();
  }
  async createMemberFee(fee: InsertMemberFee) {
    const now = new Date().toISOString();
    return db.insert(memberFees).values({ ...fee, createdAt: now, updatedAt: now }).returning().get()!;
  }
  async updateMemberFee(id: number, data: Partial<InsertMemberFee>) {
    const now = new Date().toISOString();
    return db.update(memberFees).set({ ...data, updatedAt: now }).where(eq(memberFees.id, id)).returning().get();
  }
  async deleteMemberFee(id: number) {
    db.delete(memberFees).where(eq(memberFees.id, id)).run();
  }
  async getMemberFeeSummary(memberId: number) {
    const fees = await db.select().from(memberFees).where(eq(memberFees.memberId, memberId)).all();
    const totalOpen = fees.filter(f => f.status === "open").reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    return { totalOpen, totalPaid, totalAmount };
  }

  // ── Fee Payments (Zahlungseingänge) ────────────────────
  async listFeePayments(memberFeeId: number) {
    return db.select().from(feePayments).where(eq(feePayments.memberFeeId, memberFeeId)).orderBy(desc(feePayments.paymentDate)).all();
  }
  async createFeePayment(payment: InsertFeePayment) {
    const result = db.insert(feePayments).values(payment).returning().get()!;
    // Update member fee status
    const memberFee = await this.getMemberFee(payment.memberFeeId);
    if (memberFee) {
      const payments = await this.listFeePayments(payment.memberFeeId);
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      let status = "partial";
      if (totalPaid >= memberFee.amount) status = "paid";
      else if (totalPaid === 0) status = "open";
      await this.updateMemberFee(memberFee.id, { paidAmount: totalPaid, status });
    }
    return result;
  }
  async deleteFeePayment(id: number) {
    const payment = await db.select().from(feePayments).where(eq(feePayments.id, id)).get();
    if (payment) {
      db.delete(feePayments).where(eq(feePayments.id, id)).run();
      // Recalculate member fee status
      const memberFee = await this.getMemberFee(payment.memberFeeId);
      if (memberFee) {
        const payments = await this.listFeePayments(payment.memberFeeId);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        let status = "partial";
        if (totalPaid >= memberFee.amount) status = "paid";
        else if (totalPaid === 0) status = "open";
        await this.updateMemberFee(memberFee.id, { paidAmount: totalPaid, status });
      }
    }
  }

  // ── Email Settings ───────────────────────────────────────
  async getEmailSettings() {
    return db.select().from(emailSettings).get();
  }
  async saveEmailSettings(settings: InsertEmailSettings) {
    const existing = await this.getEmailSettings();
    if (existing) {
      return db.update(emailSettings).set(settings).where(eq(emailSettings.id, existing.id)).returning().get();
    }
    return db.insert(emailSettings).values(settings).returning().get();
  }

  // ── Emails ──────────────────────────────────────────────
  async listEmails(options?: { status?: string; userId?: number; limit?: number }) {
    const whereConditions = [];
    if (options?.status) {
      whereConditions.push(eq(emails.status, options.status));
    }
    if (options?.userId) {
      whereConditions.push(eq(emails.userId, options.userId));
    }
    
    if (whereConditions.length === 0) {
      return db.select().from(emails).orderBy(desc(emails.createdAt)).limit(options?.limit || 100).all();
    } else if (whereConditions.length === 1) {
      return db.select().from(emails).where(whereConditions[0]).orderBy(desc(emails.createdAt)).limit(options?.limit || 100).all();
    } else {
      return db.select().from(emails).where(and(...whereConditions as [any, any])).orderBy(desc(emails.createdAt)).limit(options?.limit || 100).all();
    }
  }
  async getEmail(id: number) {
    return db.select().from(emails).where(eq(emails.id, id)).get();
  }
  async createEmail(email: InsertEmail) {
    return db.insert(emails).values(email).returning().get();
  }
  async markEmailSent(id: number, error?: string) {
    if (error) {
      db.update(emails).set({ status: "failed", errorMessage: error }).where(eq(emails.id, id)).run();
    } else {
      db.update(emails).set({ status: "sent", sentAt: new Date().toISOString() }).where(eq(emails.id, id)).run();
    }
  }
  async getPendingEmails() {
    return db.select().from(emails).where(eq(emails.status, "pending")).orderBy(asc(emails.createdAt)).all();
  }

  // ── Documents ──────────────────────────────────────────
  async listDocuments(options?: { memberId?: number; category?: string; visibility?: string }) {
    const whereConditions = [];
    if (options?.memberId) {
      whereConditions.push(eq(documents.memberId, options.memberId));
    }
    if (options?.category) {
      whereConditions.push(eq(documents.category, options.category));
    }
    if (options?.visibility) {
      whereConditions.push(eq(documents.visibility, options.visibility));
    }
    
    if (whereConditions.length === 0) {
      return db.select().from(documents).orderBy(desc(documents.createdAt)).all();
    } else if (whereConditions.length === 1) {
      return db.select().from(documents).where(whereConditions[0]).orderBy(desc(documents.createdAt)).all();
    } else {
      return db.select().from(documents).where(and(...whereConditions as [any, any])).orderBy(desc(documents.createdAt)).all();
    }
  }
  async getDocument(id: number) {
    return db.select().from(documents).where(eq(documents.id, id)).get();
  }
  async createDocument(doc: InsertDocument) {
    return db.insert(documents).values(doc).returning().get();
  }
  async updateDocument(id: number, data: Partial<InsertDocument>) {
    return db.update(documents).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(documents.id, id)).returning().get();
  }
  async deleteDocument(id: number) {
    db.delete(documents).where(eq(documents.id, id)).run();
  }

  // ── Registrations ───────────────────────────────────────
  async listRegistrations(status?: string) {
    if (status) {
      return db.select().from(registrations).where(eq(registrations.status, status)).orderBy(desc(registrations.createdAt)).all();
    }
    return db.select().from(registrations).orderBy(desc(registrations.createdAt)).all();
  }
  async getRegistration(id: number) {
    return db.select().from(registrations).where(eq(registrations.id, id)).get();
  }
  async createRegistration(reg: InsertRegistration) {
    return db.insert(registrations).values(reg).returning().get();
  }
  async updateRegistration(id: number, data: Partial<InsertRegistration>) {
    return db.update(registrations).set(data).where(eq(registrations.id, id)).returning().get();
  }
  async approveRegistration(id: number, processedById: number, notes?: string) {
    return db.update(registrations).set({
      status: "approved",
      processedById,
      processedAt: new Date().toISOString(),
      processedNotes: notes || null,
    }).where(eq(registrations.id, id)).returning().get();
  }
  async rejectRegistration(id: number, processedById: number, reason: string) {
    return db.update(registrations).set({
      status: "rejected",
      processedById,
      processedAt: new Date().toISOString(),
      processedNotes: reason,
    }).where(eq(registrations.id, id)).returning().get();
  }

  // ── Statistics ───────────────────────────────────────────
  async getMemberStatistics() {
    const allMembers = await this.listMembers();
    const allTeams = await this.listTeams();
    
    const teamMap = new Map(allTeams.map(t => [t.id, t.name]));
    const categoryMap = new Map(allTeams.map(t => [t.id, t.category]));
    
    const byCategory: Record<string, number> = {};
    const byTeam: Record<string, number> = {};

    // Nur aktuelle Mitglieder zählen; Ex-Mitglieder/Kontakte bleiben im Archiv.
    const activeMembers = allMembers.filter(isActiveClubMember);

    activeMembers.forEach(m => {
      // By category from team
      if (m.teamId) {
        const cat = categoryMap.get(m.teamId) || "Unbekannt";
        byCategory[cat] = (byCategory[cat] || 0) + 1;
        
        const teamName = teamMap.get(m.teamId) || "Ohne Team";
        byTeam[teamName] = (byTeam[teamName] || 0) + 1;
      }
    });

    return {
      total: activeMembers.length,
      archived: allMembers.length - activeMembers.length,
      byCategory,
      byTeam,
    };
  }

  async getFinancialStatistics(year: number) {
    const allTransactions = await this.listTransactions();
    
    // Filter by year
    const yearTransactions = allTransactions.filter(t => t.date.startsWith(String(year)));

    const totalIncome = yearTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = yearTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Monthly breakdown
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const monthTransactions = yearTransactions.filter(t => t.date.startsWith(`${year}-${monthStr}`));
      
      monthlyData.push({
        month: month + 1,
        income: monthTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
        expense: monthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
      });
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      monthlyData,
    };
  }

  async getFeeStatistics(year: number) {
    const allFees = await this.listMemberFees(undefined, year);
    
    const totalExpected = allFees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = allFees.reduce((sum, f) => sum + f.paidAmount, 0);
    
    const byStatus: Record<string, number> = {
      paid: allFees.filter(f => f.status === "paid").length,
      partial: allFees.filter(f => f.status === "partial").length,
      open: allFees.filter(f => f.status === "open").length,
      overdue: allFees.filter(f => f.status === "overdue").length,
    };

    return {
      totalExpected,
      totalPaid,
      totalOpen: totalExpected - totalPaid,
      byStatus,
    };
  }

  async getAttendanceStatistics(teamId?: number, month?: string) {
    // Get all members
    const allMembers = await this.listMembers();
    let allAttendance: any[] = [];
    
    // Get attendance for all members or specific team
    if (teamId) {
      const teamMembers = allMembers.filter(m => m.teamId === teamId);
      for (const member of teamMembers) {
        const memberAttendance = await this.listAttendanceByMember(member.id);
        allAttendance.push(...memberAttendance);
      }
    } else {
      // Get all attendance records (simplified approach)
      for (const member of allMembers.slice(0, 50)) { // Limit for performance
        const memberAttendance = await this.listAttendanceByMember(member.id);
        allAttendance.push(...memberAttendance);
      }
    }

    const presentCount = allAttendance.filter(a => a.present).length;
    const totalRecords = allAttendance.length;
    const averageAttendance = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    // Group by member
    const memberStats: Record<number, { present: number; total: number; name?: string; firstName?: string | null; lastName?: string | null }> = {};
    for (const record of allAttendance) {
      if (!memberStats[record.memberId]) {
        memberStats[record.memberId] = { present: 0, total: 0 };
      }
      memberStats[record.memberId].total++;
      if (record.present) memberStats[record.memberId].present++;
    }

    // Add member names
    for (const memberId of Object.keys(memberStats).map(Number)) {
      const member = allMembers.find(m => m.id === memberId);
      if (member) {
        memberStats[memberId].name = member.name;
        memberStats[memberId].firstName = (member as any).firstName ?? null;
        memberStats[memberId].lastName = (member as any).lastName ?? null;
      }
    }

    const byMember = Object.entries(memberStats).map(([id, stats]) => ({
      memberId: parseInt(id),
      name: stats.name || "Unbekannt",
      firstName: stats.firstName ?? null,
      lastName: stats.lastName ?? null,
      present: stats.present,
      total: stats.total,
      rate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
    })).sort((a, b) => b.rate - a.rate);

    return {
      averageAttendance,
      totalRecords,
      byMember,
    };
  }

  // ── Training Schedules ────────────────────────────────────
  async listTrainingSchedules(teamId?: number) {
    if (teamId) {
      return db.select().from(trainingSchedules).where(eq(trainingSchedules.teamId, teamId)).orderBy(trainingSchedules.dayOfWeek, trainingSchedules.startTime).all();
    }
    return db.select().from(trainingSchedules).orderBy(trainingSchedules.dayOfWeek, trainingSchedules.startTime).all();
  }
  async getTrainingSchedule(id: number) {
    return db.select().from(trainingSchedules).where(eq(trainingSchedules.id, id)).get();
  }
  async createTrainingSchedule(schedule: InsertTrainingSchedule) {
    return db.insert(trainingSchedules).values(schedule).returning().get();
  }
  async updateTrainingSchedule(id: number, data: Partial<InsertTrainingSchedule>) {
    return db.update(trainingSchedules).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(trainingSchedules.id, id)).returning().get();
  }
  async deleteTrainingSchedule(id: number) {
    db.delete(trainingSchedules).where(eq(trainingSchedules.id, id)).run();
  }
  async generateEventsFromSchedules(startDate: string, endDate: string, teamId?: number): Promise<number> {
    const schedules = await this.listTrainingSchedules();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let generatedCount = 0;

    for (const schedule of schedules) {
      if (!schedule.active) continue;
      // Optional auf ein Team beschränken (z.B. Trainer generiert nur sein Team)
      if (teamId && schedule.teamId !== teamId) continue;
      
      const scheduleStart = new Date(schedule.seasonStart);
      const scheduleEnd = new Date(schedule.seasonEnd);
      
      // Nur Termine innerhalb der Saison generieren
      const effectiveStart = start < scheduleStart ? scheduleStart : start;
      const effectiveEnd = end > scheduleEnd ? scheduleEnd : end;
      
      if (effectiveStart > effectiveEnd) continue;

      // Iteriere durch jeden Tag im Zeitraum
      let current = new Date(effectiveStart);
      while (current <= effectiveEnd) {
        if (current.getDay() === schedule.dayOfWeek) {
          const dateStr = current.toISOString().split('T')[0];
          
          // Prüfe ob Event bereits existiert
          const existingEvents = await this.listEvents();
          const alreadyExists = existingEvents.some(e => 
            e.teamId === schedule.teamId && 
            e.date === dateStr && 
            e.type === 'training'
          );
          
          if (!alreadyExists) {
            const team = await this.getTeam(schedule.teamId);
            const event = await this.createEvent({
              teamId: schedule.teamId,
              type: 'training',
              title: `Training ${team?.name || ''}`,
              date: dateStr,
              time: `${schedule.startTime} - ${schedule.endTime}`,
              location: schedule.location + (schedule.hall ? ` (${schedule.hall})` : ''),
              description: schedule.notes || `Training ${team?.name || ''}`,
            });
            
            // Track generated event
            await db.insert(generatedEvents).values({
              scheduleId: schedule.id,
              eventId: event.id,
              generatedAt: new Date().toISOString(),
            }).run();
            
            generatedCount++;
          }
        }
        current.setDate(current.getDate() + 1);
      }
    }
    
    return generatedCount;
  }

  // ── Matches ──────────────────────────────────────────────
  async listMatches(options?: { teamId?: number; season?: string; status?: string; competition?: string }) {
    const conditions: SQL<unknown>[] = [];
    if (options?.teamId) conditions.push(eq(matches.teamId, options.teamId));
    if (options?.season) conditions.push(eq(matches.season, options.season));
    if (options?.status) conditions.push(eq(matches.status, options.status));
    if (options?.competition) conditions.push(eq(matches.competition, options.competition));
    
    if (conditions.length === 0) {
      return db.select().from(matches).orderBy(desc(matches.matchDate)).all();
    }
    return db.select().from(matches).where(and(...conditions)).orderBy(desc(matches.matchDate)).all();
  }
  async getMatch(id: number) {
    return db.select().from(matches).where(eq(matches.id, id)).get();
  }
  async createMatch(match: InsertMatch) {
    const now = new Date().toISOString();
    return db.insert(matches).values({ ...match, createdAt: now, updatedAt: now }).returning().get();
  }
  async updateMatch(id: number, data: Partial<InsertMatch>) {
    const now = new Date().toISOString();
    const updated = await db.update(matches).set({ ...data, updatedAt: now }).where(eq(matches.id, id)).returning().get();
    // Auto-calculate standings if match finished
    if (data.status === 'finished' && data.homeScore !== undefined && data.awayScore !== undefined) {
      const match = await this.getMatch(id);
      if (match) await this.calculateStandings(match.competition, match.season);
    }
    return updated;
  }
  async deleteMatch(id: number) {
    // Delete related goals first
    db.delete(matchGoals).where(eq(matchGoals.matchId, id)).run();
    db.delete(matches).where(eq(matches.id, id)).run();
  }

  // ── Match Goals ───────────────────────────────────────────
  async listMatchGoals(matchId: number) {
    return db.select().from(matchGoals).where(eq(matchGoals.matchId, matchId)).orderBy(matchGoals.minute).all();
  }
  async createMatchGoal(goal: InsertMatchGoal) {
    return db.insert(matchGoals).values({ ...goal, createdAt: new Date().toISOString() }).returning().get();
  }
  async deleteMatchGoal(id: number) {
    db.delete(matchGoals).where(eq(matchGoals.id, id)).run();
  }
  async getPlayerStatistics(playerId: number, season?: string) {
    // Get all goals
    let allGoals = await db.select().from(matchGoals).where(eq(matchGoals.playerId, playerId)).all();
    
    if (season) {
      const filtered = [];
      for (const goal of allGoals) {
        const match = await this.getMatch(goal.matchId);
        if (match && match.season === season) filtered.push(goal);
      }
      allGoals = filtered;
    }
    
    // Get all penalties for the same matches
    const matchIds = Array.from(new Set(allGoals.map(g => g.matchId)));
    let allPenalties: any[] = [];
    for (const mid of matchIds) {
      const pens = await db.select().from(matchPenalties).where(eq(matchPenalties.matchId, mid)).all();
      allPenalties.push(...pens);
    }
    
    const playerPenalties = allPenalties.filter(p => p.playerId === playerId);
    
    // Calculate detailed stats
    const fieldGoals = allGoals.filter(g => g.goalType === 'field' && !g.isOwnGoal).length;
    const penaltyGoals = allGoals.filter(g => g.goalType === 'penalty' && !g.isOwnGoal).length;
    const sevenMeters = allGoals.filter(g => g.goalType === 'seven_meter' && !g.isOwnGoal).length;
    const assists = allGoals.filter(g => g.assistPlayerId === playerId).length;
    const matches = new Set(allGoals.map(g => g.matchId));
    
    return { 
      goals: allGoals.filter(g => !g.isOwnGoal).length, 
      assists, 
      matches: matches.size,
      penalties: playerPenalties.length,
      fieldGoals,
      penaltyGoals,
      sevenMeters,
    };
  }
  
  async getTopScorers(competition?: string, season?: string, limit: number = 20) {
    // Get all matches for this competition/season
    const matchConditions: SQL<unknown>[] = [];
    if (competition) matchConditions.push(eq(matches.competition, competition));
    if (season) matchConditions.push(eq(matches.season, season));
    
    const allMatches = matchConditions.length === 0 
      ? await db.select().from(matches).all()
      : await db.select().from(matches).where(and(...matchConditions)).all();
    const matchIds = allMatches.map(m => m.id);
    
    // Get all goals for these matches
    const allGoals = await db.select().from(matchGoals).all();
    const relevantGoals = allGoals.filter(g => matchIds.includes(g.matchId) && !g.isOwnGoal);
    
    // Group by player
    const playerStats: Record<string, { 
      playerId: number | null; 
      playerName: string; 
      teamName: string;
      goals: number; 
      assists: number;
      matches: Set<number>;
    }> = {};
    
    for (const goal of relevantGoals) {
      const key = `${goal.playerId || 'guest'}-${goal.playerName}`;
      const match = allMatches.find(m => m.id === goal.matchId);
      const teamName = goal.teamSide === 'home' ? match?.homeTeam : match?.awayTeam;
      
      if (!playerStats[key]) {
        playerStats[key] = { 
          playerId: goal.playerId, 
          playerName: goal.playerName, 
          teamName: teamName || '',
          goals: 0, 
          assists: 0,
          matches: new Set()
        };
      }
      playerStats[key].goals++;
      playerStats[key].matches.add(goal.matchId);
      
      // Count assists
      if (goal.assistPlayerId) {
        const assistKey = `${goal.assistPlayerId}-${goal.assistPlayerName || 'Unknown'}`;
        if (!playerStats[assistKey]) {
          playerStats[assistKey] = { 
            playerId: goal.assistPlayerId, 
            playerName: goal.assistPlayerName || 'Unknown', 
            teamName: teamName || '',
            goals: 0, 
            assists: 0,
            matches: new Set()
          };
        }
        playerStats[assistKey].assists++;
        playerStats[assistKey].matches.add(goal.matchId);
      }
    }
    
    // Convert to array and sort by goals
    const sorted = Object.values(playerStats).map(p => ({
      ...p,
      matches: p.matches.size
    })).sort((a, b) => b.goals - a.goals);
    
    return sorted.slice(0, limit);
  }

  // ── Match Penalties ───────────────────────────────────────
  async listMatchPenalties(matchId: number) {
    return db.select().from(matchPenalties).where(eq(matchPenalties.matchId, matchId)).orderBy(matchPenalties.minute).all();
  }
  async createMatchPenalty(penalty: InsertMatchPenalty) {
    return db.insert(matchPenalties).values({ ...penalty, createdAt: new Date().toISOString() }).returning().get();
  }
  async deleteMatchPenalty(id: number) {
    db.delete(matchPenalties).where(eq(matchPenalties.id, id)).run();
  }

  // ── Standings ────────────────────────────────────────────
  async listStandings(competition: string, season: string) {
    return db.select().from(standings)
      .where(and(eq(standings.competition, competition), eq(standings.season, season)))
      .orderBy(standings.position)
      .all();
  }
  async updateStanding(standing: InsertStanding) {
    const now = new Date().toISOString();
    return db.insert(standings).values({ ...standing, updatedAt: now }).returning().get();
  }
  async calculateStandings(competition: string, season: string) {
    const matches = await this.listMatches({ competition, season, status: 'finished' });
    
    // Calculate standings from matches
    const teamStats: Record<string, { 
      name: string; played: number; won: number; drawn: number; lost: number; 
      gf: number; ga: number; points: number 
    }> = {};
    
    for (const match of matches) {
      if (match.homeScore === null || match.awayScore === null) continue;
      
      const homeTeam = match.homeTeam;
      const awayTeam = match.awayTeam;
      
      if (!teamStats[homeTeam]) teamStats[homeTeam] = { name: homeTeam, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
      if (!teamStats[awayTeam]) teamStats[awayTeam] = { name: awayTeam, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
      
      teamStats[homeTeam].played++;
      teamStats[awayTeam].played++;
      teamStats[homeTeam].gf += match.homeScore;
      teamStats[homeTeam].ga += match.awayScore;
      teamStats[awayTeam].gf += match.awayScore;
      teamStats[awayTeam].ga += match.homeScore;
      
      if (match.homeScore > match.awayScore) {
        teamStats[homeTeam].won++;
        teamStats[homeTeam].points += 2; // Handball: 2 Punkte für Sieg
        teamStats[awayTeam].lost++;
      } else if (match.homeScore < match.awayScore) {
        teamStats[awayTeam].won++;
        teamStats[awayTeam].points += 2;
        teamStats[homeTeam].lost++;
      } else {
        teamStats[homeTeam].drawn++;
        teamStats[awayTeam].drawn++;
        teamStats[homeTeam].points += 1;
        teamStats[awayTeam].points += 1;
      }
    }
    
    // Convert to array and sort
    const sorted = Object.entries(teamStats).map(([name, stats]) => ({
      ...stats,
      goalDifference: stats.gf - stats.ga,
    })).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.gf - a.gf;
    });
    
    // Clear old standings and insert new
    db.delete(standings).where(and(eq(standings.competition, competition), eq(standings.season, season))).run();
    
    const now = new Date().toISOString();
    for (let i = 0; i < sorted.length; i++) {
      const team = sorted[i];
      // Find Mersch75 teamId if this is a Mersch team
      const merschTeam = await db.select().from(teams).where(eq(teams.name, team.name)).get();
      
      await db.insert(standings).values({
        teamId: merschTeam?.id || 0,
        competition,
        season,
        position: i + 1,
        teamName: team.name,
        played: team.played,
        won: team.won,
        drawn: team.drawn,
        lost: team.lost,
        goalsFor: team.gf,
        goalsAgainst: team.ga,
        goalDifference: team.goalDifference,
        points: team.points,
        updatedAt: now,
      }).run();
    }
  }

  // ─── Magic Links (Passwordless Login) ─────────────────────
  async createMagicLink(link: InsertMagicLink): Promise<MagicLink> {
    return db.insert(magicLinks).values(link).returning().get();
  }

  async getMagicLinkByToken(token: string): Promise<MagicLink | undefined> {
    return db.select().from(magicLinks).where(eq(magicLinks.token, token)).get();
  }

  async markMagicLinkUsed(id: number): Promise<void> {
    db.update(magicLinks).set({ used: true }).where(eq(magicLinks.id, id)).run();
  }

  async cleanupExpiredMagicLinks(): Promise<number> {
    const now = new Date().toISOString();
    const result = db.delete(magicLinks).where(lte(magicLinks.expiresAt, now)).run();
    return result.changes || 0;
  }

  // ─── Member Cards (QR-Code Ausweise) ──────────────────────
  async createMemberCard(card: InsertMemberCard): Promise<MemberCard> {
    return db.insert(memberCards).values(card).returning().get();
  }

  async getMemberCardByUserId(userId: number): Promise<MemberCard | undefined> {
    return db.select().from(memberCards).where(and(eq(memberCards.userId, userId), eq(memberCards.active, true))).get();
  }

  async getMemberCardByCardNumber(cardNumber: string): Promise<MemberCard | undefined> {
    return db.select().from(memberCards).where(eq(memberCards.cardNumber, cardNumber)).get();
  }

  async listMemberCards(): Promise<MemberCard[]> {
    return db.select().from(memberCards).all();
  }

  async deactivateMemberCard(id: number): Promise<void> {
    db.update(memberCards).set({ active: false }).where(eq(memberCards.id, id)).run();
  }

  // ─── Activity Logs (Audit) ─────────────────────────────
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    return db.insert(activityLogs).values(log).returning().get();
  }

  async listActivityLogs(options?: { userId?: number; entityType?: string; limit?: number }): Promise<ActivityLog[]> {
    const conditions: SQL<unknown>[] = [];
    if (options?.userId) conditions.push(eq(activityLogs.userId, options.userId));
    if (options?.entityType) conditions.push(eq(activityLogs.entityType, options.entityType));
    
    if (conditions.length === 0) {
      if (options?.limit) {
        return db.select().from(activityLogs).orderBy(sql`${activityLogs.createdAt} DESC`).limit(options.limit).all();
      }
      return db.select().from(activityLogs).orderBy(sql`${activityLogs.createdAt} DESC`).all();
    }
    
    if (options?.limit) {
      return db.select().from(activityLogs).where(and(...conditions)).orderBy(sql`${activityLogs.createdAt} DESC`).limit(options.limit).all();
    }
    return db.select().from(activityLogs).where(and(...conditions)).orderBy(sql`${activityLogs.createdAt} DESC`).all();
  }

  // ─── User Notifications ────────────────────────────────
  async createNotification(notification: InsertUserNotification): Promise<UserNotification> {
    return db.insert(userNotifications).values(notification).returning().get();
  }

  async listNotifications(userId: number): Promise<UserNotification[]> {
    return db.select().from(userNotifications)
      .where(eq(userNotifications.userId, userId))
      .orderBy(sql`${userNotifications.createdAt} DESC`)
      .all();
  }

  async markNotificationRead(id: number): Promise<void> {
    db.update(userNotifications).set({ read: true, readAt: new Date().toISOString() }).where(eq(userNotifications.id, id)).run();
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = db.select({ count: sql`count(*)` }).from(userNotifications)
      .where(and(eq(userNotifications.userId, userId), eq(userNotifications.read, false)))
      .get();
    return (result?.count as number) || 0;
  }

  // ─── Document Signatures ─────────────────────────────
  async createSignature(signature: InsertDocumentSignature): Promise<DocumentSignature> {
    return db.insert(documentSignatures).values(signature).returning().get();
  }

  async getSignatureByDocument(documentId: number): Promise<DocumentSignature | undefined> {
    return db.select().from(documentSignatures).where(eq(documentSignatures.documentId, documentId)).get();
  }

  // ─── SEPA Mandates ─────────────────────────────────
  async createSepaMandate(mandate: InsertSepaMandate): Promise<SepaMandate> {
    return db.insert(sepaMandates).values(mandate).returning().get();
  }


  async listSepaMandates(): Promise<SepaMandate[]> {
    return db.select().from(sepaMandates).all();
  }

  // ─── Match Lineups (Spielaufstellung) ────────────────
  async createMatchLineup(lineup: InsertMatchLineup): Promise<MatchLineup> {
    return db.insert(matchLineups).values(lineup).returning().get();
  }

  async getMatchLineup(matchId: number): Promise<MatchLineup[]> {
    return db.select().from(matchLineups).where(eq(matchLineups.matchId, matchId)).all();
  }

  async updateLineupConfirmation(id: number, confirmed: boolean): Promise<void> {
    db.update(matchLineups).set({ confirmed, confirmedAt: confirmed ? new Date().toISOString() : null }).where(eq(matchLineups.id, id)).run();
  }

  // ─── Training Attendance ───────────────────────────
  async createAttendance(attendance: InsertTrainingAttendance): Promise<TrainingAttendance> {
    return db.insert(trainingAttendance).values(attendance).returning().get();
  }

  async getAttendanceBySchedule(scheduleId: number): Promise<TrainingAttendance[]> {
    return db.select().from(trainingAttendance).where(eq(trainingAttendance.scheduleId, scheduleId)).all();
  }

  async getAttendanceByUser(userId: number, startDate?: string, endDate?: string): Promise<TrainingAttendance[]> {
    let query = db.select().from(trainingAttendance).where(eq(trainingAttendance.userId, userId));
    // Date filtering would require joining with trainingSchedules
    return query.all();
  }

  // ─── Family Links ──────────────────────────────────
  async createFamilyLink(link: InsertFamilyLink): Promise<FamilyLink> {
    return db.insert(familyLinks).values(link).returning().get();
  }

  async getFamilyMembers(parentId: number): Promise<FamilyLink[]> {
    return db.select().from(familyLinks).where(eq(familyLinks.parentId, parentId)).all();
  }

  async getChildrenOfParent(parentId: number): Promise<User[]> {
    const links = await this.getFamilyMembers(parentId);
    const childrenIds = links.map(l => l.childId);
    if (childrenIds.length === 0) return [];
    return db.select().from(users).where(sql`${users.id} IN (${childrenIds.join(',')})`).all();
  }

  // ─── Document Expiries ─────────────────────────────
  async createDocumentExpiry(expiry: InsertDocumentExpiry): Promise<DocumentExpiry> {
    return db.insert(documentExpiries).values(expiry).returning().get();
  }

  async getExpiringDocuments(days: number): Promise<DocumentExpiry[]> {
    const future = new Date();
    future.setDate(future.getDate() + days);
    const futureStr = future.toISOString().split('T')[0];
    return db.select().from(documentExpiries)
      .where(and(lte(documentExpiries.expiryDate, futureStr), eq(documentExpiries.reminderSent, false)))
      .all();
  }

  async markReminderSent(id: number): Promise<void> {
    db.update(documentExpiries).set({ reminderSent: true, reminderSentAt: new Date().toISOString() }).where(eq(documentExpiries.id, id)).run();
  }

  // ═══════════════════════════════════════════════════════════
  // 10 NEUE FEATURES IMPLEMENTATION
  // ═══════════════════════════════════════════════════════════

  // ─── 1. CARPOOL (Fahrgemeinschaften) ──────────────────────
  async createCarpool(carpool: InsertCarpool): Promise<Carpool> {
    return db.insert(carpools).values(carpool).returning().get();
  }

  async getCarpoolByEvent(eventId: number): Promise<Carpool[]> {
    return db.select().from(carpools).where(eq(carpools.eventId, eventId)).all();
  }

  async joinCarpool(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger> {
    return db.insert(carpoolPassengers).values(passenger).returning().get();
  }

  async leaveCarpool(carpoolId: number, userId: number): Promise<void> {
    db.delete(carpoolPassengers)
      .where(and(eq(carpoolPassengers.carpoolId, carpoolId), eq(carpoolPassengers.passengerId, userId)))
      .run();
  }

  async listCarpools(): Promise<Carpool[]> {
    return db.select().from(carpools).orderBy(desc(carpools.createdAt)).all();
  }

  async getCarpoolPassengers(carpoolId: number): Promise<CarpoolPassenger[]> {
    return db.select().from(carpoolPassengers).where(eq(carpoolPassengers.carpoolId, carpoolId)).all();
  }

  async getCarpool(id: number): Promise<Carpool | undefined> {
    return db.select().from(carpools).where(eq(carpools.id, id)).get();
  }

  async deleteCarpool(id: number): Promise<void> {
    db.delete(carpoolPassengers).where(eq(carpoolPassengers.carpoolId, id)).run();
    db.delete(carpools).where(eq(carpools.id, id)).run();
  }

  // ─── 2. REFEREES (Schiedsrichter) ─────────────────────────
  async createReferee(referee: InsertReferee): Promise<Referee> {
    return db.insert(referees).values(referee).returning().get();
  }

  async getReferee(id: number): Promise<Referee | undefined> {
    return db.select().from(referees).where(eq(referees.id, id)).get();
  }

  async listReferees(active?: boolean): Promise<Referee[]> {
    if (active !== undefined) {
      return db.select().from(referees).where(eq(referees.active, active)).all();
    }
    return db.select().from(referees).all();
  }

  async assignReferee(assignment: InsertRefereeAssignment): Promise<RefereeAssignment> {
    return db.insert(refereeAssignments).values(assignment).returning().get();
  }

  async getRefereeAssignments(matchId?: number): Promise<RefereeAssignment[]> {
    if (matchId) {
      return db.select().from(refereeAssignments).where(eq(refereeAssignments.matchId, matchId)).all();
    }
    return db.select().from(refereeAssignments).all();
  }

  async markRefereePaid(assignmentId: number): Promise<void> {
    db.update(refereeAssignments)
      .set({ paidAt: new Date().toISOString() })
      .where(eq(refereeAssignments.id, assignmentId))
      .run();
  }

  // ─── 3. INVENTORY (Material-Inventar) ───────────────────
  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    return db.insert(inventoryItems).values(item).returning().get();
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return db.select().from(inventoryItems).where(eq(inventoryItems.id, id)).get();
  }

  async listInventoryItems(category?: string): Promise<InventoryItem[]> {
    if (category) {
      return db.select().from(inventoryItems).where(eq(inventoryItems.category, category)).all();
    }
    return db.select().from(inventoryItems).all();
  }

  async loanItem(loan: InsertInventoryLoan): Promise<InventoryLoan> {
    return db.insert(inventoryLoans).values(loan).returning().get();
  }

  async returnItem(loanId: number, condition?: string): Promise<void> {
    db.update(inventoryLoans)
      .set({ returnedAt: new Date().toISOString(), condition: condition || null })
      .where(eq(inventoryLoans.id, loanId))
      .run();
  }

  async getItemLoans(itemId?: number, userId?: number): Promise<InventoryLoan[]> {
    if (itemId) {
      return db.select().from(inventoryLoans).where(eq(inventoryLoans.itemId, itemId)).all();
    }
    if (userId) {
      return db.select().from(inventoryLoans).where(eq(inventoryLoans.userId, userId)).all();
    }
    return db.select().from(inventoryLoans).all();
  }

  // ─── 4. INJURIES (Verletzungen & Reha) ───────────────────
  async createInjury(injury: InsertInjury): Promise<Injury> {
    return db.insert(injuries).values(injury).returning().get();
  }

  async getInjury(id: number): Promise<Injury | undefined> {
    return db.select().from(injuries).where(eq(injuries.id, id)).get();
  }

  async listInjuries(userId?: number, status?: string): Promise<Injury[]> {
    const conditions: SQL<unknown>[] = [];
    if (userId) conditions.push(eq(injuries.userId, userId));
    if (status) conditions.push(eq(injuries.status, status));
    
    if (conditions.length === 0) {
      return db.select().from(injuries).all();
    }
    return db.select().from(injuries).where(and(...conditions)).all();
  }

  async updateInjuryStatus(id: number, status: string, clearance?: boolean): Promise<void> {
    const updates: any = { status };
    if (clearance !== undefined) {
      updates.medicalClearance = clearance;
      updates.clearanceDate = clearance ? new Date().toISOString() : null;
    }
    db.update(injuries).set(updates).where(eq(injuries.id, id)).run();
  }

  async addRehabSession(session: InsertRehabSession): Promise<RehabSession> {
    return db.insert(rehabSessions).values(session).returning().get();
  }

  async getRehabSessions(injuryId: number): Promise<RehabSession[]> {
    return db.select().from(rehabSessions).where(eq(rehabSessions.injuryId, injuryId)).all();
  }

  // ─── 5. POLLS (Umfragen & Abstimmungen) ──────────────────
  async createPoll(poll: InsertPoll, options: Omit<InsertPollOption, "pollId" | "createdAt">[]): Promise<Poll> {
    const createdPoll = db.insert(polls).values(poll).returning().get();
    for (const option of options) {
      db.insert(pollOptions).values({ ...option, pollId: createdPoll.id }).run();
    }
    return createdPoll;
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    return db.select().from(polls).where(eq(polls.id, id)).get();
  }

  async getPollOptions(pollId: number): Promise<PollOption[]> {
    return db.select().from(pollOptions).where(eq(pollOptions.pollId, pollId)).orderBy(asc(pollOptions.sortOrder)).all();
  }

  async listPolls(teamId?: number, status?: string): Promise<Poll[]> {
    const conditions: SQL<unknown>[] = [];
    if (teamId) conditions.push(eq(polls.teamId, teamId));
    if (status) conditions.push(eq(polls.status, status));
    
    if (conditions.length === 0) {
      return db.select().from(polls).orderBy(desc(polls.createdAt)).all();
    }
    return db.select().from(polls).where(and(...conditions)).orderBy(desc(polls.createdAt)).all();
  }

  async vote(vote: InsertPollVote): Promise<PollVote> {
    return db.insert(pollVotes).values(vote).returning().get();
  }

  async getPollResults(pollId: number): Promise<{ optionId: number; count: number }[]> {
    const results = db.select({
      optionId: pollVotes.optionId,
      count: sql<number>`count(*)`
    }).from(pollVotes).where(eq(pollVotes.pollId, pollId)).groupBy(pollVotes.optionId).all();
    return results;
  }

  async closePoll(id: number): Promise<void> {
    db.update(polls).set({ status: "closed" }).where(eq(polls.id, id)).run();
  }

  // ─── 6. OPPONENTS (Gegner-Analyse) ────────────────────────
  async createOpponent(opponent: InsertOpponent): Promise<Opponent> {
    return db.insert(opponents).values(opponent).returning().get();
  }

  async getOpponent(id: number): Promise<Opponent | undefined> {
    return db.select().from(opponents).where(eq(opponents.id, id)).get();
  }

  async getOpponentByName(name: string): Promise<Opponent | undefined> {
    return db.select().from(opponents).where(eq(opponents.name, name)).get();
  }

  async listOpponents(): Promise<Opponent[]> {
    return db.select().from(opponents).all();
  }

  async updateOpponentAnalysis(id: number, strengths: string, weaknesses: string): Promise<void> {
    db.update(opponents).set({ strengths, weaknesses }).where(eq(opponents.id, id)).run();
  }

  async updateOpponent(id: number, data: Partial<InsertOpponent>): Promise<Opponent | undefined> {
    return db.update(opponents).set(data).where(eq(opponents.id, id)).returning().get();
  }

  async deleteOpponent(id: number): Promise<void> {
    db.delete(opponents).where(eq(opponents.id, id)).run();
    db.delete(opponentHistory).where(eq(opponentHistory.opponentId, id)).run();
  }

  async addOpponentHistory(history: InsertOpponentHistory): Promise<OpponentHistory> {
    return db.insert(opponentHistory).values(history).returning().get();
  }

  async getOpponentHistory(opponentId: number): Promise<OpponentHistory[]> {
    return db.select().from(opponentHistory).where(eq(opponentHistory.opponentId, opponentId)).all();
  }

  async getOpponentStats(opponentId: number): Promise<{ wins: number; losses: number; draws: number }> {
    const history = await this.getOpponentHistory(opponentId);
    const stats = { wins: 0, losses: 0, draws: 0 };
    for (const h of history) {
      if (h.result === "win") stats.wins++;
      else if (h.result === "loss") stats.losses++;
      else if (h.result === "draw") stats.draws++;
    }
    return stats;
  }

  // ─── 7. MATCH REPORTS (Spielberichte) ─────────────────────
  async createMatchReport(report: InsertMatchReport): Promise<MatchReport> {
    return db.insert(matchReports).values(report).returning().get();
  }

  async getMatchReport(matchId: number): Promise<MatchReport | undefined> {
    return db.select().from(matchReports).where(eq(matchReports.matchId, matchId)).get();
  }

  async listMatchReports(status?: string): Promise<MatchReport[]> {
    if (status) {
      return db.select().from(matchReports).where(eq(matchReports.status, status)).all();
    }
    return db.select().from(matchReports).all();
  }

  async submitReport(id: number, submittedTo: string): Promise<void> {
    db.update(matchReports)
      .set({ status: "submitted", submittedTo, submittedAt: new Date().toISOString() })
      .where(eq(matchReports.id, id))
      .run();
  }

  async generateReportPdf(matchId: number): Promise<string> {
    // Platzhalter - PDF-Generierung würde hier implementiert werden
    return `/reports/match-${matchId}.pdf`;
  }

  // ─── 8. DUTY ROSTER (Dienstplan) ──────────────────────────
  async createDutyRoster(roster: InsertDutyRoster): Promise<DutyRoster> {
    return db.insert(dutyRosters).values(roster).returning().get();
  }

  async getDutyRoster(eventId?: number, userId?: number): Promise<DutyRoster[]> {
    const conditions: SQL<unknown>[] = [];
    if (eventId) conditions.push(eq(dutyRosters.eventId, eventId));
    if (userId) conditions.push(eq(dutyRosters.userId, userId));
    
    if (conditions.length === 0) {
      return db.select().from(dutyRosters).all();
    }
    return db.select().from(dutyRosters).where(and(...conditions)).all();
  }

  async confirmDuty(rosterId: number): Promise<void> {
    db.update(dutyRosters).set({ status: "confirmed" }).where(eq(dutyRosters.id, rosterId)).run();
  }

  async completeDuty(rosterId: number): Promise<void> {
    db.update(dutyRosters).set({ status: "completed" }).where(eq(dutyRosters.id, rosterId)).run();
  }

  async requestSwap(swap: InsertDutySwap): Promise<DutySwap> {
    return db.insert(dutySwaps).values(swap).returning().get();
  }

  async respondToSwap(swapId: number, accept: boolean): Promise<void> {
    db.update(dutySwaps)
      .set({ status: accept ? "accepted" : "rejected" })
      .where(eq(dutySwaps.id, swapId))
      .run();
  }

  async getDutySwaps(userId?: number): Promise<DutySwap[]> {
    if (userId) {
      return db.select().from(dutySwaps)
        .where(or(eq(dutySwaps.requestedBy, userId), eq(dutySwaps.requestedTo, userId)))
        .all();
    }
    return db.select().from(dutySwaps).all();
  }

  // ─── 9. FAN ZONE (Öffentlicher Bereich) ─────────────────
  async createFanContent(content: InsertFanContent): Promise<FanContent> {
    return db.insert(fanContent).values(content).returning().get();
  }

  async publishContent(id: number): Promise<void> {
    db.update(fanContent)
      .set({ published: true, publishedAt: new Date().toISOString() })
      .where(eq(fanContent.id, id))
      .run();
  }

  async listFanContent(type?: string, published?: boolean): Promise<FanContent[]> {
    const conditions: SQL<unknown>[] = [];
    if (type) conditions.push(eq(fanContent.type, type));
    if (published !== undefined) conditions.push(eq(fanContent.published, published));
    
    if (conditions.length === 0) {
      return db.select().from(fanContent).orderBy(desc(fanContent.createdAt)).all();
    }
    return db.select().from(fanContent).where(and(...conditions)).orderBy(desc(fanContent.createdAt)).all();
  }

  async getPublicContent(): Promise<FanContent[]> {
    return db.select().from(fanContent)
      .where(eq(fanContent.published, true))
      .orderBy(desc(fanContent.publishedAt))
      .all();
  }

  async addLiveTickerEntry(entry: InsertLiveTicker): Promise<LiveTicker> {
    return db.insert(liveTicker).values(entry).returning().get();
  }

  async getLiveTicker(matchId: number): Promise<LiveTicker[]> {
    return db.select().from(liveTicker).where(eq(liveTicker.matchId, matchId)).all();
  }

  // ─── 10. EXTERNAL CALENDARS (Sync) ──────────────────────
  async createExternalCalendar(calendar: InsertExternalCalendar): Promise<ExternalCalendar> {
    return db.insert(externalCalendars).values(calendar).returning().get();
  }

  async getExternalCalendars(userId: number): Promise<ExternalCalendar[]> {
    return db.select().from(externalCalendars).where(eq(externalCalendars.userId, userId)).all();
  }

  async updateSyncToken(id: number, token: string): Promise<void> {
    db.update(externalCalendars)
      .set({ syncToken: token, lastSync: new Date().toISOString() })
      .where(eq(externalCalendars.id, id))
      .run();
  }

  async logCalendarSync(log: InsertCalendarSyncLog): Promise<CalendarSyncLog> {
    return db.insert(calendarSyncLogs).values(log).returning().get();
  }

  async getCalendarSyncLogs(calendarId: number): Promise<CalendarSyncLog[]> {
    return db.select().from(calendarSyncLogs).where(eq(calendarSyncLogs.calendarId, calendarId)).all();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ARCHIVE IMPLEMENTATIONEN
  // ═══════════════════════════════════════════════════════════════════════════

  // Archive Seasons
  async createArchiveSeason(season: InsertArchiveSeason): Promise<ArchiveSeason> {
    return db.insert(archiveSeasons).values(season).returning().get();
  }

  async getArchiveSeasons(): Promise<ArchiveSeason[]> {
    return db.select().from(archiveSeasons).orderBy(desc(archiveSeasons.archivedAt)).all();
  }

  async getArchiveSeason(id: number): Promise<ArchiveSeason | undefined> {
    return db.select().from(archiveSeasons).where(eq(archiveSeasons.id, id)).get();
  }

  async updateArchiveSeason(id: number, data: Partial<InsertArchiveSeason>): Promise<ArchiveSeason | undefined> {
    return db.update(archiveSeasons).set(data).where(eq(archiveSeasons.id, id)).returning().get();
  }

  async deleteArchiveSeason(id: number): Promise<void> {
    db.delete(archiveSeasons).where(eq(archiveSeasons.id, id)).run();
  }

  // Archive Teams
  async createArchiveTeam(team: InsertArchiveTeam): Promise<ArchiveTeam> {
    return db.insert(archiveTeams).values(team).returning().get();
  }

  async getArchiveTeams(seasonId: number): Promise<ArchiveTeam[]> {
    return db.select().from(archiveTeams).where(eq(archiveTeams.seasonId, seasonId)).all();
  }

  async getArchiveTeam(id: number): Promise<ArchiveTeam | undefined> {
    return db.select().from(archiveTeams).where(eq(archiveTeams.id, id)).get();
  }

  async updateArchiveTeam(id: number, data: Partial<InsertArchiveTeam>): Promise<ArchiveTeam | undefined> {
    return db.update(archiveTeams).set(data).where(eq(archiveTeams.id, id)).returning().get();
  }

  async deleteArchiveTeam(id: number): Promise<void> {
    db.delete(archiveTeams).where(eq(archiveTeams.id, id)).run();
  }

  // Archive Members
  async createArchiveMember(member: InsertArchiveMember): Promise<ArchiveMember> {
    return db.insert(archiveMembers).values(member).returning().get();
  }

  async getArchiveMembers(seasonId: number, teamId?: number): Promise<ArchiveMember[]> {
    if (teamId) {
      return db.select().from(archiveMembers)
        .where(and(eq(archiveMembers.seasonId, seasonId), eq(archiveMembers.teamId, teamId)))
        .all();
    }
    return db.select().from(archiveMembers).where(eq(archiveMembers.seasonId, seasonId)).all();
  }

  async getArchiveMember(id: number): Promise<ArchiveMember | undefined> {
    return db.select().from(archiveMembers).where(eq(archiveMembers.id, id)).get();
  }

  async updateArchiveMember(id: number, data: Partial<InsertArchiveMember>): Promise<ArchiveMember | undefined> {
    return db.update(archiveMembers).set(data).where(eq(archiveMembers.id, id)).returning().get();
  }

  async deleteArchiveMember(id: number): Promise<void> {
    db.delete(archiveMembers).where(eq(archiveMembers.id, id)).run();
  }

  // Archive Matches
  async createArchiveMatch(match: InsertArchiveMatch): Promise<ArchiveMatch> {
    return db.insert(archiveMatches).values(match).returning().get();
  }

  async getArchiveMatches(seasonId: number, teamId?: number): Promise<ArchiveMatch[]> {
    if (teamId) {
      return db.select().from(archiveMatches)
        .where(and(eq(archiveMatches.seasonId, seasonId), eq(archiveMatches.teamId, teamId)))
        .orderBy(desc(archiveMatches.date))
        .all();
    }
    return db.select().from(archiveMatches)
      .where(eq(archiveMatches.seasonId, seasonId))
      .orderBy(desc(archiveMatches.date))
      .all();
  }

  async getArchiveMatch(id: number): Promise<ArchiveMatch | undefined> {
    return db.select().from(archiveMatches).where(eq(archiveMatches.id, id)).get();
  }

  async updateArchiveMatch(id: number, data: Partial<InsertArchiveMatch>): Promise<ArchiveMatch | undefined> {
    return db.update(archiveMatches).set(data).where(eq(archiveMatches.id, id)).returning().get();
  }

  async deleteArchiveMatch(id: number): Promise<void> {
    db.delete(archiveMatches).where(eq(archiveMatches.id, id)).run();
  }

  // Archive Events
  async createArchiveEvent(event: InsertArchiveEvent): Promise<ArchiveEvent> {
    return db.insert(archiveEvents).values(event).returning().get();
  }

  async getArchiveEvents(seasonId: number, teamId?: number): Promise<ArchiveEvent[]> {
    if (teamId) {
      return db.select().from(archiveEvents)
        .where(and(eq(archiveEvents.seasonId, seasonId), eq(archiveEvents.teamId, teamId)))
        .orderBy(desc(archiveEvents.date))
        .all();
    }
    return db.select().from(archiveEvents)
      .where(eq(archiveEvents.seasonId, seasonId))
      .orderBy(desc(archiveEvents.date))
      .all();
  }

  async getArchiveEvent(id: number): Promise<ArchiveEvent | undefined> {
    return db.select().from(archiveEvents).where(eq(archiveEvents.id, id)).get();
  }

  async updateArchiveEvent(id: number, data: Partial<InsertArchiveEvent>): Promise<ArchiveEvent | undefined> {
    return db.update(archiveEvents).set(data).where(eq(archiveEvents.id, id)).returning().get();
  }

  async deleteArchiveEvent(id: number): Promise<void> {
    db.delete(archiveEvents).where(eq(archiveEvents.id, id)).run();
  }

  // Archive Exports
    // === NEW FEATURE STORAGE METHODS ===

  // Sponsors
  async listSponsors(): Promise<Sponsor[]> {
    return db.select().from(sponsors).orderBy(desc(sponsors.createdAt)).all();
  }
  async getSponsor(id: number): Promise<Sponsor | undefined> {
    return db.select().from(sponsors).where(eq(sponsors.id, id)).get();
  }
  async createSponsor(data: InsertSponsor): Promise<Sponsor> {
    const result = db.insert(sponsors).values(data).returning().get();
    return result;
  }
  async updateSponsor(id: number, data: Partial<InsertSponsor>): Promise<Sponsor | undefined> {
    const result = db.update(sponsors).set(data).where(eq(sponsors.id, id)).returning().get();
    return result;
  }
  async deleteSponsor(id: number): Promise<void> {
    db.delete(sponsors).where(eq(sponsors.id, id)).run();
  }

  // Gallery Photos
  async listGalleryPhotos(album?: string): Promise<GalleryPhoto[]> {
    if (album) return db.select().from(galleryPhotos).where(eq(galleryPhotos.album, album)).orderBy(desc(galleryPhotos.createdAt)).all();
    return db.select().from(galleryPhotos).orderBy(desc(galleryPhotos.createdAt)).all();
  }
  async createGalleryPhoto(data: InsertGalleryPhoto): Promise<GalleryPhoto> {
    return db.insert(galleryPhotos).values(data).returning().get();
  }
  async deleteGalleryPhoto(id: number): Promise<void> {
    db.delete(galleryPhotos).where(eq(galleryPhotos.id, id)).run();
  }

  // Duties
  async listDuties(teamId?: number): Promise<Duty[]> {
    if (teamId) return db.select().from(duties).where(eq(duties.teamId, teamId)).orderBy(asc(duties.date)).all();
    return db.select().from(duties).orderBy(asc(duties.date)).all();
  }
  async getDuty(id: number): Promise<Duty | undefined> {
    return db.select().from(duties).where(eq(duties.id, id)).get();
  }
  async createDuty(data: InsertDuty): Promise<Duty> {
    return db.insert(duties).values(data).returning().get();
  }
  async updateDuty(id: number, data: Partial<InsertDuty>): Promise<Duty | undefined> {
    return db.update(duties).set(data).where(eq(duties.id, id)).returning().get();
  }
  async deleteDuty(id: number): Promise<void> {
    db.delete(duties).where(eq(duties.id, id)).run();
  }

  // Facilities
  async listFacilities(): Promise<Facility[]> {
    return db.select().from(facilities).orderBy(asc(facilities.name)).all();
  }
  async getFacility(id: number): Promise<Facility | undefined> {
    return db.select().from(facilities).where(eq(facilities.id, id)).get();
  }
  async createFacility(data: InsertFacility): Promise<Facility> {
    return db.insert(facilities).values(data).returning().get();
  }
  async updateFacility(id: number, data: Partial<InsertFacility>): Promise<Facility | undefined> {
    return db.update(facilities).set(data).where(eq(facilities.id, id)).returning().get();
  }
  async deleteFacility(id: number): Promise<void> {
    db.delete(facilities).where(eq(facilities.id, id)).run();
  }

  // Facility Bookings
  async listFacilityBookings(facilityId?: number, date?: string): Promise<FacilityBooking[]> {
    const conditions = [];
    if (facilityId) conditions.push(eq(facilityBookings.facilityId, facilityId));
    if (date) conditions.push(eq(facilityBookings.date, date));
    if (conditions.length > 0) return db.select().from(facilityBookings).where(and(...conditions)).orderBy(asc(facilityBookings.date), asc(facilityBookings.startTime)).all();
    return db.select().from(facilityBookings).orderBy(asc(facilityBookings.date), asc(facilityBookings.startTime)).all();
  }
  async createFacilityBooking(data: InsertFacilityBooking): Promise<FacilityBooking> {
    return db.insert(facilityBookings).values(data).returning().get();
  }
  async deleteFacilityBooking(id: number): Promise<void> {
    db.delete(facilityBookings).where(eq(facilityBookings.id, id)).run();
  }

  // Shop Products
  async listShopProducts(category?: string): Promise<ShopProduct[]> {
    if (category) return db.select().from(shopProducts).where(eq(shopProducts.category, category)).orderBy(asc(shopProducts.name)).all();
    return db.select().from(shopProducts).orderBy(asc(shopProducts.name)).all();
  }
  async getShopProduct(id: number): Promise<ShopProduct | undefined> {
    return db.select().from(shopProducts).where(eq(shopProducts.id, id)).get();
  }
  async createShopProduct(data: InsertShopProduct): Promise<ShopProduct> {
    return db.insert(shopProducts).values(data).returning().get();
  }
  async updateShopProduct(id: number, data: Partial<InsertShopProduct>): Promise<ShopProduct | undefined> {
    return db.update(shopProducts).set(data).where(eq(shopProducts.id, id)).returning().get();
  }
  async deleteShopProduct(id: number): Promise<void> {
    db.delete(shopProducts).where(eq(shopProducts.id, id)).run();
  }

  // Shop Orders
  async listShopOrders(userId?: number): Promise<ShopOrder[]> {
    if (userId) return db.select().from(shopOrders).where(eq(shopOrders.userId, userId)).orderBy(desc(shopOrders.createdAt)).all();
    return db.select().from(shopOrders).orderBy(desc(shopOrders.createdAt)).all();
  }
  async createShopOrder(data: InsertShopOrder): Promise<ShopOrder> {
    return db.insert(shopOrders).values(data).returning().get();
  }
  async updateShopOrder(id: number, data: Partial<InsertShopOrder>): Promise<ShopOrder | undefined> {
    return db.update(shopOrders).set(data).where(eq(shopOrders.id, id)).returning().get();
  }

  // Waitlist (delegiert an Service)
  async listWaitlistEntries(teamId?: number): Promise<WaitlistEntry[]> {
    return waitlistService.listWaitlistEntries(teamId);
  }
  async createWaitlistEntry(data: InsertWaitlistEntry): Promise<WaitlistEntry> {
    return waitlistService.createWaitlistEntry(data);
  }
  async updateWaitlistEntry(id: number, data: Partial<InsertWaitlistEntry>): Promise<WaitlistEntry | undefined> {
    return waitlistService.updateWaitlistEntry(id, data);
  }
  async deleteWaitlistEntry(id: number): Promise<void> {
    return waitlistService.deleteWaitlistEntry(id);
  }
  async convertWaitlistEntryToMember(id: number): Promise<Member | undefined> {
    return waitlistService.convertWaitlistEntryToMember(id);
  }

  // Budget
  async listBudgetItems(year?: number): Promise<BudgetItem[]> {
    if (year) return db.select().from(budgetItems).where(eq(budgetItems.year, year)).orderBy(asc(budgetItems.category)).all();
    return db.select().from(budgetItems).orderBy(asc(budgetItems.category)).all();
  }
  async createBudgetItem(data: InsertBudgetItem): Promise<BudgetItem> {
    return db.insert(budgetItems).values(data).returning().get();
  }
  async updateBudgetItem(id: number, data: Partial<InsertBudgetItem>): Promise<BudgetItem | undefined> {
    return db.update(budgetItems).set(data).where(eq(budgetItems.id, id)).returning().get();
  }
  async deleteBudgetItem(id: number): Promise<void> {
    db.delete(budgetItems).where(eq(budgetItems.id, id)).run();
  }

  // Newsletter
  async listNewsletters(): Promise<Newsletter[]> {
    return db.select().from(newsletters).orderBy(desc(newsletters.createdAt)).all();
  }
  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    return db.select().from(newsletters).where(eq(newsletters.id, id)).get();
  }
  async createNewsletter(data: InsertNewsletter): Promise<Newsletter> {
    return db.insert(newsletters).values(data).returning().get();
  }
  async updateNewsletter(id: number, data: Partial<InsertNewsletter>): Promise<Newsletter | undefined> {
    return db.update(newsletters).set(data).where(eq(newsletters.id, id)).returning().get();
  }
  async deleteNewsletter(id: number): Promise<void> {
    db.delete(newsletters).where(eq(newsletters.id, id)).run();
  }

  // GDPR (delegiert an Service)
  async listGdprConsents(userId?: number): Promise<GdprConsent[]> {
    return gdprService.listGdprConsents(userId);
  }
  async createGdprConsent(data: InsertGdprConsent): Promise<GdprConsent> {
    return gdprService.createGdprConsent(data);
  }
  async listGdprDeletionRequests(status?: string): Promise<GdprDeletionRequest[]> {
    return gdprService.listGdprDeletionRequests(status);
  }
  async createGdprDeletionRequest(data: InsertGdprDeletionRequest): Promise<GdprDeletionRequest> {
    return gdprService.createGdprDeletionRequest(data);
  }
  async updateGdprDeletionRequest(id: number, data: Partial<InsertGdprDeletionRequest>): Promise<GdprDeletionRequest | undefined> {
    return gdprService.updateGdprDeletionRequest(id, data);
  }
  async getMemberDataExport(userId: number): Promise<any> {
    return gdprService.getMemberDataExport(userId);
  }

  // Website Pages
  async listWebsitePages(): Promise<WebsitePage[]> {
    return db.select().from(websitePages).orderBy(asc(websitePages.title)).all();
  }
  async getWebsitePageBySlug(slug: string): Promise<WebsitePage | undefined> {
    return db.select().from(websitePages).where(eq(websitePages.slug, slug)).get();
  }
  async createWebsitePage(data: InsertWebsitePage): Promise<WebsitePage> {
    return db.insert(websitePages).values(data).returning().get();
  }
  async updateWebsitePage(id: number, data: Partial<InsertWebsitePage>): Promise<WebsitePage | undefined> {
    return db.update(websitePages).set({...data, updatedAt: new Date().toISOString()}).where(eq(websitePages.id, id)).returning().get();
  }
  async deleteWebsitePage(id: number): Promise<void> {
    db.delete(websitePages).where(eq(websitePages.id, id)).run();
  }


  
  // Event RSVPs
  async listEventRsvps(eventId: number): Promise<EventRsvp[]> {
    return db.select().from(eventRsvps).where(eq(eventRsvps.eventId, eventId)).all();
  }
  async getEventRsvp(eventId: number, userId: number): Promise<EventRsvp | undefined> {
    return db.select().from(eventRsvps).where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, userId))).get();
  }
  async createEventRsvp(data: InsertEventRsvp): Promise<EventRsvp> {
    return db.insert(eventRsvps).values(data).returning().get();
  }
  async updateEventRsvp(id: number, data: Partial<InsertEventRsvp>): Promise<EventRsvp | undefined> {
    return db.update(eventRsvps).set({...data, updatedAt: new Date().toISOString()}).where(eq(eventRsvps.id, id)).returning().get();
  }

  
  // QR Checkins
  async listQrCheckins(eventId: number): Promise<QrCheckin[]> {
    return db.select().from(qrCheckins).where(eq(qrCheckins.eventId, eventId)).orderBy(asc(qrCheckins.checkinTime)).all();
  }
  async createQrCheckin(data: InsertQrCheckin): Promise<QrCheckin> {
    return db.insert(qrCheckins).values(data).returning().get();
  }

  // Lineups
  async listLineups(matchId: number): Promise<Lineup[]> {
    return db.select().from(lineups).where(eq(lineups.matchId, matchId)).orderBy(desc(lineups.createdAt)).all();
  }
  async createLineup(data: InsertLineup): Promise<Lineup> {
    return db.insert(lineups).values(data).returning().get();
  }
  async updateLineup(id: number, data: Partial<InsertLineup>): Promise<Lineup | undefined> {
    return db.update(lineups).set({...data, updatedAt: new Date().toISOString()}).where(eq(lineups.id, id)).returning().get();
  }
  async deleteLineup(id: number): Promise<void> {
    db.delete(lineups).where(eq(lineups.id, id)).run();
  }

  // FLH Sync
  async listFlhSyncLogs(): Promise<FlhSyncLog[]> {
    return db.select().from(flhSyncLogs).orderBy(desc(flhSyncLogs.createdAt)).all();
  }
  async createFlhSyncLog(data: InsertFlhSyncLog): Promise<FlhSyncLog> {
    return db.insert(flhSyncLogs).values(data).returning().get();
  }
  async updateFlhSyncLog(id: number, data: Partial<InsertFlhSyncLog>): Promise<FlhSyncLog | undefined> {
    return db.update(flhSyncLogs).set(data).where(eq(flhSyncLogs.id, id)).returning().get();
  }

  // SEPA Mandates
  async getSepaMandateByMember(memberId: number): Promise<SepaMandate | undefined> {
    return db.select().from(sepaMandates).where(eq(sepaMandates.memberId, memberId)).get();
  }
  async updateSepaMandate(id: number, data: Partial<InsertSepaMandate>): Promise<SepaMandate | undefined> {
    return db.update(sepaMandates).set(data).where(eq(sepaMandates.id, id)).returning().get();
  }

  // SEPA Transactions
  async listSepaTransactions(mandateId?: number): Promise<SepaTransaction[]> {
    if (mandateId) return db.select().from(sepaTransactions).where(eq(sepaTransactions.mandateId, mandateId)).orderBy(desc(sepaTransactions.createdAt)).all();
    return db.select().from(sepaTransactions).orderBy(desc(sepaTransactions.createdAt)).all();
  }
  async createSepaTransaction(data: InsertSepaTransaction): Promise<SepaTransaction> {
    return db.insert(sepaTransactions).values(data).returning().get();
  }
  async updateSepaTransaction(id: number, data: Partial<InsertSepaTransaction>): Promise<SepaTransaction | undefined> {
    return db.update(sepaTransactions).set(data).where(eq(sepaTransactions.id, id)).returning().get();
  }

  async createArchiveExport(archiveExport: InsertArchiveExport): Promise<ArchiveExport> {
    return db.insert(archiveExports).values(archiveExport).returning().get();
  }

  async getArchiveExports(seasonId?: number): Promise<ArchiveExport[]> {
    if (seasonId) {
      return db.select().from(archiveExports)
        .where(eq(archiveExports.seasonId, seasonId))
        .orderBy(desc(archiveExports.exportedAt))
        .all();
    }
    return db.select().from(archiveExports).orderBy(desc(archiveExports.exportedAt)).all();
  }

  async getArchiveExport(id: number): Promise<ArchiveExport | undefined> {
    return db.select().from(archiveExports).where(eq(archiveExports.id, id)).get();
  }

  async incrementExportDownload(id: number): Promise<void> {
    const exp = await this.getArchiveExport(id);
    if (exp) {
      db.update(archiveExports)
        .set({ downloadCount: (exp.downloadCount || 0) + 1 })
        .where(eq(archiveExports.id, id))
        .run();
    }
  }

  // ─── Saison-Rollover (siehe docs/saison-archivierung.md §3) ───
  // Archiviert die aktuelle (aktive) Saison in die archive_*-Tabellen und legt eine neue
  // aktive Saison an. Stammdaten (members) bleiben; saisonabhängige Daten werden optional
  // zurückgesetzt. Läuft transaktional (alles-oder-nichts).
  async rolloverSeason(input: {
    newSeasonName: string;
    newSeasonStart: string;
    newSeasonEnd: string;
    finishedSeasonName?: string;
    resetLiveData?: boolean;
  }): Promise<{
    archivedSeasonId: number;
    newSeasonId: number;
    counts: { teams: number; members: number; matches: number; events: number };
  }> {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    return db.transaction((tx) => {
      // 1. Abzuschließende (aktive) Saison bestimmen — sonst anlegen
      let current = tx.select().from(archiveSeasons).where(eq(archiveSeasons.active, true)).get();
      if (!current) {
        current = tx.insert(archiveSeasons).values({
          name: input.finishedSeasonName ?? "Aktuell",
          startDate: input.newSeasonStart,
          endDate: today,
          active: true,
        }).returning().get();
      }
      const seasonId = current.id;

      // 2. Teams (+ Tabellenstand) archivieren
      const teamRows = tx.select().from(teams).all();
      const teamIdMap = new Map<number, number>();
      let teamCount = 0;
      for (const t of teamRows) {
        const standing = tx.select().from(standings).where(eq(standings.teamId, t.id)).get();
        const trainer = t.trainerId ? tx.select().from(users).where(eq(users.id, t.trainerId)).get() : undefined;
        const at = tx.insert(archiveTeams).values({
          seasonId,
          name: t.name,
          category: t.category,
          trainerName: trainer?.name ?? null,
          trainerQualifications: trainer?.qualifications ?? null,
          finalRank: standing?.position ?? null,
          matchesPlayed: standing?.played ?? null,
          matchesWon: standing?.won ?? null,
          matchesDrawn: standing?.drawn ?? null,
          matchesLost: standing?.lost ?? null,
          goalsFor: standing?.goalsFor ?? null,
          goalsAgainst: standing?.goalsAgainst ?? null,
          points: standing?.points ?? null,
        }).returning().get();
        teamIdMap.set(t.id, at.id);
        teamCount++;
      }
      // Sammelteam für Mitglieder ohne Team (Supervisor, Comité, Donateur …)
      const noTeam = tx.insert(archiveTeams).values({
        seasonId,
        name: "Ohne Team / Sonstige",
        category: "sonstige",
      }).returning().get();

      // 3. Mitglieder als Snapshot archivieren (inkl. Funktionen + Kategorien)
      const memberRows = tx.select().from(members).all();
      let memberCount = 0;
      for (const m of memberRows) {
        const fns = tx.select().from(memberFunctions).where(eq(memberFunctions.memberId, m.id)).all();
        const cats = tx.select().from(memberCategories).where(eq(memberCategories.memberId, m.id)).all();
        const archiveTeamId = (m.teamId != null && teamIdMap.has(m.teamId)) ? teamIdMap.get(m.teamId)! : noTeam.id;
        tx.insert(archiveMembers).values({
          seasonId,
          teamId: archiveTeamId,
          name: m.name,
          email: m.email ?? null,
          phone: m.phone ?? null,
          birthdate: m.birthdate ?? null,
          licenseNumber: m.licenseNumber ?? null,
          catCode: m.catCode ?? null,
          functions: JSON.stringify(fns),
          categories: JSON.stringify(cats),
          membershipStatus: m.membershipStatus ?? null,
          licenceStatus: m.licenceStatus ?? null,
          memberType: m.memberType ?? null,
          snapshotJson: JSON.stringify({ member: m, functions: fns, categories: cats }),
        }).run();
        memberCount++;
      }

      // 4. Spiele archivieren
      const matchRows = tx.select().from(matches).all();
      let matchCount = 0;
      for (const mt of matchRows) {
        const archiveTeamId = (mt.teamId != null && teamIdMap.has(mt.teamId)) ? teamIdMap.get(mt.teamId)! : noTeam.id;
        let result: string | null = null;
        if (mt.homeScore != null && mt.awayScore != null) {
          if (mt.homeScore === mt.awayScore) result = "draw";
          else {
            const merschWon = mt.isHome ? mt.homeScore > mt.awayScore : mt.awayScore > mt.homeScore;
            result = merschWon ? "win" : "loss";
          }
        }
        tx.insert(archiveMatches).values({
          seasonId,
          teamId: archiveTeamId,
          date: mt.matchDate,
          opponent: mt.isHome ? mt.awayTeam : mt.homeTeam,
          venue: mt.isHome ? "home" : "away",
          location: mt.venue ?? null,
          homeGoals: mt.homeScore ?? null,
          awayGoals: mt.awayScore ?? null,
          result,
          notes: mt.notes ?? null,
        }).run();
        matchCount++;
      }

      // 5. Events archivieren
      const eventRows = tx.select().from(events).all();
      let eventCount = 0;
      for (const ev of eventRows) {
        const archiveTeamId = (ev.teamId != null && teamIdMap.has(ev.teamId)) ? teamIdMap.get(ev.teamId)! : null;
        tx.insert(archiveEvents).values({
          seasonId,
          teamId: archiveTeamId,
          title: ev.title,
          type: ev.type,
          date: ev.date,
          location: ev.location ?? null,
          description: ev.description ?? null,
        }).run();
        eventCount++;
      }

      // 6. Alte Saison abschließen, neue Saison aktiv setzen
      tx.update(archiveSeasons).set({ active: false, archivedAt: now }).where(eq(archiveSeasons.id, seasonId)).run();
      const newSeason = tx.insert(archiveSeasons).values({
        name: input.newSeasonName,
        startDate: input.newSeasonStart,
        endDate: input.newSeasonEnd,
        active: true,
      }).returning().get();

      // 7. Saisonabhängige Live-Daten zurücksetzen (Stammdaten + card_id bleiben!)
      if (input.resetLiveData !== false) {
        tx.delete(matches).run();
        tx.delete(standings).run();
        tx.delete(nominations).run();
        tx.delete(attendance).run();
        tx.delete(availability).run();
        tx.delete(memberCategories).run(); // Surclassement muss neu vergeben werden
      }

      return {
        archivedSeasonId: seasonId,
        newSeasonId: newSeason.id,
        counts: { teams: teamCount, members: memberCount, matches: matchCount, events: eventCount },
      };
    });
  }

  // Import/Export - Platzhalter, wird später implementiert
  async exportSeasonToJson(seasonId: number): Promise<string> {
    const season = await this.getArchiveSeason(seasonId);
    if (!season) throw new Error("Saison nicht gefunden");

    const teams = await this.getArchiveTeams(seasonId);
    const members = await this.getArchiveMembers(seasonId);
    const matches = await this.getArchiveMatches(seasonId);
    const events = await this.getArchiveEvents(seasonId);

    const exportData = {
      season,
      teams,
      members,
      matches,
      events,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importSeasonFromJson(jsonData: string): Promise<ArchiveSeason> {
    const data = JSON.parse(jsonData);
    // Erstelle neue Saison
    const season = await this.createArchiveSeason({
      ...data.season,
      id: undefined, // Neue ID
      archivedAt: new Date().toISOString(),
    });

    // Importiere Teams
    const teamIdMap = new Map<number, number>();
    for (const team of data.teams) {
      const newTeam = await this.createArchiveTeam({
        ...team,
        id: undefined,
        seasonId: season.id,
      });
      teamIdMap.set(team.id, newTeam.id);
    }

    // Importiere Mitglieder
    for (const member of data.members) {
      await this.createArchiveMember({
        ...member,
        id: undefined,
        seasonId: season.id,
        teamId: teamIdMap.get(member.teamId) || member.teamId,
      });
    }

    // Importiere Spiele
    for (const match of data.matches) {
      await this.createArchiveMatch({
        ...match,
        id: undefined,
        seasonId: season.id,
        teamId: teamIdMap.get(match.teamId) || match.teamId,
      });
    }

    // Importiere Events
    for (const event of data.events) {
      await this.createArchiveEvent({
        ...event,
        id: undefined,
        seasonId: season.id,
        teamId: event.teamId ? teamIdMap.get(event.teamId) || event.teamId : undefined,
      });
    }

    return season;
  }
}

export const storage = new DatabaseStorage();

// ─── Seed Data ──────────────────────────────────────────
export async function seedIfEmpty() {
  const count = db.select().from(users).all();
  if (count.length > 0) return;

  const seedPassword = process.env.SEED_USER_PASSWORD || "demo123";
  if (process.env.NODE_ENV === "production" && !process.env.SEED_USER_PASSWORD) {
    console.warn("[security] SEED_USER_PASSWORD nicht gesetzt – Demo-Seed wird in Produktion übersprungen");
    return;
  }
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);
  const now = new Date().toISOString();
  const today = new Date();
  const isoDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  // ═══════════════════════════════════════════════════════════
  // AKTUELLE SAISON 2025/26 - Teams & Trainer Mersch 75
  // ═══════════════════════════════════════════════════════════
  
  // Teams
  const seniors1 = db.insert(teams).values({ name: "Seniors 1", category: "Seniors 1" }).returning().get()!;
  const frauen = db.insert(teams).values({ name: "Frauen", category: "Frauen" }).returning().get()!;
  const u15 = db.insert(teams).values({ name: "U15", category: "U15" }).returning().get()!;
  const u13 = db.insert(teams).values({ name: "U13", category: "U13" }).returning().get()!;
  const u11Elite = db.insert(teams).values({ name: "U11 Elite", category: "U11 Elite" }).returning().get()!;
  const u11Espoirs = db.insert(teams).values({ name: "U11 Espoirs", category: "U11 Espoirs" }).returning().get()!;
  const u9 = db.insert(teams).values({ name: "U9", category: "U9" }).returning().get()!;
  const u7 = db.insert(teams).values({ name: "U7", category: "U7" }).returning().get()!;
  const u4 = db.insert(teams).values({ name: "U4 KidsSports", category: "U4 KidsSports" }).returning().get()!;

  // Users - Vorstand
  const president = db.insert(users).values({
    email: "praesident@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Präsident",
    role: "präsident",
    active: true,
    createdAt: now,
  }).returning().get()!;

  // Trainer mit LUXQF-Lizenz
  // Max Blanc (LUXQF3) - NEU seit Saison 2025/26 - Koordinator für Jugend U4-U15
  const maxBlanc = db.insert(users).values({
    email: "max.blanc@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Max Blanc",
    role: "trainer",
    qualifications: "LUXQF3",
    teamId: u4.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  // U4: Grégory Redavid, Christophe Kremer, Marc Jungels (LUXQF3)
  const gregoryRedavid = db.insert(users).values({
    email: "gregory.redavid@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Grégory Redavid",
    role: "trainer",
    teamId: u4.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  const christopheKremer = db.insert(users).values({
    email: "christophe.kremer@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Christophe Kremer",
    role: "trainer",
    teamId: u4.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  const marcJungels = db.insert(users).values({
    email: "marc.jungels@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Marc Jungels",
    role: "trainer",
    teamId: u4.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  // U7: Anne Holm (LUXQF3)
  const anneHolm = db.insert(users).values({
    email: "anne.holm@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Anne Holm",
    role: "trainer",
    qualifications: "LUXQF3",
    teamId: u7.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  // U9: Louis Van der Weken (LUXQF2Bis)
  const louisVanderweken = db.insert(users).values({
    email: "louis.vanderweken@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Louis Van der Weken",
    role: "trainer",
    qualifications: "LUXQF2Bis",
    teamId: u9.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  // U11: Elie Schuster
  const elieSchuster = db.insert(users).values({
    email: "elie.schuster@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Elie Schuster",
    role: "trainer",
    teamId: u11Elite.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  // U13 & U15: Max Blanc (Koordinator) + Mathis Derneden (Co-Trainer)
  const mathisDerneden = db.insert(users).values({
    email: "mathis.derneden@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Mathis Derneden",
    role: "trainer",
    teamId: u13.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  // Mädchengruppe (U9/U11/U13): Katarzyna Pietrasik
  const katarzynaPietrasik = db.insert(users).values({
    email: "katarzyna.pietrasik@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Katarzyna Pietrasik",
    role: "trainer",
    teamId: frauen.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  // Frauen: Anne Bisenius Holm
  const anneBisenius = db.insert(users).values({
    email: "anne.bisenius@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Anne Bisenius Holm",
    role: "trainer",
    qualifications: "LUXQF3",
    teamId: frauen.id,
    active: true,
    createdAt: now,
  }).returning().get()!;
  
  // Seniors 1 / U21 / U17: Laurent Metzler
  const laurentMetzler = db.insert(users).values({
    email: "laurent.metzler@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Laurent Metzler",
    role: "trainer",
    teamId: seniors1.id,
    active: true,
    createdAt: now,
  }).returning().get()!;

  // Demo Spieler
  const spieler = db.insert(users).values({
    email: "spieler@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Max Mustermann",
    role: "spieler",
    teamId: seniors1.id,
    active: true,
    createdAt: now,
  }).returning().get()!;

  db.insert(users).values({
    email: "kassenwart@mersch75.lu",
    passwordHash: hash(seedPassword),
    name: "Anne Müller",
    role: "kassenwart",
    active: true,
    createdAt: now,
  }).run();

  // Update team trainers - Max Blanc Koordinator für alle Jugendteams (U4-U15)
  db.update(teams).set({ trainerId: maxBlanc.id }).where(eq(teams.id, u4.id)).run();
  db.update(teams).set({ trainerId: maxBlanc.id }).where(eq(teams.id, u7.id)).run();
  db.update(teams).set({ trainerId: maxBlanc.id }).where(eq(teams.id, u9.id)).run();
  db.update(teams).set({ trainerId: maxBlanc.id }).where(eq(teams.id, u11Elite.id)).run();
  db.update(teams).set({ trainerId: maxBlanc.id }).where(eq(teams.id, u11Espoirs.id)).run();
  db.update(teams).set({ trainerId: maxBlanc.id }).where(eq(teams.id, u13.id)).run();  // Max Blanc Koordinator
  db.update(teams).set({ trainerId: maxBlanc.id }).where(eq(teams.id, u15.id)).run();  // Max Blanc Koordinator
  db.update(teams).set({ trainerId: anneBisenius.id }).where(eq(teams.id, frauen.id)).run();
  db.update(teams).set({ trainerId: laurentMetzler.id }).where(eq(teams.id, seniors1.id)).run();

  // Members - Beispieldaten für aktuelle Teams
  const firstNames = ["Lucas", "Noah", "Léon", "Liam", "Hugo", "Théo", "Gabriel", "Nathan", "Arthur", "Louis", "Mathis", "Ethan", "Raphaël", "Jules", "Adam", "Paul"];
  const lastNames = ["Muller", "Weber", "Schmit", "Schneider", "Hoffmann", "Kremer", "Thill", "Reuter", "Wagner", "Becker", "Kayser", "Klein", "Schaeffer", "Hansen"];
  const teamsArr = [seniors1, frauen, u15, u13, u11Elite, u11Espoirs, u9, u7];
  let memberIdx = 0;
  for (const t of teamsArr) {
    const memberCount = t.category === "Seniors 1" ? 18 :
                        t.category === "Frauen" ? 15 :
                        t.category === "U15" || t.category === "U13" ? 14 :
                        t.category === "U11 Elite" || t.category === "U11 Espoirs" ? 12 :
                        t.category === "U9" || t.category === "U7" ? 10 : 8;
    for (let i = 0; i < memberCount; i++) {
      const firstName = firstNames[memberIdx % firstNames.length];
      const lastName = lastNames[(memberIdx * 3) % lastNames.length];
      db.insert(members).values({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mersch75.lu`,
        phone: `+352 621 ${100000 + memberIdx}`,
        birthdate: t.category === "Seniors 1" ? `${1990 + (memberIdx % 20)}-05-12` :
          t.category === "Frauen" ? `${1995 + (memberIdx % 15)}-08-15` :
          t.category === "U15" ? `${2010 + (memberIdx % 2)}-06-14` :
          t.category === "U13" ? `${2012 + (memberIdx % 2)}-03-22` :
          t.category === "U11 Elite" || t.category === "U11 Espoirs" ? `${2014 + (memberIdx % 2)}-09-05` :
          t.category === "U9" ? `${2016 + (memberIdx % 2)}-01-20` :
          `${2018 + (memberIdx % 2)}-07-10`,
        address: `${10 + i} Rue de l'Alzette, L-7561 Mersch`,
        teamId: t.id,
        licenseNumber: `FLH-${2025000 + memberIdx}`,
        membershipStatus: "active",
      }).run();
      memberIdx++;
    }
  }

  // Link the spieler user to a member
  db.insert(members).values({
    name: "Max Mustermann",
    email: "spieler@mersch75.lu",
    phone: "+352 621 999888",
    birthdate: "1995-04-11",
    address: "2 Place de l'Église, L-7561 Mersch",
    teamId: seniors1.id,
    licenseNumber: "FLH-2025999",
    membershipStatus: "active",
    userId: spieler.id,
  }).run();

  // Announcements
  const announcementsData = [
    { title: "Willkommen zur Saison 2025/26!", content: "Wir starten mit großer Motivation in die neue Saison. Viel Erfolg allen Teams!", pinned: true, targetRole: "all" },
    { title: "Neue Trainingszeiten", content: "Ab nächster Woche: Seniors trainieren Dienstag und Donnerstag ab 19:30 Uhr in der Halle Krounebierg.", pinned: true, targetRole: "all" },
    { title: "Heimspiel gegen HB Esch", content: "Kommenden Samstag empfangen wir HB Esch in der Halle Krounebierg. Anpfiff: 18:00 Uhr. Support erwünscht!", pinned: false, targetRole: "all" },
    { title: "Sommerfest 2025", content: "Save the date: Unser traditionelles Sommerfest findet am 21. Juni im Vereinsheim statt.", pinned: false, targetRole: "all" },
    { title: "Trainertagung", content: "Alle Trainer sind zur Sitzung am Mittwoch 20:00 Uhr im Clubhaus eingeladen.", pinned: false, targetRole: "trainer" },
  ];
  for (let i = 0; i < announcementsData.length; i++) {
    const a = announcementsData[i];
    const ts = new Date(Date.now() - i * 86400000 * 2).toISOString();
    db.insert(announcements).values({
      title: a.title,
      content: a.content,
      authorId: president.id,
      targetRole: a.targetRole,
      pinned: a.pinned,
      createdAt: ts,
    }).run();
  }

  // Events - Trainings und Spiele aktuelle Saison 2025/26
  const eventData = [
    // Seniors 1 (Méindes & Mëttwochs 20:30-21:30, Hall Omnisports)
    { offset: 1, time: "20:30", title: "Training Seniors 1", type: "training", teamId: seniors1.id, location: "Hall Omnisports, 21 rue des Prés Mersch" },
    { offset: 3, time: "20:30", title: "Training Seniors 1", type: "training", teamId: seniors1.id, location: "Hall Omnisports, 21 rue des Prés Mersch" },
    
    // Frauen (Méindes & Freides 19:00-20:30, Hall Omnisports)
    { offset: 1, time: "19:00", title: "Training Frauen", type: "training", teamId: frauen.id, location: "Hall Omnisports, 21 rue des Prés Mersch" },
    { offset: 5, time: "19:00", title: "Training Frauen", type: "training", teamId: frauen.id, location: "Hall Omnisports, 21 rue des Prés Mersch" },
    
    // U15 & U13 (Méindes 17:30-19:00, Mëttwochs 18:30-20:00, Freides 19:00-20:30)
    { offset: 1, time: "18:30", title: "Training U15", type: "training", teamId: u15.id, location: "Hall Omnisports, 21 rue des Prés Mersch" },
    { offset: 1, time: "17:30", title: "Training U13", type: "training", teamId: u13.id, location: "Hall Omnisports, 21 rue des Prés Mersch" },
    { offset: 3, time: "18:30", title: "Training U15 & U13", type: "training", teamId: u15.id, location: "Hall Omnisports, 21 rue des Prés Mersch" },
    { offset: 5, time: "19:00", title: "Training U15 & U13", type: "training", teamId: u15.id, location: "Hall Omnisports Krounebierg, 11 rue de la Piscine Mersch" },
    
    // U11 Elite/Espoirs (Mëttwochs & Freides 17:30-19:00)
    { offset: 3, time: "17:30", title: "Training U11", type: "training", teamId: u11Elite.id, location: "Hall Omnisports, 21 rue des Prés Mersch" },
    { offset: 5, time: "17:30", title: "Training U11", type: "training", teamId: u11Espoirs.id, location: "Hall Omnisports Krounebierg, 11 rue de la Piscine Mersch" },
    
    // U9 (Dënschdes & Donneschdes 17:30-19:00)
    { offset: 2, time: "17:30", title: "Training U9", type: "training", teamId: u9.id, location: "Hall Omnisports Krounebierg, 11 rue de la Piscine Mersch" },
    { offset: 4, time: "17:30", title: "Training U9", type: "training", teamId: u9.id, location: "Hall Omnisports Krounebierg, 11 rue de la Piscine Mersch" },
    
    // U7 (Dënschdes 17:30-18:30, Freides 16:30-17:30)
    { offset: 2, time: "17:30", title: "Training U7", type: "training", teamId: u7.id, location: "Sportshal Lëntgen, 50 rue de la Gare" },
    { offset: 5, time: "16:30", title: "Training U7", type: "training", teamId: u7.id, location: "Hall Omnisports Krounebierg, 11 rue de la Piscine Mersch" },
    
    // Vorstandssitzung
    { offset: 4, time: "20:00", title: "Vorstandssitzung", type: "meeting", teamId: null, location: "Clubhaus", jitsi: true },
    
    // Spiel
    { offset: 5, time: "18:00", title: "Spiel vs. HB Esch", type: "spiel", teamId: seniors1.id, location: "Hall Omnisports, 21 rue des Prés Mersch" },
  ];
  for (const e of eventData) {
    db.insert(events).values({
      title: e.title,
      type: e.type,
      teamId: e.teamId ?? undefined,
      date: isoDate(e.offset),
      time: e.time,
      location: e.location,
      jitsiRoom: e.jitsi ? `Mersch75-${Math.random().toString(36).slice(2, 10)}` : undefined,
    }).run();
  }

  // Meetings
  db.insert(meetings).values({
    title: "Vorstandssitzung November",
    date: isoDate(4),
    time: "20:00",
    jitsiRoom: `Mersch75-vorstand-${Math.random().toString(36).slice(2, 8)}`,
    agenda: "1. Finanzbericht\n2. Saisonplanung\n3. Sommerfest 2025\n4. Sonstiges",
    createdAt: now,
    authorId: president.id,
  }).run();

  db.insert(meetings).values({
    title: "Trainer-Meeting",
    date: isoDate(7),
    time: "19:00",
    jitsiRoom: `Mersch75-trainer-${Math.random().toString(36).slice(2, 8)}`,
    agenda: "1. Trainingsplan\n2. Turniervorbereitung\n3. Kommunikation mit Eltern",
    createdAt: now,
    authorId: president.id,
  }).run();

  // Accounts
  const mainAcc = db.insert(accounts).values({ name: "Hauptkonto", balance: 0 }).returning().get()!;
  const eventAcc = db.insert(accounts).values({ name: "Eventkasse", balance: 0 }).returning().get()!;
  const juniorsAcc = db.insert(accounts).values({ name: "Jugendförderung", balance: 0 }).returning().get()!;

  // Transactions
  const txData = [
    { accountId: mainAcc.id, amount: 12500, description: "Mitgliedsbeiträge Q1", type: "income", visibility: "öffentlich", offset: -30 },
    { accountId: mainAcc.id, amount: 3400, description: "Sponsoring Banque Raiffeisen", type: "income", visibility: "öffentlich", offset: -25 },
    { accountId: mainAcc.id, amount: 1800, description: "Hallenmiete März", type: "expense", visibility: "öffentlich", offset: -20 },
    { accountId: mainAcc.id, amount: 650, description: "Trikotsatz U17", type: "expense", visibility: "intern", offset: -15 },
    { accountId: eventAcc.id, amount: 2100, description: "Tombola Sommerfest", type: "income", visibility: "öffentlich", offset: -10 },
    { accountId: eventAcc.id, amount: 980, description: "Verpflegung Turnier", type: "expense", visibility: "intern", offset: -8 },
    { accountId: juniorsAcc.id, amount: 5000, description: "Zuschuss Gemeinde Mersch", type: "income", visibility: "öffentlich", offset: -5 },
    { accountId: juniorsAcc.id, amount: 420, description: "Trainingsmaterial U13", type: "expense", visibility: "intern", offset: -3 },
  ];
  for (const t of txData) {
    const d = new Date();
    d.setDate(d.getDate() + t.offset);
    await storage.createTransaction({
      accountId: t.accountId,
      amount: t.amount,
      description: t.description,
      type: t.type,
      visibility: t.visibility,
      date: d.toISOString().slice(0, 10),
      createdAt: d.toISOString(),
    });
  }

  // Sample attendance for past sessions (Seniors 1 team)
  const seniors1Members = db.select().from(members).where(eq(members.teamId, seniors1.id)).all();
  for (let offsetDays = -14; offsetDays <= 0; offsetDays += 3) {
    const date = isoDate(offsetDays);
    for (const m of seniors1Members) {
      db.insert(attendance).values({
        memberId: m.id,
        teamId: seniors1.id,
        date,
        present: Math.random() > 0.2,
      }).run();
    }
  }

  // Player flags
  if (seniors1Members.length > 2) {
    db.insert(playerFlags).values({
      memberId: seniors1Members[0].id,
      flag: "injured",
      note: "Knöchel, 2 Wochen Pause",
      createdAt: now,
    }).run();
    db.insert(playerFlags).values({
      memberId: seniors1Members[2].id,
      flag: "absent",
      note: "Urlaub bis Ende Monat",
      createdAt: now,
    }).run();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ARCHIV SAISON 2024/25
  // ═══════════════════════════════════════════════════════════════════════════

  const archiveSeason = db.insert(archiveSeasons).values({
    name: "2024/25",
    startDate: "2024-08-01",
    endDate: "2025-06-30",
    description: "Historische Daten der Saison 2024/25 - Vorgänger der aktuellen Saison",
    active: false,
    createdAt: now,
    archivedAt: now,
  }).returning().get()!;

  // Alte Teams der Saison 24/25
  // Hinweis: U17 und U21 spielen nicht in der Meisterschaft und werden nicht als Archiv-Teams geführt
  // Trainer-Zuordnung basiert auf den angegebenen Trainingsgruppen-Daten
  const oldTeams = [
    { name: "Vétérans", category: "Vétérans", trainerName: null as any, matchesPlayed: 18, matchesWon: 12, matchesDrawn: 3, matchesLost: 3, goalsFor: 156, goalsAgainst: 98, points: 27 },
    { name: "Seniors", category: "Seniors", trainerName: "Laurent Metzler", matchesPlayed: 22, matchesWon: 15, matchesDrawn: 4, matchesLost: 3, goalsFor: 198, goalsAgainst: 145, points: 34 },
    { name: "Frauen", category: "Frauen", trainerName: "Katarzyna Pietrasik", matchesPlayed: 16, matchesWon: 10, matchesDrawn: 3, matchesLost: 3, goalsFor: 145, goalsAgainst: 112, points: 23 },
    { name: "U15", category: "U15", trainerName: "Max Blanc, Mathis Derneden", matchesPlayed: 16, matchesWon: 12, matchesDrawn: 2, matchesLost: 2, goalsFor: 98, goalsAgainst: 65, points: 26 },
    { name: "U13", category: "U13", trainerName: "Max Blanc, Mathis Derneden", matchesPlayed: 14, matchesWon: 9, matchesDrawn: 3, matchesLost: 2, goalsFor: 87, goalsAgainst: 52, points: 21 },
    { name: "U11 Elite", category: "U11 Elite", trainerName: "Max Blanc, Elie Schuster", matchesPlayed: 12, matchesWon: 6, matchesDrawn: 3, matchesLost: 3, goalsFor: 65, goalsAgainst: 48, points: 15 },
    { name: "U11 Espoirs", category: "U11 Espoirs", trainerName: "Max Blanc, Elie Schuster", matchesPlayed: 10, matchesWon: 5, matchesDrawn: 2, matchesLost: 3, goalsFor: 45, goalsAgainst: 38, points: 12 },
    { name: "U9", category: "U9", trainerName: "Max Blanc, Louis Van der Weken", matchesPlayed: 8, matchesWon: 4, matchesDrawn: 2, matchesLost: 2, goalsFor: 32, goalsAgainst: 28, points: 10 },
    { name: "U7", category: "U7", trainerName: "Max Blanc, Anne Holm", matchesPlayed: 6, matchesWon: 3, matchesDrawn: 1, matchesLost: 2, goalsFor: 18, goalsAgainst: 15, points: 7 },
    { name: "U4 KidsSports", category: "U4 KidsSports", trainerName: "Grégory Redavid, Christophe Kremer, Marc Jungels, Max Blanc", matchesPlayed: 4, matchesWon: 2, matchesDrawn: 1, matchesLost: 1, goalsFor: 12, goalsAgainst: 10, points: 5 },
  ];

  const archivedTeamIds = new Map<string, number>();

  for (const teamData of oldTeams) {
    const team = db.insert(archiveTeams).values({
      seasonId: archiveSeason.id,
      name: teamData.name,
      category: teamData.category,
      trainerName: teamData.trainerName,
      finalRank: Math.floor(Math.random() * 8) + 1,
      matchesPlayed: teamData.matchesPlayed,
      matchesWon: teamData.matchesWon,
      matchesDrawn: teamData.matchesDrawn,
      matchesLost: teamData.matchesLost,
      goalsFor: teamData.goalsFor,
      goalsAgainst: teamData.goalsAgainst,
      points: teamData.points,
      createdAt: now,
    }).returning().get()!;
    archivedTeamIds.set(teamData.category, team.id);
  }

  // Archivierte Mitglieder für jede Altersklasse
  const archiveFirstNames = ["Marc", "Luc", "Paul", "Jean", "Tom", "Max", "Leo", "Tim", "Ben", "Noah", "Elias", "Liam", "Felix", "Jonas"];
  const archiveLastNames = ["Weber", "Schmit", "Kremer", "Thill", "Hoffmann", "Muller", "Reuter", "Wagner", "Becker", "Klein"];

  for (const [category, teamId] of Array.from(archivedTeamIds.entries())) {
    const memberCount = category === "Vétérans" ? 12 :
                        category === "Seniors" ? 18 :
                        category === "Frauen" ? 16 :
                        category === "U15" ? 14 :
                        category === "U13" ? 12 :
                        category === "U11 Elite" ? 12 :
                        category === "U11 Espoirs" ? 10 :
                        category === "U9" ? 10 :
                        category === "U7" ? 8 : 6;

    for (let i = 0; i < memberCount; i++) {
      const firstName = archiveFirstNames[i % archiveFirstNames.length];
      const lastName = archiveLastNames[(i * 3) % archiveLastNames.length];
      const birthYear = category === "Vétérans" ? 1980 + (i % 20) :
                        category === "Seniors" ? 1990 + (i % 15) :
                        category === "Frauen" ? 1995 + (i % 10) :
                        category === "U15" ? 2009 + (i % 2) :
                        category === "U13" ? 2011 + (i % 2) :
                        category === "U11 Elite" ? 2013 + (i % 2) :
                        category === "U11 Espoirs" ? 2013 + (i % 2) :
                        category === "U9" ? 2015 + (i % 2) :
                        category === "U7" ? 2017 + (i % 2) : 2020;

      db.insert(archiveMembers).values({
        seasonId: archiveSeason.id,
        teamId: teamId,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@archive-2425.lu`,
        birthdate: `${birthYear}-05-${10 + (i % 20)}`,
        licenseNumber: `FLH-2024${1000 + i}`,
        position: i === 0 ? "TW" : i < 4 ? "LW" : i < 7 ? "RW" : i < 10 ? "KM" : "RM",
        goals: Math.floor(Math.random() * 30),
        assists: Math.floor(Math.random() * 20),
        yellowCards: Math.floor(Math.random() * 5),
        redCards: Math.floor(Math.random() * 2),
        matchesPlayed: Math.floor(Math.random() * 15) + 5,
        createdAt: now,
      }).run();
    }
  }

  // Archivierte Spiele
  const opponents = ["HB Esch", "HC Käerjeng", "Handball Diddeleng", "HB Dudelange", "HC Pétange", "HB Diekirch", "Handball Echternach"];

  for (const [category, teamId] of Array.from(archivedTeamIds)) {
    const matchCount = Math.floor(Math.random() * 8) + 6;
    for (let i = 0; i < matchCount; i++) {
      const isHome = i % 2 === 0;
      const opponent = opponents[i % opponents.length];
      const homeGoals = Math.floor(Math.random() * 15) + 5;
      const awayGoals = Math.floor(Math.random() * 15) + 5;
      const result = homeGoals > awayGoals ? "win" : homeGoals < awayGoals ? "loss" : "draw";

      db.insert(archiveMatches).values({
        seasonId: archiveSeason.id,
        teamId: teamId,
        date: `2024-${9 + Math.floor(i / 4)}-${(i % 28) + 1}`,
        opponent: opponent,
        venue: isHome ? "home" : "away",
        location: isHome ? "Halle Krounebierg, Mersch" : `${opponent} Halle`,
        homeGoals: isHome ? homeGoals : awayGoals,
        awayGoals: isHome ? awayGoals : homeGoals,
        result: isHome ? result : (result === "win" ? "loss" : result === "loss" ? "win" : "draw"),
        scorers: JSON.stringify([{name: "Spieler A", goals: 2}, {name: "Spieler B", goals: 1}]),
        notes: "Archiviertes Spiel Saison 24/25",
        createdAt: now,
      }).run();
    }
  }

  // Archivierte Events
  const eventTypes = ["training", "tournament", "camp", "friendly"];
  const eventTitles = ["Trainingslager", "Turnier", "Freundschaftsspiel", "Saisonabschluss"];

  for (let i = 0; i < 20; i++) {
    const entries = Array.from(archivedTeamIds.entries());
    const randomTeam = entries[Math.floor(Math.random() * entries.length)];
    db.insert(archiveEvents).values({
      seasonId: archiveSeason.id,
      teamId: randomTeam[1],
      title: eventTitles[i % eventTitles.length],
      type: eventTypes[i % eventTypes.length],
      date: `2024-${9 + Math.floor(i / 5)}-${(i % 28) + 1}`,
      location: i % 2 === 0 ? "Mersch" : "Auswärts",
      description: `Archiviertes Event aus Saison 24/25 für ${randomTeam[0]}`,
      attendance: JSON.stringify({present: 12, absent: 3}),
      createdAt: now,
    }).run();
  }

  console.log("[seed] initial data seeded + archive season 2024/25");
}

// ─── Test-Random-Nos (Demo) ─────────────────────────────
// Idempotent: legt 5 Test-Mitglieder mit festen Random-Nos je Funktion an,
// damit man den Karten-Login pro Rolle ausprobieren kann.
export const TEST_CARDS: { cardId: string; name: string; clubFunction: string }[] = [
  { cardId: "ABCDEFG1", name: "TEST Admin", clubFunction: "Admin" },
  { cardId: "ABCDEFG2", name: "TEST Präsident", clubFunction: "Comité" },
  { cardId: "ABCDEFG3", name: "TEST Trainer", clubFunction: "Entraîneur" },
  { cardId: "ABCDEFG4", name: "TEST Spieler", clubFunction: "Spieler" },
  { cardId: "ABCDEFG5", name: "TEST Mitglied", clubFunction: "Mitglied" },
];

export function seedTestCards() {
  for (const c of TEST_CARDS) {
    const existing = db.select().from(members).where(eq(members.cardId, c.cardId)).get();
    if (!existing) {
      db.insert(members)
        .values({
          name: c.name,
          membershipStatus: "active",
          cardId: c.cardId,
          clubFunction: c.clubFunction,
        })
        .run();
    }
  }
  console.log("[seed] test random-no cards ensured (ABCDEFG1–5)");
}
