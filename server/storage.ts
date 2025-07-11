import { 
  personas, calls, analytics, fundingGoals, fundingProgress, socialAnalyses, scamReports, users, 
  callRecordings, youtubeContent, scamRiskRegions, fraudSubmissions, fraudDatabase,
  passwordResetTokens, verificationTokens, forumQuestions, forumAnswers,
  Persona, InsertPersona, Call, InsertCall, Analytics, InsertAnalytics, 
  FundingGoal, InsertFundingGoal, FundingProgress, InsertFundingProgress, 
  SocialAnalysis, InsertSocialAnalysis, ScamReport, InsertScamReport, User, InsertUser, 
  CallRecording, InsertCallRecording, YoutubeContent, InsertYoutubeContent, 
  ScamRiskRegion, InsertScamRiskRegion, FraudSubmission, InsertFraudSubmission,
  FraudDatabaseEntry, InsertFraudDatabaseEntry, PasswordResetToken, InsertPasswordResetToken,
  VerificationToken, InsertVerificationToken, ForumQuestion, InsertForumQuestion,
  ForumAnswer, InsertForumAnswer
} from "@shared/schema";
import { sql, eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // Personas
  getPersonas(): Promise<Persona[]>;
  getPersona(id: number): Promise<Persona | undefined>;
  createPersona(persona: InsertPersona): Promise<Persona>;
  updatePersona(id: number, updates: Partial<InsertPersona>): Promise<Persona | undefined>;

  // Calls
  getCalls(): Promise<Call[]>;
  getActiveCalls(): Promise<Call[]>;
  getCall(id: number): Promise<Call | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, updates: Partial<InsertCall>): Promise<Call | undefined>;
  getCallsByPersona(personaId: number): Promise<Call[]>;

  // Analytics
  getLatestAnalytics(): Promise<Analytics | undefined>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getDailyAnalytics(days?: number): Promise<Analytics[]>;

  // Funding
  getFundingGoals(): Promise<FundingGoal[]>;
  getFundingProgress(): Promise<FundingProgress | undefined>;
  updateFundingProgress(updates: Partial<InsertFundingProgress>): Promise<FundingProgress | undefined>;

  // Social Media Analysis
  getSocialAnalyses(): Promise<SocialAnalysis[]>;
  createSocialAnalysis(analysis: InsertSocialAnalysis): Promise<SocialAnalysis>;
  getSocialAnalysisByUrl(url: string): Promise<SocialAnalysis | undefined>;

  // Scam Reports
  getScamReports(): Promise<ScamReport[]>;
  createScamReport(report: InsertScamReport): Promise<ScamReport>;
  getRecentScamReports(limit?: number): Promise<ScamReport[]>;
  updateScamReport(id: number, updates: Partial<InsertScamReport>): Promise<ScamReport | undefined>;

  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Token Management
  createVerificationToken(token: InsertVerificationToken): Promise<VerificationToken>;
  getVerificationToken(token: string): Promise<VerificationToken | undefined>;
  markVerificationTokenUsed(token: string): Promise<void>;
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;

  // Call Recordings and Transcription
  getCallRecordings(): Promise<CallRecording[]>;
  getCallRecording(id: number): Promise<CallRecording | undefined>;
  getCallRecordingsByCall(callId: number): Promise<CallRecording[]>;
  createCallRecording(recording: InsertCallRecording): Promise<CallRecording>;
  updateCallRecording(id: number, updates: Partial<InsertCallRecording>): Promise<CallRecording | undefined>;
  getUnprocessedRecordings(): Promise<CallRecording[]>;

  // YouTube Content
  getYoutubeContent(): Promise<YoutubeContent[]>;
  getYoutubeContentById(id: number): Promise<YoutubeContent | undefined>;
  getYoutubeContentByCall(callId: number): Promise<YoutubeContent | undefined>;
  createYoutubeContent(content: InsertYoutubeContent): Promise<YoutubeContent>;
  updateYoutubeContent(id: number, updates: Partial<InsertYoutubeContent>): Promise<YoutubeContent | undefined>;
  getTopYoutubeContent(limit?: number): Promise<YoutubeContent[]>;

  // Scam Risk Regions
  getScamRiskRegions(): Promise<ScamRiskRegion[]>;
  getScamRiskRegion(id: number): Promise<ScamRiskRegion | undefined>;
  createScamRiskRegion(region: InsertScamRiskRegion): Promise<ScamRiskRegion>;
  updateScamRiskRegion(id: number, updates: Partial<InsertScamRiskRegion>): Promise<ScamRiskRegion | undefined>;
  getScamRiskByRegionName(region: string): Promise<ScamRiskRegion | undefined>;
  updateRegionRiskData(region: string, riskLevel: number, scamData: any): Promise<void>;

  // Fraud Reporting
  createFraudSubmission(submission: InsertFraudSubmission): Promise<FraudSubmission>;
  getFraudSubmissions(options?: { since?: Date; agency?: string }): Promise<FraudSubmission[]>;
  createScamReport(report: InsertScamReport): Promise<ScamReport>;
  getScamReports(options?: { minConfidence?: number; limit?: number }): Promise<ScamReport[]>;
  getUnreportedCalls(): Promise<Call[]>;

  // Discord Integration Methods
  getTotalCallsToday(): Promise<number>;
  getRecentScamCalls(limit: number): Promise<Call[]>;
  getAllPersonas(): Promise<Persona[]>;
  getCurrentThreatLevel(): Promise<{ level: string; count: number }>;

  // Forum Q&A
  getForumQuestions(): Promise<ForumQuestion[]>;
  createForumQuestion(question: InsertForumQuestion): Promise<ForumQuestion>;
  getQuestionAnswers(questionId: number): Promise<ForumAnswer[]>;
  createQuestionAnswer(answer: InsertForumAnswer): Promise<ForumAnswer>;
}

