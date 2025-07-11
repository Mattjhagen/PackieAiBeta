import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ScamAnalysis {
  isScam: boolean;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  suggestions: string[];
  reportable: boolean;
  scamType?: string;
}

const SCAM_INDICATORS = [
  // Financial scams
  'urgent payment required', 'verify your account', 'suspended account', 'click here immediately',
  'congratulations you won', 'lottery winner', 'inheritance money', 'nigerian prince',
  'wire transfer', 'send money', 'bitcoin payment', 'gift cards', 'western union',
  
  // Tech support scams
  'microsoft security', 'computer virus detected', 'windows support', 'tech support',
  'refund department', 'subscription renewal', 'auto-renewal', 'cancel subscription',
  
  // Government/Authority scams
  'irs', 'social security administration', 'arrest warrant', 'legal action',
  'court summons', 'federal agency', 'tax refund', 'stimulus payment',
  
  // Romance/Social scams
  'lonely soldier', 'deployed overseas', 'emergency funds', 'stranded abroad',
  'medical emergency', 'help my family', 'love you', 'soulmate',
  
  // Phishing indicators
  'verify identity', 'update information', 'confirm details', 'security alert',
  'suspicious activity', 'account locked', 'login attempts', 'verify now'
];

const LEGITIMATE_INDICATORS = [
  'unsubscribe', 'privacy policy', 'customer service', 'official domain',
  'established company', 'physical address', 'phone support', 'secure payment'
];

