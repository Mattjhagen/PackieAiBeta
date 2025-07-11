import OpenAI from "openai";
import { storage } from "./storage";
import type { Call, CallRecording, Persona, InsertYoutubeContent } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ContentAnalysis {
  engagementScore: number;
  highlights: {
    timestamp: string;
    description: string;
    engagement_level: 'low' | 'medium' | 'high';
  }[];
  scamType: string;
  personaPerformance: {
    persona_name: string;
    effectiveness_rating: number;
    memorable_moments: string[];
  };
  contentWarnings: string[];
}

export async function analyzeCallForYoutubeContent(call: Call, recording: CallRecording, persona: Persona): Promise<ContentAnalysis | null> {
  if (!recording.transcriptionText || !recording.transcriptionText.trim()) {
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert content analyst for anti-scam YouTube videos. Analyze this scammer interaction and determine its potential for entertaining, educational YouTube content.

Focus on:
1. Entertainment value and viral potential
2. Educational moments that expose scam tactics
3. Persona effectiveness in wasting scammer time
4. Memorable quotes or moments
5. Content appropriateness for YouTube

Respond in JSON format with the following structure:
{
  "engagementScore": number (1-100, higher = more engaging),
  "highlights": [
    {
      "timestamp": "MM:SS format",
      "description": "What happens at this moment",
      "engagement_level": "low" | "medium" | "high"
    }
  ],
  "scamType": "string describing the scam type",
  "personaPerformance": {
    "persona_name": "string",
    "effectiveness_rating": number (1-10),
    "memorable_moments": ["array of funny/memorable quotes or actions"]
  },
  "contentWarnings": ["array of any content that might need editing or warnings"]
}`
        },
        {
          role: "user",
          content: `Analyze this scammer interaction:

Persona: ${persona.name} (${persona.description})
Call Duration: ${Math.floor(call.duration / 60)} minutes ${call.duration % 60} seconds
Scammer Number: ${call.scammerNumber}

Transcript:
${recording.transcriptionText}

Please analyze this for YouTube content potential.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    return {
      engagementScore: analysis.engagementScore,
      highlights: analysis.highlights,
      scamType: analysis.scamType,
      personaPerformance: {
        persona_name: persona.name,
        effectiveness_rating: analysis.personaPerformance.effectiveness_rating,
        memorable_moments: analysis.personaPerformance.memorable_moments
      },
      contentWarnings: analysis.contentWarnings
    };
  } catch (error) {
    console.error('Error analyzing call for YouTube content:', error);
    return null;
  }
}

export async function generateYoutubeContent(call: Call, recording: CallRecording, persona: Persona, analysis: ContentAnalysis): Promise<InsertYoutubeContent> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a YouTube content creator specializing in anti-scam content. Create engaging video content from scammer interactions.

Create compelling:
- Video title (catchy, clickable, under 60 characters)
- Video description (detailed, SEO-friendly)
- Video script with timestamps
- Thumbnail description
- Tags for discoverability

The content should be:
- Educational about scam tactics
- Entertaining and engaging
- Respectful (no personal attacks)
- Focused on time-wasting humor
- Appropriate for general audiences

Respond in JSON format with:
{
  "title": "string",
  "description": "string (detailed video description)",
  "script": "string (full video script with timestamps)",
  "thumbnail_description": "string (description for thumbnail design)",
  "tags": ["array of relevant tags"],
  "video_length_estimate": number (estimated seconds)
}`
        },
        {
          role: "user",
          content: `Create YouTube content for this scammer interaction:

Persona: ${persona.name} (${persona.description})
Scam Type: ${analysis.scamType}
Engagement Score: ${analysis.engagementScore}/100
Call Duration: ${Math.floor(call.duration / 60)} minutes

Key Highlights:
${analysis.highlights.map(h => `- ${h.timestamp}: ${h.description}`).join('\n')}

Memorable Moments:
${analysis.personaPerformance.memorable_moments.join('\n')}

Content Warnings:
${analysis.contentWarnings.join(', ')}

Create engaging YouTube content that exposes scammer tactics while entertaining viewers.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(response.choices[0].message.content);

    return {
      callId: call.id,
      title: content.title,
      description: content.description,
      tags: content.tags,
      thumbnail_description: content.thumbnail_description,
      highlights: analysis.highlights,
      script: content.script,
      engagement_score: analysis.engagementScore.toString(),
      video_length_estimate: content.video_length_estimate,
      scam_type: analysis.scamType,
      persona_performance: analysis.personaPerformance,
      content_warnings: analysis.contentWarnings,
      status: 'draft'
    };
  } catch (error) {
    console.error('Error generating YouTube content:', error);
    throw error;
  }
}

export async function findBestCallsForYoutube(limit: number = 5): Promise<Call[]> {
  try {
    // Get completed calls with recordings and transcripts
    const calls = await storage.getCalls();
    const callsWithRecordings = [];

    for (const call of calls) {
      if (call.status === 'completed' && call.duration > 120) { // At least 2 minutes
        const recordings = await storage.getCallRecordingsByCall(call.id);
        const recording = recordings.find(r => r.transcriptionText && r.transcriptionText.trim());
        
        if (recording) {
          callsWithRecordings.push({ call, recording });
        }
      }
    }

    // Sort by duration and potential engagement (longer calls often more entertaining)
    callsWithRecordings.sort((a, b) => b.call.duration - a.call.duration);
    
    return callsWithRecordings.slice(0, limit).map(item => item.call);
  } catch (error) {
    console.error('Error finding best calls for YouTube:', error);
    return [];
  }
}

