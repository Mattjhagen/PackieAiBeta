import { db } from "./db";
import { legalAgreements, complianceAudits, dataRetentionLog, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import type { 
  InsertLegalAgreement, 
  LegalAgreement, 
  InsertComplianceAudit,
  InsertDataRetentionLog 
} from "@shared/schema";

// Current legal document versions
const LEGAL_VERSIONS = {
  tos: "1.0",
  privacy: "1.0",
  developer_terms: "1.0"
} as const;

interface UserComplianceStatus {
  userId: number;
  tosAccepted: boolean;
  privacyAccepted: boolean;
  developerTermsAccepted: boolean;
  isCompliant: boolean;
  missingAgreements: string[];
}

class LegalComplianceService {
  /**
   * Record user acceptance of legal agreement
   */
  async recordAgreementAcceptance(
    userId: number,
    agreementType: 'tos' | 'privacy' | 'developer_terms',
    ipAddress?: string,
    userAgent?: string
  ): Promise<LegalAgreement> {
    const version = LEGAL_VERSIONS[agreementType];
    
    const [agreement] = await db
      .insert(legalAgreements)
      .values({
        userId,
        agreementType,
        version,
        accepted: true,
        acceptedAt: new Date(),
        ipAddress,
        userAgent,
      })
      .returning();

    // Log the acceptance for audit trail
    await this.logDataRetention(
      'legal_agreement',
      agreement.id,
      'created',
      `User ${userId} accepted ${agreementType} v${version}`
    );

    return agreement;
  }

  /**
   * Check if user has accepted all required agreements for developer portal
   */
  async checkUserCompliance(userId: number): Promise<UserComplianceStatus> {
    const agreements = await db
      .select()
      .from(legalAgreements)
      .where(
        and(
          eq(legalAgreements.userId, userId),
          eq(legalAgreements.accepted, true)
        )
      )
      .orderBy(desc(legalAgreements.acceptedAt));

    const currentAgreements = new Map<string, LegalAgreement>();
    
    // Get the most recent acceptance for each agreement type
    for (const agreement of agreements) {
      if (!currentAgreements.has(agreement.agreementType)) {
        currentAgreements.set(agreement.agreementType, agreement);
      }
    }

    const tosAccepted = this.isAgreementCurrent(currentAgreements.get('tos'), 'tos');
    const privacyAccepted = this.isAgreementCurrent(currentAgreements.get('privacy'), 'privacy');
    const developerTermsAccepted = this.isAgreementCurrent(currentAgreements.get('developer_terms'), 'developer_terms');

    const missingAgreements: string[] = [];
    if (!tosAccepted) missingAgreements.push('Terms of Service');
    if (!privacyAccepted) missingAgreements.push('Privacy Policy');
    if (!developerTermsAccepted) missingAgreements.push('Developer Terms');

    return {
      userId,
      tosAccepted,
      privacyAccepted,
      developerTermsAccepted,
      isCompliant: tosAccepted && privacyAccepted && developerTermsAccepted,
      missingAgreements
    };
  }

  /**
   * Check if agreement is current version
   */
  private isAgreementCurrent(
    agreement: LegalAgreement | undefined, 
    type: keyof typeof LEGAL_VERSIONS
  ): boolean {
    if (!agreement) return false;
    return agreement.version === LEGAL_VERSIONS[type];
  }

  /**
   * Get legal document content
   */
  async getLegalDocument(type: 'tos' | 'privacy'): Promise<{ content: string; version: string }> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    let filename: string;
    switch (type) {
      case 'tos':
        filename = 'TERMS_OF_SERVICE.md';
        break;
      case 'privacy':
        filename = 'PRIVACY_POLICY.md';
        break;
      default:
        throw new Error(`Unknown legal document type: ${type}`);
    }

    try {
      const content = await fs.readFile(path.resolve(process.cwd(), filename), 'utf-8');
      return {
        content,
        version: LEGAL_VERSIONS[type]
      };
    } catch (error) {
      throw new Error(`Failed to load legal document: ${filename}`);
    }
  }

  /**
   * Bulk accept all required agreements for developer portal
   */
  async acceptAllDeveloperAgreements(
    userId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LegalAgreement[]> {
    const agreements: LegalAgreement[] = [];

    // Accept Terms of Service
    const tosAgreement = await this.recordAgreementAcceptance(
      userId, 'tos', ipAddress, userAgent
    );
    agreements.push(tosAgreement);

    // Accept Privacy Policy
    const privacyAgreement = await this.recordAgreementAcceptance(
      userId, 'privacy', ipAddress, userAgent
    );
    agreements.push(privacyAgreement);

    // Accept Developer Terms
    const devAgreement = await this.recordAgreementAcceptance(
      userId, 'developer_terms', ipAddress, userAgent
    );
    agreements.push(devAgreement);

    return agreements;
  }

  /**
   * Schedule compliance audit
   */
  async scheduleComplianceAudit(
    auditType: 'data_retention' | 'access_review' | 'security_check',
    scheduledDate?: Date
  ): Promise<void> {
    await db.insert(complianceAudits).values({
      auditType,
      status: 'pending',
      scheduledDate: scheduledDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      nextAuditDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    });
  }

  /**
   * Log data retention action
   */
  async logDataRetention(
    dataType: string,
    recordId?: number,
    action: 'created' | 'accessed' | 'anonymized' | 'deleted' = 'created',
    reason?: string,
    performedBy?: string
  ): Promise<void> {
    const retentionPeriods: Record<string, number> = {
      'call_recordings': 2555, // 7 years in days
      'personal_data': 1095, // 3 years in days
      'analytics': 365, // 1 year in days
      'legal_agreement': 2555, // 7 years in days
      'fraud_report': -1, // Permanent
    };

    const retentionPeriod = retentionPeriods[dataType] || 365;
    const scheduledDeletionDate = retentionPeriod > 0 
      ? new Date(Date.now() + retentionPeriod * 24 * 60 * 60 * 1000)
      : null;

    await db.insert(dataRetentionLog).values({
      dataType,
      recordId,
      action,
      retentionPeriod: retentionPeriod > 0 ? retentionPeriod : null,
      scheduledDeletionDate,
      reason,
      performedBy,
    });
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard(): Promise<{
    totalUsers: number;
    compliantUsers: number;
    pendingAudits: number;
    dataRetentionActions: number;
    recentActions: any[];
  }> {
    // Get total users
    const [{ count: totalUsers }] = await db
      .select({ count: users.id })
      .from(users);

    // Get compliance status for all users
    const allAgreements = await db
      .select()
      .from(legalAgreements)
      .where(eq(legalAgreements.accepted, true));

    const userCompliance = new Map<number, Set<string>>();
    for (const agreement of allAgreements) {
      if (!userCompliance.has(agreement.userId)) {
        userCompliance.set(agreement.userId, new Set());
      }
      if (this.isAgreementCurrent(agreement, agreement.agreementType as any)) {
        userCompliance.get(agreement.userId)!.add(agreement.agreementType);
      }
    }

    let compliantUsers = 0;
    for (const [userId, agreements] of userCompliance) {
      if (agreements.has('tos') && agreements.has('privacy') && agreements.has('developer_terms')) {
        compliantUsers++;
      }
    }

    // Get pending audits
    const [{ count: pendingAudits }] = await db
      .select({ count: complianceAudits.id })
      .from(complianceAudits)
      .where(eq(complianceAudits.status, 'pending'));

    // Get recent data retention actions
    const [{ count: dataRetentionActions }] = await db
      .select({ count: dataRetentionLog.id })
      .from(dataRetentionLog);

    const recentActions = await db
      .select()
      .from(dataRetentionLog)
      .orderBy(desc(dataRetentionLog.createdAt))
      .limit(10);

    return {
      totalUsers: Number(totalUsers),
      compliantUsers,
      pendingAudits: Number(pendingAudits),
      dataRetentionActions: Number(dataRetentionActions),
      recentActions,
    };
  }

  /**
   * Export user data for GDPR/CCPA compliance
   */
  async exportUserData(userId: number): Promise<{
    personalData: any;
    agreements: LegalAgreement[];
    dataRetentionLogs: any[];
  }> {
    // Get user's personal data
    const [personalData] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    // Get user's legal agreements
    const agreements = await db
      .select()
      .from(legalAgreements)
      .where(eq(legalAgreements.userId, userId));

    // Get data retention logs related to this user
    const dataRetentionLogs = await db
      .select()
      .from(dataRetentionLog)
      .where(eq(dataRetentionLog.recordId, userId));

    return {
      personalData,
      agreements,
      dataRetentionLogs,
    };
  }

  /**
   * Delete user data for GDPR right to erasure
   */
  async deleteUserData(userId: number, reason: string = 'User request'): Promise<void> {
    // Log the deletion request
    await this.logDataRetention(
      'personal_data',
      userId,
      'deleted',
      reason,
      'System'
    );

    // Anonymize instead of delete to maintain fraud prevention data integrity
    await db
      .update(users)
      .set({
        email: `deleted_user_${userId}@packieai.local`,
        firstName: null,
        lastName: null,
        passwordHash: 'DELETED',
        isVerified: false,
        verificationToken: null,
        resetToken: null,
        resetTokenExpires: null,
      })
      .where(eq(users.id, userId));
  }

  /**
   * Get current legal document versions
   */
  getCurrentVersions(): typeof LEGAL_VERSIONS {
    return { ...LEGAL_VERSIONS };
  }
}

export const legalComplianceService = new LegalComplianceService();
export { LEGAL_VERSIONS };