export class ScamChatbot {
  async analyzeMessage(message: string): Promise<ScamAnalysis> {
    try {
      // Use OpenAI to analyze the message for scam patterns
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert scam detection AI for PackieAI. Analyze messages for fraud indicators and provide detailed assessments.

SCAM TYPES TO DETECT:
- Phishing attempts (fake login pages, account verification)
- Romance scams (fake relationships for money)
- Tech support scams (fake Microsoft/Apple support)
- Financial scams (fake investments, lottery winnings)
- Government impersonation (fake IRS, Social Security)
- Business email compromise
- Advance fee fraud
- Cryptocurrency scams

ANALYSIS CRITERIA:
1. Urgency tactics ("act now", "limited time")
2. Fear tactics ("account suspended", "legal action")
3. Requests for personal information
4. Unusual payment methods (gift cards, wire transfers, crypto)
5. Grammar/spelling errors
6. Suspicious links or attachments
7. Impersonation of legitimate organizations
8. Too-good-to-be-true offers

Respond with JSON in this exact format:
{
  "isScam": boolean,
  "confidence": number (0-100),
  "riskLevel": "low" | "medium" | "high" | "critical",
  "reasons": ["specific reason 1", "specific reason 2"],
  "suggestions": ["actionable advice 1", "actionable advice 2"],
  "reportable": boolean,
  "scamType": "string or null"
}`
          },
          {
            role: "user",
            content: `Analyze this message for scam indicators: "${message}"`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Enhance with our own pattern matching
      const enhancedAnalysis = this.enhanceAnalysis(message, analysis);
      
      return enhancedAnalysis;
    } catch (error) {
      console.error('Error analyzing message with OpenAI:', error);
      
      // Fallback to pattern-based analysis if OpenAI fails
      return this.fallbackAnalysis(message);
    }
  }

  private enhanceAnalysis(message: string, aiAnalysis: any): ScamAnalysis {
    const lowerMessage = message.toLowerCase();
    
    // Count scam indicators
    const scamMatches = SCAM_INDICATORS.filter(indicator => 
      lowerMessage.includes(indicator.toLowerCase())
    );
    
    // Count legitimate indicators
    const legitMatches = LEGITIMATE_INDICATORS.filter(indicator =>
      lowerMessage.includes(indicator.toLowerCase())
    );

    // Adjust confidence based on pattern matching
    let adjustedConfidence = aiAnalysis.confidence || 0;
    
    if (scamMatches.length > 0) {
      adjustedConfidence = Math.min(100, adjustedConfidence + (scamMatches.length * 15));
    }
    
    if (legitMatches.length > 0) {
      adjustedConfidence = Math.max(0, adjustedConfidence - (legitMatches.length * 10));
    }

    // Determine risk level based on confidence
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (adjustedConfidence >= 90) riskLevel = 'critical';
    else if (adjustedConfidence >= 70) riskLevel = 'high';
    else if (adjustedConfidence >= 40) riskLevel = 'medium';

    return {
      isScam: adjustedConfidence > 60,
      confidence: adjustedConfidence,
      riskLevel,
      reasons: aiAnalysis.reasons || [],
      suggestions: aiAnalysis.suggestions || this.getDefaultSuggestions(riskLevel),
      reportable: adjustedConfidence > 70,
      scamType: aiAnalysis.scamType || this.detectScamType(message)
    };
  }

  private fallbackAnalysis(message: string): ScamAnalysis {
    const lowerMessage = message.toLowerCase();
    
    const scamMatches = SCAM_INDICATORS.filter(indicator => 
      lowerMessage.includes(indicator.toLowerCase())
    );
    
    const legitMatches = LEGITIMATE_INDICATORS.filter(indicator =>
      lowerMessage.includes(indicator.toLowerCase())
    );

    const confidence = Math.max(0, Math.min(100, 
      (scamMatches.length * 20) - (legitMatches.length * 15) + 20
    ));

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (confidence >= 90) riskLevel = 'critical';
    else if (confidence >= 70) riskLevel = 'high';
    else if (confidence >= 40) riskLevel = 'medium';

    return {
      isScam: confidence > 60,
      confidence,
      riskLevel,
      reasons: scamMatches.map(match => `Contains suspicious phrase: "${match}"`),
      suggestions: this.getDefaultSuggestions(riskLevel),
      reportable: confidence > 70,
      scamType: this.detectScamType(message)
    };
  }

  private detectScamType(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('microsoft') || lowerMessage.includes('tech support') || 
        lowerMessage.includes('computer virus')) {
      return 'Tech Support Scam';
    }
    
    if (lowerMessage.includes('irs') || lowerMessage.includes('social security') ||
        lowerMessage.includes('arrest warrant')) {
      return 'Government Impersonation';
    }
    
    if (lowerMessage.includes('lottery') || lowerMessage.includes('inheritance') ||
        lowerMessage.includes('congratulations you won')) {
      return 'Advance Fee Fraud';
    }
    
    if (lowerMessage.includes('love') || lowerMessage.includes('deployed') ||
        lowerMessage.includes('emergency funds')) {
      return 'Romance Scam';
    }
    
    if (lowerMessage.includes('verify account') || lowerMessage.includes('login') ||
        lowerMessage.includes('update information')) {
      return 'Phishing Attempt';
    }
    
    return null;
  }

  private getDefaultSuggestions(riskLevel: string): string[] {
    const baseSuggestions = [
      "Never give out personal information via unsolicited messages",
      "Verify requests by contacting the organization directly using official channels",
      "Be suspicious of urgent or threatening language"
    ];

    switch (riskLevel) {
      case 'critical':
        return [
          "Do not respond to this message - it's almost certainly a scam",
          "Block the sender immediately",
          "Report this to authorities if it involves threats",
          "Forward suspicious messages to PackieAI at (402) 302-0633",
          ...baseSuggestions
        ];
      
      case 'high':
        return [
          "This appears to be a scam - do not respond",
          "Verify independently before taking any action",
          "Block the sender",
          "Report to PackieAI if you received this via phone call",
          ...baseSuggestions
        ];
      
      case 'medium':
        return [
          "Exercise extreme caution with this message",
          "Verify through official channels before responding",
          "Look for red flags like poor grammar or urgent demands",
          ...baseSuggestions
        ];
      
      default:
        return [
          "While this appears legitimate, always verify important requests",
          "Check the sender's email address or phone number carefully",
          ...baseSuggestions
        ];
    }
  }

  async generateResponse(userMessage: string, analysis: ScamAnalysis): Promise<string> {
    const context = `The user shared: "${userMessage}"
    
Analysis results:
- Scam probability: ${analysis.confidence}%
- Risk level: ${analysis.riskLevel}
- Scam type: ${analysis.scamType || 'Unknown'}
- Key concerns: ${analysis.reasons.join(', ')}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are PackieAI's scam prevention assistant. Provide helpful, clear advice about potential scams. Be friendly but serious about security. Use the analysis data to give specific, actionable advice.

Guidelines:
- If high risk, be very clear about the danger
- Provide specific reasons why it's suspicious
- Give clear next steps
- Mention PackieAI's services when relevant (phone numbers: 402-302-0633 for personal, 888-568-9418 for business)
- Keep responses conversational but informative
- Use formatting for readability`
          },
          {
            role: "user",
            content: context
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || "I'm unable to provide a detailed response right now, but please be cautious with any suspicious messages.";
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateFallbackResponse(analysis);
    }
  }

  private generateFallbackResponse(analysis: ScamAnalysis): string {
    if (analysis.isScam) {
      return `🚨 **SCAM ALERT** - This appears to be a scam with ${analysis.confidence}% confidence.

**Why this is suspicious:**
${analysis.reasons.map(reason => `• ${reason}`).join('\n')}

**What you should do:**
${analysis.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

${analysis.reportable ? '\n📞 **Report this scam:** Forward this to our scammer database by calling (402) 302-0633' : ''}`;
    } else {
      return `✅ This message appears to be legitimate with ${100 - analysis.confidence}% confidence.

${analysis.suggestions.length > 0 ? `**Additional safety tips:**\n${analysis.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}` : ''}`;
    }
  }
}

export const scamChatbot = new ScamChatbot();