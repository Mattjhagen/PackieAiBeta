import { pgTable, text, varchar, serial, integer, boolean, timestamp, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const personas = pgTable("personas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  avatar: text("avatar").notNull(),
  specialties: jsonb("specialties").$type<string[]>().notNull(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).notNull(),
  averageCallDuration: integer("average_call_duration").notNull(), // in minutes
  isActive: boolean("is_active").notNull().default(true),
  voiceSettings: jsonb("voice_settings").$type<{
    voice: string; // Twilio voice name
    speed: string;
    pitch: string;
  }>().notNull(),
  conversationStyle: jsonb("conversation_style").$type<{
    greetings: string[];
    responses: string[];
    questions: string[];
    personality: string;
  }>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  personaId: integer("persona_id").references(() => personas.id).notNull(),
  scammerNumber: text("scammer_number").notNull(),
  duration: integer("duration").notNull(), // in seconds
  status: text("status").notNull(), // 'active', 'completed', 'failed'
  scamType: text("scam_type"), // 'tech_support', 'irs_tax', 'medicare', etc.
  lastResponse: text("last_response"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  recordingUrl: text("recording_url"),
  transcript: text("transcript"),
  keywords: jsonb("keywords").$type<string[]>(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  totalCalls: integer("total_calls").notNull().default(0),
  totalDuration: integer("total_duration").notNull().default(0), // in minutes
  scammersWasted: integer("scammers_wasted").notNull().default(0),
  scamsPrevented: decimal("scams_prevented", { precision: 10, scale: 2 }).notNull().default('0'),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).notNull().default('0'),
  topScamTypes: jsonb("top_scam_types").$type<{type: string, percentage: number}[]>(),
});

export const fundingGoals = pgTable("funding_goals", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  features: jsonb("features").$type<string[]>().notNull(),
  isAchieved: boolean("is_achieved").notNull().default(false),
  achievedAt: timestamp("achieved_at"),
  order: integer("order").notNull(),
});