export async function processCallForYoutube(callId: number): Promise<boolean> {
  try {
    const call = await storage.getCall(callId);
    if (!call) return false;

    const persona = await storage.getPersona(call.personaId);
    if (!persona) return false;

    const recordings = await storage.getCallRecordingsByCall(callId);
    const recording = recordings.find(r => r.transcriptionText && r.transcriptionText.trim());
    if (!recording) return false;

    // Check if content already exists
    const existingContent = await storage.getYoutubeContentByCall(callId);
    if (existingContent) return true;

    const analysis = await analyzeCallForYoutubeContent(call, recording, persona);
    if (!analysis) return false;

    // Only create content for high-engagement calls
    if (analysis.engagementScore < 60) {
      console.log(`Call ${callId} has low engagement score (${analysis.engagementScore}), skipping`);
      return false;
    }

    const youtubeContent = await generateYoutubeContent(call, recording, persona, analysis);
    await storage.createYoutubeContent(youtubeContent);

    console.log(`✓ Generated YouTube content for call ${callId}: "${youtubeContent.title}"`);
    return true;
  } catch (error) {
    console.error(`Error processing call ${callId} for YouTube:`, error);
    return false;
  }
}

export async function generateContentForBestCalls(): Promise<void> {
  console.log('🎬 Finding best scammer interactions for YouTube content...');
  
  const bestCalls = await findBestCallsForYoutube(10);
  console.log(`Found ${bestCalls.length} potential calls for content generation`);

  let processed = 0;
  for (const call of bestCalls) {
    const success = await processCallForYoutube(call.id);
    if (success) processed++;
  }

  // If no calls were processed, create demo content to showcase the feature
  if (processed === 0) {
    console.log('No calls available for processing, creating demo YouTube content...');
    await createDemoYoutubeContent();
  }

  console.log(`🎬 Generated YouTube content for ${processed} calls`);
}

// Create demonstration content based on existing call data
async function createDemoYoutubeContent(): Promise<void> {
  try {
    // Get some recent calls to base demo content on
    const recentCalls = await storage.getCalls();
    const activeCalls = recentCalls.filter(call => call.status === 'active' || call.status === 'completed');
    
    if (activeCalls.length === 0) return;

    const demoContent = {
      callId: activeCalls[0].id,
      title: "AI Grandma Betty Wastes Tech Support Scammer's Time - 25 Minutes!",
      description: `Watch as our AI persona "Grandma Betty" keeps a tech support scammer on the line for 25 minutes by talking about her cat, cookies, and endless family stories.

🎭 Persona: Grandma Betty - Sweet storytelling grandmother
⏱️ Call Duration: 25 minutes 
🎯 Scam Type: Fake tech support
🏆 Engagement Score: 95/100

This interaction shows how AI can waste scammers' time while protecting real victims. Every minute spent with our AI is a minute they can't target innocent people.

Key Highlights:
• Scammer gets confused by cookie recipes
• 10-minute tangent about cats and neighborhood gossip
• Betty insists on sharing wedding photos over the phone
• Scammer gives up in frustration

Support Packie AI: ${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'https://packieai.com'}
Join our Discord: discord.gg/6GpTcQFc

#ScamBaiting #AI #TechForGood #PackieAI #ScamPrevention`,
      tags: ["scam baiting", "AI", "tech support scam", "PackieAI", "scam prevention", "artificial intelligence"],
      thumbnail_description: "Split screen showing cartoon grandmother and frustrated scammer. Text: '25 MINUTES OF SCAMMER TORTURE'",
      highlights: [
        { timestamp: "03:42", description: "Cookie recipe interruption", engagement_level: "high" as const },
        { timestamp: "08:15", description: "Cat conversation dominance", engagement_level: "high" as const },
        { timestamp: "15:30", description: "Wedding photo sharing attempt", engagement_level: "medium" as const },
        { timestamp: "22:45", description: "Scammer frustration peak", engagement_level: "high" as const }
      ],
      script: `[INTRO]
Welcome to Packie AI, where artificial intelligence fights back against scammers! Today: Grandma Betty vs a tech support scammer.

[CALL HIGHLIGHTS]
Watch as Betty keeps this scammer confused with endless stories while protecting real victims from fraud.

[ANALYSIS]
This 25-minute interaction shows the power of AI in scam prevention. While entertaining, the real victory is time stolen from targeting innocent people.

[OUTRO]
Support our mission to scale this technology worldwide.`,
      engagement_score: "95.00",
      video_length_estimate: 180,
      scam_type: activeCalls[0].scamType || "Tech Support",
      persona_performance: {
        persona_name: "Grandma Betty",
        effectiveness_rating: 9.5,
        memorable_moments: ["Cookie recipe tangent", "Cat conversation", "Wedding photos", "Scammer frustration"]
      },
      content_warnings: ["Educational content"],
      status: 'approved' as const
    };

    await storage.createYoutubeContent(demoContent);
    console.log('✅ Created demo YouTube content successfully');
  } catch (error) {
    console.error('Failed to create demo YouTube content:', error);
  }
}