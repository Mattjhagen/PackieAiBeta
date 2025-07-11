import { Express } from 'express';
import { generateElevenLabsAudio, getVoiceForPersona } from './elevenlabs';
import { truecallerService } from './truecaller-integration';

// Vulnerable and compliant persona definitions that appear easily scammed
const personas = [
  {
    name: "Margaret",
    voice: "Polly.Joanna",
    prosody: { rate: "slow", pitch: "+5%" },
    greeting: "Hello?"
  },
  {
    name: "Bob", 
    voice: "Polly.Matthew",
    prosody: { rate: "medium", pitch: "-3%" },
    greeting: "Hello, this is Bob."
  },
  {
    name: "Linda",
    voice: "Polly.Kimberly", 
    prosody: { rate: "fast", pitch: "+8%" },
    greeting: "Hi, Linda speaking."
  },
  {
    name: "Frank",
    voice: "Polly.Joey",
    prosody: { rate: "medium", pitch: "-5%" },
    greeting: "Hello there."
  }
];

// Track active calls and their assigned personas with persistence
const activeCallPersonas = new Map<string, any>();

// Track conversation state with timestamps for persistence
interface ConversationState {
  persona: any;
  conversationHistory: string[];
  lastCallTime: number;
  callCount: number;
}

const conversationStates = new Map<string, ConversationState>();

// Clean up old conversation states (older than 15 minutes)
function cleanupOldConversations() {
  const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);
  const expiredCallers: string[] = [];
  
  conversationStates.forEach((state, callerNumber) => {
    if (state.lastCallTime < fifteenMinutesAgo) {
      expiredCallers.push(callerNumber);
    }
  });
  
  expiredCallers.forEach(callerNumber => {
    conversationStates.delete(callerNumber);
    console.log(`🧹 Cleaned up conversation state for ${callerNumber}`);
  });
}

// Run cleanup every 5 minutes
setInterval(cleanupOldConversations, 5 * 60 * 1000);

// Cache for generated audio files
const audioCache = new Map<string, Buffer>();

// Generate audio using ElevenLabs and cache it
async function getPersonaAudio(personaName: string, text: string): Promise<string | null> {
  const cacheKey = `${personaName}_${text.slice(0, 50)}`;
  
  try {
    if (!audioCache.has(cacheKey)) {
      const voiceId = getVoiceForPersona(personaName);
      const audioBuffer = await generateElevenLabsAudio(text, voiceId);
      audioCache.set(cacheKey, audioBuffer);
    }
    
    // Return URL where Twilio can access the audio
    return `/api/audio/${encodeURIComponent(cacheKey)}`;
  } catch (error) {
    console.error('ElevenLabs audio generation failed:', error);
    // Fallback to Polly if ElevenLabs fails
    return null;
  }
}

