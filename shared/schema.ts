import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Users ──────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // präsident | kassenwart | trainer | spieler | elternteil | admin | secretaire
  teamId: integer("team_id"),
  phone: text("phone"), // für SMS Magic Links
  countryCode: text("country_code").default("+352"), // +352 = Luxemburg
  photoUrl: text("photo_url"),
  qualifications: text("qualifications"), // Trainer-Lizenz (LUXQF3, LUXQF2Bis, etc.)
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "passwordHash">;

// ─── Teams ──────────────────────────────────────────────
export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  trainerId: integer("trainer_id"),
});
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

// ─── Members ─────────────────────────────────────────────
export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  birthdate: text("birthdate"),
  address: text("address"),
  teamId: integer("team_id"),
  licenseNumber: text("license_number"),
  membershipStatus: text("membership_status").notNull().default("active"),
  photoUrl: text("photo_url"),
  faceDescriptor: text("face_descriptor"), // JSON-encoded float array
  userId: integer("user_id"),
  cardId: text("card_id"), // Random-No / Karten-ID (z.B. LNS6S2DM), aus Mitgliederliste
  clubFunction: text("club_function"), // Funktion im Verein (z.B. Mitglied, Spieler, Comité, Officiel, Entraîneur)
  nationality: text("nationality"), // Langue / Nationalité
  internalCategory: text("internal_category"), // Catégorie interne Mersch75
  flhCategory: text("flh_category"), // Catégorie Listing FLH 2025-2026
  teamCategory: text("team_category"), // abgeleitet aus U-Flags (z.B. U13H)
  passNumber: text("pass_number"), // Pass Nummer / Lizenz
  matricule: text("matricule"), // nationale Matricule
  medicoNext: text("medico_next"), // Prochain Médico
  joinDate: text("join_date"), // date début membre
  rawData: text("raw_data"), // JSON aller Originalspalten aus der Excel
  // ─── Neue strukturierte Felder (Kategorien-Neuordnung, siehe docs/kategorien-neuordnung.md) ───
  catCode: integer("cat_code"), // Spielkategorie-Code: H 11-21, D 31-41 (siehe CAT_CODE_LABELS)
  licenceStatus: text("licence_status"), // aktiv | keine | behalten | geloescht
  transferStatus: text("transfer_status"), // pret_raus | pret_rein | transfer_rein | pret_gratis | transfer_raus
  memberType: text("member_type").default("spieler"), // spieler | donateur | donateur_lizenz | ehrenmitglied | sponsor
  contactInfoType: text("contact_info_type"), // contact_famille | mere_accueil (rein informativ, Nicht-Mitglied)
});
export const insertMemberSchema = createInsertSchema(members).omit({ id: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

// ─── Attendance ─────────────────────────────────────────
export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  teamId: integer("team_id").notNull(),
  date: text("date").notNull(), // ISO date YYYY-MM-DD
  present: integer("present", { mode: "boolean" }).notNull(),
  note: text("note"),
});
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

// ─── Announcements ──────────────────────────────────────
export const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull(),
  targetRole: text("target_role").notNull().default("all"),
  targetTeamId: integer("target_team_id"),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true });
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// ─── Events ─────────────────────────────────────────────
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  type: text("type").notNull(), // training | spiel | event | meeting
  teamId: integer("team_id"),
  date: text("date").notNull(), // YYYY-MM-DD
  time: text("time"), // HH:MM
  endTime: text("end_time"),
  location: text("location"),
  description: text("description"),
  jitsiRoom: text("jitsi_room"),
});
export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// ─── Availability ───────────────────────────────────────
export const availability = sqliteTable("availability", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  eventId: integer("event_id").notNull(),
  available: integer("available", { mode: "boolean" }).notNull(),
  note: text("note"),
});
export const insertAvailabilitySchema = createInsertSchema(availability).omit({ id: true });
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;

// ─── Meetings ───────────────────────────────────────────
export const meetings = sqliteTable("meetings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  jitsiRoom: text("jitsi_room").notNull(),
  agenda: text("agenda"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  authorId: integer("author_id").notNull(),
});
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true });
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

// ─── Accounts ───────────────────────────────────────────
export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  balance: real("balance").notNull().default(0),
});
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

// ─── Transactions ───────────────────────────────────────
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: integer("account_id").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(), // income | expense
  visibility: text("visibility").notNull().default("intern"), // intern | öffentlich
  createdAt: text("created_at").notNull(),
});
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// ─── Player Flags ───────────────────────────────────────
export const playerFlags = sqliteTable("player_flags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  flag: text("flag").notNull(), // injured | suspended | absent
  note: text("note"),
  createdAt: text("created_at").notNull(),
});
export const insertPlayerFlagSchema = createInsertSchema(playerFlags).omit({ id: true });
export type InsertPlayerFlag = z.infer<typeof insertPlayerFlagSchema>;
export type PlayerFlag = typeof playerFlags.$inferSelect;

// ─── Member Functions (Mehrfach-Funktionen pro Mitglied) ─
// Ersetzt die alten Kombi-Codes (102/109/151/152). Eine Person kann mehrere Zeilen haben.
export const memberFunctions = sqliteTable("member_functions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull().references(() => members.id),
  function: text("function").notNull(), // joueur | arbitre | officiel | comite | coach | coach_backup | benevole | benevole_licence | contact_famille | mere_accueil
  code: integer("code"), // zugehöriger Code: Comité H1/F3, Officiel H2/F4, Arbitre H21/F41, Bénévole 50er-Block
  note: text("note"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});
export const insertMemberFunctionSchema = createInsertSchema(memberFunctions).omit({ id: true, createdAt: true });
export type InsertMemberFunction = z.infer<typeof insertMemberFunctionSchema>;
export type MemberFunction = typeof memberFunctions.$inferSelect;

// ─── Member Categories (Spielberechtigung in mehreren Kategorien) ─
// Ein Spieler spielt normal in seiner Alterskategorie (= members.catCode, Hauptkategorie),
// darf aber HÖHER spielen (Surclassement, z.B. Sa U13 + So U15) und in seltenen Fällen
// TIEFER (sous_classement). Hier stehen die ZUSÄTZLICHEN Spielberechtigungen.
export const memberCategories = sqliteTable("member_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull().references(() => members.id),
  catCode: integer("cat_code").notNull(), // Kategorie-Code (11-21 / 31-41)
  kind: text("kind").notNull().default("surclassement"), // surclassement (höher) | sous_classement (tiefer)
  note: text("note"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});
