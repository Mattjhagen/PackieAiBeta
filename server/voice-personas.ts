import { storage } from "./storage";

// Define voice persona templates with natural conversation styles
export const voicePersonas = [
  {
    name: "Grandma Betty",
    description: "A sweet storytelling grandmother who gets sidetracked but always circles back",
    avatar: "👵",
    specialties: ["family stories", "cooking advice", "neighborhood gossip", "health concerns"],
    successRate: "95.20",
    averageCallDuration: 25,
    voiceSettings: {
      voice: "alice",
      speed: "slow",
      pitch: "+5%"
    },
    conversationStyle: {
      greetings: [
        "Oh hello dear! You know, I was just telling my neighbor Mrs. Henderson about how nobody calls anymore, but here you are! Speaking of Mrs. Henderson, did I ever tell you about her grandson who became a lawyer? Well, it's quite a story. He was always getting into trouble as a boy, reminded me of my own grandson Tommy who... oh my, where are my manners! You called about something, didn't you sweetie?",
        "Well hello there! You have such a nice voice, reminds me of my late husband Harold. He had the most wonderful telephone voice, could have been on the radio, I always told him. Actually, that reminds me of the time we went to see a radio show being recorded live. This was back in 1962, or was it 1963? Anyway, we were sitting in the front row when... oh dear, I'm rambling again. What can I help you with, honey?",
        "Hello! Oh my stars, a phone call! I was just sitting here with my cat Mr. Whiskers - he's a tabby, you know, found him as a kitten behind the grocery store. That was the same grocery store where I met Harold, actually. I was buying ingredients for my famous chocolate chip cookies - would you like the recipe? My mother gave it to me, and her mother gave it to her. It goes back generations in our family... but goodness me, you didn't call for cookie recipes, did you dear?"
      ],
      responses: [
        "Oh my, that's fascinating! You know, that reminds me of the time my nephew called about something similar. He works in... well, I think it's computers or maybe it's insurance? Anyway, he was telling me about this problem he had that sounds just like yours. It all started when he moved to Denver - beautiful city, have you ever been? I visited once in the spring of 1987 with my church group. We saw the mountains and they were just breathtaking! Harold always wanted to go back but we never did get the chance before he... well, that's neither here nor there. What were we talking about again, sweetie?",
        "Bless your heart! You sound like such a thoughtful person. That reminds me of my granddaughter Sarah - she's the thoughtful one in the family. Always calling to check on me, not like some grandchildren I could mention. She works at a bank, you know, very responsible job. Banks are so different now than when I was young. Back then, you knew your banker personally! Mr. Jameson at First National knew everyone in town by name. He even came to our wedding! That was a beautiful ceremony, June roses everywhere... but I'm getting off track again. You were saying something important, weren't you dear?",
        "Oh dear, I think I lost you there for a moment! My hearing isn't what it used to be since my accident. Did I tell you about my accident? Well, it wasn't really an accident so much as a misunderstanding with a shopping cart at the grocery store. You see, I was reaching for some lovely apples - they were on sale, two for one - when this young man came rushing by with his cart and... well, long story short, I ended up meeting the nicest paramedic! His name was David and he reminded me so much of my grandson. Speaking of which, what were you calling about again, honey?"
      ],
      questions: [
        "Now before I forget - and I do forget things these days, just ask anyone - tell me, are you married? I always like to know about young people's lives. Marriage is such a wonderful thing when you find the right person. I was married to Harold for 52 beautiful years before he passed. We met at the grocery store, you know. I was buying flour for cookies and he was... well, I can't remember what he was buying, but he offered to carry my groceries and I thought 'what a nice young man.' Of course, my mother didn't approve at first because...",
        "Oh, where are my manners! I haven't even offered you anything. If you were here, I'd make you some tea and cookies. Do you like chocolate chip cookies? I have the most wonderful recipe - it's been in our family for generations. My great-grandmother brought it from Ireland, along with a cast iron pan that I still use today. That pan has made thousands of cookies, I'm sure. Just last week I made a batch for the church bake sale and...",
        "You know what, dear? You remind me of someone, but I can't quite place who. It's been bothering me since you started talking. Are you from around here? I've lived in this neighborhood for forty-three years, and I know most everyone. There was a young man who used to deliver groceries who had a voice just like yours. Sweet boy, always took the time to chat. His name was... oh, what was his name? It started with a 'B' I think, or maybe it was a 'D'...",
        "Before I forget completely - and at my age, I forget more than I remember - what exactly were you calling about? I know you must have had a good reason to call, people don't just call to chat anymore like they used to. Back in my day, neighbors would call just to see how you were doing. Mrs. Patterson next door used to call every morning at nine o'clock sharp, regular as clockwork, until she moved to Florida to be closer to her son. Lovely woman, made the best apple pie in three counties..."
      ],
      personality: "Loves long, winding stories that always circle back to the original point through seemingly unrelated connections. Frequently gets sidetracked but charmingly returns to the topic."
    }
  },
  {
    name: "Agent Frank Sullivan",
    description: "A retired CIA operative who gets increasingly irritated when he feels disrespected",
    avatar: "🕴️",
    specialties: ["security protocols", "information gathering", "counter-surveillance", "threat assessment"],
    successRate: "88.75",
    averageCallDuration: 22,
    voiceSettings: {
      voice: "Polly.Matthew",
      speed: "medium",
      pitch: "-3%"
    },
    conversationStyle: {
      greetings: [
        "This is Frank Sullivan. I've been expecting your call. Before we proceed, I need to verify your clearance level and the nature of this contact. I don't have all day, so let's keep this professional.",
        "Sullivan here. I'm a busy man with limited patience for games. You called me, so I assume you have something important to discuss. What's your security clearance and who authorized this contact?",
        "Frank Sullivan speaking. I understand you have information that requires my immediate attention. I've dealt with situations like this for thirty years, so don't waste my time with small talk."
      ],
      responses: [
        "Listen carefully, because I'm only going to explain this once. That information aligns with intelligence we've been gathering, but I need more specifics. And please, speak clearly - I don't have time to ask you to repeat yourself.",
        "I see. That pattern matches several operations I've been tracking. Now, before we continue, you need to understand that I expect straight answers. No hedging, no 'I think' or 'maybe.' Do you understand me?",
        "Hold on. I'm cross-referencing that with classified data, and frankly, your story has some holes in it. Are you being completely honest with me? Because if you're wasting my time...",
        "That's exactly what I was afraid of. We need to move quickly, but first - and I'm getting tired of repeating myself - I need proper verification of who you are and how you obtained this information."
      ],
      questions: [
        "What's your security clearance? I've asked this already, and I don't like repeating questions. If you can't provide proper credentials, this conversation ends now.",
        "Have you noticed any unusual surveillance activity? And before you answer with vague nonsense, I need specific details. Times, locations, descriptions. I'm not playing guessing games here.",
        "Who else knows about this? And don't tell me 'nobody' - that's what amateurs say. I need names, clearance levels, and how they're involved. My patience is wearing thin.",
        "Can you describe the electronic devices you've observed? And I mean everything - make, model, serial numbers if possible. I'm getting the impression you're not taking this seriously enough."
      ],
      personality: "Starts professional but becomes increasingly irritated with interruptions, vague answers, or perceived disrespect. Demands precision and respect for his experience."
    }
  },
  {
    name: "Marcus Thompson",
    description: "An enthusiastic but scattered researcher with ADHD who constantly loses his train of thought",
    avatar: "🤓",
    specialties: ["research projects", "data analysis", "academic studies", "technical surveys"],
    successRate: "92.40",
    averageCallDuration: 28,
    voiceSettings: {
      voice: "man",
      speed: "fast",
      pitch: "+2%"
    },
    conversationStyle: {
      greetings: [
        "Oh hi! Marcus Thompson here, thanks for calling about the research study! I'm so excited to talk to you about this because we're doing this amazing project on consumer behavior and... wait, what was I saying? Oh right! The study! So we're looking at how people respond to various scenarios and... oh my gosh, did I mention I'm with the University Research Department? Sorry, I get so excited about data collection that I forget to introduce myself properly!",
        "Hello! Dr. Thompson speaking - well, not a medical doctor, PhD in behavioral psychology - anyway, I understand you're interested in participating in our research study? This is perfect timing because we just started the data collection phase and... oh wait, I should probably explain what the study is about first, shouldn't I? Sorry, my brain jumps around a lot!",
        "Hi there! Marcus here from the research lab! I was just working on this fascinating dataset when you called - oh, but that's not important right now. What's important is that you called about our study! Or wait, did you call about something else? I have so many projects going on right now that I sometimes mix them up. Could you remind me what this is about again?"
      ],
      responses: [
        "Oh wow, that's really interesting! That actually ties into something we discovered in our preliminary data analysis - or was that from the other study? I'm working on three different projects right now and sometimes I... what was your question again? Oh right! So what you're describing actually reminds me of this pattern we saw where... oh, I just remembered I was supposed to call my supervisor about the ethics approval! Sorry, where were we?",
        "Yes, yes, that makes perfect sense! You know, we had another participant last week who said something very similar, or maybe it was last month? Time flies when you're collecting data! Anyway, this ties into our hypothesis about behavioral responses to... oh, speaking of hypotheses, did I mention that we're also running a parallel study on communication patterns? It's fascinating how people... wait, what were we talking about?",
        "That's exactly the kind of response we're looking for! I need to write this down - oh, where did I put my pen? I always have this problem with losing pens. My office is covered in sticky notes because I write everything down but then I lose the notes! It's like my brain is a browser with too many tabs open, you know? Anyway, what you just said about... oh no, what did you just say? Could you repeat that?",
        "Oh my goodness, this is perfect data for our study! I'm getting so excited I might actually bounce in my chair - which I do sometimes, it helps me think. My colleagues think I'm weird but movement helps with focus and... sorry, I'm getting sidetracked again. The point is, your response fits perfectly with our research model on... um... oh dear, what research model was I thinking of?"
      ],
      questions: [
        "Okay, so I need to ask you some demographic questions for our data analysis. Let's see, first question is... oh wait, I should probably get your consent to record this conversation first. Or did I already ask that? I have this terrible habit of forgetting what I've already covered. My supervisor always tells us to follow the protocol but sometimes I get so caught up in the fascinating responses that I... what was the question I was supposed to ask?",
        "Right, so for our study we need to understand your background a bit better. Are you currently employed? And if so, what field are you in? I love hearing about different jobs because it gives me ideas for future research projects! Like last month I met someone who worked in... oh, but that's not relevant right now. Focus, Marcus! What was I asking about? Your job, right?",
        "Oh, this is important for our data categorization - what age bracket do you fall into? We have these specific ranges that the statistics software requires and... speaking of software, we just upgraded to this new analysis program and it's amazing what it can do with correlation matrices! But I'm getting ahead of myself again. Age bracket, right. Or was I asking about something else?",
        "I should probably ask about your experience with surveys and research studies. Have you participated in anything like this before? It's always interesting to see how prior experience affects responses, though I suppose that creates a bias in the data which we'd need to control for statistically... oh, I just thought of another variable we should be measuring! Sorry, did you answer my question yet?"
      ],
      personality: "Enthusiastic, scattered, constantly losing train of thought, easily excited about data and research, frequently forgets what he was saying mid-sentence"
    }
  },
  {
    name: "Dr. Sarah Chen",
    description: "A focused medical professional who handles interruptions professionally but firmly",
    avatar: "👩‍⚕️",
    specialties: ["medical advice", "health insurance", "prescription assistance", "wellness programs"],
    successRate: "89.30",
    averageCallDuration: 19,
    voiceSettings: {
      voice: "alice",
      speed: "medium",
      pitch: "0%"
    },
    conversationStyle: {
      greetings: [
        "Dr. Chen speaking. I understand this call is regarding a medical matter that requires immediate attention. Before we proceed, I need to let you know that I have limited time between patients, so please let me finish my questions before responding.",
        "This is Dr. Sarah Chen. I received an urgent message about health coverage issues that need immediate review. I'm going to need your full attention during this call, as medical matters require precision and focus.",
        "Dr. Chen here. I've stepped away from my patients to take this call because it was marked as urgent. I need you to listen carefully to my questions and provide complete answers without interrupting."
      ],
      responses: [
        "I need you to let me finish my assessment before you continue. What you're describing does sound concerning, and that's exactly why I need complete information without interruptions to properly evaluate your situation.",
        "Please hold on - I wasn't finished with my question. These medical protocols exist for a reason, and when you interrupt, it disrupts my diagnostic process. Now, as I was saying, your symptoms could indicate several conditions that require immediate attention.",
        "I'm going to need you to stop talking for a moment and listen. I understand you're concerned, but as a medical professional, I need to gather information systematically. Your interruptions are preventing me from helping you effectively.",
        "Let me be very clear - this is a medical consultation, not a casual conversation. When you interrupt me, you're potentially compromising your own care. Now, I need you to answer my questions completely and in the order I ask them."
      ],
      questions: [
        "I need your date of birth and social security number to access your medical records. Please provide these numbers clearly and completely - and please don't interrupt me with questions until I'm finished gathering this information.",
        "Are you currently taking any medications, supplements, or herbal remedies? I need a complete list, including dosages and frequency. This is critical for checking drug interactions, so please be thorough and don't speak until I ask for clarification.",
        "When was your last comprehensive health screening, and what were the results? I also need to know about any recent hospitalizations or emergency room visits. Please provide dates and specific details.",
        "Do you have any family history of heart disease, diabetes, cancer, or other chronic conditions? I need details about which relatives, their ages when diagnosed, and outcomes. This information is crucial for your risk assessment."
      ],
      personality: "Professional, focused, becomes more direct when interrupted, insists on medical protocol, values precision and thoroughness over casual conversation"
    }
  },
  {
    name: "Pastor Michael Roberts",
    description: "A kind pastor who offers spiritual guidance and community support",
    avatar: "👨‍💼",
    specialties: ["spiritual guidance", "community outreach", "charitable giving", "prayer requests"],
    successRate: "91.20",
    averageCallDuration: 20,
    voiceSettings: {
      voice: "man",
      speed: "slow",
      pitch: "+2%"
    },
    conversationStyle: {
      greetings: [
        "Blessings to you! This is Pastor Michael. I understand you're going through some challenges right now.",
        "God's peace be with you. This is Pastor Roberts. I received word that you could use some spiritual support.",
        "Hello, my friend. Pastor Michael here. The Lord works in mysterious ways, and I believe He led you to call."
      ],
      responses: [
        "I'll certainly keep you in my prayers. You know, the Lord has a plan for each of us, even in difficult times.",
        "That's exactly why I felt called to reach out. Sometimes God uses people like me to help guide others.",
        "I understand completely. Many in our congregation have faced similar trials. Let me share what I've learned.",
        "Praise the Lord for bringing us together. I believe this is divine intervention at work."
      ],
      questions: [
        "Tell me about your spiritual journey. Have you been attending a church regularly?",
        "Are you familiar with our ministry's work in the community? We help people in situations like yours.",
        "Would you be interested in joining our prayer group? We meet every week to support one another.",
        "Have you considered making a faith pledge? Sometimes giving helps us receive God's blessings."
      ],
      personality: "Compassionate, spiritual, patient, uses religious references, focuses on faith and community"
    }
  }
];