export const fundingProgress = pgTable("funding_progress", {
  id: serial("id").primaryKey(),
  totalRaised: decimal("total_raised", { precision: 10, scale: 2 }).notNull().default('0'),
  backerCount: integer("backer_count").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const legalAgreements = pgTable("legal_agreements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  agreementType: varchar("agreement_type", { length: 50 }).notNull(), // 'tos', 'privacy', 'developer_terms'
  version: varchar("version", { length: 50 }).notNull(),
  accepted: boolean("accepted").notNull().default(false),
  acceptedAt: timestamp("accepted_at"),
  ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const complianceAudits = pgTable("compliance_audits", {
  id: serial("id").primaryKey(),
  auditType: varchar("audit_type", { length: 100 }).notNull(), // 'data_retention', 'access_review', 'security_check'
  status: varchar("status", { length: 50 }).notNull(), // 'pending', 'in_progress', 'completed', 'failed'
  findings: jsonb("findings").$type<{
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    remediation: string;
  }[]>(),
  auditedBy: varchar("audited_by", { length: 255 }),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  nextAuditDate: timestamp("next_audit_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dataRetentionLog = pgTable("data_retention_log", {
  id: serial("id").primaryKey(),
  dataType: varchar("data_type", { length: 100 }).notNull(), // 'call_recordings', 'personal_data', 'analytics'
  recordId: integer("record_id"),
  action: varchar("action", { length: 50 }).notNull(), // 'created', 'accessed', 'anonymized', 'deleted'
  retentionPeriod: integer("retention_period"), // in days
  scheduledDeletionDate: timestamp("scheduled_deletion_date"),
  actualDeletionDate: timestamp("actual_deletion_date"),
  reason: text("reason"),
  performedBy: varchar("performed_by", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPersonaSchema = createInsertSchema(personas).omit({
  id: true,
  createdAt: true,
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  startedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  date: true,
});

export const insertFundingGoalSchema = createInsertSchema(fundingGoals).omit({
  id: true,
  achievedAt: true,
});

export const insertFundingProgressSchema = createInsertSchema(fundingProgress).omit({
  id: true,
  lastUpdated: true,
});

export const insertLegalAgreementSchema = createInsertSchema(legalAgreements).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceAuditSchema = createInsertSchema(complianceAudits).omit({
  id: true,
  createdAt: true,
});

export const insertDataRetentionLogSchema = createInsertSchema(dataRetentionLog).omit({
  id: true,
  createdAt: true,
});

export type Persona = typeof personas.$inferSelect;
export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type FundingGoal = typeof fundingGoals.$inferSelect;
export type InsertFundingGoal = z.infer<typeof insertFundingGoalSchema>;
export type FundingProgress = typeof fundingProgress.$inferSelect;
export type InsertFundingProgress = z.infer<typeof insertFundingProgressSchema>;
export type LegalAgreement = typeof legalAgreements.$inferSelect;
export type InsertLegalAgreement = z.infer<typeof insertLegalAgreementSchema>;
export type ComplianceAudit = typeof complianceAudits.$inferSelect;
export type InsertComplianceAudit = z.infer<typeof insertComplianceAuditSchema>;
export type DataRetentionLog = typeof dataRetentionLog.$inferSelect;
export type InsertDataRetentionLog = z.infer<typeof insertDataRetentionLogSchema>;

// WebSocket message types
// Social Media Article Analysis
export const socialAnalyses = pgTable("social_analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  platform: text("platform").notNull(), // 'facebook', 'twitter', 'reddit', 'linkedin'
  title: text("title"),
  content: text("content"),
  summary: text("summary").notNull(),
  engagement: jsonb("engagement").$type<{likes?: number, shares?: number, comments?: number}>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User accounts for people who submit scam reports
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique(),
  email: text("email").unique().notNull(),
  hashedPassword: text("hashed_password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // 'user', 'admin'
  isVerified: boolean("is_verified").notNull().default(false),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Scam Reports Table with user association
export const scamReports = pgTable("scam_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  phoneNumber: text("phone_number").notNull(),
  scamType: text("scam_type").notNull(),
  description: text("description"),
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
  status: text("status").notNull().default("new"), // 'new', 'reviewed', 'processed'
  packieResponse: text("packie_response"),
  notificationSent: boolean("notification_sent").notNull().default(false),
});

// Persistent persona assignments for consistent character interactions
export const personaAssignments = pgTable("persona_assignments", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  personaId: integer("persona_id").references(() => personas.id).notNull(),
  callDirection: text("call_direction").notNull(), // 'inbound' or 'outbound'
  conversationHistory: jsonb("conversation_history").$type<Array<{ timestamp: string; message: string; speaker: string }>>().default([]),
  totalCalls: integer("total_calls").default(1),
  lastCallAt: timestamp("last_call_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  phonePersonaIdx: index("phone_persona_idx").on(table.phoneNumber, table.personaId),
  phoneNumberIdx: index("phone_number_idx").on(table.phoneNumber),
}));

// Call recordings and transcriptions
export const callRecordings = pgTable("call_recordings", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").references(() => calls.id).notNull(),
  scamReportId: integer("scam_report_id").references(() => scamReports.id),
  recordingUrl: text("recording_url").notNull(),
  transcriptionText: text("transcription_text"),
  transcriptionConfidence: decimal("transcription_confidence", { precision: 5, scale: 2 }),
  duration: integer("duration"), // in seconds
  fileSize: integer("file_size"), // in bytes
  isProcessed: boolean("is_processed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const youtubeContent = pgTable("youtube_content", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").references(() => calls.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  thumbnail_description: text("thumbnail_description").notNull(),
  highlights: jsonb("highlights").$type<{
    timestamp: string;
    description: string;
    engagement_level: 'low' | 'medium' | 'high';
  }[]>().notNull(),
  script: text("script").notNull(),
  engagement_score: decimal("engagement_score", { precision: 5, scale: 2 }).notNull(),
  video_length_estimate: integer("video_length_estimate").notNull(), // in seconds
  scam_type: text("scam_type").notNull(),
  persona_performance: jsonb("persona_performance").$type<{
    persona_name: string;
    effectiveness_rating: number;
    memorable_moments: string[];
  }>().notNull(),
  content_warnings: jsonb("content_warnings").$type<string[]>().notNull(),
  status: text("status").notNull().default('draft'), // 'draft', 'approved', 'published'
  youtube_video_id: text("youtube_video_id"),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const insertSocialAnalysisSchema = createInsertSchema(socialAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScamReportSchema = createInsertSchema(scamReports).omit({
  id: true,
  reportedAt: true,
});

export const insertCallRecordingSchema = createInsertSchema(callRecordings).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertYoutubeContentSchema = createInsertSchema(youtubeContent).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SocialAnalysis = typeof socialAnalyses.$inferSelect;
export type InsertSocialAnalysis = z.infer<typeof insertSocialAnalysisSchema>;
export type ScamReport = typeof scamReports.$inferSelect;
export type InsertScamReport = z.infer<typeof insertScamReportSchema>;
export type CallRecording = typeof callRecordings.$inferSelect;
export type InsertCallRecording = z.infer<typeof insertCallRecordingSchema>;
export type YoutubeContent = typeof youtubeContent.$inferSelect;
export type InsertYoutubeContent = z.infer<typeof insertYoutubeContentSchema>;

// Scam Risk Heat Map Data
export const scamRiskRegions = pgTable("scam_risk_regions", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(), // state, city, or zip code
  regionType: text("region_type").notNull(), // 'state', 'city', 'zipcode'
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  riskLevel: integer("risk_level").notNull(), // 1-10 scale
  scamReportsCount: integer("scam_reports_count").notNull().default(0),
  activeCallsCount: integer("active_calls_count").notNull().default(0),
  successfulBlocksCount: integer("successful_blocks_count").notNull().default(0),
  commonScamTypes: jsonb("common_scam_types").$type<{type: string, count: number}[]>().notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertScamRiskRegionSchema = createInsertSchema(scamRiskRegions).omit({
  id: true,
  lastUpdated: true,
});

export type ScamRiskRegion = typeof scamRiskRegions.$inferSelect;
export type InsertScamRiskRegion = z.infer<typeof insertScamRiskRegionSchema>;

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User account verification tokens
export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  email: varchar("email").notNull(),
  token: varchar("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertVerificationTokenSchema = createInsertSchema(verificationTokens).omit({
  id: true,
  createdAt: true,
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type InsertVerificationToken = z.infer<typeof insertVerificationTokenSchema>;

// Fraud agency submissions table
export const fraudSubmissions = pgTable("fraud_submissions", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").references(() => calls.id).notNull(),
  agency: varchar("agency").notNull(),
  reportId: varchar("report_id"),
  submissionDate: timestamp("submission_date").defaultNow(),
  status: varchar("status").notNull(), // pending, submitted, acknowledged, failed
  response: jsonb("response"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fraud database reports (for tracking known scammer numbers)
export const fraudDatabase = pgTable("fraud_database", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number").notNull(),
  scammerName: varchar("scammer_name"),
  scamType: varchar("scam_type").notNull(),
  source: varchar("source").notNull(),
  confidence: integer("confidence").notNull(),
  reportedDate: timestamp("reported_date").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFraudSubmissionSchema = createInsertSchema(fraudSubmissions).omit({
  id: true,
  submissionDate: true,
  createdAt: true,
});

export const insertFraudDatabaseSchema = createInsertSchema(fraudDatabase).omit({
  id: true,
  createdAt: true,
});

export type FraudSubmission = typeof fraudSubmissions.$inferSelect;
export type InsertFraudSubmission = z.infer<typeof insertFraudSubmissionSchema>;
export type FraudDatabaseEntry = typeof fraudDatabase.$inferSelect;
export type InsertFraudDatabaseEntry = z.infer<typeof insertFraudDatabaseSchema>;

export type WebSocketMessage = 
  | { type: 'call_started'; data: Call }
  | { type: 'call_updated'; data: Call }
  | { type: 'call_ended'; data: Call }
  | { type: 'analytics_updated'; data: Analytics }
  | { type: 'funding_updated'; data: FundingProgress }
  | { type: 'social_analysis_created'; data: SocialAnalysis }
  | { type: 'scam_reported'; data: ScamReport }
  | { type: 'risk_map_updated'; data: ScamRiskRegion[] }
  | { type: 'scam_alert'; alert: any };

// Community Forum Tables
export const forumQuestions = pgTable("forum_questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  status: text("status").notNull().default("open"), // 'open', 'answered', 'closed'
  priority: text("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  votes: integer("votes").notNull().default(0),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const forumAnswers = pgTable("forum_answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => forumQuestions.id).notNull(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  votes: integer("votes").notNull().default(0),
  isAccepted: boolean("is_accepted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertForumQuestionSchema = createInsertSchema(forumQuestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumAnswerSchema = createInsertSchema(forumAnswers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ForumQuestion = typeof forumQuestions.$inferSelect;
export type InsertForumQuestion = z.infer<typeof insertForumQuestionSchema>;
export type ForumAnswer = typeof forumAnswers.$inferSelect;
export type InsertForumAnswer = z.infer<typeof insertForumAnswerSchema>;
