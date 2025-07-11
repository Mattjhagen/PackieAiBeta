import OpenAI from "openai";
import { storage } from './storage';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ConversationAnalysis {
  effectiveness: number; // 1-10 scale
  scammerEngagement: number; // 1-10 scale  
  timeWasted: number; // minutes
  scamType: string;
  tactics: string[];
  personaPerformance: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  keyMoments: {
    timestamp: number;
    description: string;
    effectiveness: 'high' | 'medium' | 'low';
  }[];
}

interface TrainingData {
  input: string;
  response: string;
  context: string;
  effectiveness: number;
  personaName: string;
}

class ConversationTrainer {
  private trainingQueue: TrainingData[] = [];
  private isProcessing = false;

  async analyzeCallRecording(callId: number): Promise<ConversationAnalysis | null> {
    try {
      const call = await storage.getCall(callId);
      const recordings = await storage.getCallRecordingsByCall(callId);
      
      if (!call || recordings.length === 0) {
        console.log(`No call or recordings found for call ${callId}`);
        return null;
      }

      const recording = recordings[0];
      if (!recording.transcriptionText) {
        console.log(`No transcription available for call ${callId}`);
        return null;
      }

      const persona = await storage.getPersona(call.personaId);
      if (!persona) {
        console.log(`No persona found for call ${callId}`);
        return null;
      }

      console.log(`🔍 Analyzing conversation for call ${callId} with persona ${persona.name}`);

      const analysis = await this.performAIAnalysis(
        recording.transcriptionText,
        persona.name,
        call.duration,
        call.scamType || 'unknown'
      );

      // Store analysis results
      await this.storeAnalysisResults(callId, analysis);

      // Extract training data for model improvement
      await this.extractTrainingData(recording.transcriptionText, persona.name, analysis);

      return analysis;

    } catch (error) {
      console.error('Error analyzing call recording:', error);
      return null;
    }
  }

