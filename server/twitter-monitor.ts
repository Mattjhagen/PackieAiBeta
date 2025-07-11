import { TwitterApi } from 'twitter-api-v2';
import { detectClickbait, generateClickbaitResponse, logClickbaitDetection } from './facebook-monitor';
import { extractArticleContent, analyzeArticle } from './openai';

interface TwitterConfig {
  appKey: string;
  appSecret: string;
  accessToken: string;
  accessSecret: string;
  bearerToken: string;
}

class TwitterMonitor {
  private client: TwitterApi | null = null;
  private userClient: TwitterApi | null = null;
  private isMonitoring = false;
  private monitoringTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    const config = this.getTwitterConfig();
    if (!config) {
      console.log('Twitter API credentials not configured');
      return;
    }

    try {
      // Read-only client with bearer token
      this.client = new TwitterApi(config.bearerToken);
      
      // Read-write client for posting replies
      this.userClient = new TwitterApi({
        appKey: config.appKey,
        appSecret: config.appSecret,
        accessToken: config.accessToken,
        accessSecret: config.accessSecret,
      });

      console.log('Twitter clients initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Twitter clients:', error);
    }
  }

  private getTwitterConfig(): TwitterConfig | null {
    const appKey = process.env.TWITTER_API_KEY;
    const appSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!appKey || !appSecret || !accessToken || !accessSecret || !bearerToken) {
      return null;
    }

    return {
      appKey,
      appSecret,
      accessToken,
      accessSecret,
      bearerToken
    };
  }

  async startMonitoring() {
    if (!this.client || !this.userClient) {
      console.log('Twitter clients not initialized - credentials may be missing');
      return;
    }

    if (this.isMonitoring) {
      console.log('Twitter monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('Starting Twitter clickbait monitoring...');
    this.monitorLoop();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.monitoringTimeout) {
      clearTimeout(this.monitoringTimeout);
      this.monitoringTimeout = null;
    }
    console.log('Twitter monitoring stopped');
  }

  private async monitorLoop() {
    if (!this.isMonitoring) return;

    try {
      await this.checkRecentTweets();
    } catch (error) {
      console.error('Error in Twitter monitoring loop:', error);
    }

    // Check again in 8 hours to stay within monthly limits (100 reads/month)
    this.monitoringTimeout = setTimeout(() => {
      this.monitorLoop();
    }, 8 * 60 * 60 * 1000);
  }

  private async checkRecentTweets() {
    if (!this.client) return;

    try {
      // Limited to 3 most effective search terms for monthly quota (100 reads/month)
      const searchTerms = [
        '"you won\'t believe"',
        '"this will shock you"',
        '"doctors hate this"'
      ];

      for (const term of searchTerms) {
        try {
          const tweets = await this.client.v2.search(`${term} -is:retweet`, {
            max_results: 5,
            'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'entities'],
            expansions: ['author_id'],
            sort_order: 'recency'
          });

          if (tweets.data) {
            for (const tweet of tweets.data) {
              await this.processTweet(tweet);
            }
          }
        } catch (searchError) {
          console.error(`Error searching for "${term}":`, searchError);
        }
      }
    } catch (error) {
      console.error('Error checking recent tweets:', error);
    }
  }

  private async processTweet(tweet: any) {
    try {
      // Extract URLs from the tweet
      const urls = tweet.entities?.urls || [];
      
      // Check if the tweet text contains clickbait patterns
      const clickbaitAnalysis = detectClickbait(tweet.text);
      
      if (!clickbaitAnalysis.isClickbait || clickbaitAnalysis.confidence < 70) {
        return; // Only respond to high-confidence clickbait
      }

      let response = '';
      
      if (urls.length > 0) {
        // Get the first URL to analyze
        const articleUrl = urls[0].expanded_url || urls[0].url;
        
        // Generate TL;DR summary with PackieAI promotion
        response = await this.generateTLDRResponse(tweet.text, articleUrl);
      } else {
        // No URL, just respond to clickbait pattern
        response = await this.generateClickbaitCallout(tweet.text);
      }
      
      // Post reply with rate limiting consideration
      await this.postReply(tweet.id, response);
      
      // Log the detection
      await logClickbaitDetection(tweet.text, urls[0]?.expanded_url || 'no-url', true, clickbaitAnalysis.confidence);
      
      console.log(`Posted TL;DR response to clickbait tweet ${tweet.id}`);
      
    } catch (error) {
      console.error('Error processing tweet:', error);
    }
  }

  private async generateTLDRResponse(tweetText: string, articleUrl: string): Promise<string> {
    try {
      // Extract and analyze article content
      const articleData = await extractArticleContent(articleUrl);
      const analysis = await analyzeArticle(articleUrl, articleData.content);
      
      const tldrResponses = [
        `TL;DR: ${analysis}

🚨 Don't fall for clickbait! Get real insights from AI that fights scams.

#PackieAI #AntiScam #ClickbaitBusted #AIProtection #ScamPrevention`,

        `📰 TL;DR Summary: ${analysis}

💡 Pro tip: Always be skeptical of sensational headlines! PackieAI helps protect against online manipulation.

#TLDRBot #PackieAI #MediaLiteracy #AntiClickbait #StayVigilant`,

        `Here's the actual story: ${analysis}

🛡️ Stop falling for clickbait! PackieAI's AI technology helps you spot manipulation tactics.

#FactCheck #PackieAI #ClickbaitExposed #AITruth #DigitalSafety`
      ];
      
      return tldrResponses[Math.floor(Math.random() * tldrResponses.length)];
      
    } catch (error) {
      console.error('Error generating TL;DR:', error);
      return this.generateClickbaitCallout(tweetText);
    }
  }

  private async generateClickbaitCallout(tweetText: string): Promise<string> {
    const calloutResponses = [
      `🚨 Clickbait Alert! 

Headlines like this are designed to manipulate your emotions. Stay informed, stay protected.

#PackieAI #ClickbaitAlert #MediaLiteracy #StayVigilant #AntiScam`,

      `📢 This looks like clickbait designed to grab attention!

💡 Tip: Always verify sensational claims before sharing. PackieAI helps protect against online manipulation.

#FactCheck #PackieAI #DigitalSafety #ThinkBeforeYouClick`,

      `⚠️ Sensational headline detected!

Don't let clickbait waste your time. Get real protection with AI that fights scams and misinformation.

#PackieAI #ClickbaitBusted #AIProtection #StayInformed`
    ];
    
    return calloutResponses[Math.floor(Math.random() * calloutResponses.length)];
  }

  private async postReply(tweetId: string, replyText: string) {
    if (!this.userClient) {
      console.log('Cannot post reply - user client not initialized');
      return;
    }

    try {
      // Add a rate limit delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.userClient.v2.reply(replyText, tweetId);
    } catch (error) {
      console.error('Error posting reply:', error);
      
      // Handle rate limiting
      if (error.code === 429) {
        console.log('Rate limited - will retry later');
        // Could implement exponential backoff here
      }
    }
  }

  async testConnection() {
    if (!this.client) {
      return { success: false, error: 'Clients not initialized' };
    }

    try {
      const user = await this.userClient?.v2.me();
      return { 
        success: true, 
        user: user?.data?.username,
        message: 'Successfully connected to Twitter API'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to connect to Twitter API'
      };
    }
  }

  // Manual testing method
  async testClickbaitDetection(tweetText: string, articleUrl?: string) {
    const analysis = detectClickbait(tweetText);
    let response = null;
    
    if (analysis.isClickbait) {
      response = await generateClickbaitResponse(tweetText, articleUrl);
    }
    
    return {
      isClickbait: analysis.isClickbait,
      confidence: analysis.confidence,
      reasons: analysis.reasons,
      suggestedResponse: response
    };
  }
}

export const twitterMonitor = new TwitterMonitor();