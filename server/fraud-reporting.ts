import fetch from 'node-fetch';
import { storage } from './storage';

interface FraudReport {
  phoneNumber: string;
  scamType: string;
  transcript?: string;
  recordingUrl?: string;
  duration: number;
  timestamp: Date;
  victimImpact?: string;
  evidence: {
    callRecording: boolean;
    transcript: boolean;
    scammerInfo: any;
  };
}

interface AgencySubmission {
  agency: string;
  reportId?: string;
  submissionDate: Date;
  status: 'pending' | 'submitted' | 'acknowledged' | 'failed';
  response?: any;
}

class FraudReportingService {
  private agencies = {
    ftc: {
      name: 'Federal Trade Commission',
      url: 'https://www.ftccomplaintassistant.gov',
      webFormUrl: 'https://www.ftccomplaintassistant.gov/',
      apiKey: process.env.FTC_API_KEY,
      enabled: true,
      requiresManualSubmission: true
    },
    ic3: {
      name: 'Internet Crime Complaint Center (IC3)',
      url: 'https://www.ic3.gov',
      webFormUrl: 'https://www.ic3.gov/Home/FileComplaint',
      apiKey: process.env.IC3_API_KEY,
      enabled: true,
      requiresManualSubmission: true
    },
    itrc: {
      name: 'Identity Theft Resource Center',
      url: 'https://www.idtheftcenter.org',
      webFormUrl: 'https://www.idtheftcenter.org/get-help',
      apiKey: process.env.ITRC_API_KEY,
      enabled: true,
      requiresManualSubmission: true
    },
    bbb: {
      name: 'Better Business Bureau',
      url: 'https://www.bbb.org',
      webFormUrl: 'https://www.bbb.org/consumer-complaints/file-a-complaint/get-started',
      apiKey: process.env.BBB_API_KEY,
      enabled: true,
      requiresManualSubmission: true
    },
    fraud_org: {
      name: 'Fraud.org (National Consumers League)',
      url: 'https://fraud.org',
      webFormUrl: 'https://fraud.org/report-fraud/',
      apiKey: process.env.FRAUD_ORG_API_KEY,
      enabled: true,
      requiresManualSubmission: true
    }
  };

  async processCallForReporting(callId: number): Promise<void> {
    try {
      const call = await storage.getCall(callId);
      const recordings = await storage.getCallRecordingsByCall(callId);
      
      if (!call || !recordings.length) {
        console.log(`No reportable data found for call ${callId}`);
        return;
      }

      // Only report calls that show clear scam indicators
      if (!this.isReportableScam(call, recordings)) {
        console.log(`Call ${callId} does not meet reporting criteria`);
        return;
      }

      const fraudReport = await this.buildFraudReport(call, recordings);
      const submissions = await this.submitToAgencies(fraudReport);
      
      // Store submission records
      for (const submission of submissions) {
        await storage.createFraudSubmission({
          callId,
          agency: submission.agency,
          reportId: submission.reportId,
          submissionDate: submission.submissionDate,
          status: submission.status,
          response: submission.response
        });
      }

      console.log(`Submitted fraud report for call ${callId} to ${submissions.length} agencies`);
    } catch (error) {
      console.error(`Failed to process fraud report for call ${callId}:`, error);
    }
  }

  private isReportableScam(call: any, recordings: any[]): boolean {
    // Check if call has sufficient evidence for reporting
    const hasTranscript = recordings.some(r => r.transcriptionText);
    const hasMinDuration = call.duration > 30; // At least 30 seconds
    const hasScamIndicators = call.scamType && call.scamType !== 'unknown';
    
    return hasTranscript && hasMinDuration && hasScamIndicators;
  }

  private async buildFraudReport(call: any, recordings: any[]): Promise<FraudReport> {
    const primaryRecording = recordings[0];
    
    return {
      phoneNumber: call.scammerNumber,
      scamType: call.scamType,
      transcript: primaryRecording?.transcriptionText || undefined,
      recordingUrl: primaryRecording?.recordingUrl || undefined,
      duration: call.duration,
      timestamp: call.createdAt,
      victimImpact: this.assessVictimImpact(call),
      evidence: {
        callRecording: !!primaryRecording?.recordingUrl,
        transcript: !!primaryRecording?.transcriptionText,
        scammerInfo: {
          tactics: this.extractScamTactics(primaryRecording?.transcriptionText),
          targetedDemographic: this.getTargetedDemographic(call.scamType),
          persistenceLevel: this.assessPersistenceLevel(call.duration)
        }
      }
    };
  }

