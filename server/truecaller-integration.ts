import fetch from 'node-fetch';
import { storage } from './storage';

interface TruecallerResponse {
  data: Array<{
    id: string;
    name: string;
    phoneNumbers: Array<{
      e164Format: string;
      numberType: string;
      carrier: string;
      countryCode: string;
    }>;
    addresses: Array<{
      city: string;
      countryCode: string;
    }>;
    tags: Array<{
      tag: string;
    }>;
    spamInfo: {
      spamType: string;
      spamScore: number;
      blocklistName: string[];
    };
    badges: Array<{
      type: string;
      verified: boolean;
    }>;
  }>;
}

interface TruecallerLookupResult {
  phoneNumber: string;
  name: string | null;
  location: string | null;
  carrier: string | null;
  isSpam: boolean;
  spamType: string | null;
  spamScore: number;
  tags: string[];
  verified: boolean;
  source: 'truecaller';
}

class TruecallerService {
  private apiKey: string | undefined;
  private baseUrl = 'https://search5-noneu.truecaller.com/v2/search';
  private webSearchUrl = 'https://www.truecaller.com/search';

  constructor() {
    this.apiKey = process.env.TRUECALLER_API_KEY;
  }

  async lookupNumber(phoneNumber: string): Promise<TruecallerLookupResult | null> {
    try {
      // Clean and format phone number
      const cleanNumber = this.normalizePhoneNumber(phoneNumber);
      
      if (this.apiKey) {
        return await this.apiLookup(cleanNumber);
      } else {
        return await this.webScrapeLookup(cleanNumber);
      }
    } catch (error) {
      console.error('Truecaller lookup failed:', error);
      return null;
    }
  }

  private async apiLookup(phoneNumber: string): Promise<TruecallerLookupResult | null> {
    if (!this.apiKey) {
      throw new Error('Truecaller API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}?q=${encodeURIComponent(phoneNumber)}&type=4&locAddr=&countryCode=`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'PackieAI-TruecallerIntegration/1.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Truecaller API responded with status: ${response.status}`);
      }

      const data: TruecallerResponse = await response.json();
      
      if (!data.data || data.data.length === 0) {
        return {
          phoneNumber,
          name: null,
          location: null,
          carrier: null,
          isSpam: false,
          spamType: null,
          spamScore: 0,
          tags: [],
          verified: false,
          source: 'truecaller'
        };
      }

      const result = data.data[0];
      return this.formatTruecallerResult(phoneNumber, result);
    } catch (error) {
      console.error('Truecaller API lookup failed:', error);
      throw error;
    }
  }

  private async webScrapeLookup(phoneNumber: string): Promise<TruecallerLookupResult | null> {
    try {
      // Web scraping approach for when API key is not available
      const searchUrl = `${this.webSearchUrl}?q=${encodeURIComponent(phoneNumber)}`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`Web scraping failed with status: ${response.status}`);
      }

      const html = await response.text();
      return this.parseWebResults(phoneNumber, html);
    } catch (error) {
      console.error('Truecaller web scraping failed:', error);
      return null;
    }
  }

  private parseWebResults(phoneNumber: string, html: string): TruecallerLookupResult {
    // Extract information from HTML using regex patterns
    const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const spamMatch = html.match(/spam|scam|telemarketer|robocall/i);
    const locationMatch = html.match(/location[^>]*>([^<]+)</i);
    const carrierMatch = html.match(/carrier[^>]*>([^<]+)</i);
    
    return {
      phoneNumber,
      name: nameMatch ? nameMatch[1].trim() : null,
      location: locationMatch ? locationMatch[1].trim() : null,
      carrier: carrierMatch ? carrierMatch[1].trim() : null,
      isSpam: !!spamMatch,
      spamType: spamMatch ? 'suspected_spam' : null,
      spamScore: spamMatch ? 0.7 : 0,
      tags: spamMatch ? ['spam', 'community_reported'] : [],
      verified: false,
      source: 'truecaller'
    };
  }

  private formatTruecallerResult(phoneNumber: string, data: any): TruecallerLookupResult {
    const isSpam = data.spamInfo && (
      data.spamInfo.spamScore > 0.5 || 
      data.spamInfo.blocklistName?.length > 0 ||
      data.tags?.some((tag: any) => tag.tag?.toLowerCase().includes('spam'))
    );

    return {
      phoneNumber,
      name: data.name || null,
      location: data.addresses?.[0] ? `${data.addresses[0].city}, ${data.addresses[0].countryCode}` : null,
      carrier: data.phoneNumbers?.[0]?.carrier || null,
      isSpam,
      spamType: data.spamInfo?.spamType || (isSpam ? 'community_reported' : null),
      spamScore: data.spamInfo?.spamScore || 0,
      tags: data.tags?.map((tag: any) => tag.tag) || [],
      verified: data.badges?.some((badge: any) => badge.verified) || false,
      source: 'truecaller'
    };
  }

  private normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if missing (assume US +1 for now)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    // Add + prefix for international format
    return '+' + cleaned;
  }

  async bulkLookup(phoneNumbers: string[]): Promise<TruecallerLookupResult[]> {
    const results: TruecallerLookupResult[] = [];
    
    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await this.lookupNumber(phoneNumber);
        if (result) {
          results.push(result);
        }
        
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to lookup ${phoneNumber}:`, error);
      }
    }
    