  private async performAIAnalysis(
    transcript: string,
    personaName: string,
    duration: number,
    scamType: string
  ): Promise<ConversationAnalysis> {
    try {
      const prompt = `Analyze this scammer vs AI persona conversation transcript and provide detailed insights:

Persona: ${personaName}
Duration: ${duration} seconds
Scam Type: ${scamType}

Transcript:
${transcript}

Please analyze the conversation and respond with JSON containing:
1. effectiveness (1-10): How well did the AI waste the scammer's time
2. scammerEngagement (1-10): How engaged/frustrated the scammer became
3. timeWasted (minutes): Estimated time wasted from scammer's perspective
4. scamType: Identified type of scam attempt
5. tactics: Array of scam tactics identified
6. personaPerformance: Object with strengths, weaknesses, suggestions arrays
7. keyMoments: Array of significant conversation moments with timestamps and effectiveness

Focus on identifying what made the AI effective or ineffective at wasting the scammer's time.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing scammer-AI conversations to improve anti-scam AI performance. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysisText = response.choices[0].message.content;
      if (!analysisText) {
        throw new Error('No analysis response received');
      }

      return JSON.parse(analysisText);

    } catch (error) {
      console.error('Error in AI analysis:', error);
      // Return default analysis if AI analysis fails
      return {
        effectiveness: 5,
        scammerEngagement: 5,
        timeWasted: Math.round(duration / 60),
        scamType: scamType,
        tactics: ['unknown'],
        personaPerformance: {
          strengths: ['maintained character'],
          weaknesses: ['needs improvement'],
          suggestions: ['continue development']
        },
        keyMoments: []
      };
    }
  }

  private async storeAnalysisResults(callId: number, analysis: ConversationAnalysis): Promise<void> {
    try {
      // Update call record with analysis results
      await storage.updateCall(callId, {
        confidence: analysis.effectiveness.toString()
      });

      console.log(`✅ Stored analysis results for call ${callId}`);
    } catch (error) {
      console.error('Error storing analysis results:', error);
    }
  }

  private async extractTrainingData(
    transcript: string,
    personaName: string,
    analysis: ConversationAnalysis
  ): Promise<void> {
    try {
      // Parse transcript into conversation turns
      const turns = this.parseTranscriptTurns(transcript);
      
      for (let i = 0; i < turns.length - 1; i++) {
        const currentTurn = turns[i];
        const nextTurn = turns[i + 1];
        
        // Only capture AI responses (not scammer inputs)
        if (this.isAIResponse(currentTurn, personaName) && this.isScammerInput(nextTurn)) {
          const trainingData: TrainingData = {
            input: i > 0 ? turns[i - 1].text : '',
            response: currentTurn.text,
            context: `persona:${personaName},scamType:${analysis.scamType}`,
            effectiveness: this.calculateResponseEffectiveness(currentTurn, nextTurn, analysis),
            personaName: personaName
          };
          
          this.trainingQueue.push(trainingData);
        }
      }

      // Process training queue
      await this.processTrainingQueue();

    } catch (error) {
      console.error('Error extracting training data:', error);
    }
  }

  private parseTranscriptTurns(transcript: string): Array<{speaker: string, text: string, timestamp?: number}> {
    // Parse transcript format - adjust based on actual transcript format
    const lines = transcript.split('\n').filter(line => line.trim());
    const turns = [];
    
    for (const line of lines) {
      // Handle different transcript formats
      if (line.includes(':')) {
        const [speaker, ...textParts] = line.split(':');
        turns.push({
          speaker: speaker.trim(),
          text: textParts.join(':').trim()
        });
      } else {
        // If no speaker identified, assume it's continuation of previous turn
        if (turns.length > 0) {
          turns[turns.length - 1].text += ' ' + line.trim();
        }
      }
    }
    
    return turns;
  }

  private isAIResponse(turn: any, personaName: string): boolean {
    const aiIndicators = [personaName.toLowerCase(), 'packie', 'ai', 'assistant'];
    return aiIndicators.some(indicator => 
      turn.speaker?.toLowerCase().includes(indicator)
    );
  }

  private isScammerInput(turn: any): boolean {
    const scammerIndicators = ['caller', 'scammer', 'user', 'human'];
    return scammerIndicators.some(indicator => 
      turn.speaker?.toLowerCase().includes(indicator)
    );
  }

  private calculateResponseEffectiveness(
    aiTurn: any, 
    scammerTurn: any, 
    analysis: ConversationAnalysis
  ): number {
    // Calculate effectiveness based on scammer's response and overall analysis
    let effectiveness = analysis.effectiveness;
    
    // Adjust based on scammer response length (longer = more engaged)
    if (scammerTurn.text.length > 100) effectiveness += 1;
    if (scammerTurn.text.length < 20) effectiveness -= 1;
    
    // Look for frustration indicators
    const frustrationWords = ['what', 'confused', 'don\'t understand', 'listen', 'focus'];
    const frustrationCount = frustrationWords.filter(word => 
      scammerTurn.text.toLowerCase().includes(word)
    ).length;
    
    effectiveness += frustrationCount * 0.5;
    
    return Math.min(10, Math.max(1, effectiveness));
  }

  private async processTrainingQueue(): Promise<void> {
    if (this.isProcessing || this.trainingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🧠 Processing ${this.trainingQueue.length} training examples`);

    try {
      // Group training data by persona for batch processing
      const groupedData = this.groupTrainingDataByPersona();
      
      for (const [personaName, examples] of Object.entries(groupedData)) {
        await this.generatePersonaImprovements(personaName, examples);
      }

      // Clear processed queue
      this.trainingQueue = [];

    } catch (error) {
      console.error('Error processing training queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private groupTrainingDataByPersona(): Record<string, TrainingData[]> {
    const grouped: Record<string, TrainingData[]> = {};
    
    for (const data of this.trainingQueue) {
      if (!grouped[data.personaName]) {
        grouped[data.personaName] = [];
      }
      grouped[data.personaName].push(data);
    }
    
    return grouped;
  }

  private async generatePersonaImprovements(
    personaName: string, 
    examples: TrainingData[]
  ): Promise<void> {
    try {
      // Analyze patterns in effective vs ineffective responses
      const highEffectiveness = examples.filter(e => e.effectiveness >= 7);
      const lowEffectiveness = examples.filter(e => e.effectiveness <= 4);

      if (highEffectiveness.length === 0 && lowEffectiveness.length === 0) {
        return;
      }

      const prompt = `Analyze these conversation examples for persona "${personaName}" and suggest improvements:

High Effectiveness Examples (${highEffectiveness.length}):
${highEffectiveness.map(e => `Input: "${e.input}" → Response: "${e.response}" (${e.effectiveness}/10)`).join('\n')}

Low Effectiveness Examples (${lowEffectiveness.length}):
${lowEffectiveness.map(e => `Input: "${e.input}" → Response: "${e.response}" (${e.effectiveness}/10)`).join('\n')}

Please provide JSON with:
1. patterns: What patterns make responses effective vs ineffective
2. suggestions: Specific improvements for this persona
3. newResponses: 3-5 new response templates that would be more effective
4. conversationTactics: New tactics to keep scammers engaged longer

Focus on psychological elements that waste scammers' time effectively.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system", 
            content: "You are an expert at improving AI personas for anti-scam purposes. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const improvements = response.choices[0].message.content;
      if (improvements) {
        await this.applyPersonaImprovements(personaName, JSON.parse(improvements));
      }

    } catch (error) {
      console.error('Error generating persona improvements:', error);
    }
  }

  private async applyPersonaImprovements(personaName: string, improvements: any): Promise<void> {
    try {
      console.log(`🔧 Applying improvements to persona: ${personaName}`);
      console.log('Improvement suggestions:', improvements.suggestions);
      
      // Log improvements for manual review and application
      // In a production system, you might want to automatically update persona configs
      // or queue improvements for human review
      
    } catch (error) {
      console.error('Error applying persona improvements:', error);
    }
  }

  async processUnanalyzedCalls(): Promise<void> {
    try {
      console.log('🔄 Processing unanalyzed calls for training data...');
      
      const unprocessedRecordings = await storage.getUnprocessedRecordings();
      
      for (const recording of unprocessedRecordings) {
        if (recording.transcriptionText) {
          await this.analyzeCallRecording(recording.callId);
          
          // Mark as processed
          await storage.updateCallRecording(recording.id, {
            isProcessed: true
          });
        }
      }
      
      console.log(`✅ Processed ${unprocessedRecordings.length} call recordings`);
      
    } catch (error) {
      console.error('Error processing unanalyzed calls:', error);
    }
  }

  async generatePersonaResponseImprovement(
    personaName: string,
    userInput: string,
    currentResponse: string,
    context: string
  ): Promise<string> {
    try {
      const prompt = `Improve this AI persona response to be more effective at wasting a scammer's time:

Persona: ${personaName}
Scammer Input: "${userInput}"
Current Response: "${currentResponse}"
Context: ${context}

Generate a better response that:
1. Stays in character for the persona
2. Keeps the scammer more engaged and confused
3. Wastes more of their time
4. Uses psychological tactics appropriate for the persona
5. Avoids being too obvious about being an AI

Respond with just the improved response text.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert at creating effective anti-scam AI responses. Be creative and psychological."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.8
      });

      return response.choices[0].message.content || currentResponse;

    } catch (error) {
      console.error('Error generating improved response:', error);
      return currentResponse;
    }
  }
}

export const conversationTrainer = new ConversationTrainer();

// Auto-process unanalyzed calls every hour
setInterval(async () => {
  try {
    await conversationTrainer.processUnanalyzedCalls();
  } catch (error) {
    console.error('Error in auto-processing calls:', error);
  }
}, 60 * 60 * 1000); // 1 hour