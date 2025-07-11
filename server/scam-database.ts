import fetch from 'node-fetch';
import { storage } from './storage';

interface ScamReport {
  phone: string;
  name?: string;
  scamType: string;
  source: string;
  confidence: number;
  reportedDate: Date;
}

interface ScamDatabase {
  name: string;
  url: string;
  apiKey?: string;
  parser: (data: any) => ScamReport[];
  enabled: boolean;
}

class ScamDatabaseManager {
  private databases: ScamDatabase[] = [
    {
      name: 'FTC Consumer Sentinel',
      url: 'https://reportfraud.ftc.gov/api/complaints/phone',
      parser: this.parseFTCData,
      enabled: true
    },
    {
      name: 'RoboKiller Database',
      url: 'https://lookup.robokiller.com/api/v1/lookup',
      parser: this.parseRoboKillerData,
      enabled: true
    },
    {
      name: 'TrueCaller Spam API',
      url: 'https://search5-noneu.truecaller.com/v2/search',
      parser: this.parseTrueCallerData,
      enabled: false // Requires API key
    },
    {
      name: 'Should I Answer',
      url: 'https://www.shouldianswer.net/api/number',
      parser: this.parseShouldIAnswerData,
      enabled: true
    },
    {
      name: 'Scammer.info Community Database',
      url: 'https://scammer.info/api/numbers',
      parser: this.parseScammerInfoData,
      enabled: true
    }
  ];

