import fetch from 'node-fetch';
import nacl from 'tweetnacl';

interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordField[];
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
  thumbnail?: {
    url: string;
  };
  author?: {
    name: string;
    icon_url?: string;
  };
}

interface DiscordField {
  name: string;
  value: string;
  inline?: boolean;
}

class DiscordService {
  private webhookUrl: string | null = null;

  constructor() {
    // Discord webhook URL should be provided by user
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || null;
  }

  verifyDiscordRequest(signature: string, timestamp: string, body: string): boolean {
    const publicKey = process.env.DISCORD_PUB_KEY;
    if (!publicKey) {
      console.error('DISCORD_PUB_KEY not configured');
      return false;
    }

    try {
      const timestampAndBody = timestamp + body;
      const message = new TextEncoder().encode(timestampAndBody);
      const sig = new Uint8Array(Buffer.from(signature, 'hex'));
      const key = new Uint8Array(Buffer.from(publicKey, 'hex'));
      
      return nacl.sign.detached.verify(message, sig, key);
    } catch (error) {
      console.error('Discord signature verification failed:', error);
      return false;
    }
  }

  private getWebhookUrl(): string | null {
    return this.webhookUrl;
  }

  async sendMessage(message: DiscordMessage): Promise<boolean> {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      console.log('Discord webhook URL not configured');
      return false;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error('Discord webhook failed:', response.status, response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending Discord message:', error);
      return false;
    }
  }

  async postScamCallAlert(callData: {
    scammerNumber: string;
    scamType: string;
    duration: number;
    personaName: string;
    confidence: string;
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '🚨 New Scam Call Detected',
      description: `PackieAI successfully engaged with a scammer for ${Math.round(callData.duration / 60)} minutes`,
      color: 0xff4444, // Red
      fields: [
        {
          name: '📞 Scammer Number',
          value: callData.scammerNumber,
          inline: true,
        },
        {
          name: '🎭 Scam Type',
          value: callData.scamType,
          inline: true,
        },
        {
          name: '🤖 AI Persona',
          value: callData.personaName,
          inline: true,
        },
        {
          name: '⏱️ Call Duration',
          value: `${Math.round(callData.duration / 60)} minutes`,
          inline: true,
        },
        {
          name: '🎯 Confidence',
          value: callData.confidence,
          inline: true,
        },
      ],
      footer: {
        text: 'PackieAI Anti-Scam System',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendMessage({
      embeds: [embed],
      username: 'PackieAI',
    });
  }

  async postFraudAlert(alertData: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    originalUrl: string;
  }): Promise<boolean> {
    const severityColors = {
      low: 0x00ff00,     // Green
      medium: 0xffaa00,  // Orange
      high: 0xff4444,    // Red
      critical: 0x8b0000, // Dark Red
    };

    const severityEmojis = {
      low: '🟢',
      medium: '🟡', 
      high: '🔴',
      critical: '🚨',
    };

    const embed: DiscordEmbed = {
      title: `${severityEmojis[alertData.severity]} Fraud Alert: ${alertData.severity.toUpperCase()}`,
      description: alertData.description,
      color: severityColors[alertData.severity],
      fields: [
        {
          name: '📰 Source',
          value: alertData.source,
          inline: true,
        },
        {
          name: '🔗 Read More',
          value: `[View Original Article](${alertData.originalUrl})`,
          inline: true,
        },
      ],
      footer: {
        text: 'PackieAI Fraud Detection',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendMessage({
      embeds: [embed],
      username: 'PackieAI',
    });
  }

  async postSystemUpdate(updateData: {
    title: string;
    description: string;
    type: 'info' | 'success' | 'warning' | 'error';
    details?: string[];
  }): Promise<boolean> {
    const typeColors = {
      info: 0x0099ff,      // Blue
      success: 0x00ff00,   // Green
      warning: 0xffaa00,   // Orange
      error: 0xff4444,     // Red
    };

    const typeEmojis = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };

    const embed: DiscordEmbed = {
      title: `${typeEmojis[updateData.type]} ${updateData.title}`,
      description: updateData.description,
      color: typeColors[updateData.type],
      footer: {
        text: 'PackieAI System',
      },
      timestamp: new Date().toISOString(),
    };

    if (updateData.details && updateData.details.length > 0) {
      embed.fields = updateData.details.map((detail, index) => ({
        name: `Detail ${index + 1}`,
        value: detail,
        inline: false,
      }));
    }

    return this.sendMessage({
      embeds: [embed],
      username: 'PackieAI',
    });
  }

  async postWeeklySummary(summaryData: {
    totalCalls: number;
    totalTimeWasted: number;
    topScamTypes: Array<{ type: string; count: number }>;
    weeklyStats: {
      callsThisWeek: number;
      avgCallDuration: number;
      fraudAlertsShared: number;
    };
  }): Promise<boolean> {
    const embed: DiscordEmbed = {
      title: '📊 Weekly Anti-Scam Summary',
      description: `PackieAI's performance for the past week`,
      color: 0x00aa00, // Green
      fields: [
        {
          name: '📞 Total Calls Handled',
          value: summaryData.totalCalls.toString(),
          inline: true,
        },
        {
          name: '⏰ Time Wasted (Scammers)',
          value: `${Math.round(summaryData.totalTimeWasted / 60)} hours`,
          inline: true,
        },
        {
          name: '📈 Calls This Week',
          value: summaryData.weeklyStats.callsThisWeek.toString(),
          inline: true,
        },
        {
          name: '📊 Avg Call Duration',
          value: `${Math.round(summaryData.weeklyStats.avgCallDuration / 60)} minutes`,
          inline: true,
        },
        {
          name: '🚨 Fraud Alerts Shared',
          value: summaryData.weeklyStats.fraudAlertsShared.toString(),
          inline: true,
        },
        {
          name: '🎯 Top Scam Types',
          value: summaryData.topScamTypes
            .slice(0, 3)
            .map((scam, i) => `${i + 1}. ${scam.type} (${scam.count})`)
            .join('\n') || 'No data available',
          inline: false,
        },
      ],
      footer: {
        text: 'PackieAI Weekly Report',
      },
      timestamp: new Date().toISOString(),
    };

    return this.sendMessage({
      embeds: [embed],
      username: 'PackieAI',
    });
  }

  async testConnection(): Promise<boolean> {
    return this.postSystemUpdate({
      title: 'Discord Integration Test',
      description: 'Testing Discord webhook connection from PackieAI',
      type: 'info',
      details: ['This is a test message to verify Discord integration is working properly.'],
    });
  }
}

export const discordService = new DiscordService();