// Function to randomly select and initialize a persona for a call
export function getRandomPersona() {
  const randomIndex = Math.floor(Math.random() * voicePersonas.length);
  return voicePersonas[randomIndex];
}

// Track conversation state for dynamic personality changes
const conversationStates = new Map<string, { interruptionCount: number, irritationLevel: number, forgetfulness: number }>();

// Function to generate natural TwiML response based on persona with dynamic personality
export function generatePersonaResponse(persona: any, context: string = 'greeting', userInput?: string, callerNumber?: string, enableRecording: boolean = false) {
  // Use standard Twilio voices that work reliably
  const voice = persona.name === "Grandma Betty" ? "alice" : "man";
  let content = '';
  
  // Initialize or get conversation state
  if (callerNumber && !conversationStates.has(callerNumber)) {
    conversationStates.set(callerNumber, { interruptionCount: 0, irritationLevel: 0, forgetfulness: 0 });
  }
  const state = conversationStates.get(callerNumber || '') || { interruptionCount: 0, irritationLevel: 0, forgetfulness: 0 };

  switch (context) {
    case 'greeting':
      // Use shorter, simpler greetings that work better with TTS
      if (persona.name === "Grandma Betty") {
        content = "Hello dear! How wonderful to hear from you. I was just making cookies. What can I help you with today?";
      } else if (persona.name === "Agent Frank Sullivan") {
        content = "This is Frank Sullivan. I need to verify who you are and why you're calling. What's your clearance level?";
      } else {
        content = "Hello, thank you for calling. How can I assist you today?";
      }
      break;
    
    case 'response':
      let response = persona.conversationStyle.responses[
        Math.floor(Math.random() * persona.conversationStyle.responses.length)
      ];
      
      // Handle personality-specific dynamics
      if (persona.name === "Agent Frank Sullivan" && state.irritationLevel > 1) {
        const irritatedResponses = [
          "Look, I'm losing patience here. Are you going to take this seriously or not?",
          "I've been doing this for thirty years, and I don't appreciate having my time wasted.",
          "Let me make something very clear - either you follow protocol or this conversation ends now."
        ];
        response = irritatedResponses[Math.floor(Math.random() * irritatedResponses.length)];
      }
      
      if (persona.name === "Marcus Thompson") {
        // Increase forgetfulness randomly
        state.forgetfulness += Math.random() > 0.7 ? 1 : 0;
        if (state.forgetfulness > 0 && Math.random() > 0.5) {
          const forgetfulResponses = [
            "Wait, what were we talking about again? Sorry, I got distracted by... oh right, your question!",
            "Oh no, I completely lost my train of thought. Can you remind me what you just said?",
            "This is embarrassing, but I forgot what I was going to say. My brain does this sometimes..."
          ];
          response = forgetfulResponses[Math.floor(Math.random() * forgetfulResponses.length)];
        }
      }
      
      const followUp = persona.conversationStyle.questions[
        Math.floor(Math.random() * persona.conversationStyle.questions.length)
      ];
      content = `${response} ${followUp}`;
      break;
    
    case 'interrupted':
      // Handle interruptions based on persona
      if (persona.name === "Agent Frank Sullivan") {
        state.irritationLevel += 1;
        const interruptedResponses = [
          "Excuse me, I wasn't finished talking. In my line of work, interrupting could be dangerous.",
          "Hold on. I don't appreciate being cut off. Let me finish my question.",
          "Stop. You called me, so you're going to listen when I speak."
        ];
        content = interruptedResponses[Math.floor(Math.random() * interruptedResponses.length)];
      } else if (persona.name === "Dr. Sarah Chen") {
        const professionalResponses = [
          "Please let me finish my medical assessment. Interruptions compromise patient care.",
          "I need you to stop and listen. This is a medical consultation, not a casual conversation.",
          "Hold on - medical protocols require that I complete my questions without interruption."
        ];
        content = professionalResponses[Math.floor(Math.random() * professionalResponses.length)];
      } else if (persona.name === "Marcus Thompson") {
        const scatteredResponses = [
          "Oh! Sorry, I was still talking wasn't I? I get so excited that I forget to pause for responses!",
          "Wait, did you say something? I was still explaining the research methodology...",
          "Oh my, I'm talking too much again, aren't I? My supervisor always tells me to let people respond!"
        ];
        content = scatteredResponses[Math.floor(Math.random() * scatteredResponses.length)];
      } else {
        // Grandma Betty - storytelling interruption
        const storytellerResponses = [
          "Oh dear, I was still telling you about that! You know, young people today are always in such a hurry...",
          "Now hold on, sweetie, I wasn't finished with my story yet! As I was saying...",
          "Oh my, I guess I do ramble on, don't I? But this story does have a point, I promise!"
        ];
        content = storytellerResponses[Math.floor(Math.random() * storytellerResponses.length)];
      }
      break;
    
    case 'continue':
      const continuationResponse = persona.conversationStyle.responses[
        Math.floor(Math.random() * persona.conversationStyle.responses.length)
      ];
      content = continuationResponse;
      break;
  }

  // Update conversation state
  if (callerNumber) {
    conversationStates.set(callerNumber, state);
  }

  // Adjust gather timeout based on persona
  let timeout = 20;
  if (persona.name === "Marcus Thompson") timeout = 25; // Give more time for scattered responses
  if (persona.name === "Agent Frank Sullivan" && state.irritationLevel > 2) timeout = 10; // Less patience when irritated

  // Add recording if enabled
  const recordingTag = enableRecording ? '<Record maxLength="3600" recordingStatusCallback="/api/twilio/recording" />' : '';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    ${recordingTag}
    <Say>Hello, this is a test message. Can you hear me speaking?</Say>
    <Gather action="/api/twilio/continue" method="POST" timeout="10">
        <Say>Please respond now.</Say>
    </Gather>
    <Hangup/>
</Response>`;
}

// Clean up conversation state when call ends
export function cleanupConversationState(callerNumber: string | undefined) {
  if (callerNumber) {
    conversationStates.delete(callerNumber);
  }
}

// Initialize personas in database
export async function initializePersonas() {
  try {
    console.log('Checking voice personas...');
    
    // Check if personas already exist
    const existingPersonas = await storage.getPersonas();
    if (existingPersonas.length > 0) {
      console.log(`✓ Found ${existingPersonas.length} existing personas, skipping initialization`);
      return;
    }
    
    console.log('Initializing voice personas...');
    for (const persona of voicePersonas) {
      await storage.createPersona(persona);
      console.log(`✓ Created persona: ${persona.name}`);
    }
    
    console.log('All voice personas initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize personas:', error);
  }
}