import { storage } from "./storage";

interface ScamAnalytics {
  phoneNumber: string;
  scamType: string;
  callId: number;
  carrierInfo: string;
  geoLocation: {
    city: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
  };
  numberPool: string[];
  confidence: number;
  reportCount: number;
  detectedAt: Date;
  conversationLength: number;
  scammerEngagement: number;
  tactics: string[];
  victimProfile: string;
}

interface NumberPoolAnalysis {
  basePattern: string;
  relatedNumbers: string[];
  scamType: string;
  confidence: number;
  firstSeen: Date;
  lastActive: Date;
  totalCalls: number;
}

class ScamAnalyticsEngine {
  private activeAnalysis = new Map<string, any>();

  async analyzeCall(callId: number, phoneNumber: string, scamType: string): Promise<ScamAnalytics> {
    console.log(`Starting analytics for call ${callId} to ${phoneNumber}`);

    const analytics: ScamAnalytics = {
      phoneNumber,
      scamType,
      callId,
      carrierInfo: await this.getCarrierInfo(phoneNumber),
      geoLocation: await this.getGeoLocation(phoneNumber),
      numberPool: await this.detectNumberPool(phoneNumber, scamType),
      confidence: 0,
      reportCount: await this.getReportCount(phoneNumber),
      detectedAt: new Date(),
      conversationLength: 0,
      scammerEngagement: 0,
      tactics: [],
      victimProfile: 'elderly_targeting'
    };

    // Store in active analysis for real-time updates
    this.activeAnalysis.set(phoneNumber, analytics);

    return analytics;
  }

  async updateCallAnalytics(
    phoneNumber: string, 
    transcript: string, 
    duration: number, 
    outcome: string
  ): Promise<void> {
    const analytics = this.activeAnalysis.get(phoneNumber);
    if (!analytics) return;

    // Analyze conversation content
    analytics.conversationLength = duration;
    analytics.scammerEngagement = this.calculateEngagementScore(transcript, duration);
    analytics.tactics = this.extractScamTactics(transcript);
    analytics.confidence = this.calculateConfidenceScore(transcript, outcome);

    // Update database
    await storage.updateScamAnalytics(analytics.callId, analytics);

    // Remove from active analysis
    this.activeAnalysis.delete(phoneNumber);

    console.log(`Analytics updated for ${phoneNumber}: ${analytics.scammerEngagement}/10 engagement`);
  }

  private async getCarrierInfo(phoneNumber: string): Promise<string> {
    // In production, use carrier lookup API
    const areaCode = phoneNumber.substring(2, 5);
    
    // Common VOIP/scammer carriers by area code patterns
    const voipPatterns = ['800', '888', '877', '866', '855', '844', '833', '822'];
    if (voipPatterns.includes(areaCode)) {
      return 'VOIP Provider';
    }

    const carriers = ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Regional Carrier'];
    return carriers[Math.floor(Math.random() * carriers.length)];
  }

  private async getGeoLocation(phoneNumber: string): Promise<any> {
    const areaCode = phoneNumber.substring(2, 5);
    
    // Real area code to location mapping
    const locationMap: { [key: string]: any } = {
      '212': { city: 'New York', state: 'NY', country: 'US', lat: 40.7128, lng: -74.0060 },
      '213': { city: 'Los Angeles', state: 'CA', country: 'US', lat: 34.0522, lng: -118.2437 },
      '305': { city: 'Miami', state: 'FL', country: 'US', lat: 25.7617, lng: -80.1918 },
      '312': { city: 'Chicago', state: 'IL', country: 'US', lat: 41.8781, lng: -87.6298 },
      '404': { city: 'Atlanta', state: 'GA', country: 'US', lat: 33.7490, lng: -84.3880 },
      '415': { city: 'San Francisco', state: 'CA', country: 'US', lat: 37.7749, lng: -122.4194 },
      '469': { city: 'Dallas', state: 'TX', country: 'US', lat: 32.7767, lng: -96.7970 },
      '702': { city: 'Las Vegas', state: 'NV', country: 'US', lat: 36.1699, lng: -115.1398 },
      '786': { city: 'Miami', state: 'FL', country: 'US', lat: 25.7617, lng: -80.1918 },
      '917': { city: 'New York', state: 'NY', country: 'US', lat: 40.7128, lng: -74.0060 }
    };

    return locationMap[areaCode] || { 
      city: 'Unknown', 
      state: 'Unknown', 
      country: 'US', 
      lat: 0, 
      lng: 0 
    };
  }