// Export function to get current active calls for API
export function getCurrentActiveCalls() {
  const activeCalls: any[] = [];
  let callId = 1;
  
  Array.from(activeCallPersonas.entries()).forEach(([phoneNumber, persona]) => {
    activeCalls.push({
      id: callId++,
      personaId: persona.name === "Margaret" ? 1 : persona.name === "Bob" ? 2 : persona.name === "Linda" ? 3 : 4,
      scammerNumber: phoneNumber,
      status: 'active',
      duration: Math.floor(Math.random() * 300) + 30,
      scamType: 'honeypot_trap',
      lastResponse: `${persona.name}: In conversation with caller`,
      endedAt: null,
      recordingUrl: null,
      transcript: null,
      keywords: [persona.name, 'active'],
      confidence: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
  
  return activeCalls;
}

// Temporary verification mode for Google Voice setup
let verificationMode = false; // Disabled - back to normal personas
const verificationCode = "591384"; // Updated 6-digit code for Google Voice verification

// Function to enable verification mode temporarily
function enableVerificationMode() {
  verificationMode = true;
  console.log(`🔐 Verification mode enabled. Code: ${verificationCode}`);
  // Auto-disable after 15 minutes
  setTimeout(() => {
    verificationMode = false;
    console.log("🔐 Verification mode disabled, returning to normal personas");
  }, 15 * 60 * 1000);
}

// Auto-enable verification mode - DISABLED
// enableVerificationMode();

export function setupSimpleWebhook(app: Express) {
  // Enable verification mode endpoint
  app.post('/api/enable-verification', (req, res) => {
    enableVerificationMode();
    res.json({ 
      success: true, 
      code: verificationCode,
      message: "Verification mode enabled for 10 minutes"
    });
  });

  // Twilio webhook with randomized personas OR verification code
  app.post('/api/twilio/voice', async (req, res) => {
    try {
      const { From: callerNumber, CallSid: callId } = req.body;
      console.log(`🎭 Incoming call from: ${callerNumber}, Call ID: ${callId}`);
      
      // Check if in verification mode - forward to cell phone for Google Voice setup
      if (verificationMode) {
        console.log(`📞 Forwarding call to cell phone for Google Voice verification`);
        const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial timeout="20" record="do-not-record">+14029027502</Dial>
    <Say voice="alice">The call could not be completed. Please try again.</Say>
</Response>`;
        res.set('Content-Type', 'text/xml');
        res.send(twimlResponse);
        return;
      }
      
      let selectedPersona;
      let conversationState = conversationStates.get(callerNumber);
      
      if (conversationState) {
        // Continue with existing persona if called within 15 minutes
        selectedPersona = conversationState.persona;
        conversationState.lastCallTime = Date.now();
        conversationState.callCount++;
        console.log(`🔄 Continuing conversation with ${selectedPersona.name} for ${callerNumber} (call #${conversationState.callCount})`);
      } else {
        // Select a new random persona for first-time or expired callers
        selectedPersona = personas[Math.floor(Math.random() * personas.length)];
        conversationState = {
          persona: selectedPersona,
          conversationHistory: [],
          lastCallTime: Date.now(),
          callCount: 1
        };
        conversationStates.set(callerNumber, conversationState);
        console.log(`🎭 New conversation started with ${selectedPersona.name} for caller ${callerNumber}`);
      }
      
      // Store persona for this active call session
      if (callerNumber) {
        activeCallPersonas.set(callerNumber, selectedPersona);
      }
      
      // Generate appropriate greeting based on conversation history
      let greeting;
      if (conversationState.callCount > 1) {
        // Returning caller - natural but showing recognition
        const returningGreetings = [
          `Oh, hello again!`,
          `Hi there, it's you!`,
          `Hello, you called back!`,
          `Oh hi! I was hoping you'd call again.`
        ];
        greeting = returningGreetings[Math.floor(Math.random() * returningGreetings.length)];
      } else {
        greeting = selectedPersona.greeting;
      }
      
      // Generate audio using ElevenLabs for realistic voice
      const cleanGreeting = greeting.replace(/<break[^>]*>/g, '');
      const audioUrl = await getPersonaAudio(selectedPersona.name, cleanGreeting);
      
      // Generate ring count - returning callers get faster pickup (familiarity)
      let ringCount, ringDelay;
      if (conversationState.callCount > 1) {
        // Returning callers: answer faster (1-3 rings) - they're familiar
        ringCount = Math.floor(Math.random() * 3) + 1;
        ringDelay = ringCount * 2.5; // Slightly faster ring timing too
        console.log(`📞 🔄 RETURNING CALLER: Answering quickly after ${ringCount} rings (${ringDelay}s) - ${selectedPersona.name} recognizes the number`);
      } else {
        // New callers: normal ring time (3-7 rings)
        ringCount = Math.floor(Math.random() * 5) + 3;
        ringDelay = ringCount * 3; // Normal ring timing
        console.log(`📞 🆕 NEW CALLER: Normal answering time after ${ringCount} rings (${ringDelay}s) - ${selectedPersona.name} taking time to answer`);
      }
      
      let twimlResponse;
      if (audioUrl) {
        // Use ElevenLabs generated audio with realistic ring delay and recording
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Pause length="${ringDelay}"/>
    <Gather action="/api/twilio/gather" method="POST" timeout="30" input="speech" speechTimeout="auto">
        <Play>https://packieai.replit.app${audioUrl}</Play>
        <Pause length="1"/>
    </Gather>
    <Record action="/api/twilio/recording" method="POST" recordingStatusCallback="/api/twilio/recording-status" playBeep="false" maxLength="3600" transcribe="true" transcribeCallback="/api/twilio/transcription"/>
    <Redirect>/api/twilio/gather</Redirect>
</Response>`;
      } else {
        // Fallback to Polly if ElevenLabs fails, with ring delay and recording
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Pause length="${ringDelay}"/>
    <Gather action="/api/twilio/gather" method="POST" timeout="30" input="speech" speechTimeout="auto">
        <Say voice="${selectedPersona.voice}">
            <prosody rate="${selectedPersona.prosody.rate}" pitch="${selectedPersona.prosody.pitch}">
                ${greeting}
            </prosody>
        </Say>
        <Pause length="1"/>
    </Gather>
    <Record action="/api/twilio/recording" method="POST" recordingStatusCallback="/api/twilio/recording-status" playBeep="false" maxLength="3600" transcribe="true" transcribeCallback="/api/twilio/transcription"/>
    <Redirect>/api/twilio/gather</Redirect>
</Response>`;
      }
      
      res.set('Content-Type', 'text/xml');
      res.send(twimlResponse);
    } catch (error) {
      console.error('Error in persona webhook:', error);
      // Fallback to simple response
      res.set('Content-Type', 'text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">Hello! You've reached PackieAI. One moment please.</Say>
    <Pause length="2"/>
    <Say voice="alice">How can I help you today?</Say>
    <Gather action="/api/twilio/gather" method="POST" timeout="10">
        <Say voice="alice">Please tell me what you're looking for.</Say>
    </Gather>
</Response>`);
    }
  });

  // Serve ElevenLabs audio files
  app.get('/api/audio/:cacheKey', (req, res) => {
    const cacheKey = decodeURIComponent(req.params.cacheKey);
    const audioBuffer = audioCache.get(cacheKey);
    
    if (audioBuffer) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      });
      res.send(audioBuffer);
    } else {
      res.status(404).send('Audio not found');
    }
  });

  // Handle user input/responses
  app.post('/api/twilio/gather', async (req, res) => {
    try {
      const { From: callerNumber, SpeechResult, Digits, CallSid } = req.body;
      const userInput = SpeechResult || Digits || '';
      
      console.log(`📞 === GATHER WEBHOOK CALLED ===`);
      console.log(`📞 From: ${callerNumber}`);
      console.log(`📞 SpeechResult: "${SpeechResult}"`);
      console.log(`📞 Digits: "${Digits}"`);
      console.log(`📞 UserInput: "${userInput}"`);
      console.log(`📞 CallSid: ${CallSid}`);
      console.log(`📞 All active personas:`, Object.fromEntries(activeCallPersonas));
      console.log(`📞 All conversation states:`, Object.fromEntries(conversationStates));
      
      // Ensure we have a conversation state
      let conversationState = conversationStates.get(callerNumber);
      if (!conversationState) {
        // Re-create conversation state if missing
        const selectedPersona = personas[Math.floor(Math.random() * personas.length)];
        conversationState = {
          persona: selectedPersona,
          conversationHistory: [],
          lastCallTime: Date.now(),
          callCount: 1
        };
        conversationStates.set(callerNumber, conversationState);
        activeCallPersonas.set(callerNumber, selectedPersona);
        console.log(`📞 Re-created conversation state with ${selectedPersona.name} for ${callerNumber}`);
      }
      
      // Always respond to keep conversation flowing
      const shouldRespond = true;
      
      // Update conversation history - handle both speech and silence
      if (userInput.trim()) {
        conversationState.conversationHistory.push(`Caller: ${userInput}`);
        console.log(`📞 ✅ User said: "${userInput}"`);
      } else {
        conversationState.conversationHistory.push(`Caller: [silence/unclear]`);
        console.log(`📞 🔇 User was silent or speech unclear`);
      }
      
      // Debug: Check if this is the first response after greeting
      const isFirstResponse = conversationState.conversationHistory.length <= 2;
      console.log(`📞 🔍 Is first response after greeting: ${isFirstResponse}`);
      console.log(`📞 📊 Total conversation history length: ${conversationState.conversationHistory.length}`);
      
      conversationState.lastCallTime = Date.now();
      console.log(`📞 Updated conversation history. Total messages: ${conversationState.conversationHistory.length}`);
      console.log(`📞 Last 3 messages:`, conversationState.conversationHistory.slice(-3));
      
      // Get the persona assigned to this caller
      const persona = activeCallPersonas.get(callerNumber) || conversationState.persona;
      console.log(`📞 Using persona: ${persona ? persona.name : 'NONE'}`);
      
      if (!persona) {
        console.log(`📞 ERROR: No persona found for ${callerNumber}`);
        res.set('Content-Type', 'text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, there seems to be a technical issue. Please call back.</Say>
    <Hangup/>
</Response>`);
        return;
      }

      // Generate persona responses that adapt to what the scammer says
      let personaResponse;
      
      // Check if user input contains common scam keywords
      const userInputLower = userInput.toLowerCase();
      const isScamRelated = /virus|infected|security|microsoft|windows|computer|problem|fix|urgent|suspended|account|bank|refund|money|social security|irs|tax|arrest|warrant|gift card|amazon|apple|google|tech support|error|warning/.test(userInputLower);
      
      // Handle silence or unclear speech
      if (!userInput.trim()) {
        const silenceResponses = {
          "Margaret": ["Hello? Are you still there?", "I can't hear you very well.", "Did you say something?", "The connection might be bad."],
          "Bob": ["Can you repeat that?", "I didn't catch what you said.", "Are you there?", "Speak up, I can't hear you."],
          "Linda": ["Sorry, what was that?", "Could you say that again?", "Hello?", "I think we have a bad connection."],
          "Frank": ["I'm having trouble hearing you.", "What did you say?", "Are you still on the line?", "Can you speak louder?"]
        };
        const personaResponses = silenceResponses[persona.name as keyof typeof silenceResponses] || ["I'm sorry, I didn't hear that clearly."];
        personaResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];
      }
      // Handle scam-related keywords with vulnerable responses
      else if (isScamRelated) {
        const vulnerableResponses = {
          "Margaret": [
            "Oh my goodness, is my computer really infected?",
            "That sounds terrible! What should I do?",
            "I've been wondering why it's been so slow lately.",
            "Can you really help me fix this?",
            "I don't understand computers very well.",
            "Should I be worried about my personal information?"
          ],
          "Bob": [
            "I knew something was wrong with this thing.",
            "My computer has been acting up lately.",
            "How serious is this problem?",
            "What kind of help do you provide?",
            "I'm not very technical, can you walk me through it?",
            "Is this going to cost me anything?"
          ],
          "Linda": [
            "Oh no, I was afraid something like this would happen!",
            "I've been getting so many pop-ups lately.",
            "Can you fix this over the phone?",
            "How did you know I was having problems?",
            "I really need to get this sorted out quickly.",
            "Is my information safe?"
          ],
          "Frank": [
            "I was wondering why my computer was so slow.",
            "That explains all the strange things happening.",
            "Can you really help me with this?",
            "I'm not good with technology stuff.",
            "What do I need to do to fix this?",
            "How much will this cost me?"
          ]
        };
        const personaResponses = vulnerableResponses[persona.name as keyof typeof vulnerableResponses] || ["That sounds concerning. Tell me more."];
        personaResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];
      }
      // General conversational responses
      else {
        const generalResponses = {
          "Margaret": [
            "That's interesting. Tell me more about that.",
            "Oh really? I didn't know that.",
            "Mm-hmm, go on.",
            "I see. What else?",
            "That makes sense, I suppose.",
            "I'm listening, please continue."
          ],
          "Bob": [
            "Uh-huh, okay.",
            "I see what you mean.",
            "That's what I figured.",
            "Right, go ahead.",
            "Okay, I'm following you.",
            "Tell me more about that."
          ],
          "Linda": [
            "Oh wow, really?",
            "That's exactly what I thought!",
            "Interesting, keep going.",
            "I had a feeling about that.",
            "That makes perfect sense.",
            "What else can you tell me?"
          ],
          "Frank": [
            "I was thinking the same thing.",
            "That sounds about right.",
            "Okay, I understand.",
            "That explains a lot.",
            "Go on, I'm listening.",
            "What should I do next?"
          ]
        };
        const personaResponses = generalResponses[persona.name as keyof typeof generalResponses] || ["That's very interesting."];
        personaResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)];
      }
      
      console.log(`📞 Selected response for ${persona.name}: "${personaResponse}"`);
      
      // Add response to conversation history
      if (conversationState) {
        conversationState.conversationHistory.push(`${persona.name}: ${personaResponse}`);
      }
      
      // Generate ElevenLabs audio for the response
      const audioUrl = await getPersonaAudio(persona.name, personaResponse);
      
      let twimlResponse;
      console.log(`📞 Generating TwiML response with audioUrl: ${audioUrl ? 'YES' : 'NO'}`);
      
      if (audioUrl) {
        // Use ElevenLabs generated audio
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>https://packieai.replit.app${audioUrl}</Play>
    <Gather action="/api/twilio/gather" method="POST" timeout="30" input="speech" speechTimeout="auto">
        <Say voice="${persona.voice}">Go ahead, I'm listening.</Say>
    </Gather>
    <Redirect>/api/twilio/gather</Redirect>
</Response>`;
      } else {
        // Fallback to Polly if ElevenLabs fails
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="${persona.voice}">
        <prosody rate="${persona.prosody.rate}" pitch="${persona.prosody.pitch}">
            ${personaResponse}
        </prosody>
    </Say>
    <Gather action="/api/twilio/gather" method="POST" timeout="30" input="speech" speechTimeout="auto">
        <Say voice="${persona.voice}">
            <prosody rate="${persona.prosody.rate}" pitch="${persona.prosody.pitch}">
                Please continue, I'm still here.
            </prosody>
        </Say>
    </Gather>
    <Redirect>/api/twilio/gather</Redirect>
</Response>`;
      }
      
      res.set('Content-Type', 'text/xml');
      res.send(twimlResponse);
      console.log(`📞 Sent TwiML response for ${persona.name}`);
      
    } catch (error) {
      console.error(`📞 Error in gather webhook:`, error);
      res.set('Content-Type', 'text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">I'm sorry, there seems to be a technical issue. Please call back.</Say>
    <Hangup/>
</Response>`);
    }
  });

  // Handle call completion
  app.post('/api/twilio/status', (req, res) => {
    const { From: callerNumber, CallStatus } = req.body;
    
    if (CallStatus === 'completed' && callerNumber) {
      console.log(`📞 Call ended from: ${callerNumber}`);
      // Clean up the persona mapping
      activeCallPersonas.delete(callerNumber);
    }
    
    res.sendStatus(200);
  });

  // Handle recording completion
  app.post('/api/twilio/recording', async (req, res) => {
    const { CallSid, RecordingUrl, RecordingSid, From: callerNumber } = req.body;
    
    console.log(`🎙️ Recording completed for call ${CallSid} from ${callerNumber}`);
    console.log(`🎙️ Recording URL: ${RecordingUrl}`);
    console.log(`🎙️ Recording SID: ${RecordingSid}`);
    
    try {
      // Store the recording information in the database
      const { storage } = await import('./storage');
      
      const recordingData = {
        callSid: CallSid,
        recordingUrl: RecordingUrl,
        recordingSid: RecordingSid,
        callerNumber: callerNumber,
        status: 'completed',
        duration: null,
        transcriptionText: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await storage.createCallRecording(recordingData);
      console.log(`💾 Stored recording data for call ${CallSid}`);
      
    } catch (error) {
      console.error('Error storing recording data:', error);
    }
    
    res.sendStatus(200);
  });

  // Handle recording status updates
  app.post('/api/twilio/recording-status', (req, res) => {
    const { CallSid, RecordingStatus, RecordingSid } = req.body;
    console.log(`🎙️ Recording status update for ${CallSid}: ${RecordingStatus} (${RecordingSid})`);
    res.sendStatus(200);
  });

  // Handle transcription completion
  app.post('/api/twilio/transcription', async (req, res) => {
    const { CallSid, TranscriptionText, TranscriptionSid, RecordingSid } = req.body;
    
    console.log(`📝 Transcription completed for call ${CallSid}`);
    console.log(`📝 Transcription: ${TranscriptionText}`);
    
    try {
      // Update the recording with transcription
      const { storage } = await import('./storage');
      
      // Find the recording by RecordingSid and update with transcription
      const recordings = await storage.getCallRecordings();
      const recording = recordings.find(r => r.recordingSid === RecordingSid);
      
      if (recording) {
        await storage.updateCallRecording(recording.id, {
          transcriptionText: TranscriptionText,
          transcriptionSid: TranscriptionSid,
          updatedAt: new Date()
        });
        console.log(`💾 Updated recording ${recording.id} with transcription`);
      }
      
    } catch (error) {
      console.error('Error updating transcription:', error);
    }
    
    res.sendStatus(200);
  });

  // Test endpoint
  app.get('/webhook-test', (req, res) => {
    res.json({ status: 'Webhook server is running', time: new Date().toISOString() });
  });
}