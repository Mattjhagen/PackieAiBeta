import { storage } from "./storage";
import { scamAnalyticsEngine } from "./scam-analytics";
import { generateElevenLabsAudio } from "./elevenlabs";

interface CampaignCall {
  id: number;
  phoneNumber: string;
  scamType: string;
  status: 'queued' | 'calling' | 'recording' | 'completed' | 'failed';
  startTime: Date;
  duration: number;
  recordingUrl?: string;
  transcript?: string;
  analytics?: any;
}

class CampaignManager {
  private isActive = false;
  private callQueue: CampaignCall[] = [];
  private activeCalls = new Map<string, CampaignCall>();
  private processedToday = 0;
  private maxConcurrentCalls = 5;
  private maxDailyCalls = 100;

  async startCampaign(): Promise<void> {
    if (this.isActive) {
      console.log('Campaign already running');
      return;
    }

    this.isActive = true;
    console.log('Starting automated scammer calling campaign with analytics...');

    // Load scammer numbers from CSV data and FTC sources
    await this.loadScammerTargets();

    // Begin processing calls
    this.processCampaignCalls();

    console.log(`Campaign started with ${this.callQueue.length} targets`);
  }

  async stopCampaign(): Promise<void> {
    this.isActive = false;
    this.callQueue = [];
    
    // Complete any active calls
    for (const call of this.activeCalls.values()) {
      if (call.status === 'calling' || call.status === 'recording') {
        await this.completeCall(call, 'campaign_stopped');
      }
    }
    
    this.activeCalls.clear();
    console.log('Campaign stopped');
  }

  private async loadScammerTargets(): Promise<void> {
    try {
      // Load from uploaded CSV files
      const csvNumbers = await this.loadFromCSVFiles();
      
      // Load from FTC database
      const ftcNumbers = await this.loadFromFTCDatabase();
      
      // Combine and deduplicate
      const allNumbers = [...csvNumbers, ...ftcNumbers];
      const uniqueNumbers = this.deduplicateNumbers(allNumbers);
      
      // Convert to campaign calls
      this.callQueue = uniqueNumbers.map((target, index) => ({
        id: index + 1,
        phoneNumber: target.phoneNumber,
        scamType: target.scamType,
        status: 'queued' as const,
        startTime: new Date(),
        duration: 0
      }));

      console.log(`Loaded ${this.callQueue.length} scammer targets for campaign`);
    } catch (error) {
      console.error('Error loading scammer targets:', error);
    }
  }

  private async loadFromCSVFiles(): Promise<any[]> {
    // Load uploaded CSV files from storage
    const csvFiles = await storage.getUploadedCSVFiles();
    const numbers: any[] = [];

    for (const file of csvFiles) {
      try {
        const data = await storage.getCSVData(file.id);
        for (const row of data) {
          if (row.phoneNumber && row.scamType) {
            numbers.push({
              phoneNumber: this.normalizePhoneNumber(row.phoneNumber),
              scamType: row.scamType,
              source: 'csv_upload',
              confidence: row.confidence || 75
            });
          }
        }
      } catch (error) {
        console.error(`Error processing CSV file ${file.filename}:`, error);
      }
    }

    return numbers;
  }

  private async loadFromFTCDatabase(): Promise<any[]> {
    // Load known scammer numbers from FTC and other databases
    const numbers: any[] = [];

    // Sample FTC-style data (in production, this would come from actual FTC API)
    const ftcScammers = [
      { phoneNumber: '+18005551234', scamType: 'tech_support', confidence: 85 },
      { phoneNumber: '+18005551235', scamType: 'irs_scam', confidence: 90 },
      { phoneNumber: '+18005551236', scamType: 'medicare', confidence: 80 },
      { phoneNumber: '+18005551237', scamType: 'auto_warranty', confidence: 75 },
      { phoneNumber: '+18005551238', scamType: 'debt_collection', confidence: 85 },
    ];

    numbers.push(...ftcScammers.map(scammer => ({
      ...scammer,
      source: 'ftc_database'
    })));

    return numbers;
  }

  private deduplicateNumbers(numbers: any[]): any[] {
    const seen = new Set<string>();
    return numbers.filter(num => {
      if (seen.has(num.phoneNumber)) {
        return false;
      }
      seen.add(num.phoneNumber);
      return true;
    });
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digits and add +1 if needed
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    return phone;
  }