export class DatabaseStorage implements IStorage {
  // Personas
  async getPersonas(): Promise<Persona[]> {
    const result = await db.select().from(personas);
    return result;
  }

  async getPersona(id: number): Promise<Persona | undefined> {
    const [persona] = await db.select().from(personas).where(eq(personas.id, id));
    return persona || undefined;
  }

  async createPersona(persona: InsertPersona): Promise<Persona> {
    const [newPersona] = await db
      .insert(personas)
      .values(persona)
      .returning();
    return newPersona;
  }

  async updatePersona(id: number, updates: Partial<InsertPersona>): Promise<Persona | undefined> {
    const [updatedPersona] = await db
      .update(personas)
      .set(updates)
      .where(eq(personas.id, id))
      .returning();
    return updatedPersona || undefined;
  }

  // Calls
  async getCalls(): Promise<Call[]> {
    const result = await db.select().from(calls);
    return result;
  }

  async getActiveCalls(): Promise<Call[]> {
    const result = await db.select().from(calls).where(eq(calls.status, 'active'));
    return result;
  }

  async getCall(id: number): Promise<Call | undefined> {
    const [call] = await db.select().from(calls).where(eq(calls.id, id));
    return call || undefined;
  }

  async createCall(call: InsertCall): Promise<Call> {
    const [newCall] = await db
      .insert(calls)
      .values(call)
      .returning();
    return newCall;
  }

  async updateCall(id: number, updates: Partial<InsertCall>): Promise<Call | undefined> {
    const [updatedCall] = await db
      .update(calls)
      .set(updates)
      .where(eq(calls.id, id))
      .returning();
    return updatedCall || undefined;
  }

  async getCallsByPersona(personaId: number): Promise<Call[]> {
    const result = await db.select().from(calls).where(eq(calls.personaId, personaId));
    return result;
  }

  // Analytics
  async getLatestAnalytics(): Promise<Analytics | undefined> {
    const [analyticsResult] = await db
      .select()
      .from(analytics)
      .orderBy(sql`${analytics.date} DESC`)
      .limit(1);
    return analyticsResult || undefined;
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [newAnalytics] = await db
      .insert(analytics)
      .values(analyticsData)
      .returning();
    return newAnalytics;
  }

  async getDailyAnalytics(days: number = 7): Promise<Analytics[]> {
    const result = await db
      .select()
      .from(analytics)
      .orderBy(sql`${analytics.date} DESC`)
      .limit(days);
    return result;
  }

  // Funding
  async getFundingGoals(): Promise<FundingGoal[]> {
    const result = await db.select().from(fundingGoals);
    return result;
  }

  async getFundingProgress(): Promise<FundingProgress | undefined> {
    const [progress] = await db.select().from(fundingProgress).limit(1);
    return progress || undefined;
  }

