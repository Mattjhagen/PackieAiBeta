import { detectClickbait } from './facebook-monitor';
import { generateClickbaitResponse } from './facebook-monitor';
import { storage } from './storage';

interface MetaConfig {
  appId: string;
  appSecret: string;
  pageAccessToken: string;
  pageId: string;
}

interface WhatsAppMessage {
  from: string;
  text: string;
  timestamp: number;
  id: string;
}

interface ThreadsPost {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  media_type?: string;
  media_url?: string;
}

interface FacebookPost {
  id: string;
  message: string;
  created_time: string;
  from: {
    name: string;
    id: string;
  };
  permalink_url: string;
}

class MetaPlatformMonitor {
  private config: MetaConfig | null = null;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = this.getMetaConfig();
  }

  private getMetaConfig(): MetaConfig | null {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    if (!appId || !appSecret || !pageAccessToken || !pageId) {
      console.log('Meta platform credentials not found in environment variables');
      return null;
    }

    return {
      appId,
      appSecret,
      pageAccessToken,
      pageId
    };
  }

  async startMonitoring(): Promise<void> {
    if (!this.config) {
      throw new Error('Meta platform configuration not available');
    }

    if (this.isMonitoring) {
      console.log('Meta platform monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('🎯 Starting Meta platform monitoring...');

    // Monitor Facebook Pages every 10 minutes
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.monitorFacebookPosts();
        await this.monitorThreadsPosts();
      } catch (error) {
        console.error('Error in Meta platform monitoring cycle:', error);
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Initial check
    await this.monitorFacebookPosts();
    await this.monitorThreadsPosts();
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Meta platform monitoring stopped');
  }

  private async monitorFacebookPosts(): Promise<void> {
    if (!this.config) return;

    try {
      console.log('🔍 Checking Facebook posts for clickbait...');
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.pageId}/posts?access_token=${this.config.pageAccessToken}&limit=10&fields=id,message,created_time,from,permalink_url`
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Facebook API error: ${data.error.message}`);
      }

      for (const post of data.data || []) {
        await this.processFacebookPost(post);
      }

    } catch (error) {
      console.error('Error monitoring Facebook posts:', error);
    }
  }

  private async processFacebookPost(post: FacebookPost): Promise<void> {
    if (!post.message) return;

    try {
      const detection = detectClickbait(post.message);
      
      if (detection.isClickbait && detection.confidence > 0.7) {
        console.log(`🎣 Clickbait detected on Facebook: ${post.message.substring(0, 100)}...`);
        
        // Generate educational response
        const response = await generateClickbaitResponse(post.message, post.permalink_url);
        
        // Post educational comment
        await this.postFacebookComment(post.id, response);
        
        // Log to database
        await storage.createSocialAnalysis({
          url: post.permalink_url,
          platform: 'facebook',
          title: post.message.substring(0, 100),
          content: post.message,
          summary: `Clickbait detected with ${Math.round(detection.confidence * 100)}% confidence: ${detection.reasons.join(', ')}`
        });
      }
    } catch (error) {
      console.error('Error processing Facebook post:', error);
    }
  }

  private async postFacebookComment(postId: string, comment: string): Promise<void> {
    if (!this.config) return;

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: comment,
            access_token: this.config.pageAccessToken
          })
        }
      );

      if (response.ok) {
        console.log('✅ Educational comment posted to Facebook');
      } else {
        console.error('Failed to post Facebook comment:', await response.text());
      }
    } catch (error) {
      console.error('Error posting Facebook comment:', error);
    }
  }

  private async monitorThreadsPosts(): Promise<void> {
    if (!this.config) return;

    try {
      console.log('🧵 Checking Threads posts for clickbait...');
      
      // Threads API endpoint (may need adjustment based on final API)
      const response = await fetch(
        `https://graph.threads.net/v1.0/${this.config.pageId}/threads?access_token=${this.config.pageAccessToken}&limit=10&fields=id,text,timestamp,media_type,media_url`
      );

      if (!response.ok) {
        console.log('Threads API not available or configured');
        return;
      }

      const data = await response.json();
      
      for (const post of data.data || []) {
        await this.processThreadsPost(post);
      }

    } catch (error) {
      console.log('Threads monitoring not available:', error.message);
    }
  }

  private async processThreadsPost(post: ThreadsPost): Promise<void> {
    if (!post.text) return;

    try {
      const detection = detectClickbait(post.text);
      
      if (detection.isClickbait && detection.confidence > 0.7) {
        console.log(`🎣 Clickbait detected on Threads: ${post.text.substring(0, 100)}...`);
        
        // Generate educational response
        const response = await generateClickbaitResponse(post.text);
        
        // Reply to thread (implementation depends on Threads API)
        await this.replyToThread(post.id, response);
        
        // Log to database
        await storage.createSocialAnalysis({
          url: `https://threads.net/post/${post.id}`,
          platform: 'threads',
          title: post.text.substring(0, 100),
          content: post.text,
          summary: `Clickbait detected with ${Math.round(detection.confidence * 100)}% confidence: ${detection.reasons.join(', ')}`
        });
      }
    } catch (error) {
      console.error('Error processing Threads post:', error);
    }
  }

  private async replyToThread(threadId: string, reply: string): Promise<void> {
    if (!this.config) return;

    try {
      // Threads reply API (implementation depends on final API structure)
      const response = await fetch(
        `https://graph.threads.net/v1.0/${threadId}/replies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: reply,
            access_token: this.config.pageAccessToken
          })
        }
      );

      if (response.ok) {
        console.log('✅ Educational reply posted to Threads');
      } else {
        console.log('Threads reply API not available');
      }
    } catch (error) {
      console.log('Threads reply not available:', error.message);
    }
  }

  // WhatsApp Business API integration
  async handleWhatsAppWebhook(webhookData: any): Promise<void> {
    try {
      const messages = webhookData.entry?.[0]?.changes?.[0]?.value?.messages || [];
      
      for (const message of messages) {
        if (message.type === 'text') {
          await this.processWhatsAppMessage({
            from: message.from,
            text: message.text.body,
            timestamp: message.timestamp,
            id: message.id
          });
        }
      }
    } catch (error) {
      console.error('Error processing WhatsApp webhook:', error);
    }
  }

  private async processWhatsAppMessage(message: WhatsAppMessage): Promise<void> {
    try {
      const detection = detectClickbait(message.text);
      
      if (detection.isClickbait && detection.confidence > 0.6) {
        console.log(`🎣 Potential scam detected in WhatsApp: ${message.text.substring(0, 50)}...`);
        
        // Send educational response
        const response = await this.generateWhatsAppScamWarning(message.text);
        await this.sendWhatsAppMessage(message.from, response);
        
        // Log to database
        await storage.createSocialAnalysis({
          url: `whatsapp://message/${message.id}`,
          platform: 'whatsapp',
          content: message.text,
          summary: `Potential scam detected with ${Math.round(detection.confidence * 100)}% confidence`
        });
      }
    } catch (error) {
      console.error('Error processing WhatsApp message:', error);
    }
  }

  private async generateWhatsAppScamWarning(message: string): Promise<string> {
    const warnings = [
      "⚠️ This message contains potential scam indicators. Be cautious about:",
      "• Urgent requests for money or personal information",
      "• Too-good-to-be-true offers",
      "• Requests to click suspicious links",
      "• Pressure to act immediately",
      "",
      "🛡️ Packie AI helps protect against scams. Stay safe!",
      "Report suspicious messages to authorities."
    ];
    
    return warnings.join('\n');
  }

  private async sendWhatsAppMessage(to: string, message: string): Promise<void> {
    if (!this.config) return;

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.pageId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.pageAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: {
              body: message
            }
          })
        }
      );

      if (response.ok) {
        console.log('✅ WhatsApp warning message sent');
      } else {
        console.error('Failed to send WhatsApp message:', await response.text());
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) {
      console.log('Meta platform configuration not available');
      return false;
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.config.pageId}?access_token=${this.config.pageAccessToken}`
      );

      if (response.ok) {
        console.log('✅ Meta platform connection successful');
        return true;
      } else {
        console.error('Meta platform connection failed:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Meta platform connection error:', error);
      return false;
    }
  }

  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      hasConfig: !!this.config,
      platforms: {
        facebook: !!this.config,
        threads: !!this.config,
        whatsapp: !!this.config
      }
    };
  }
}

export const metaPlatformMonitor = new MetaPlatformMonitor();