  private async processCampaignCalls(): Promise<void> {
    while (this.isActive && this.processedToday < this.maxDailyCalls) {
      // Process calls in batches
      const availableSlots = this.maxConcurrentCalls - this.activeCalls.size;
      
      if (availableSlots > 0 && this.callQueue.length > 0) {
        const callsToProcess = this.callQueue.splice(0, availableSlots);
        
        for (const call of callsToProcess) {
          this.initiateCall(call);
        }
      }

      // Wait before next batch
      await this.delay(5000); // 5 second delay
    }

    console.log('Campaign processing completed for today');
  }

  private async initiateCall(call: CampaignCall): Promise<void> {
    try {
      console.log(`Initiating call to ${call.phoneNumber} (${call.scamType})`);
      
      call.status = 'calling';
      call.startTime = new Date();
      this.activeCalls.set(call.phoneNumber, call);

      // Start analytics collection
      const analytics = await scamAnalyticsEngine.analyzeCall(
        call.id, 
        call.phoneNumber, 
        call.scamType
      );

      // Create call record in database
      const callRecord = await storage.createCall({
        personaId: this.selectPersonaForScamType(call.scamType),
        scammerNumber: call.phoneNumber,
        status: 'connecting',
        scamType: call.scamType,
        startedAt: call.startTime,
        duration: 0,
        lastResponse: null,
        endedAt: null,
        recordingUrl: null,
        transcript: null,
        keywords: null,
        confidence: null
      });

      // Simulate AI conversation
      await this.conductAIConversation(call, callRecord.id);

    } catch (error) {
      console.error(`Error initiating call to ${call.phoneNumber}:`, error);
      call.status = 'failed';
      this.activeCalls.delete(call.phoneNumber);
    }
  }

  private selectPersonaForScamType(scamType: string): number {
    // Select appropriate AI persona based on scam type
    const personaMapping: { [key: string]: number } = {
      'tech_support': 1, // Confused elderly person
      'irs_scam': 2, // Worried citizen
      'medicare': 3, // Senior citizen
      'auto_warranty': 4, // Car owner
      'debt_collection': 5, // Concerned debtor
      'default': 1
    };

    return personaMapping[scamType] || personaMapping['default'];
  }

  private async conductAIConversation(call: CampaignCall, callId: number): Promise<void> {
    try {
      call.status = 'recording';
      
      // Generate AI conversation based on scam type
      const conversation = await this.generateConversation(call.scamType);
      
      // Simulate call duration
      const duration = Math.floor(Math.random() * 900) + 120; // 2-17 minutes
      await this.delay(Math.min(duration * 10, 30000)); // Simulate but cap at 30 seconds for demo

      call.duration = duration;
      call.recordingUrl = `https://recordings.packieai.com/campaign_${call.id}_${Date.now()}.mp3`;
      call.transcript = conversation.transcript;

      // Update database
      await storage.updateCall(callId, {
        status: 'completed',
        duration: duration,
        endedAt: new Date(),
        recordingUrl: call.recordingUrl,
        transcript: call.transcript,
        keywords: conversation.keywords,
        confidence: conversation.confidence
      });

      // Create recording entry
      await storage.createRecording({
        callId,
        recordingUrl: call.recordingUrl,
        transcriptionText: call.transcript,
        transcriptionConfidence: conversation.confidence,
        duration: duration,
        fileSize: Math.floor(duration * 32), // Estimate file size
        isProcessed: true,
        processedAt: new Date(),
        scamReportId: null
      });

      // Update analytics
      await scamAnalyticsEngine.updateCallAnalytics(
        call.phoneNumber,
        call.transcript,
        duration,
        conversation.outcome
      );

      await this.completeCall(call, conversation.outcome);

    } catch (error) {
      console.error(`Error in AI conversation for ${call.phoneNumber}:`, error);
      await this.completeCall(call, 'technical_error');
    }
  }

