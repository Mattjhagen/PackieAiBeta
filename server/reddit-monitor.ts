interface RedditConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  userAgent: string;
}

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  author: string;
  subreddit: string;
  permalink: string;
  created_utc: number;
  score: number;
  num_comments: number;
}

class RedditMonitor {
  private accessToken: string | null = null;
  private isMonitoring = false;
  private monitoringTimeout: NodeJS.Timeout | null = null;
  private lastCheck = 0;

  constructor() {
    this.initializeMonitoring();
  }

  private getRedditConfig(): RedditConfig | null {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;
    const userAgent = process.env.REDDIT_USER_AGENT;

    if (!clientId || !clientSecret || !username || !password || !userAgent) {
      return null;
    }

    return {
      clientId,
      clientSecret,
      username,
      password,
      userAgent
    };
  }

  private async authenticate(): Promise<boolean> {
    const config = this.getRedditConfig();
    if (!config) {
      console.log('Reddit credentials not configured');
      return false;
    }

    try {
      const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
      
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': config.userAgent
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: config.username,
          password: config.password
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      console.log('Reddit authentication successful');
      return true;
    } catch (error) {
      console.error('Reddit authentication error:', error);
      return false;
    }
  }

  private async makeRedditRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) return null;
    }

    const config = this.getRedditConfig();
    if (!config) return null;

    try {
      const url = new URL(`https://oauth.reddit.com${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': config.userAgent
        }
      });

      if (response.status === 401) {
        // Token expired, re-authenticate
        this.accessToken = null;
        const authenticated = await this.authenticate();
        if (!authenticated) return null;
        
        return this.makeRedditRequest(endpoint, params);
      }

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Reddit API request error:', error);
      return null;
    }
  }

  private async initializeMonitoring() {
    const config = this.getRedditConfig();
    if (!config) {
      console.log('Reddit monitoring disabled - no credentials');
      return;
    }

    await this.startMonitoring();
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    
    const authenticated = await this.authenticate();
    if (!authenticated) {
      console.log('Cannot start Reddit monitoring - authentication failed');
      return;
    }

    this.isMonitoring = true;
    console.log('Starting Reddit clickbait monitoring...');
    this.monitorLoop();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.monitoringTimeout) {
      clearTimeout(this.monitoringTimeout);
      this.monitoringTimeout = null;
    }
    console.log('Reddit monitoring stopped');
  }

  private async monitorLoop() {
    if (!this.isMonitoring) return;

    try {
      await this.checkRecentPosts();
    } catch (error) {
      console.error('Error in Reddit monitoring loop:', error);
    }

    // Check again in 6 hours to stay conservative with API usage
    this.monitoringTimeout = setTimeout(() => {
      this.monitorLoop();
    }, 6 * 60 * 60 * 1000);
  }

  private async checkRecentPosts() {
    const subreddits = [
      'todayilearned',
      'interestingasfuck', 
      'mildlyinteresting',
      'videos',
      'news'
    ];

    const config = this.getRedditConfig();
    if (!config) return;

    for (const subreddit of subreddits) {
      try {
        // Use public JSON API as fallback
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/new.json?limit=10`, {
          headers: {
            'User-Agent': config.userAgent
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data?.data?.children) {
          console.log(`Checking ${data.data.children.length} posts from r/${subreddit}`);
          for (const child of data.data.children) {
            const post = child.data;
            await this.processPost(post);
          }
        }

        // Add delay between subreddit checks
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Error checking subreddit ${subreddit}:`, error);
      }
    }
  }

  private async processPost(post: RedditPost) {
    try {
      const { detectClickbait } = await import('./facebook-monitor');
      const fullText = `${post.title} ${post.selftext}`;
      
      const detection = detectClickbait(fullText);
      
      if (detection.isClickbait && detection.confidence > 25) {
        console.log(`Clickbait detected on Reddit: r/${post.subreddit} - "${post.title}"`);
        
        const response = await this.generateRedditResponse(post, detection);
        if (response) {
          await this.postComment(post.id, response);
          
          // Log the detection
          await this.logClickbaitDetection(post);
        }
      }
    } catch (error) {
      console.error('Error processing Reddit post:', error);
    }
  }

  private async generateRedditResponse(post: RedditPost, detection: any): Promise<string> {
    try {
      const { analyzeArticle } = await import('./openai');
      
      let analysis = '';
      if (post.url && !post.url.includes('reddit.com')) {
        try {
          analysis = await analyzeArticle(post.url, post.title);
        } catch (error) {
          console.error('Error analyzing linked content:', error);
        }
      }

      const prompt = `Generate a helpful, educational response to this potentially clickbait Reddit post. Be respectful and informative.

Post Title: "${post.title}"
Post Content: "${post.selftext}"
Clickbait Confidence: ${detection.confidence}%
Detected Patterns: ${detection.reasons.join(', ')}

${analysis ? `Content Analysis: ${analysis}` : ''}

Create a brief, friendly comment that:
1. Provides a helpful summary if possible
2. Educates about clickbait tactics
3. Promotes digital literacy
4. Mentions PackieAI as a resource for scam protection
5. Stays within Reddit's community guidelines

Keep it conversational and under 200 words.`;

      const { generateElevenLabsAudio } = await import('./elevenlabs');
      // For Reddit, we just need text response, not audio
      
      const openai = (await import('openai')).default;
      const client = new openai({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await client.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content || '';
      return response + '\n\n^(This ^message ^was ^generated ^by ^PackieAI ^- ^helping ^protect ^against ^online ^scams)';
    } catch (error) {
      console.error('Error generating Reddit response:', error);
      return '';
    }
  }

  private async postComment(postId: string, comment: string): Promise<boolean> {
    try {
      const response = await this.makeRedditRequest('/api/comment', {});
      
      // For now, just log what we would post (to avoid spamming during development)
      console.log(`Would post comment on ${postId}:`, comment);
      
      // TODO: Implement actual comment posting once approved
      // const response = await fetch('https://oauth.reddit.com/api/comment', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.accessToken}`,
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //     'User-Agent': config.userAgent
      //   },
      //   body: new URLSearchParams({
      //     api_type: 'json',
      //     text: comment,
      //     thing_id: `t3_${postId}`
      //   })
      // });

      return true;
    } catch (error) {
      console.error('Error posting Reddit comment:', error);
      return false;
    }
  }

  private async logClickbaitDetection(post: RedditPost) {
    try {
      const { storage } = await import('./storage');
      
      await storage.createSocialAnalysis({
        platform: 'reddit',
        url: `https://reddit.com${post.permalink}`,
        title: post.title,
        content: post.selftext,
        summary: `Clickbait detected in r/${post.subreddit}: Educational response provided`,
        engagement: {
          likes: post.score,
          comments: post.num_comments
        }
      });
      
      console.log(`Logged Reddit clickbait detection: ${post.id}`);
    } catch (error) {
      console.error('Error logging Reddit detection:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const authenticated = await this.authenticate();
      if (!authenticated) return false;

      // Test using public JSON API (no OAuth required)
      const config = this.getRedditConfig();
      if (!config) return false;

      const response = await fetch('https://www.reddit.com/r/test/hot.json?limit=1', {
        headers: {
          'User-Agent': config.userAgent
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.data?.children?.length > 0) {
          console.log(`Successfully connected to Reddit public API`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Reddit connection test failed:', error);
      // Try alternative authentication method
      return await this.testAlternativeAuth();
    }
  }

  private async testAlternativeAuth(): Promise<boolean> {
    const config = this.getRedditConfig();
    if (!config) return false;

    try {
      // Test with read-only access to a public subreddit
      const response = await fetch('https://www.reddit.com/r/test/hot.json?limit=1', {
        headers: {
          'User-Agent': config.userAgent
        }
      });

      if (response.ok) {
        console.log('Reddit read access confirmed (public API)');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Alternative Reddit auth test failed:', error);
      return false;
    }
  }

  async testClickbaitDetection(postTitle: string, postContent: string = ''): Promise<any> {
    try {
      const { detectClickbait, generateClickbaitResponse } = await import('./facebook-monitor');
      
      const fullText = `${postTitle} ${postContent}`;
      const detection = detectClickbait(fullText);
      
      if (detection.isClickbait) {
        const response = await generateClickbaitResponse(fullText);
        return {
          ...detection,
          suggestedResponse: response
        };
      }
      
      return detection;
    } catch (error) {
      console.error('Error testing Reddit clickbait detection:', error);
      return { isClickbait: false, confidence: 0, reasons: [], error: String(error) };
    }
  }
}

export const redditMonitor = new RedditMonitor();