    return results;
  }

  async checkCallIncoming(phoneNumber: string): Promise<{
    shouldBlock: boolean;
    reason: string;
    confidence: number;
    details: TruecallerLookupResult | null;
  }> {
    try {
      const lookup = await this.lookupNumber(phoneNumber);
      
      if (!lookup) {
        return {
          shouldBlock: false,
          reason: 'No information available',
          confidence: 0,
          details: null
        };
      }

      if (lookup.isSpam) {
        return {
          shouldBlock: true,
          reason: `Reported as ${lookup.spamType} by Truecaller community`,
          confidence: lookup.spamScore,
          details: lookup
        };
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        'unknown',
        'private number',
        'telemarketer',
        'robocall',
        'survey'
      ];

      const isSuspicious = suspiciousPatterns.some(pattern => 
        lookup.name?.toLowerCase().includes(pattern) ||
        lookup.tags.some(tag => tag.toLowerCase().includes(pattern))
      );

      if (isSuspicious) {
        return {
          shouldBlock: true,
          reason: 'Suspicious caller patterns detected',
          confidence: 0.6,
          details: lookup
        };
      }

      return {
        shouldBlock: false,
        reason: lookup.verified ? 'Verified legitimate caller' : 'No spam indicators',
        confidence: lookup.verified ? 0.9 : 0.3,
        details: lookup
      };
    } catch (error) {
      console.error('Error checking incoming call:', error);
      return {
        shouldBlock: false,
        reason: 'Lookup service unavailable',
        confidence: 0,
        details: null
      };
    }
  }

  async updateLocalDatabase(): Promise<void> {
    try {
      // Get recent calls to check against Truecaller
      const recentCalls = await storage.getCalls();
      const uniqueNumbers = [...new Set(recentCalls.map(call => call.scammerNumber))];
      
      console.log(`Updating local database with ${uniqueNumbers.length} numbers from Truecaller...`);
      
      for (const phoneNumber of uniqueNumbers) {
        try {
          const lookup = await this.lookupNumber(phoneNumber);
          
          if (lookup && lookup.isSpam) {
            // Store in fraud database
            await storage.createFraudDatabaseEntry({
              phoneNumber: lookup.phoneNumber,
              scammerName: lookup.name,
              scamType: lookup.spamType || 'spam',
              source: 'truecaller',
              confidence: Math.round(lookup.spamScore * 100),
              reportedDate: new Date(),
              verified: lookup.verified
            });
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Failed to process ${phoneNumber}:`, error);
        }
      }
      
      console.log('Truecaller database update completed');
    } catch (error) {
      console.error('Failed to update local database from Truecaller:', error);
    }
  }

  async generateSpamReport(): Promise<{
    totalLookups: number;
    spamDetected: number;
    topSpamTypes: Array<{ type: string; count: number; }>;
    topLocations: Array<{ location: string; count: number; }>;
  }> {
    try {
      const fraudEntries = await storage.getFraudDatabaseEntries({
        minConfidence: 50,
        limit: 1000
      });
      
      const truecallerEntries = fraudEntries.filter(entry => entry.source === 'truecaller');
      
      const spamTypes = truecallerEntries.reduce((acc, entry) => {
        acc[entry.scamType] = (acc[entry.scamType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topSpamTypes = Object.entries(spamTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        totalLookups: truecallerEntries.length,
        spamDetected: truecallerEntries.filter(entry => entry.confidence > 70).length,
        topSpamTypes,
        topLocations: [] // Would need location data from Truecaller responses
      };
    } catch (error) {
      console.error('Failed to generate spam report:', error);
      return {
        totalLookups: 0,
        spamDetected: 0,
        topSpamTypes: [],
        topLocations: []
      };
    }
  }
}

export const truecallerService = new TruecallerService();