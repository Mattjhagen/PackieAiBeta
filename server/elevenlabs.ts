import fetch from 'node-fetch';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

// ElevenLabs voice IDs for realistic elderly personas
const VOICE_MAPPING = {
  Margaret: 'XrExE9yKIg1WjnnlVkGX', // Matilda - elderly female voice
  Bob: 'pqHfZKP75CvOlQylNhV4', // George - older male voice  
  Linda: 'oWAxZDx7w5VEj9dCyTzz', // Grace - middle-aged female voice
  Frank: 'bVMeCyTHy58xNoL34h3p', // Jeremy - mature male voice
};

export async function generateElevenLabsAudio(text: string, voiceId: string): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export function getVoiceForPersona(personaName: string): string {
  return VOICE_MAPPING[personaName as keyof typeof VOICE_MAPPING] || VOICE_MAPPING.Margaret;
}

export async function testElevenLabsConnection(): Promise<boolean> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('ElevenLabs connection test failed:', error);
    return false;
  }
}