  async fetchScamNumbers(): Promise<ScamReport[]> {
    const allReports: ScamReport[] = [];
    
    for (const database of this.databases.filter(db => db.enabled)) {
      try {
        console.log(`Fetching data from ${database.name}...`);
        const reports = await this.fetchFromDatabase(database);
        allReports.push(...reports);
        console.log(`Retrieved ${reports.length} reports from ${database.name}`);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to fetch from ${database.name}:`, error);
      }
    }
    
    return this.deduplicateReports(allReports);
  }

  private async fetchFromDatabase(database: ScamDatabase): Promise<ScamReport[]> {
    try {
      const headers: any = {
        'User-Agent': 'PackieAI-AntiScam/1.0'
      };
      
      if (database.apiKey) {
        headers['Authorization'] = `Bearer ${database.apiKey}`;
      }
      
      const response = await fetch(database.url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return database.parser(data);
    } catch (error) {
      console.error(`Database fetch error for ${database.name}:`, error);
      return [];
    }
  }

  private parseFTCData(data: any): ScamReport[] {
    if (!data.complaints || !Array.isArray(data.complaints)) return [];
    
    return data.complaints
      .filter((complaint: any) => complaint.phoneNumber && complaint.complaintType)
      .map((complaint: any) => ({
        phone: this.normalizePhoneNumber(complaint.phoneNumber),
        name: complaint.companyName || 'Unknown',
        scamType: this.categorizeScamType(complaint.complaintType),
        source: 'FTC Consumer Sentinel',
        confidence: complaint.verifiedCount ? Math.min(complaint.verifiedCount * 10, 100) : 50,
        reportedDate: new Date(complaint.dateReceived || Date.now())
      }));
  }

  private parseRoboKillerData(data: any): ScamReport[] {
    if (!data.results || !Array.isArray(data.results)) return [];
    
    return data.results
      .filter((result: any) => result.phone && result.spamScore > 70)
      .map((result: any) => ({
        phone: this.normalizePhoneNumber(result.phone),
        name: result.name || 'Unknown Scammer',
        scamType: this.categorizeScamType(result.category || 'general'),
        source: 'RoboKiller',
        confidence: result.spamScore,
        reportedDate: new Date(result.lastReported || Date.now())
      }));
  }

  private parseTrueCallerData(data: any): ScamReport[] {
    if (!data.data || !Array.isArray(data.data)) return [];
    
    return data.data
      .filter((entry: any) => entry.phones && entry.spamInfo)
      .flatMap((entry: any) => 
        entry.phones.map((phone: any) => ({
          phone: this.normalizePhoneNumber(phone.e164Format),
          name: entry.name || 'Unknown',
          scamType: this.categorizeScamType(entry.spamInfo.spamType),
          source: 'TrueCaller',
          confidence: entry.spamInfo.spamScore,
          reportedDate: new Date()
        }))
      );
  }

  private parseShouldIAnswerData(data: any): ScamReport[] {
    if (!data.numbers || !Array.isArray(data.numbers)) return [];
    
    return data.numbers
      .filter((number: any) => number.rating && number.rating < 3) // Low ratings indicate spam
      .map((number: any) => ({
        phone: this.normalizePhoneNumber(number.number),
        name: number.name || 'Unknown',
        scamType: this.categorizeScamType(number.category || 'telemarketing'),
        source: 'Should I Answer',
        confidence: (5 - number.rating) * 20, // Convert 1-5 rating to confidence score
        reportedDate: new Date(number.lastUpdate || Date.now())
      }));
  }

  private parseScammerInfoData(data: any): ScamReport[] {
    if (!data.scamNumbers || !Array.isArray(data.scamNumbers)) return [];
    
    return data.scamNumbers.map((scam: any) => ({
      phone: this.normalizePhoneNumber(scam.phoneNumber),
      name: scam.scammerName || 'Unknown Scammer',
      scamType: this.categorizeScamType(scam.scamType),
      source: 'Scammer.info Community',
      confidence: scam.reportCount ? Math.min(scam.reportCount * 5, 100) : 75,
      reportedDate: new Date(scam.dateReported || Date.now())
    }));
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Add +1 prefix for US numbers if not present
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    return `+${digits}`;
  }

  private categorizeScamType(rawType: string): string {
    const type = rawType.toLowerCase();
    
    if (type.includes('tech') || type.includes('computer') || type.includes('microsoft')) {
      return 'tech-support';
    } else if (type.includes('irs') || type.includes('tax') || type.includes('government')) {
      return 'irs-scam';
    } else if (type.includes('bank') || type.includes('credit') || type.includes('loan')) {
      return 'financial';
    } else if (type.includes('insurance') || type.includes('health')) {
      return 'insurance';
    } else if (type.includes('charity') || type.includes('donation')) {
      return 'charity-fraud';
    } else if (type.includes('romance') || type.includes('dating')) {
      return 'romance-scam';
    } else if (type.includes('social security') || type.includes('ssn')) {
      return 'social-security';
    } else if (type.includes('medicare') || type.includes('medical')) {
      return 'medicare-scam';
    } else {
      return 'general-scam';
    }
  }

  private deduplicateReports(reports: ScamReport[]): ScamReport[] {
    const phoneMap = new Map<string, ScamReport>();
    
    for (const report of reports) {
      const existing = phoneMap.get(report.phone);
      
      if (!existing || report.confidence > existing.confidence) {
        phoneMap.set(report.phone, report);
      }
    }
    
    return Array.from(phoneMap.values());
  }

  async updateLocalDatabase(): Promise<void> {
    try {
      console.log('Starting scam database update...');
      const reports = await this.fetchScamNumbers();
      
      console.log(`Processing ${reports.length} scam reports...`);
      
      // Store in database for future reference
      for (const report of reports) {
        await storage.createScamReport({
          phoneNumber: report.phone,
          scammerName: report.name || 'Unknown',
          scamType: report.scamType,
          source: report.source,
          confidence: report.confidence,
          reportedDate: report.reportedDate,
          verified: report.confidence > 80
        });
      }
      
      console.log(`Successfully updated database with ${reports.length} scam numbers`);
    } catch (error) {
      console.error('Failed to update scam database:', error);
      throw error;
    }
  }

  async getHighConfidenceScamNumbers(limit: number = 100): Promise<ScamReport[]> {
    const reports = await storage.getScamReports({
      minConfidence: 75,
      limit
    });
    
    return reports.map(report => ({
      phone: report.phoneNumber,
      name: report.scammerName,
      scamType: report.scamType,
      source: report.source,
      confidence: report.confidence,
      reportedDate: report.reportedDate
    }));
  }

  async scheduleRegularUpdates(): Promise<void> {
    // Update database every 6 hours
    setInterval(async () => {
      try {
        await this.updateLocalDatabase();
      } catch (error) {
        console.error('Scheduled update failed:', error);
      }
    }, 6 * 60 * 60 * 1000);
    
    console.log('Scheduled regular scam database updates every 6 hours');
  }
}

export const scamDatabaseManager = new ScamDatabaseManager();