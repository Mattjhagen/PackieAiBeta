import fetch from 'node-fetch';

interface ScamTrendItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  source: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  imageUrl?: string;
  originalUrl: string;
}

interface RSSFeed {
  title: string;
  description: string;
  items: ScamTrendItem[];
}

class ScamTrendsRSSService {
  private feeds = [
    {
      name: 'FCC Frauds, Scams and Alerts',
      url: 'https://www.fcc.gov/rss/consumer-guides',
      source: 'FCC',
      category: 'Official Government Alerts'
    },
    {
      name: 'Leonard Vona Security Blog',
      url: 'https://www.leonardvona.com/blog/rss.xml',
      source: 'Leonard Vona',
      category: 'Security Research'
    }
  ];

  async fetchAllScamTrends(): Promise<ScamTrendItem[]> {
    const allTrends: ScamTrendItem[] = [];

    for (const feed of this.feeds) {
      try {
        const trends = await this.fetchFeedTrends(feed);
        allTrends.push(...trends);
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        // Continue with other feeds even if one fails
      }
    }

    // Sort by publication date (newest first)
    return allTrends.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  }

  private async fetchFeedTrends(feed: any): Promise<ScamTrendItem[]> {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'PackieAI-ScamTrends/1.0 (https://packieai.com)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      return this.parseRSSXML(xmlText, feed);
    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error);
      return [];
    }
  }

  private parseRSSXML(xml: string, feed: any): ScamTrendItem[] {
    const items: ScamTrendItem[] = [];
    
    // Simple XML parsing for RSS items
    const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    itemMatches.forEach((itemXml, index) => {
      try {
        const title = this.extractXMLContent(itemXml, 'title');
        const description = this.extractXMLContent(itemXml, 'description');
        const link = this.extractXMLContent(itemXml, 'link');
        const pubDateStr = this.extractXMLContent(itemXml, 'pubDate');
        
        if (title && this.isScamRelated(title, description)) {
          // Extract image URL from enclosure or media:content tags
          const imageUrl = this.extractXMLContent(itemXml, 'media:content')?.match(/url="([^"]+)"/)?.[1] ||
                          this.extractXMLContent(itemXml, 'enclosure')?.match(/url="([^"]+)"/)?.[1] ||
                          this.extractImageFromDescription(description);

          items.push({
            id: `${feed.source}-${Date.now()}-${index}`,
            title: this.cleanHTML(title),
            description: this.cleanHTML(description),
            link: link || '',
            pubDate: pubDateStr ? new Date(pubDateStr) : new Date(),
            source: feed.source,
            category: feed.category,
            severity: this.assessSeverity(title, description),
            imageUrl: imageUrl || undefined,
            originalUrl: link || ''
          });
        }
      } catch (error) {
        console.error('Error parsing RSS item:', error);
      }
    });

    return items;
  }

  private extractXMLContent(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  private cleanHTML(text: string): string {
    return text
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  private extractImageFromDescription(description: string): string | null {
    // Extract image URLs from img tags in description
    const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
    return imgMatch ? imgMatch[1] : null;
  }

  private isScamRelated(title: string, description: string): boolean {
    const scamKeywords = [
      'scam', 'fraud', 'phishing', 'robocall', 'spam', 'identity theft',
      'fake', 'bogus', 'deceptive', 'misleading', 'con artist', 'swindle',
      'suspicious', 'warning', 'alert', 'avoid', 'beware', 'caution',
      'telemarketing', 'imposter', 'bitcoin', 'cryptocurrency', 'romance scam',
      'tech support', 'refund', 'prize', 'lottery', 'sweepstakes',
      'IRS', 'social security', 'medicare', 'stimulus', 'unemployment'
    ];

    const fullText = `${title} ${description}`.toLowerCase();
    return scamKeywords.some(keyword => fullText.includes(keyword));
  }

  private assessSeverity(title: string, description: string): 'low' | 'medium' | 'high' | 'critical' {
    const fullText = `${title} ${description}`.toLowerCase();
    
    // Critical severity indicators
    if (fullText.includes('urgent') || fullText.includes('immediate') || 
        fullText.includes('emergency') || fullText.includes('widespread')) {
      return 'critical';
    }
    
    // High severity indicators
    if (fullText.includes('new scam') || fullText.includes('trending') ||
        fullText.includes('increasing') || fullText.includes('surge')) {
      return 'high';
    }
    
    // Medium severity indicators
    if (fullText.includes('alert') || fullText.includes('warning') ||
        fullText.includes('caution') || fullText.includes('beware')) {
      return 'medium';
    }
    
    return 'low';
  }

  async generateRSSFeed(): Promise<string> {
    const trends = await this.fetchAllScamTrends();
    const latestTrends = trends.slice(0, 50); // Limit to 50 most recent

    const rssItems = latestTrends.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <source>${item.source}</source>
      <category>${item.category}</category>
      <severity>${item.severity}</severity>
      <guid isPermaLink="false">${item.id}</guid>
    </item>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PackieAI Scam Trends Alert</title>
    <description>Current scam trends and fraud alerts from reputable sources including FTC, FBI, AARP, and BBB</description>
    <link>https://packieai.com/scam-trends</link>
    <atom:link href="https://packieai.com/api/scam-trends/rss" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>PackieAI Scam Trends Aggregator</generator>
    <webMaster>support@packieai.com</webMaster>
    <managingEditor>support@packieai.com</managingEditor>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;
  }

  async getLatestTrends(limit: number = 20): Promise<ScamTrendItem[]> {
    const trends = await this.fetchAllScamTrends();
    return trends.slice(0, limit);
  }

  async getTrendsByCategory(category: string, limit: number = 10): Promise<ScamTrendItem[]> {
    const trends = await this.fetchAllScamTrends();
    return trends
      .filter(trend => trend.category.toLowerCase().includes(category.toLowerCase()))
      .slice(0, limit);
  }

  async getTrendsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): Promise<ScamTrendItem[]> {
    const trends = await this.fetchAllScamTrends();
    return trends.filter(trend => trend.severity === severity);
  }
}

export const scamTrendsRSSService = new ScamTrendsRSSService();