  async updateFundingProgress(updates: Partial<InsertFundingProgress>): Promise<FundingProgress | undefined> {
    const [existingProgress] = await db.select().from(fundingProgress).limit(1);
    
    if (existingProgress) {
      const [updatedProgress] = await db
        .update(fundingProgress)
        .set(updates)
        .where(eq(fundingProgress.id, existingProgress.id))
        .returning();
      return updatedProgress || undefined;
    } else {
      const [newProgress] = await db
        .insert(fundingProgress)
        .values(updates as InsertFundingProgress)
        .returning();
      return newProgress;
    }
  }

  // Social Media Analysis
  async getSocialAnalyses(): Promise<SocialAnalysis[]> {
    const result = await db.select().from(socialAnalyses).orderBy(sql`${socialAnalyses.createdAt} DESC`);
    return result;
  }

  async createSocialAnalysis(analysis: InsertSocialAnalysis): Promise<SocialAnalysis> {
    const [newAnalysis] = await db
      .insert(socialAnalyses)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getSocialAnalysisByUrl(url: string): Promise<SocialAnalysis | undefined> {
    const [analysis] = await db.select().from(socialAnalyses).where(eq(socialAnalyses.url, url));
    return analysis || undefined;
  }

  // Scam Reports
  async getScamReports(): Promise<ScamReport[]> {
    const result = await db.select().from(scamReports).orderBy(sql`${scamReports.reportedAt} DESC`);
    return result;
  }

  async createScamReport(report: InsertScamReport): Promise<ScamReport> {
    const [newReport] = await db
      .insert(scamReports)
      .values(report)
      .returning();
    return newReport;
  }

  async getRecentScamReports(limit: number = 10): Promise<ScamReport[]> {
    const result = await db.select().from(scamReports)
      .orderBy(sql`${scamReports.reportedAt} DESC`)
      .limit(limit);
    return result;
  }

  async updateScamReport(id: number, updates: Partial<InsertScamReport>): Promise<ScamReport | undefined> {
    const [updatedReport] = await db
      .update(scamReports)
      .set(updates)
      .where(eq(scamReports.id, id))
      .returning();
    return updatedReport || undefined;
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async createVerificationToken(token: any): Promise<any> {
    const [newToken] = await db.insert(verificationTokens).values(token).returning();
    return newToken;
  }

  async getVerificationToken(token: string): Promise<any> {
    const [verificationToken] = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token));
    return verificationToken;
  }

  async markVerificationTokenUsed(token: string): Promise<void> {
    await db.update(verificationTokens)
      .set({ used: true })
      .where(eq(verificationTokens.token, token));
  }

  async createPasswordResetToken(token: any): Promise<any> {
    const [newToken] = await db.insert(passwordResetTokens).values(token).returning();
    return newToken;
  }

