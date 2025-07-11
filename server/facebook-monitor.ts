import { analyzeArticle, extractArticleContent } from "./openai";
import { storage } from "./storage";

interface ClickbaitPattern {
  keywords: string[];
  phrases: string[];
  patterns: RegExp[];
}

// Common clickbait detection patterns
const clickbaitPatterns: ClickbaitPattern = {
  keywords: [
    'shocking', 'unbelievable', 'amazing', 'incredible', 'mind-blowing',
    'secret', 'hidden', 'revealed', 'exposed', 'truth',
    'doctors hate', 'one weird trick', 'you wont believe',
    'this will blow your mind', 'wait until you see'
  ],
  phrases: [
    'number 7 will shock you',
    'what happens next will amaze you',
    'you wont believe what happened',
    'the result will surprise you',
    'this simple trick',
    'doctors dont want you to know'
  ],
  patterns: [
    /\d+\s+(reasons?|ways?|tips?|tricks?|secrets?|facts?)/i,
    /you\s+won\'?t\s+believe/i,
    /this\s+will\s+(shock|amaze|surprise|blow\s+your\s+mind)/i,
    /one\s+weird\s+trick/i,
    /doctors\s+hate\s+(him|her|this)/i
  ]
};

export function detectClickbait(text: string): { isClickbait: boolean; confidence: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  
  if (!text || typeof text !== 'string') {
    return { isClickbait: false, confidence: 0, reasons: ['Invalid or empty text'] };
  }
  
  const textLower = text.toLowerCase();

  // Check for clickbait keywords
  clickbaitPatterns.keywords.forEach(keyword => {
    if (textLower.includes(keyword)) {
      reasons.push(`Contains clickbait keyword: "${keyword}"`);
      score += 10;
    }
  });

  // Check for clickbait phrases
  clickbaitPatterns.phrases.forEach(phrase => {
    if (textLower.includes(phrase)) {
      reasons.push(`Contains clickbait phrase: "${phrase}"`);
      score += 20;
    }
  });

  // Check for clickbait patterns
  clickbaitPatterns.patterns.forEach(pattern => {
    if (pattern.test(text)) {
      reasons.push(`Matches clickbait pattern: ${pattern.source}`);
      score += 15;
    }
  });

  // Additional heuristics
  if (text.includes('!!!') || text.includes('???')) {
    reasons.push('Excessive punctuation');
    score += 5;
  }

  if (text.match(/[A-Z]{3,}/g)) {
    reasons.push('Excessive capitalization');
    score += 5;
  }

  const confidence = Math.min(score, 100);
  return {
    isClickbait: confidence > 30,
    confidence,
    reasons
  };
}

export async function generateClickbaitResponse(originalPost: string, articleUrl?: string): Promise<string> {
  try {
    let analysis = '';
    
    if (articleUrl) {
      // Try to analyze the actual article
      try {
        const articleContent = await extractArticleContent(articleUrl);
        analysis = await analyzeArticle(articleUrl, articleContent.content);
      } catch (error) {
        console.log('Could not analyze article, generating general response');
      }
    }

    if (analysis) {
      return `🦝 Packie here! I analyzed this article for you. Here's what I found:\n\n${analysis}\n\nAlways verify information from multiple sources! 🔍 #FactCheck #PackieAI`;
    } else {
      // Generate a general helpful response for clickbait
      return `🦝 Hey there! This looks like clickbait content. Remember to:\n\n• Check multiple reliable sources\n• Look for actual evidence and citations\n• Be skeptical of "miracle" claims\n• Verify before sharing\n\nStay smart and stay safe! 🔍 #FactCheck #PackieAI`;
    }
  } catch (error) {
    console.error('Error generating clickbait response:', error);
    return `🦝 Packie here! Always verify information from multiple reliable sources before believing or sharing. Stay skeptical, stay safe! #FactCheck #PackieAI`;
  }
}

// Store detected clickbait for analysis
export async function logClickbaitDetection(postText: string, source: string, isClickbait: boolean, confidence: number) {
  try {
    await storage.createSocialAnalysis({
      url: source,
      platform: 'facebook',
      content: postText,
      summary: `Clickbait detection: ${confidence}% confidence - ${isClickbait ? 'CLICKBAIT DETECTED' : 'Legitimate content'}`
    });
  } catch (error) {
    console.error('Error logging clickbait detection:', error);
  }
}