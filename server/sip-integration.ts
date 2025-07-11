import { storage } from './storage';

interface SIPConfiguration {
  domain: string;
  username: string;
  password: string;
  authToken: string;
  accountSid: string;
  sipTrunkSid?: string;
}

interface SIPCall {
  callSid: string;
  from: string;
  to: string;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed';
  direction: 'inbound' | 'outbound';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  recordingUrl?: string;
}

class SIPIntegration {
  private config: SIPConfiguration | null = null;
  private activeCalls = new Map<string, SIPCall>();

  constructor() {
    this.loadConfiguration();
  }

  private loadConfiguration() {
    if (process.env.TWILIO_SIP_DOMAIN && 
        process.env.TWILIO_SIP_USERNAME && 
        process.env.TWILIO_SIP_PASSWORD &&
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN) {
      
      this.config = {
        domain: process.env.TWILIO_SIP_DOMAIN,
        username: process.env.TWILIO_SIP_USERNAME,
        password: process.env.TWILIO_SIP_PASSWORD,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        sipTrunkSid: process.env.TWILIO_SIP_TRUNK_SID
      };
      
      console.log('SIP integration configured successfully');
    } else {
      console.log('SIP credentials not configured - using standard Twilio');
    }
  }

  async createSIPTrunk(friendlyName: string = 'PackieAI-SIP'): Promise<any> {
    if (!this.config) {
      throw new Error('SIP configuration not available');
    }

    const twilio = require('twilio')(this.config.accountSid, this.config.authToken);
    
    try {
      const trunk = await twilio.trunking.v1.trunks.create({
        friendlyName,
        domainName: this.config.domain
      });

      console.log(`SIP Trunk created: ${trunk.sid}`);
      return trunk;
    } catch (error) {
      console.error('Failed to create SIP trunk:', error);
      throw error;
    }
  }

  async initiateSIPCall(toNumber: string, fromNumber: string, twimlUrl?: string): Promise<SIPCall> {
    if (!this.config) {
      throw new Error('SIP configuration not available');
    }

    const twilio = require('twilio')(this.config.accountSid, this.config.authToken);
    
    try {
      const call = await twilio.calls.create({
        to: toNumber,
        from: fromNumber,
        url: twimlUrl || `${process.env.BASE_URL || 'https://your-domain.replit.app'}/api/twiml/scammer-response`,
        record: true,
        recordingChannels: 'dual',
        recordingStatusCallback: `${process.env.BASE_URL || 'https://your-domain.replit.app'}/api/webhooks/recording-status`,
        statusCallback: `${process.env.BASE_URL || 'https://your-domain.replit.app'}/api/webhooks/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        timeout: 30
      });

      const sipCall: SIPCall = {
        callSid: call.sid,
        from: fromNumber,
        to: toNumber,
        status: 'initiated',
        direction: 'outbound',
        startTime: new Date()
      };

      this.activeCalls.set(call.sid, sipCall);
      
      console.log(`SIP call initiated: ${call.sid} to ${toNumber}`);
      return sipCall;
    } catch (error) {
      console.error('Failed to initiate SIP call:', error);
      throw error;
    }
  }

  async updateCallStatus(callSid: string, status: string, additionalData?: any): Promise<void> {
    const call = this.activeCalls.get(callSid);
    if (!call) return;

    call.status = status as any;
    
    if (status === 'completed' && additionalData?.duration) {
      call.duration = parseInt(additionalData.duration);
      call.endTime = new Date();
    }

    if (additionalData?.recordingUrl) {
      call.recordingUrl = additionalData.recordingUrl;
    }

    this.activeCalls.set(callSid, call);

    // Save to database
    try {
      await storage.createCall({
        callSid,
        callerNumber: call.from,
        calleeNumber: call.to,
        status: call.status,
        duration: call.duration || 0,
        recordingUrl: call.recordingUrl || '',
        aiPersona: 'PackieAI-SIP',
        scamType: 'proactive-call',
        startTime: call.startTime || new Date(),
        endTime: call.endTime
      });
    } catch (error) {
      console.error('Failed to save SIP call to database:', error);
    }
  }

  async bulkCall(phoneNumbers: string[], fromNumber: string): Promise<SIPCall[]> {
    if (!this.config) {
      throw new Error('SIP configuration not available');
    }

    const calls: SIPCall[] = [];
    const delay = 2000; // 2 second delay between calls

    for (const phoneNumber of phoneNumbers) {
      try {
        const call = await this.initiateSIPCall(phoneNumber, fromNumber);
        calls.push(call);
        
        console.log(`Bulk SIP call initiated to ${phoneNumber}`);
        
        // Delay to avoid rate limiting
        if (phoneNumbers.indexOf(phoneNumber) < phoneNumbers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Failed to call ${phoneNumber}:`, error);
      }
    }

    return calls;
  }

  getActiveCalls(): SIPCall[] {
    return Array.from(this.activeCalls.values());
  }

  getCallStatus(callSid: string): SIPCall | undefined {
    return this.activeCalls.get(callSid);
  }

  async testSIPConnection(): Promise<boolean> {
    if (!this.config) {
      console.log('SIP not configured');
      return false;
    }

    const twilio = require('twilio')(this.config.accountSid, this.config.authToken);
    
    try {
      await twilio.api.accounts(this.config.accountSid).fetch();
      console.log('SIP connection test successful');
      return true;
    } catch (error) {
      console.error('SIP connection test failed:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getConfiguration(): Partial<SIPConfiguration> | null {
    if (!this.config) return null;
    
    // Return safe configuration without sensitive data
    return {
      domain: this.config.domain,
      username: this.config.username,
      accountSid: this.config.accountSid,
      sipTrunkSid: this.config.sipTrunkSid
    };
  }
}

export const sipIntegration = new SIPIntegration();