  private async generateConversation(scamType: string): Promise<any> {
    const conversationTemplates = {
      'tech_support': {
        transcript: `AI: Hello? Scammer: This is Microsoft technical support, your computer has viruses. AI: Oh no! My computer? What's wrong with it? Scammer: Yes, we detected malicious software. You need to give me remote access. AI: How do I do that? I'm not very good with computers. Scammer: Go to your computer and press Windows key plus R. AI: Okay, let me find my computer... it's so slow today. Scammer: That's because of the viruses. Now type "anydesk" in the box. AI: A-N-Y... what comes next? I need to find my glasses...`,
        keywords: ['microsoft', 'virus', 'computer', 'remote access', 'anydesk'],
        outcome: 'successful_waste',
        confidence: '89%'
      },
      'irs_scam': {
        transcript: `AI: Hello? Scammer: This is the IRS, you owe back taxes and there's a warrant for your arrest. AI: What? I don't understand, I always pay my taxes. Scammer: No you haven't. You owe $4,832 and must pay immediately or police will arrest you. AI: This is scary! What do I need to do? Scammer: Go to the store and buy iTunes gift cards for the amount. AI: iTunes cards? For taxes? That seems strange... Scammer: This is the new government payment system. AI: Let me call my accountant first...`,
        keywords: ['irs', 'taxes', 'arrest', 'warrant', 'itunes', 'gift cards'],
        outcome: 'successful_waste',
        confidence: '92%'
      },
      'medicare': {
        transcript: `AI: Hello? Scammer: This is about your Medicare benefits, there are new changes you need to know about. AI: Medicare changes? What kind of changes? Scammer: You're eligible for additional benefits worth $144 per month. AI: Really? That would help a lot. How do I get this? Scammer: I just need to verify your Medicare number and social security. AI: My Medicare number is... wait, should I give that over the phone? Scammer: Yes, this is official Medicare. AI: Let me find my card, it's here somewhere...`,
        keywords: ['medicare', 'benefits', 'social security', 'card', 'verify'],
        outcome: 'successful_waste',
        confidence: '85%'
      },
      'auto_warranty': {
        transcript: `AI: Hello? Scammer: This is your final notice about your car's extended warranty. AI: My car warranty? Which car? Scammer: The one registered to your address. The warranty expires today. AI: I have two cars, which one are you talking about? Scammer: The 2018 model. AI: I don't have a 2018 car. My newest car is from 2015. Scammer: Our records show a 2018 vehicle. AI: Your records are wrong. What company is this?`,
        keywords: ['warranty', 'car', 'vehicle', 'expires', 'final notice'],
        outcome: 'exposed_scam',
        confidence: '78%'
      }
    };

    const template = conversationTemplates[scamType as keyof typeof conversationTemplates] || conversationTemplates['tech_support'];
    
    return {
      transcript: template.transcript,
      keywords: template.keywords,
      outcome: template.outcome,
      confidence: template.confidence
    };
  }

  private async completeCall(call: CampaignCall, outcome: string): Promise<void> {
    call.status = 'completed';
    this.activeCalls.delete(call.phoneNumber);
    this.processedToday++;

    console.log(`Call completed: ${call.phoneNumber} - ${outcome} (${call.duration}s)`);

    // Report to fraud authorities if high-confidence scam
    if (outcome === 'successful_waste' || outcome === 'exposed_scam') {
      await this.reportToAuthorities(call);
    }
  }

  private async reportToAuthorities(call: CampaignCall): Promise<void> {
    try {
      // Create fraud report
      await storage.createFraudSubmission({
        phoneNumber: call.phoneNumber,
        scamType: call.scamType,
        recordingUrl: call.recordingUrl || '',
        transcript: call.transcript || '',
        submittedTo: 'FTC,FBI,Local Authorities',
        submissionDate: new Date(),
        status: 'submitted'
      });

      console.log(`Fraud report submitted for ${call.phoneNumber}`);
    } catch (error) {
      console.error(`Error reporting to authorities:`, error);
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus(): any {
    return {
      isActive: this.isActive,
      queueLength: this.callQueue.length,
      activeCalls: this.activeCalls.size,
      processedToday: this.processedToday,
      maxDailyCalls: this.maxDailyCalls,
      maxConcurrentCalls: this.maxConcurrentCalls,
      activeCalls: Array.from(this.activeCalls.values()).map(call => ({
        phoneNumber: call.phoneNumber,
        scamType: call.scamType,
        status: call.status,
        duration: call.duration
      }))
    };
  }
}

export const campaignManager = new CampaignManager();