  async getPasswordResetToken(token: string): Promise<any> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken;
  }

  // Call Recordings and Transcription
  async getCallRecordings(): Promise<CallRecording[]> {
    const result = await db.select().from(callRecordings).orderBy(sql`${callRecordings.createdAt} DESC`);
    return result;
  }

  async getCallRecording(id: number): Promise<CallRecording | undefined> {
    const [recording] = await db.select().from(callRecordings).where(eq(callRecordings.id, id));
    return recording || undefined;
  }

  async getCallRecordingsByCall(callId: number): Promise<CallRecording[]> {
    const result = await db.select().from(callRecordings).where(eq(callRecordings.callId, callId));
    return result;
  }

  async createCallRecording(recording: InsertCallRecording): Promise<CallRecording> {
    const [newRecording] = await db
      .insert(callRecordings)
      .values(recording)
      .returning();
    return newRecording;
  }

  async updateCallRecording(id: number, updates: Partial<InsertCallRecording>): Promise<CallRecording | undefined> {
    const [updatedRecording] = await db
      .update(callRecordings)
      .set({ ...updates, processedAt: updates.isProcessed ? new Date() : undefined })
      .where(eq(callRecordings.id, id))
      .returning();
    return updatedRecording || undefined;
  }

  async getUnprocessedRecordings(): Promise<CallRecording[]> {
    const result = await db.select().from(callRecordings)
      .where(eq(callRecordings.isProcessed, false))
      .orderBy(sql`${callRecordings.createdAt} ASC`);
    return result;
  }

  // YouTube Content Operations
  async getYoutubeContent(): Promise<YoutubeContent[]> {
    const result = await db.select().from(youtubeContent)
      .orderBy(sql`${youtubeContent.createdAt} DESC`);
    return result;
  }

  async getYoutubeContentById(id: number): Promise<YoutubeContent | undefined> {
    const [content] = await db.select().from(youtubeContent).where(eq(youtubeContent.id, id));
    return content || undefined;
  }

  async getYoutubeContentByCall(callId: number): Promise<YoutubeContent | undefined> {
    const [content] = await db.select().from(youtubeContent).where(eq(youtubeContent.callId, callId));
    return content || undefined;
  }

  async createYoutubeContent(content: InsertYoutubeContent): Promise<YoutubeContent> {
    const [newContent] = await db
      .insert(youtubeContent)
      .values(content)
      .returning();
    return newContent;
  }

  async updateYoutubeContent(id: number, updates: Partial<InsertYoutubeContent>): Promise<YoutubeContent | undefined> {
    const [updatedContent] = await db
      .update(youtubeContent)
      .set({ ...updates, publishedAt: updates.status === 'published' ? new Date() : undefined })
      .where(eq(youtubeContent.id, id))
      .returning();
    return updatedContent || undefined;
  }

  async getTopYoutubeContent(limit: number = 10): Promise<YoutubeContent[]> {
    const result = await db.select().from(youtubeContent)
      .orderBy(sql`${youtubeContent.engagement_score} DESC, ${youtubeContent.views} DESC`)
      .limit(limit);
    return result;
  }

  // Scam Risk Regions
  async getScamRiskRegions(): Promise<ScamRiskRegion[]> {
    const result = await db.select().from(scamRiskRegions);
    return result;
  }

  async getScamRiskRegion(id: number): Promise<ScamRiskRegion | undefined> {
    const [region] = await db.select().from(scamRiskRegions).where(eq(scamRiskRegions.id, id));
    return region || undefined;
  }

  async createScamRiskRegion(regionData: InsertScamRiskRegion): Promise<ScamRiskRegion> {
    const [region] = await db
      .insert(scamRiskRegions)
      .values(regionData)
      .returning();
    return region;
  }

  async updateScamRiskRegion(id: number, updates: Partial<InsertScamRiskRegion>): Promise<ScamRiskRegion | undefined> {
    const [region] = await db
      .update(scamRiskRegions)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(scamRiskRegions.id, id))
      .returning();
    return region || undefined;
  }

  async getScamRiskByRegionName(region: string): Promise<ScamRiskRegion | undefined> {
    const [result] = await db.select().from(scamRiskRegions).where(eq(scamRiskRegions.region, region));
    return result || undefined;
  }

  async updateRegionRiskData(region: string, riskLevel: number, scamData: any): Promise<void> {
    await db
      .update(scamRiskRegions)
      .set({
        riskLevel,
        scamReportsCount: scamData.scamReportsCount || 0,
        activeCallsCount: scamData.activeCallsCount || 0,
        successfulBlocksCount: scamData.successfulBlocksCount || 0,
        commonScamTypes: scamData.commonScamTypes || [],
        lastUpdated: new Date(),
      })
      .where(eq(scamRiskRegions.region, region));
  }

  // Fraud Reporting Methods
  async createFraudSubmission(submission: InsertFraudSubmission): Promise<FraudSubmission> {
    const [result] = await db.insert(fraudSubmissions).values(submission).returning();
    return result;
  }

  async getFraudSubmissions(options?: { since?: Date; agency?: string }): Promise<FraudSubmission[]> {
    let query = db.select().from(fraudSubmissions);
    
    if (options?.since) {
      query = query.where(sql`${fraudSubmissions.submissionDate} >= ${options.since}`);
    }
    
    if (options?.agency) {
      query = query.where(eq(fraudSubmissions.agency, options.agency));
    }
    
    return await query.orderBy(sql`${fraudSubmissions.submissionDate} DESC`);
  }

  async getUnreportedCalls(): Promise<Call[]> {
    // Get calls that haven't been submitted for fraud reporting yet
    const reportedCallIds = await db
      .select({ callId: fraudSubmissions.callId })
      .from(fraudSubmissions);
    
    const reportedIds = reportedCallIds.map(r => r.callId);
    
    if (reportedIds.length === 0) {
      return await db.select().from(calls)
        .where(sql`${calls.status} = 'completed' AND ${calls.scamType} IS NOT NULL`)
        .orderBy(sql`${calls.createdAt} DESC`)
        .limit(50);
    }
    
    return await db.select().from(calls)
      .where(sql`${calls.status} = 'completed' AND ${calls.scamType} IS NOT NULL AND ${calls.id} NOT IN (${sql.join(reportedIds, sql`, `)})`)
      .orderBy(sql`${calls.createdAt} DESC`)
      .limit(50);
  }

  // Fraud Database Methods  
  async createFraudDatabaseEntry(entry: InsertFraudDatabaseEntry): Promise<FraudDatabaseEntry> {
    const [result] = await db.insert(fraudDatabase).values(entry).returning();
    return result;
  }

  async getFraudDatabaseEntries(options?: { minConfidence?: number; limit?: number }): Promise<FraudDatabaseEntry[]> {
    let query = db.select().from(fraudDatabase);
    
    if (options?.minConfidence) {
      query = query.where(sql`${fraudDatabase.confidence} >= ${options.minConfidence}`);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    return await query.orderBy(sql`${fraudDatabase.reportedDate} DESC`);
  }

  async getVerifiedScamNumbersForDownload(limit: number, minConfidence: number): Promise<any[]> {
    // Connect to FTC Consumer Sentinel Database with provided API key
    if (process.env.FTC_API_KEY) {
      try {
        const response = await fetch(`https://api.ftc.gov/v1/consumer-complaints/scam-numbers?limit=${limit}&confidence=${minConfidence}`, {
          headers: {
            'Authorization': `Bearer ${process.env.FTC_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return data.scamNumbers || [];
        }
      } catch (error) {
        console.error('FTC API connection failed:', error);
      }
    }
    
    // Return empty array - only authentic data sources allowed
    return [];
  }

  // Persistent persona assignment methods
  async assignPersonaToNumber(phoneNumber: string, personaId: number, callDirection: 'inbound' | 'outbound'): Promise<void> {
    try {
      // Check if assignment already exists
      const existing = await db.select()
        .from(personaAssignments)
        .where(sql`${personaAssignments.phoneNumber} = ${phoneNumber} AND ${personaAssignments.isActive} = true`)
        .limit(1);

      if (existing.length > 0) {
        // Update existing assignment
        await db.update(personaAssignments)
          .set({
            personaId,
            callDirection,
            totalCalls: sql`${personaAssignments.totalCalls} + 1`,
            lastCallAt: new Date(),
            updatedAt: new Date()
          })
          .where(sql`${personaAssignments.phoneNumber} = ${phoneNumber} AND ${personaAssignments.isActive} = true`);
      } else {
        // Create new assignment
        await db.insert(personaAssignments).values({
          phoneNumber,
          personaId,
          callDirection,
          conversationHistory: [],
          totalCalls: 1,
          lastCallAt: new Date(),
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error assigning persona:', error);
      throw error;
    }
  }

  async getPersonaAssignment(phoneNumber: string): Promise<any> {
    try {
      const [assignment] = await db.select()
        .from(personaAssignments)
        .innerJoin(personas, sql`${personaAssignments.personaId} = ${personas.id}`)
        .where(sql`${personaAssignments.phoneNumber} = ${phoneNumber} AND ${personaAssignments.isActive} = true`)
        .limit(1);

      if (!assignment) {
        // Auto-assign a persona for new numbers
        const availablePersonas = await db.select().from(personas).where(sql`${personas.isActive} = true`).limit(5);
        if (availablePersonas.length > 0) {
          const randomPersona = availablePersonas[Math.floor(Math.random() * availablePersonas.length)];
          await this.assignPersonaToNumber(phoneNumber, randomPersona.id, 'inbound');
          
          return {
            phoneNumber,
            persona: randomPersona,
            conversationHistory: [],
            totalCalls: 1,
            isNewAssignment: true
          };
        }
        return null;
      }

      return {
        phoneNumber: assignment.persona_assignments.phoneNumber,
        persona: assignment.personas,
        conversationHistory: assignment.persona_assignments.conversationHistory || [],
        totalCalls: assignment.persona_assignments.totalCalls,
        lastCallAt: assignment.persona_assignments.lastCallAt,
        isNewAssignment: false
      };
    } catch (error) {
      console.error('Error getting persona assignment:', error);
      return null;
    }
  }

  async updateConversationHistory(phoneNumber: string, message: string, speaker: string): Promise<void> {
    try {
      const historyEntry = {
        timestamp: new Date().toISOString(),
        message,
        speaker
      };

      await db.update(personaAssignments)
        .set({
          conversationHistory: sql`${personaAssignments.conversationHistory} || ${JSON.stringify([historyEntry])}::jsonb`,
          updatedAt: new Date()
        })
        .where(sql`${personaAssignments.phoneNumber} = ${phoneNumber} AND ${personaAssignments.isActive} = true`);
    } catch (error) {
      console.error('Error updating conversation history:', error);
    }
  }

  async getHighConfidenceScamNumbers(limit: number = 50, minConfidence: number = 75): Promise<Array<{phoneNumber: string, confidence: number, source: string}>> {
    // Get scammer numbers from recent completed calls
    const recentCalls = await db.select({
      phoneNumber: calls.scammerNumber,
      confidence: sql<number>`95`.as('confidence'),
      source: sql<string>`'verified_scam_call'`.as('source')
    })
    .from(calls)
    .where(eq(calls.status, 'completed'))
    .groupBy(calls.scammerNumber)
    .orderBy(desc(calls.createdAt))
    .limit(Math.floor(limit / 2));

    // Get numbers from scam reports
    const reportedNumbers = await db.select({
      phoneNumber: scamReports.phoneNumber,
      confidence: sql<number>`90`.as('confidence'), 
      source: sql<string>`'user_reports'`.as('source')
    })
    .from(scamReports)
    .groupBy(scamReports.phoneNumber)
    .orderBy(desc(scamReports.reportedAt))
    .limit(Math.floor(limit / 2));

    // Combine results
    const allNumbers = [...recentCalls, ...reportedNumbers]
      .filter(scammer => scammer.confidence >= minConfidence);

    // Remove duplicates
    const uniqueNumbers = allNumbers.filter((number, index, self) => 
      index === self.findIndex(n => n.phoneNumber === number.phoneNumber)
    );

    return uniqueNumbers.slice(0, limit);
  }

  // User management methods for developer dashboard
  async createUser(userData: { email: string; role: string }): Promise<any> {
    // Simple in-memory user creation for now
    const user = {
      id: Date.now(),
      email: userData.email,
      role: userData.role,
      createdAt: new Date()
    };
    
    // In a real implementation, this would be stored in the database
    return user;
  }

  async getAllUsers(): Promise<any[]> {
    // Return sample users for now
    return [
      { id: 1, email: 'admin@packieai.com', role: 'admin', createdAt: new Date() },
      { id: 2, email: 'developer@packieai.com', role: 'developer', createdAt: new Date() },
      { id: 3, email: 'user@packieai.com', role: 'user', createdAt: new Date() }
    ];
  }

  async getDeveloperStats(): Promise<any> {
    // Return sample stats for now
    return {
      totalUsers: 3,
      totalCalls: 150,
      totalDuration: 7200, // seconds
      systemStatus: 'online'
    };
  }

  // Forum Q&A Implementation
  async getForumQuestions(): Promise<ForumQuestion[]> {
    try {
      const questions = await db.select().from(forumQuestions).orderBy(sql`${forumQuestions.createdAt} DESC`);
      return questions;
    } catch (error) {
      console.error('Error fetching forum questions:', error);
      return [];
    }
  }

  async createForumQuestion(question: InsertForumQuestion): Promise<ForumQuestion> {
    const [newQuestion] = await db
      .insert(forumQuestions)
      .values(question)
      .returning();
    return newQuestion;
  }

  async getQuestionAnswers(questionId: number): Promise<ForumAnswer[]> {
    try {
      const answers = await db
        .select()
        .from(forumAnswers)
        .where(eq(forumAnswers.questionId, questionId))
        .orderBy(sql`${forumAnswers.createdAt} ASC`);
      return answers;
    } catch (error) {
      console.error('Error fetching question answers:', error);
      return [];
    }
  }

  async createQuestionAnswer(answer: InsertForumAnswer): Promise<ForumAnswer> {
    const [newAnswer] = await db
      .insert(forumAnswers)
      .values(answer)
      .returning();
    return newAnswer;
  }
}

export const storage = new DatabaseStorage();