export const insertMemberCategorySchema = createInsertSchema(memberCategories).omit({ id: true, createdAt: true });
export type InsertMemberCategory = z.infer<typeof insertMemberCategorySchema>;
export type MemberCategory = typeof memberCategories.$inferSelect;
export const CATEGORY_KINDS = ["primaer", "surclassement", "sous_classement"] as const;

// Hinweis: Eine Tabelle `injuries` (+ `rehab_sessions`) existiert bereits weiter unten
// (an users.id gebunden). Für die Verletzungsstatistik wird diese bestehende Tabelle genutzt.

// ─── Kategorie-/Funktions-Konstanten (siehe docs/kategorien-neuordnung.md) ───
export const MEMBER_FUNCTIONS = ["joueur", "arbitre", "officiel", "comite", "coach", "coach_backup", "benevole", "benevole_licence", "contact_famille", "mere_accueil"] as const;
export type MemberFunctionType = typeof MEMBER_FUNCTIONS[number];

export const LICENCE_STATUSES = ["aktiv", "keine", "behalten", "geloescht"] as const;
export const MEMBERSHIP_STATUSES = ["aktiv", "inaktiv", "arret_temporaire", "pausiert_verletzung", "abbruch", "abbruch_jung", "ehemalig", "intern_gesperrt"] as const;
export const TRANSFER_STATUSES = ["pret_raus", "pret_rein", "transfer_rein", "pret_gratis", "transfer_raus"] as const;
export const MEMBER_TYPES = ["spieler", "donateur", "donateur_lizenz", "ehrenmitglied", "sponsor"] as const;

// Spielkategorie-Code → Label (H 11-21 / D 31-41)
export const CAT_CODE_LABELS: Record<number, string> = {
  11: "Seniors H", 12: "U21 H", 13: "U17 H", 14: "U15 H", 15: "U13 H",
  16: "U11 H", 17: "U9 H", 18: "U7 H", 19: "U4 H", 20: "Vétérans H", 21: "Arbitre H",
  31: "Seniors/Dames", 32: "U21 F", 33: "U17 F", 34: "U15 F", 35: "U13 F",
  36: "U11 F", 37: "U9 F", 38: "U7 F", 39: "U4 F", 40: "Vétérans D", 41: "Arbitre F",
};

// Funktions-Code (H/F) → Funktion
export const FUNCTION_CODES: Record<number, string> = {
  1: "comite", 3: "comite", 2: "officiel", 4: "officiel", 21: "arbitre", 41: "arbitre",
  50: "benevole", 51: "benevole", 52: "benevole_licence", 53: "coach", 54: "coach_backup",
};

// Role helpers
export const ROLES = ["präsident", "kassenwart", "trainer", "spieler", "elternteil", "admin", "secretaire"] as const;
export type Role = typeof ROLES[number];

// Aktuelle Saison: 2025/26
// Teams: Seniors 1, Frauen, U21, U15, U13, U11 Elite, U11 Espoirs, U9, U7, U4
// Hinweis: U17 existiert noch nicht
export const CATEGORIES = [
  "Seniors 1",
  "Frauen",
  "U21",
  "U15",
  "U13",
  "U11 Elite",
  "U11 Espoirs",
  "U9",
  "U7",
  "U4 KidsSports",
] as const;

// ─── Nominations (Spieler-Nominierung) ──────────────────
export const nominations = sqliteTable("nominations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),         // welches Spiel
  memberId: integer("member_id").notNull(),        // nominierter Spieler
  nominatedById: integer("nominated_by_id").notNull(), // Trainer
  response: text("response"),                      // "ja" | "nein" | null (ausstehend)
  reason: text("reason"),                          // Begründung bei "nein"
  createdAt: text("created_at").notNull(),
});
export const insertNominationSchema = createInsertSchema(nominations).omit({ id: true });
export type InsertNomination = z.infer<typeof insertNominationSchema>;
export type Nomination = typeof nominations.$inferSelect;

// ─── Chat Messages (Team-Gruppenchat) ───────────────────
export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull(),
  authorId: integer("author_id").notNull(),        // user.id
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// ─── Fee Rules (Beitragsregeln) ─────────────────────────
export const feeRules = sqliteTable("fee_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // z.B. "Jugend U17", "Erwachsene", "Familie"
  category: text("category").notNull(), // age_group | team | family | custom
  amount: real("amount").notNull(), // in EUR
  description: text("description"),
  appliesToTeams: text("applies_to_teams"), // JSON array of team IDs, null = alle
  minAge: integer("min_age"), // optional: ab welchem Alter
  maxAge: integer("max_age"), // optional: bis welchem Alter
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});
export const insertFeeRuleSchema = createInsertSchema(feeRules).omit({ id: true });
export type InsertFeeRule = z.infer<typeof insertFeeRuleSchema>;
export type FeeRule = typeof feeRules.$inferSelect;

// ─── Member Fees (Beitragszuordnung pro Mitglied) ───────
export const memberFees = sqliteTable("member_fees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  feeRuleId: integer("fee_rule_id").notNull(),
  year: integer("year").notNull(), // z.B. 2025
  amount: real("amount").notNull(), // tatsächlicher Betrag (kann abweichen)
  status: text("status").notNull().default("open"), // open | paid | partial | waived
  paidAmount: real("paid_amount").notNull().default(0),
  dueDate: text("due_date"), // Fälligkeitsdatum
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
export const insertMemberFeeSchema = createInsertSchema(memberFees).omit({ id: true });
export type InsertMemberFee = z.infer<typeof insertMemberFeeSchema>;
export type MemberFee = typeof memberFees.$inferSelect;

// ─── Fee Payments (Zahlungseingänge) ────────────────────
export const feePayments = sqliteTable("fee_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberFeeId: integer("member_fee_id").notNull(),
  amount: real("amount").notNull(),
  paymentDate: text("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull().default("transfer"), // transfer | cash | paypal | other
  reference: text("reference"), // Verwendungszweck/Referenz
  notes: text("notes"),
  createdById: integer("created_by_id"), // wer hat gebucht
  createdAt: text("created_at").notNull(),
});
export const insertFeePaymentSchema = createInsertSchema(feePayments).omit({ id: true });
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;
export type FeePayment = typeof feePayments.$inferSelect;

// ─── Audit Logs (Security & Compliance) ─────────────────
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventType: text("event_type").notNull(),        // THREAT_DETECTED, AUTH_FAILURE, RATE_LIMIT, etc.
  severity: text("severity").notNull().default("LOW"), // LOW, MEDIUM, HIGH, CRITICAL
  ipAddress: text("ip_address").notNull(),
  path: text("path").notNull(),
  method: text("method").notNull(),
  userId: integer("user_id"),                      // optional
  userAgent: text("user_agent"),
  details: text("details"),                        // JSON or text description
  timestamp: text("timestamp").notNull(),
  emailAlertSent: integer("email_alert_sent", { mode: "boolean" }).default(false),
});
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ─── Email Settings (SMTP-Konfiguration) ──────────────────
export const emailSettings = sqliteTable("email_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").notNull().default(587),
  smtpUser: text("smtp_user").notNull(),
  smtpPassword: text("smtp_password").notNull(), // verschlüsselt speichern!
  smtpSecure: integer("smtp_secure", { mode: "boolean" }).notNull().default(false),
  fromName: text("from_name").notNull().default("M75 Manager"),
  fromEmail: text("from_email").notNull(),
  replyTo: text("reply_to"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});
