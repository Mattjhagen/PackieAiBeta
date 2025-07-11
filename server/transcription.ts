import OpenAI from "openai";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import twilio from 'twilio';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeCallRecording(recordingId: number): Promise<void> {
  try {
    const recording = await storage.getCallRecording(recordingId);
    if (!recording || recording.isProcessed) {
      return;
    }

    // Use Twilio client to get the recording URL with proper authentication
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Extract recording SID from the URL
    const urlParts = recording.recordingUrl.split('/');
    const recordingSid = urlParts[urlParts.length - 1];
    if (!recordingSid || !recordingSid.startsWith('RE')) {
      throw new Error('Invalid recording URL format');
    }
    
    // Get the media URL directly from Twilio client
    const recordingResource = await client.recordings(recordingSid).fetch();
    const mediaUrl = `https://api.twilio.com${recordingResource.mediaUrl}`;
    
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download recording: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const tempFilePath = path.join('/tmp', `recording_${recordingId}.wav`);
    
    // Write to temporary file
    fs.writeFileSync(tempFilePath, Buffer.from(audioBuffer));

    // Transcribe using OpenAI Whisper
    const audioReadStream = fs.createReadStream(tempFilePath);
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: "en", // Assuming English for scam calls
    });

    // Update the recording with transcription
    await storage.updateCallRecording(recordingId, {
      transcriptionText: transcription.text,
      isProcessed: true,
    });

    // Clean up temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    console.log(`Transcription completed for recording ${recordingId}`);
  } catch (error) {
    console.error(`Failed to transcribe recording ${recordingId}:`, error);
    
    // Mark as processed even if failed to avoid retry loops
    await storage.updateCallRecording(recordingId, {
      isProcessed: true,
    });
  }
}

export async function processUnprocessedRecordings(): Promise<void> {
  const unprocessedRecordings = await storage.getUnprocessedRecordings();
  
  for (const recording of unprocessedRecordings) {
    await transcribeCallRecording(recording.id);
  }
}

// Analyze transcription for scam patterns and keywords
export async function analyzeTranscription(transcriptionText: string): Promise<{
  scamType: string;
  confidence: string;
  keywords: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing phone call transcriptions to identify scam patterns. 
          Analyze the provided transcription and identify:
          1. The type of scam being attempted
          2. Your confidence level (high/medium/low)
          3. Key scam-related keywords or phrases
          
          Respond with JSON in this format: { "scamType": "string", "confidence": "high|medium|low", "keywords": ["string"] }`
        },
        {
          role: "user",
          content: `Analyze this call transcription for scam patterns:\n\n${transcriptionText}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      scamType: analysis.scamType || "Unknown",
      confidence: analysis.confidence || "low",
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords : []
    };
  } catch (error) {
    console.error("Failed to analyze transcription:", error);
    return {
      scamType: "Unknown",
      confidence: "low",
      keywords: []
    };
  }
}