  private async detectNumberPool(phoneNumber: string, scamType: string): Promise<string[]> {
    // Look for sequential or pattern-based numbers
    const baseNumber = phoneNumber.substring(0, 8); // +1234567
    const lastFour = phoneNumber.substring(8);
    
    const relatedNumbers: string[] = [];
    
    // Check for sequential numbers
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      const newLastFour = String(parseInt(lastFour) + i).padStart(4, '0');
      if (newLastFour.length === 4) {
        relatedNumbers.push(baseNumber + newLastFour);
      }
    }

    // Check existing database for similar patterns
    const existingCalls = await storage.getCallsByPattern(baseNumber, scamType);
    relatedNumbers.push(...existingCalls.map(call => call.scammerNumber));

    return [...new Set(relatedNumbers)].slice(0, 20); // Limit to 20 related numbers
  }

  private async getReportCount(phoneNumber: string): Promise<number> {
    // Check how many times this number has been reported
    const reports = await storage.getScamReportsByNumber(phoneNumber);
    return reports.length;
  }

  private calculateEngagementScore(transcript: string, duration: number): number {
    // Score based on conversation length and content
    let score = Math.min(duration / 300, 5); // 5 minutes = 5 points max
    
    // Check for engagement indicators
    const engagementWords = [
      'yes', 'okay', 'sure', 'help', 'understand', 'continue',
      'payment', 'money', 'card', 'account', 'verify'
    ];
    
    const wordCount = engagementWords.filter(word => 
      transcript.toLowerCase().includes(word)
    ).length;
    
    score += Math.min(wordCount * 0.5, 5); // Max 5 points for keywords
    
    return Math.min(Math.round(score), 10);
  }

  private extractScamTactics(transcript: string): string[] {
    const tactics: string[] = [];
    const tacticPatterns = {
      'urgency': ['urgent', 'immediately', 'expire', 'today only', 'limited time'],
      'authority': ['government', 'irs', 'police', 'fbi', 'microsoft', 'amazon'],
      'fear': ['arrest', 'lawsuit', 'suspend', 'block', 'close account'],
      'greed': ['prize', 'winner', 'money', 'refund', 'compensation'],
      'sympathy': ['grandson', 'family', 'emergency', 'hospital', 'accident'],
      'tech_support': ['computer', 'virus', 'error', 'fix', 'remote access']
    };

    for (const [tactic, keywords] of Object.entries(tacticPatterns)) {
      if (keywords.some(keyword => transcript.toLowerCase().includes(keyword))) {
        tactics.push(tactic);
      }
    }

    return tactics;
  }

  private calculateConfidenceScore(transcript: string, outcome: string): number {
    let confidence = 50; // Base confidence
    
    // Increase confidence based on outcome
    switch (outcome) {
      case 'successful_waste':
        confidence += 30;
        break;
      case 'exposed_scam':
        confidence += 40;
        break;
      case 'scammer_hangup':
        confidence += 20;
        break;
      case 'technical_issues':
        confidence -= 10;
        break;
    }

    // Increase confidence based on transcript quality
    if (transcript.length > 500) confidence += 10;
    if (transcript.includes('scam') || transcript.includes('fraud')) confidence += 15;

    return Math.min(Math.max(confidence, 0), 100);
  }

  async generateNumberPoolReport(): Promise<NumberPoolAnalysis[]> {
    const pools = await storage.getNumberPoolAnalysis();
    
    return pools.map(pool => ({
      basePattern: pool.pattern,
      relatedNumbers: pool.numbers,
      scamType: pool.scamType,
      confidence: pool.confidence,
      firstSeen: pool.firstSeen,
      lastActive: pool.lastActive,
      totalCalls: pool.callCount
    }));
  }

  async generateScamTrendsReport(): Promise<any> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const trends = await storage.getScamTrends(last30Days);
    
    return {
      totalCalls: trends.totalCalls,
      topScamTypes: trends.scamTypes,
      topLocations: trends.locations,
      averageCallDuration: trends.averageDuration,
      successfulWastes: trends.successfulWastes,
      exposedScams: trends.exposedScams,
      generatedAt: new Date()
    };
  }

  async getActiveAnalytics(): Promise<any[]> {
    return Array.from(this.activeAnalysis.values());
  }
}

export const scamAnalyticsEngine = new ScamAnalyticsEngine();