export const insertEmailSettingsSchema = createInsertSchema(emailSettings).omit({ id: true });
export type InsertEmailSettings = z.infer<typeof insertEmailSettingsSchema>;
export type EmailSettings = typeof emailSettings.$inferSelect;

// ─── Emails (Versendete E-Mails) ────────────────────────
export const emails = sqliteTable("emails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  toEmail: text("to_email").notNull(),
  toName: text("to_name"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  template: text("template"), // welcome | reminder | alert | custom
  status: text("status").notNull().default("pending"), // pending | sent | failed
  errorMessage: text("error_message"),
  sentAt: text("sent_at"),
  createdAt: text("created_at").notNull(),
  userId: integer("user_id"), // optional: an welchen User
  memberId: integer("member_id"), // optional: an welches Mitglied
});
export const insertEmailSchema = createInsertSchema(emails).omit({ id: true });
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Email = typeof emails.$inferSelect;

// ─── Documents (Dokumenten-Management) ───────────────────
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(), // relativer Pfad im uploads/documents Ordner
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  category: text("category").notNull().default("other"), // contract | invoice | certificate | protocol | other
  tags: text("tags"), // JSON-Array
  memberId: integer("member_id"), // optional: zuordnung zu Mitglied
  uploadedById: integer("uploaded_by_id").notNull(),
  visibility: text("visibility").notNull().default("private"), // private | team | board | public
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// ─── Registrations (Online-Anmeldungen) ─────────────────
export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  birthdate: text("birthdate"),
  address: text("address"),
  teamId: integer("team_id"), // gewünschtes Team
  parentName: text("parent_name"), // für Minderjährige
  parentEmail: text("parent_email"),
  parentPhone: text("parent_phone"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | converted
  processedById: integer("processed_by_id"), // wer hat bearbeitet
  processedAt: text("processed_at"),
  processedNotes: text("processed_notes"),
  memberId: integer("member_id"), // wenn in Mitglied umgewandelt
  createdAt: text("created_at").notNull(),
});
export const insertRegistrationSchema = createInsertSchema(registrations).omit({ id: true });
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

// ─── Training Schedules (Wiederkehrende Trainings) ───────
export const trainingSchedules = sqliteTable("training_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sonntag, 1=Montag, ..., 6=Samstag
  startTime: text("start_time").notNull(), // HH:MM Format
  endTime: text("end_time").notNull(), // HH:MM Format
  location: text("location").notNull(), // z.B. "Omnisport", "Krounebierg"
  hall: text("hall"), // Optional: Hallennummer
  seasonStart: text("season_start").notNull(), // YYYY-MM-DD
  seasonEnd: text("season_end").notNull(), // YYYY-MM-DD
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
export const insertTrainingScheduleSchema = createInsertSchema(trainingSchedules).omit({ id: true });
export type InsertTrainingSchedule = z.infer<typeof insertTrainingScheduleSchema>;
export type TrainingSchedule = typeof trainingSchedules.$inferSelect;

// ─── Generated Events (Automatisch erstellte Events) ─────
export const generatedEvents = sqliteTable("generated_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleId: integer("schedule_id").notNull(),
  eventId: integer("event_id").notNull(), // Referenz zum events-Tabelle
  generatedAt: text("generated_at").notNull(),
});
export const insertGeneratedEventSchema = createInsertSchema(generatedEvents).omit({ id: true });
export type InsertGeneratedEvent = z.infer<typeof insertGeneratedEventSchema>;
export type GeneratedEvent = typeof generatedEvents.$inferSelect;

// ─── Matches (Spiele & Ergebnisse) ────────────────────────
export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull(),
  competition: text("competition").notNull(), // z.B. "H-PRO", "D-PRO", "U15"
  matchType: text("match_type").notNull().default("league"), // league, cup, tournament
  matchDate: text("match_date").notNull(), // YYYY-MM-DD
  matchTime: text("match_time"), // HH:MM
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  sboUrl: text("sbo_url"), // handball4all.de Link
  rtlUrl: text("rtl_url"), // RTL Livestream/Replay
  venue: text("venue"), // Spielort
  isHome: integer("is_home", { mode: "boolean" }).notNull().default(false), // Mersch75 Heimspiel?
  status: text("status").notNull().default("scheduled"), // scheduled, live, finished, cancelled
  notes: text("notes"), // Bemerkungen
  season: text("season").notNull(), // z.B. "2025-2026"
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

// ─── Match Goals (Torschützen & Statistiken) ───────────────
export const matchGoals = sqliteTable("match_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id").notNull(),
  playerId: integer("player_id"), // Mitglied (optional)
  playerName: text("player_name").notNull(), // Name falls kein Mitglied
  teamSide: text("team_side").notNull(), // home oder away
  minute: integer("minute"), // Spielminute
  goalType: text("goal_type").default("field"), // field, penalty, free_throw, seven_meter
  assistPlayerId: integer("assist_player_id"), // Vorlage von
  assistPlayerName: text("assist_player_name"),
  isOwnGoal: integer("is_own_goal", { mode: "boolean" }).default(false),
  sourceUrl: text("source_url"), // FLH/handball4all Link
  importedAt: text("imported_at"), // Wann importiert
  createdAt: text("created_at").notNull(),
});

// ─── Match Penalties (Zeitstrafen) ───────────────────────────
export const matchPenalties = sqliteTable("match_penalties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id").notNull(),
  playerId: integer("player_id"),
  playerName: text("player_name").notNull(),
  teamSide: text("team_side").notNull(), // home oder away
  minute: integer("minute").notNull(), // Minute der Zeitstrafe
  duration: integer("duration").notNull().default(2), // 2, 5, oder 10 Minuten
  reason: text("reason"), // Grund falls angegeben
  sourceUrl: text("source_url"),
  createdAt: text("created_at").notNull(),
});
export const insertMatchPenaltySchema = createInsertSchema(matchPenalties).omit({ id: true });
export type InsertMatchPenalty = z.infer<typeof insertMatchPenaltySchema>;
export type MatchPenalty = typeof matchPenalties.$inferSelect;
export const insertMatchGoalSchema = createInsertSchema(matchGoals).omit({ id: true });
export type InsertMatchGoal = z.infer<typeof insertMatchGoalSchema>;
export type MatchGoal = typeof matchGoals.$inferSelect;