  private async submitToAgencies(report: FraudReport): Promise<AgencySubmission[]> {
    const submissions: AgencySubmission[] = [];
    
    for (const [key, agency] of Object.entries(this.agencies)) {
      if (!agency.enabled) continue;
      
      try {
        const submission = await this.submitToAgency(key, agency, report);
        submissions.push(submission);
        
        // Add delay between submissions to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to submit to ${agency.name}:`, error);
        submissions.push({
          agency: agency.name,
          submissionDate: new Date(),
          status: 'failed',
          response: { error: error.message }
        });
      }
    }
    
    return submissions;
  }

  private async submitToAgency(agencyKey: string, agency: any, report: FraudReport): Promise<AgencySubmission> {
    const payload = this.formatReportForAgency(agencyKey, report);
    
    // For agencies requiring manual submission, generate a structured report package
    if (agency.requiresManualSubmission) {
      const reportPackage = {
        agencyName: agency.name,
        submissionUrl: agency.webFormUrl,
        reportData: payload,
        instructions: `Please visit ${agency.webFormUrl} to submit this fraud report manually.`,
        generatedAt: new Date().toISOString(),
        caseReference: `PackieAI-${Date.now()}-${agencyKey.toUpperCase()}`
      };
      
      console.log(`Generated fraud report package for ${agency.name}:`, JSON.stringify(reportPackage, null, 2));
      
      return {
        agency: agency.name,
        reportId: reportPackage.caseReference,
        submissionDate: new Date(),
        status: 'pending',
        response: {
          type: 'manual_submission_required',
          submissionUrl: agency.webFormUrl,
          reportPackage: reportPackage
        }
      };
    }
    
    // For agencies with API access (if any)
    try {
      const response = await fetch(agency.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PackieAI-FraudReporting/1.0',
          ...(agency.apiKey && { 'Authorization': `Bearer ${agency.apiKey}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      return {
        agency: agency.name,
        reportId: responseData.reportId || responseData.confirmationNumber,
        submissionDate: new Date(),
        status: 'submitted',
        response: responseData
      };
    } catch (error) {
      console.error(`API submission failed for ${agency.name}, falling back to manual submission package`);
      
      const reportPackage = {
        agencyName: agency.name,
        submissionUrl: agency.webFormUrl,
        reportData: payload,
        instructions: `API submission failed. Please visit ${agency.webFormUrl} to submit this fraud report manually.`,
        generatedAt: new Date().toISOString(),
        caseReference: `PackieAI-${Date.now()}-${agencyKey.toUpperCase()}`,
        error: error.message
      };
      
      return {
        agency: agency.name,
        reportId: reportPackage.caseReference,
        submissionDate: new Date(),
        status: 'pending',
        response: {
          type: 'manual_submission_required',
          submissionUrl: agency.webFormUrl,
          reportPackage: reportPackage,
          error: error.message
        }
      };
    }
  }

  private formatReportForAgency(agencyKey: string, report: FraudReport): any {
    const baseReport = {
      reportType: 'phone_scam',
      phoneNumber: report.phoneNumber,
      scamCategory: this.mapScamTypeToAgencyCategory(agencyKey, report.scamType),
      incidentDate: report.timestamp.toISOString(),
      description: this.generateReportDescription(report),
      evidence: {
        hasRecording: report.evidence.callRecording,
        hasTranscript: report.evidence.transcript,
        callDuration: report.duration
      },
      reportingEntity: {
        name: 'PackieAI Anti-Scam System',
        type: 'automated_honeypot',
        contact: 'reports@packieai.com'
      }
    };

    // Agency-specific formatting
    switch (agencyKey) {
      case 'ftc':
        return {
          ...baseReport,
          complaintType: 'TELEMARKETING_ROBOCALLS',
          productService: 'Phone Scam Detection',
          businessName: 'Unknown Scammer',
          lossAmount: 0, // Prevented loss
          mediaType: 'PHONE'
        };
        
      case 'fbi':
        return {
          ...baseReport,
          crimeType: 'TELECOM_FRAUD',
          victimType: 'INDIVIDUAL',
          suspectInformation: {
            phoneNumber: report.phoneNumber,
            tactics: report.evidence.scammerInfo.tactics
          }
        };
        
      case 'fcc':
        return {
          ...baseReport,
          violationType: 'UNWANTED_CALLS',
          callType: 'SCAM_LIKELY',
          consumerType: 'INDIVIDUAL',
          phoneType: 'WIRELESS'
        };
        
      default:
        return baseReport;
    }
  }

  private mapScamTypeToAgencyCategory(agencyKey: string, scamType: string): string {
    const mappings = {
      'tech-support': {
        ftc: 'TECH_SUPPORT_SCAM',
        fbi: 'TECH_SUPPORT_FRAUD',
        fcc: 'TECH_SUPPORT_SCAM'
      },
      'irs-scam': {
        ftc: 'GOVERNMENT_IMPERSONATION',
        fbi: 'GOVERNMENT_IMPERSONATION',
        fcc: 'GOVERNMENT_IMPERSONATION'
      },
      'financial': {
        ftc: 'FINANCIAL_SERVICES',
        fbi: 'FINANCIAL_FRAUD',
        fcc: 'FINANCIAL_SCAM'
      }
    };

    return mappings[scamType]?.[agencyKey] || 'OTHER_SCAM';
  }

  private generateReportDescription(report: FraudReport): string {
    return `Automated scam detection system recorded suspicious call activity:

Phone Number: ${report.phoneNumber}
Scam Type: ${report.scamType}
Call Duration: ${Math.floor(report.duration / 60)}m ${report.duration % 60}s
Date/Time: ${report.timestamp.toLocaleString()}

${report.transcript ? `Call Transcript Summary:
${report.transcript.substring(0, 500)}...` : 'Transcript processing in progress'}

This report was generated by PackieAI's automated anti-scam system, which uses AI personas to engage with suspected scammers and waste their time while gathering evidence.

Evidence Available:
- Audio Recording: ${report.evidence.callRecording ? 'Yes' : 'No'}
- Transcript: ${report.evidence.transcript ? 'Yes' : 'No'}
- Scammer Tactics: ${report.evidence.scammerInfo.tactics.join(', ')}`;
  }

  private assessVictimImpact(call: any): string {
    switch (call.scamType) {
      case 'tech-support':
        return 'High - Targets elderly with computer fears, potential for significant financial loss';
      case 'irs-scam':
        return 'Critical - Threatens arrest/legal action, causes severe anxiety and financial harm';
      case 'financial':
        return 'High - Targets personal financial information, potential identity theft';
      case 'medicare-scam':
        return 'High - Targets vulnerable elderly population with health concerns';
      default:
        return 'Medium - General scam activity with potential for financial or emotional harm';
    }
  }

  private extractScamTactics(transcript?: string): string[] {
    if (!transcript) return ['Unknown tactics'];
    
    const tactics = [];
    const text = transcript.toLowerCase();
    
    if (text.includes('urgent') || text.includes('immediately')) {
      tactics.push('Urgency pressure');
    }
    if (text.includes('suspend') || text.includes('close account')) {
      tactics.push('Account threats');
    }
    if (text.includes('gift card') || text.includes('wire transfer')) {
      tactics.push('Untraceable payment requests');
    }
    if (text.includes('remote access') || text.includes('teamviewer')) {
      tactics.push('Remote access requests');
    }
    if (text.includes('verify') || text.includes('confirm')) {
      tactics.push('Information harvesting');
    }
    
    return tactics.length > 0 ? tactics : ['General deception'];
  }

  private getTargetedDemographic(scamType: string): string {
    const demographics = {
      'tech-support': 'Elderly (65+), less tech-savvy individuals',
      'irs-scam': 'Tax-paying adults, recent immigrants',
      'medicare-scam': 'Medicare recipients (65+)',
      'social-security': 'Senior citizens, disability recipients',
      'financial': 'General adult population with bank accounts'
    };
    
    return demographics[scamType] || 'General population';
  }

  private assessPersistenceLevel(duration: number): string {
    if (duration > 600) return 'Very High (10+ minutes)';
    if (duration > 300) return 'High (5-10 minutes)';
    if (duration > 120) return 'Medium (2-5 minutes)';
    return 'Low (under 2 minutes)';
  }

  async generateMonthlyReport(): Promise<void> {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const submissions = await storage.getFraudSubmissions({
        since: lastMonth
      });
      
      const report = {
        reportingPeriod: lastMonth.toISOString().slice(0, 7),
        totalSubmissions: submissions.length,
        agencyBreakdown: this.analyzeSubmissionsByAgency(submissions),
        scamTypeBreakdown: await this.analyzeScamTypes(lastMonth),
        impactMetrics: await this.calculateImpactMetrics(lastMonth)
      };
      
      // Send summary report to agencies
      await this.submitMonthlySummary(report);
      
      console.log('Monthly fraud reporting summary submitted to agencies');
    } catch (error) {
      console.error('Failed to generate monthly fraud report:', error);
    }
  }

  private analyzeSubmissionsByAgency(submissions: any[]): any {
    const breakdown = {};
    
    for (const submission of submissions) {
      if (!breakdown[submission.agency]) {
        breakdown[submission.agency] = {
          total: 0,
          successful: 0,
          failed: 0
        };
      }
      
      breakdown[submission.agency].total++;
      if (submission.status === 'submitted' || submission.status === 'acknowledged') {
        breakdown[submission.agency].successful++;
      } else {
        breakdown[submission.agency].failed++;
      }
    }
    
    return breakdown;
  }

  private async analyzeScamTypes(since: Date): Promise<any> {
    const calls = await storage.getCalls({ since });
    const scamTypes = {};
    
    for (const call of calls) {
      if (!scamTypes[call.scamType]) {
        scamTypes[call.scamType] = {
          count: 0,
          totalDuration: 0,
          averageDuration: 0
        };
      }
      
      scamTypes[call.scamType].count++;
      scamTypes[call.scamType].totalDuration += call.duration;
    }
    
    // Calculate averages
    for (const type of Object.values(scamTypes) as any[]) {
      type.averageDuration = Math.round(type.totalDuration / type.count);
    }
    
    return scamTypes;
  }

  private async calculateImpactMetrics(since: Date): Promise<any> {
    const calls = await storage.getCalls({ since });
    
    return {
      totalScammerTimeWasted: calls.reduce((sum, call) => sum + call.duration, 0),
      averageCallDuration: calls.length > 0 ? 
        Math.round(calls.reduce((sum, call) => sum + call.duration, 0) / calls.length) : 0,
      uniqueScammerNumbers: new Set(calls.map(call => call.scammerNumber)).size,
      estimatedLossPrevented: this.estimatePreventedLoss(calls)
    };
  }

  private estimatePreventedLoss(calls: any[]): number {
    // Conservative estimates based on scam type
    const lossEstimates = {
      'tech-support': 300,
      'irs-scam': 500,
      'financial': 250,
      'medicare-scam': 400,
      'romance-scam': 1000
    };
    
    return calls.reduce((total, call) => {
      const estimatedLoss = lossEstimates[call.scamType] || 100;
      return total + estimatedLoss;
    }, 0);
  }

  private async submitMonthlySummary(report: any): Promise<void> {
    // Submit summary to each agency
    for (const [key, agency] of Object.entries(this.agencies)) {
      if (!agency.enabled || !agency.apiKey) continue;
      
      try {
        await fetch(`${agency.url}/monthly-summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${agency.apiKey}`
          },
          body: JSON.stringify({
            ...report,
            submittingOrganization: 'PackieAI Anti-Scam System'
          })
        });
        
        console.log(`Monthly summary submitted to ${agency.name}`);
      } catch (error) {
        console.error(`Failed to submit monthly summary to ${agency.name}:`, error);
      }
    }
  }

  async scheduleAutomatedReporting(): Promise<void> {
    // Process new calls every hour
    setInterval(async () => {
      try {
        const recentCalls = await storage.getUnreportedCalls();
        
        for (const call of recentCalls) {
          await this.processCallForReporting(call.id);
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        }
      } catch (error) {
        console.error('Automated reporting failed:', error);
      }
    }, 60 * 60 * 1000); // Every hour
    
    // Generate monthly reports
    setInterval(async () => {
      await this.generateMonthlyReport();
    }, 30 * 24 * 60 * 60 * 1000); // Every 30 days
    
    console.log('Automated fraud reporting scheduled');
  }
}

export const fraudReportingService = new FraudReportingService();