// ─── Standings (Tabellenstände) ────────────────────────────
export const standings = sqliteTable("standings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull(), // Mersch75 Team
  competition: text("competition").notNull(),
  season: text("season").notNull(),
  position: integer("position").notNull(),
  teamName: text("team_name").notNull(), // Tabellenplatz Teamname
  played: integer("played").notNull().default(0),
  won: integer("won").notNull().default(0),
  drawn: integer("drawn").notNull().default(0),
  lost: integer("lost").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  goalDifference: integer("goal_difference").notNull().default(0),
  points: integer("points").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
});
export const insertStandingSchema = createInsertSchema(standings).omit({ id: true });
export type InsertStanding = z.infer<typeof insertStandingSchema>;
export type Standing = typeof standings.$inferSelect;

// ─── Magic Links (Passwordless Login) ─────────────────────
export const magicLinks = sqliteTable("magic_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  token: text("token").notNull().unique(),
  email: text("email"),
  phone: text("phone"), // z.B. +352621123456
  countryCode: text("country_code").default("+352"), // +352 = Luxemburg
  userId: integer("user_id"),
  action: text("action").notNull(), // login | register | unsubscribe
  method: text("method").notNull().default("email"), // email | sms
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertMagicLinkSchema = createInsertSchema(magicLinks).omit({
  id: true,
  createdAt: true,
});
export type InsertMagicLink = z.infer<typeof insertMagicLinkSchema>;
export type MagicLink = typeof magicLinks.$inferSelect;

// ─── Member Cards (QR-Code Mitgliedsausweis) ──────────────
export const memberCards = sqliteTable("member_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  cardNumber: text("card_number").notNull().unique(), // z.B. M75-2024-001
  qrCodeData: text("qr_code_data").notNull(), // JSON mit User-Info
  validFrom: text("valid_from").notNull(),
  validUntil: text("valid_until"), // null = unbefristet
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  issuedAt: text("issued_at").notNull().default("CURRENT_TIMESTAMP"),
  issuedBy: integer("issued_by").references(() => users.id),
});

export const insertMemberCardSchema = createInsertSchema(memberCards).omit({
  id: true,
  issuedAt: true,
});
export type InsertMemberCard = z.infer<typeof insertMemberCardSchema>;
export type MemberCard = typeof memberCards.$inferSelect;

// ─── Activity Logs (Wer hat was wann geändert) ───────────────
export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // create, update, delete, login, logout
  entityType: text("entity_type").notNull(), // user, match, document, etc.
  entityId: integer("entity_id"),
  oldValues: text("old_values"), // JSON
  newValues: text("new_values"), // JSON
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// === NEW FEATURE TABLES ===
export const qrCheckins = sqliteTable("qr_checkins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => events.id),
  memberId: integer("member_id").references(() => members.id),
  userId: integer("user_id").references(() => users.id),
  checkinTime: text("checkin_time").notNull().default("CURRENT_TIMESTAMP"),
  method: text("method").default("qr"), // qr, manual
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const lineups = sqliteTable("lineups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id").notNull().references(() => matches.id),
  teamId: integer("team_id").notNull().references(() => teams.id),
  formation: text("formation").notNull(), // JSON: positions + player IDs
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at"),
});

export const flhSyncLogs = sqliteTable("flh_sync_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  syncType: text("sync_type").notNull(), // members, licenses, matches
  status: text("status").notNull().default("pending"),
  recordsProcessed: integer("records_processed").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorMessage: text("error_message"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const sepaMandates = sqliteTable("sepa_mandates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull().references(() => members.id),
  mandateReference: text("mandate_reference").notNull().unique(),
  iban: text("iban").notNull(),
  bic: text("bic"),
  accountHolder: text("account_holder").notNull(),
  signedAt: text("signed_at").notNull(),
  status: text("status").notNull().default("active"), // active, revoked, expired
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const sepaTransactions = sqliteTable("sepa_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  mandateId: integer("mandate_id").notNull().references(() => sepaMandates.id),
  amount: real("amount").notNull(),
  currency: text("currency").default("EUR"),
  description: text("description").notNull(),
  executionDate: text("execution_date").notNull(),
  status: text("status").notNull().default("pending"), // pending, submitted, completed, failed
  sepaXml: text("sepa_xml"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const eventRsvps = sqliteTable("event_rsvps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // attending, maybe, declined
  guests: integer("guests").default(0),
  note: text("note"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at"),
});


export const sponsors = sqliteTable("sponsors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  level: text("level").default("bronze"),
  contractStart: text("contract_start"),
  contractEnd: text("contract_end"),
  logoUrl: text("logo_url"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const galleryPhotos = sqliteTable("gallery_photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  album: text("album").notNull().default("general"),
  title: text("title"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  eventId: integer("event_id"),
  matchId: integer("match_id"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const duties = sqliteTable("duties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  time: text("time"),
  location: text("location"),
  assignedTo: integer("assigned_to").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  eventId: integer("event_id"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const facilities = sqliteTable("facilities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  capacity: integer("capacity"),
  location: text("location"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const facilityBookings = sqliteTable("facility_bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  facilityId: integer("facility_id").notNull().references(() => facilities.id),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  bookedBy: integer("booked_by").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  purpose: text("purpose"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const shopProducts = sqliteTable("shop_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category").default("clothing"),
  sizes: text("sizes"),
  stock: integer("stock").default(0),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const shopOrders = sqliteTable("shop_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => shopProducts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  quantity: integer("quantity").notNull().default(1),
  size: text("size"),
  status: text("status").default("pending"),
  totalPrice: real("total_price"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const waitlistEntries = sqliteTable("waitlist_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberName: text("member_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  teamId: integer("team_id").notNull().references(() => teams.id),
  position: text("position"),
  notes: text("notes"),
  status: text("status").default("waiting"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const budgetItems = sqliteTable("budget_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  description: text("description"),
  plannedAmount: real("planned_amount").notNull().default(0),
  actualAmount: real("actual_amount").default(0),
  year: integer("year").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const newsletters = sqliteTable("newsletters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  template: text("template"),
  status: text("status").default("draft"),
  sentAt: text("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const gdprConsents = sqliteTable("gdpr_consents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  consentType: text("consent_type").notNull(),
  consented: integer("consented", { mode: "boolean" }).notNull().default(true),
  consentedAt: text("consented_at").notNull().default("CURRENT_TIMESTAMP"),
  ipAddress: text("ip_address"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const websitePages = sqliteTable("website_pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  published: integer("published", { mode: "boolean" }).default(false),
  updatedAt: text("updated_at"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});


// ─── User Notifications (Push-Benachrichtigungen) ────────
export const userNotifications = sqliteTable("user_notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, warning, success, error
  category: text("category").notNull().default("general"), // match, training, document, birthday
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  readAt: text("read_at"),
  actionUrl: text("action_url"), // Link für Klick
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).omit({
  id: true,
  readAt: true,
  createdAt: true,
});
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;

// ─── Document Signatures (Digitale Unterschrift) ─────────
export const documentSignatures = sqliteTable("document_signatures", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  signatureData: text("signature_data").notNull(), // SVG oder Base64 Bild
  signedAt: text("signed_at").notNull().default("CURRENT_TIMESTAMP"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const insertDocumentSignatureSchema = createInsertSchema(documentSignatures).omit({
  id: true,
  signedAt: true,
});
export type InsertDocumentSignature = z.infer<typeof insertDocumentSignatureSchema>;
export type DocumentSignature = typeof documentSignatures.$inferSelect;

// ─── SEPA Mandates (Lastschrift-Mandate) ───────────────────
export const insertSepaMandateSchema = createInsertSchema(sepaMandates).omit({
  id: true,
  createdAt: true,
});
export type InsertSepaMandate = z.infer<typeof insertSepaMandateSchema>;
export type SepaMandate = typeof sepaMandates.$inferSelect;

// ─── Match Lineups (Spielaufstellung) ───────────────────
export const matchLineups = sqliteTable("match_lineups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id").notNull().references(() => matches.id),
  userId: integer("user_id").notNull().references(() => users.id),
  position: text("position").notNull(), // TW, LW, etc.
  jerseyNumber: integer("jersey_number"),
  isStarting: integer("is_starting", { mode: "boolean" }).notNull().default(true), // Start oder Ersatz
  notes: text("notes"),
  confirmed: integer("confirmed", { mode: "boolean" }).notNull().default(false), // Spieler hat bestätigt
  confirmedAt: text("confirmed_at"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertMatchLineupSchema = createInsertSchema(matchLineups).omit({
  id: true,
  confirmedAt: true,
  createdAt: true,
});
export type InsertMatchLineup = z.infer<typeof insertMatchLineupSchema>;
export type MatchLineup = typeof matchLineups.$inferSelect;

// ─── Training Attendance (Trainingsanwesenheit) ──────────
export const trainingAttendance = sqliteTable("training_attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleId: integer("schedule_id").notNull().references(() => trainingSchedules.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull(), // present, absent, excused, late
  checkedInAt: text("checked_in_at"),
  checkedInBy: integer("checked_in_by").references(() => users.id), // Trainer/Admin
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertTrainingAttendanceSchema = createInsertSchema(trainingAttendance).omit({
  id: true,
  createdAt: true,
});
export type InsertTrainingAttendance = z.infer<typeof insertTrainingAttendanceSchema>;
export type TrainingAttendance = typeof trainingAttendance.$inferSelect;

// ─── Family Links (Familienverknüpfung) ───────────────────
export const familyLinks = sqliteTable("family_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  parentId: integer("parent_id").notNull().references(() => users.id),
  childId: integer("child_id").notNull().references(() => users.id),
  relationship: text("relationship").notNull().default("parent"), // parent, guardian
  canManageProfile: integer("can_manage_profile", { mode: "boolean" }).notNull().default(true),
  canManagePayments: integer("can_manage_payments", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertFamilyLinkSchema = createInsertSchema(familyLinks).omit({
  id: true,
  createdAt: true,
});
export type InsertFamilyLink = z.infer<typeof insertFamilyLinkSchema>;
export type FamilyLink = typeof familyLinks.$inferSelect;

// ─── Document Expiry (Dokumente Ablaufdatum) ──────────────
export const documentExpiries = sqliteTable("document_expiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").notNull(),
  documentType: text("document_type").notNull(), // medical, license, insurance
  expiryDate: text("expiry_date").notNull(),
  reminderSent: integer("reminder_sent", { mode: "boolean" }).notNull().default(false),
  reminderSentAt: text("reminder_sent_at"),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertDocumentExpirySchema = createInsertSchema(documentExpiries).omit({
  id: true,
  reminderSentAt: true,
  createdAt: true,
});
export type InsertDocumentExpiry = z.infer<typeof insertDocumentExpirySchema>;
export type DocumentExpiry = typeof documentExpiries.$inferSelect;

// ═══════════════════════════════════════════════════════════
// 10 NEUE FEATURES FÜR MERSCH75
// ═══════════════════════════════════════════════════════════

// ─── 1. CARPOOL (Fahrgemeinschaften) ──────────────────────
export const carpools = sqliteTable("carpools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => events.id), // Match oder Training
  driverId: integer("driver_id").notNull().references(() => users.id),
  departureTime: text("departure_time").notNull(),
  departureLocation: text("departure_location").notNull(),
  availableSeats: integer("available_seats").notNull().default(4),
  status: text("status").notNull().default("open"), // open, full, cancelled
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const carpoolPassengers = sqliteTable("carpool_passengers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  carpoolId: integer("carpool_id").notNull().references(() => carpools.id),
  passengerId: integer("passenger_id").notNull().references(() => users.id),
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertCarpoolSchema = createInsertSchema(carpools).omit({ id: true, createdAt: true });
export const insertCarpoolPassengerSchema = createInsertSchema(carpoolPassengers).omit({ id: true, createdAt: true });
export type InsertCarpool = z.infer<typeof insertCarpoolSchema>;
export type InsertCarpoolPassenger = z.infer<typeof insertCarpoolPassengerSchema>;
export type Carpool = typeof carpools.$inferSelect;
export type CarpoolPassenger = typeof carpoolPassengers.$inferSelect;

// ─── 2. REFEREES (Schiedsrichter) ─────────────────────────
export const referees = sqliteTable("referees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id), // Falls Schiri auch Mitglied
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  licenseLevel: text("license_level"), // C, B, A, etc.
  hourlyRate: integer("hourly_rate"), // Cent pro Stunde
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const refereeAssignments = sqliteTable("referee_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  refereeId: integer("referee_id").notNull().references(() => referees.id),
  matchId: integer("match_id").notNull().references(() => matches.id),
  role: text("role").notNull().default("referee"), // referee, assistant, timekeeper
  status: text("status").notNull().default("assigned"), // assigned, confirmed, completed, cancelled
  paymentAmount: integer("payment_amount"), // Tatsächliche Zahlung in Cent
  paidAt: text("paid_at"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertRefereeSchema = createInsertSchema(referees).omit({ id: true, createdAt: true });
export const insertRefereeAssignmentSchema = createInsertSchema(refereeAssignments).omit({ id: true, createdAt: true });
export type InsertReferee = z.infer<typeof insertRefereeSchema>;
export type InsertRefereeAssignment = z.infer<typeof insertRefereeAssignmentSchema>;
export type Referee = typeof referees.$inferSelect;
export type RefereeAssignment = typeof refereeAssignments.$inferSelect;

// ─── 3. INVENTORY (Material-Inventar) ───────────────────
export const inventoryItems = sqliteTable("inventory_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(), // jerseys, balls, equipment, goals
  description: text("description"),
  qrCode: text("qr_code").unique(), // Für Scan
  purchaseDate: text("purchase_date"),
  purchasePrice: integer("purchase_price"), // Cent
  condition: text("condition").default("good"), // new, good, worn, damaged, lost
  location: text("location"), // Lagerort
  totalQuantity: integer("total_quantity").notNull().default(1),
  availableQuantity: integer("available_quantity").notNull().default(1),
  maintenanceInterval: integer("maintenance_interval"), // Tage bis Wartung
  lastMaintenance: text("last_maintenance"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const inventoryLoans = sqliteTable("inventory_loans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id").notNull().references(() => inventoryItems.id),
  userId: integer("user_id").notNull().references(() => users.id),
  quantity: integer("quantity").notNull().default(1),
  loanedAt: text("loaned_at").notNull().default("CURRENT_TIMESTAMP"),
  dueDate: text("due_date"),
  returnedAt: text("returned_at"),
  condition: text("condition"), // returned condition
  checkedOutBy: integer("checked_out_by").references(() => users.id),
  checkedInBy: integer("checked_in_by").references(() => users.id),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, createdAt: true });
export const insertInventoryLoanSchema = createInsertSchema(inventoryLoans).omit({ id: true, createdAt: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InsertInventoryLoan = z.infer<typeof insertInventoryLoanSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InventoryLoan = typeof inventoryLoans.$inferSelect;

// ─── 4. INJURIES (Verletzungen & Reha) ───────────────────
export const injuries = sqliteTable("injuries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // Sprungelenk, Knie, etc.
  severity: text("severity").notNull(), // light, moderate, severe
  incidentDate: text("incident_date").notNull(),
  incidentDescription: text("incident_description"),
  diagnosis: text("diagnosis"),
  doctorName: text("doctor_name"),
  expectedRecovery: text("expected_recovery"), // Datum
  status: text("status").notNull().default("active"), // active, recovering, recovered, chronic
  medicalClearance: integer("medical_clearance", { mode: "boolean" }).default(false),
  clearanceDate: text("clearance_date"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const rehabSessions = sqliteTable("rehab_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  injuryId: integer("injury_id").notNull().references(() => injuries.id),
  sessionDate: text("session_date").notNull(),
  type: text("type").notNull(), // Physio, Training, Massage
  duration: integer("duration"), // Minuten
  notes: text("notes"),
  progress: integer("progress"), // 0-100%
  therapistId: integer("therapist_id").references(() => users.id),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertInjurySchema = createInsertSchema(injuries).omit({ id: true, createdAt: true });
export const insertRehabSessionSchema = createInsertSchema(rehabSessions).omit({ id: true, createdAt: true });
export type InsertInjury = z.infer<typeof insertInjurySchema>;
export type InsertRehabSession = z.infer<typeof insertRehabSessionSchema>;
export type Injury = typeof injuries.$inferSelect;
export type RehabSession = typeof rehabSessions.$inferSelect;

// ─── 5. POLLS (Umfragen & Abstimmungen) ──────────────────
export const polls = sqliteTable("polls", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().default("single"), // single, multiple, date
  anonymous: integer("anonymous", { mode: "boolean" }).notNull().default(false),
  teamId: integer("team_id").references(() => teams.id), // Für spezifisches Team
  createdBy: integer("created_by").notNull().references(() => users.id),
  startsAt: text("starts_at").notNull().default("CURRENT_TIMESTAMP"),
  endsAt: text("ends_at"),
  status: text("status").notNull().default("active"), // active, closed, draft
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const pollOptions = sqliteTable("poll_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pollId: integer("poll_id").notNull().references(() => polls.id),
  optionText: text("option_text").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const pollVotes = sqliteTable("poll_votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pollId: integer("poll_id").notNull().references(() => polls.id),
  optionId: integer("option_id").notNull().references(() => pollOptions.id),
  userId: integer("user_id").references(() => users.id), // null wenn anonymous
  votedAt: text("voted_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertPollSchema = createInsertSchema(polls).omit({ id: true, createdAt: true });
export const insertPollOptionSchema = createInsertSchema(pollOptions).omit({ id: true, createdAt: true });
export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({ id: true, votedAt: true });
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type InsertPollOption = z.infer<typeof insertPollOptionSchema>;
export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;
export type Poll = typeof polls.$inferSelect;
export type PollOption = typeof pollOptions.$inferSelect;
export type PollVote = typeof pollVotes.$inferSelect;

// ─── 6. OPPONENTS (Gegner-Analyse) ────────────────────────
export const opponents = sqliteTable("opponents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  shortName: text("short_name"),
  logoUrl: text("logo_url"),
  venue: text("venue"), // Halle
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  notes: text("notes"), // Allgemeine Notizen
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const opponentHistory = sqliteTable("opponent_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  opponentId: integer("opponent_id").notNull().references(() => opponents.id),
  matchId: integer("match_id").notNull().references(() => matches.id),
  ourScore: integer("our_score").notNull(),
  theirScore: integer("their_score").notNull(),
  result: text("result").notNull(), // win, loss, draw
  matchNotes: text("match_notes"),
  keyPlayers: text("key_players"), // JSON Array
  tactics: text("tactics"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertOpponentSchema = createInsertSchema(opponents).omit({ id: true, createdAt: true });
export const insertOpponentHistorySchema = createInsertSchema(opponentHistory).omit({ id: true, createdAt: true });
export type InsertOpponent = z.infer<typeof insertOpponentSchema>;
export type InsertOpponentHistory = z.infer<typeof insertOpponentHistorySchema>;
export type Opponent = typeof opponents.$inferSelect;
export type OpponentHistory = typeof opponentHistory.$inferSelect;

// ─── 7. MATCH REPORTS (Spielberichte) ─────────────────────
export const matchReports = sqliteTable("match_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id").notNull().references(() => matches.id).unique(),
  reportNumber: text("report_number").notNull().unique(), // SB-2024-001
  generatedBy: integer("generated_by").notNull().references(() => users.id),
  generatedAt: text("generated_at").notNull().default("CURRENT_TIMESTAMP"),
  pdfUrl: text("pdf_url"),
  status: text("status").notNull().default("draft"), // draft, submitted, confirmed
  submittedTo: text("submitted_to"), // Liga/Verband
  submittedAt: text("submitted_at"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertMatchReportSchema = createInsertSchema(matchReports).omit({ id: true, createdAt: true });
export type InsertMatchReport = z.infer<typeof insertMatchReportSchema>;
export type MatchReport = typeof matchReports.$inferSelect;

// ─── 8. DUTY ROSTER (Dienstplan) ──────────────────────────
export const dutyRosters = sqliteTable("duty_rosters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull().references(() => events.id), // Match/Training
  dutyType: text("duty_type").notNull(), // supervision, coaching, first_aid, timekeeping
  userId: integer("user_id").notNull().references(() => users.id),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  compensation: integer("compensation"), // Vergütung in Cent
  status: text("status").notNull().default("assigned"), // assigned, confirmed, completed
  swappedWith: integer("swapped_with").references(() => users.id),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const dutySwaps = sqliteTable("duty_swaps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  rosterId: integer("roster_id").notNull().references(() => dutyRosters.id),
  requestedBy: integer("requested_by").notNull().references(() => users.id),
  requestedTo: integer("requested_to").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, cancelled
  message: text("message"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertDutyRosterSchema = createInsertSchema(dutyRosters).omit({ id: true, createdAt: true });
export const insertDutySwapSchema = createInsertSchema(dutySwaps).omit({ id: true, createdAt: true });
export type InsertDutyRoster = z.infer<typeof insertDutyRosterSchema>;
export type InsertDutySwap = z.infer<typeof insertDutySwapSchema>;
export type DutyRoster = typeof dutyRosters.$inferSelect;
export type DutySwap = typeof dutySwaps.$inferSelect;

// ─── 9. FAN ZONE (Öffentlicher Bereich) ─────────────────
export const fanContent = sqliteTable("fan_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(), // news, photo, video, result
  title: text("title").notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  matchId: integer("match_id").references(() => matches.id),
  teamId: integer("team_id").references(() => teams.id),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const liveTicker = sqliteTable("live_ticker", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  matchId: integer("match_id").notNull().references(() => matches.id),
  minute: integer("minute").notNull(),
  eventType: text("event_type").notNull(), // goal, card, substitution, timeout, etc.
  description: text("description").notNull(),
  playerId: integer("player_id").references(() => users.id),
  scoreHome: integer("score_home"),
  scoreAway: integer("score_away"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const insertFanContentSchema = createInsertSchema(fanContent).omit({ id: true, createdAt: true });
export const insertLiveTickerSchema = createInsertSchema(liveTicker).omit({ id: true, createdAt: true });
export type InsertFanContent = z.infer<typeof insertFanContentSchema>;
export type InsertLiveTicker = z.infer<typeof insertLiveTickerSchema>;
export type FanContent = typeof fanContent.$inferSelect;
export type LiveTicker = typeof liveTicker.$inferSelect;

// ─── 10. EXTERNAL CALENDARS (Sync) ──────────────────────
export const externalCalendars = sqliteTable("external_calendars", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(), // google, apple, outlook
  externalId: text("external_id"), // Provider's calendar ID
  syncToken: text("sync_token"), // Für Änderungserkennung
  lastSync: text("last_sync"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const calendarSyncLogs = sqliteTable("calendar_sync_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  calendarId: integer("calendar_id").notNull().references(() => externalCalendars.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  externalEventId: text("external_event_id"),
  action: text("action").notNull(), // created, updated, deleted
  syncedAt: text("synced_at").notNull().default("CURRENT_TIMESTAMP"),
  status: text("status").notNull().default("success"), // success, failed
  errorMessage: text("error_message"),
});

export const insertExternalCalendarSchema = createInsertSchema(externalCalendars).omit({ id: true, createdAt: true });
export const insertCalendarSyncLogSchema = createInsertSchema(calendarSyncLogs).omit({ id: true, syncedAt: true });
export type InsertExternalCalendar = z.infer<typeof insertExternalCalendarSchema>;
export type InsertCalendarSyncLog = z.infer<typeof insertCalendarSyncLogSchema>;
export type ExternalCalendar = typeof externalCalendars.$inferSelect;
export type CalendarSyncLog = typeof calendarSyncLogs.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// ARCHIV TABELLEN - Historische Daten vergangener Saisons
// ═══════════════════════════════════════════════════════════════════════════

export const archiveSeasons = sqliteTable("archive_seasons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // z.B. "2024/25"
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  description: text("description"),
  active: integer("active", { mode: "boolean" }).notNull().default(false), // nur eine aktiv
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  archivedAt: text("archived_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Archivierte Teams einer Saison
export const archiveTeams = sqliteTable("archive_teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seasonId: integer("season_id").notNull().references(() => archiveSeasons.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  trainerName: text("trainer_name"), // Name des Trainers zur Zeit der Archivierung
  trainerQualifications: text("trainer_qualifications"),
  finalRank: integer("final_rank"), // Endplatzierung
  matchesPlayed: integer("matches_played"),
  matchesWon: integer("matches_won"),
  matchesDrawn: integer("matches_drawn"),
  matchesLost: integer("matches_lost"),
  goalsFor: integer("goals_for"),
  goalsAgainst: integer("goals_against"),
  points: integer("points"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Archivierte Mitglieder (Spieler)
export const archiveMembers = sqliteTable("archive_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seasonId: integer("season_id").notNull().references(() => archiveSeasons.id),
  teamId: integer("team_id").notNull().references(() => archiveTeams.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  birthdate: text("birthdate"),
  licenseNumber: text("license_number"),
  position: text("position"), // z.B. "TW", "LW", "RW", etc.
  goals: integer("goals").default(0),
  assists: integer("assists").default(0),
  yellowCards: integer("yellow_cards").default(0),
  redCards: integer("red_cards").default(0),
  matchesPlayed: integer("matches_played").default(0),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Archivierte Spiele
export const archiveMatches = sqliteTable("archive_matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seasonId: integer("season_id").notNull().references(() => archiveSeasons.id),
  teamId: integer("team_id").notNull().references(() => archiveTeams.id),
  date: text("date").notNull(),
  opponent: text("opponent").notNull(),
  venue: text("venue"), // home, away, neutral
  location: text("location"),
  homeGoals: integer("home_goals"),
  awayGoals: integer("away_goals"),
  result: text("result"), // win, loss, draw
  scorers: text("scorers"), // JSON: [{"name": "Max", "goals": 2}, ...]
  notes: text("notes"),
  matchReport: text("match_report"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Archivierte Events (Trainings, Turniere etc.)
export const archiveEvents = sqliteTable("archive_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seasonId: integer("season_id").notNull().references(() => archiveSeasons.id),
  teamId: integer("team_id").references(() => archiveTeams.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // training, tournament, camp, etc.
  date: text("date").notNull(),
  location: text("location"),
  description: text("description"),
  attendance: text("attendance"), // JSON: {"present": 12, "absent": 3}
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// Export-Logs für Archiv-Daten
export const archiveExports = sqliteTable("archive_exports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  seasonId: integer("season_id").notNull().references(() => archiveSeasons.id),
  exportType: text("export_type").notNull(), // pdf, csv, json
  fileName: text("file_name").notNull(),
  filePath: text("file_path"),
  fileData: text("file_data"), // Base64 oder JSON für kleine Dateien
  exportedBy: integer("exported_by").references(() => users.id),
  exportedAt: text("exported_at").notNull().default("CURRENT_TIMESTAMP"),
  downloadCount: integer("download_count").default(0),
  expiresAt: text("expires_at"),
});

export const insertArchiveSeasonSchema = createInsertSchema(archiveSeasons).omit({ id: true, createdAt: true });
export const insertArchiveTeamSchema = createInsertSchema(archiveTeams).omit({ id: true, createdAt: true });
export const insertArchiveMemberSchema = createInsertSchema(archiveMembers).omit({ id: true, createdAt: true });
export const insertArchiveMatchSchema = createInsertSchema(archiveMatches).omit({ id: true, createdAt: true });
export const insertArchiveEventSchema = createInsertSchema(archiveEvents).omit({ id: true, createdAt: true });
export const insertArchiveExportSchema = createInsertSchema(archiveExports).omit({ id: true, exportedAt: true });

export type InsertArchiveSeason = z.infer<typeof insertArchiveSeasonSchema>;
export type InsertArchiveTeam = z.infer<typeof insertArchiveTeamSchema>;
export type InsertArchiveMember = z.infer<typeof insertArchiveMemberSchema>;
export type InsertArchiveMatch = z.infer<typeof insertArchiveMatchSchema>;
export type InsertArchiveEvent = z.infer<typeof insertArchiveEventSchema>;
export type InsertArchiveExport = z.infer<typeof insertArchiveExportSchema>;

export type ArchiveSeason = typeof archiveSeasons.$inferSelect;
export type ArchiveTeam = typeof archiveTeams.$inferSelect;
export type ArchiveMember = typeof archiveMembers.$inferSelect;
export type ArchiveMatch = typeof archiveMatches.$inferSelect;
export type ArchiveEvent = typeof archiveEvents.$inferSelect;
export type ArchiveExport = typeof archiveExports.$inferSelect;

export const insertSponsorSchema = createInsertSchema(sponsors).omit({ id: true, createdAt: true });
export const insertGalleryPhotoSchema = createInsertSchema(galleryPhotos).omit({ id: true, createdAt: true });
export const insertDutySchema = createInsertSchema(duties).omit({ id: true, createdAt: true });
export const insertFacilitySchema = createInsertSchema(facilities).omit({ id: true, createdAt: true });
export const insertFacilityBookingSchema = createInsertSchema(facilityBookings).omit({ id: true, createdAt: true });
export const insertShopProductSchema = createInsertSchema(shopProducts).omit({ id: true, createdAt: true });
export const insertShopOrderSchema = createInsertSchema(shopOrders).omit({ id: true, createdAt: true });
export const insertWaitlistEntrySchema = createInsertSchema(waitlistEntries).omit({ id: true, createdAt: true });
export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({ id: true, createdAt: true });
export const insertNewsletterSchema = createInsertSchema(newsletters).omit({ id: true, createdAt: true });
export const insertGdprConsentSchema = createInsertSchema(gdprConsents).omit({ id: true, createdAt: true });
export const insertWebsitePageSchema = createInsertSchema(websitePages).omit({ id: true, createdAt: true });

export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type InsertGalleryPhoto = z.infer<typeof insertGalleryPhotoSchema>;
export type InsertDuty = z.infer<typeof insertDutySchema>;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type InsertFacilityBooking = z.infer<typeof insertFacilityBookingSchema>;
export type InsertShopProduct = z.infer<typeof insertShopProductSchema>;
export type InsertShopOrder = z.infer<typeof insertShopOrderSchema>;
export type InsertWaitlistEntry = z.infer<typeof insertWaitlistEntrySchema>;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type InsertGdprConsent = z.infer<typeof insertGdprConsentSchema>;
export type InsertWebsitePage = z.infer<typeof insertWebsitePageSchema>;

export type Sponsor = typeof sponsors.$inferSelect;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type Duty = typeof duties.$inferSelect;
export type Facility = typeof facilities.$inferSelect;
export type FacilityBooking = typeof facilityBookings.$inferSelect;
export type ShopProduct = typeof shopProducts.$inferSelect;
export type ShopOrder = typeof shopOrders.$inferSelect;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type Newsletter = typeof newsletters.$inferSelect;
export type GdprConsent = typeof gdprConsents.$inferSelect;
export type WebsitePage = typeof websitePages.$inferSelect;

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({ id: true, createdAt: true });
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;

export const insertQrCheckinSchema = createInsertSchema(qrCheckins).omit({ id: true, createdAt: true });
export const insertLineupSchema = createInsertSchema(lineups).omit({ id: true, createdAt: true });
export const insertFlhSyncLogSchema = createInsertSchema(flhSyncLogs).omit({ id: true, createdAt: true });
export const insertSepaTransactionSchema = createInsertSchema(sepaTransactions).omit({ id: true, createdAt: true });

export type InsertQrCheckin = z.infer<typeof insertQrCheckinSchema>;
export type InsertLineup = z.infer<typeof insertLineupSchema>;
export type InsertFlhSyncLog = z.infer<typeof insertFlhSyncLogSchema>;
export type InsertSepaTransaction = z.infer<typeof insertSepaTransactionSchema>;

export type QrCheckin = typeof qrCheckins.$inferSelect;
export type Lineup = typeof lineups.$inferSelect;
export type FlhSyncLog = typeof flhSyncLogs.$inferSelect;
export type SepaTransaction = typeof sepaTransactions.$inferSelect;

