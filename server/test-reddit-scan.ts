// Manual Reddit scan test to demonstrate clickbait detection
export async function testRedditScan() {
  console.log('🔍 Testing Reddit scan for clickbait content...');
  
  try {
    const response = await fetch('https://www.reddit.com/r/todayilearned/hot.json?limit=10', {
      headers: {
        'User-Agent': 'PackieAI:v1.0 (Anti-scam education tool)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data?.data?.children) {
      console.log(`Found ${data.data.children.length} posts from r/todayilearned`);
      
      const { detectClickbait } = await import('./facebook-monitor');
      
      for (const child of data.data.children) {
        const post = child.data;
        const fullText = `${post.title} ${post.selftext || ''}`;
        
        const detection = detectClickbait(fullText);
        
        if (detection.isClickbait && detection.confidence > 30) {
          console.log(`🚨 CLICKBAIT DETECTED:`);
          console.log(`  Title: ${post.title}`);
          console.log(`  Confidence: ${detection.confidence}%`);
          console.log(`  URL: https://reddit.com${post.permalink}`);
          console.log(`  Reasons: ${detection.reasons.join(', ')}`);
          
          // Generate educational response
          const prompt = `Create a brief, educational comment for this Reddit post that might be clickbait:
Title: "${post.title}"
Be helpful and promote digital literacy. Keep it under 100 words.`;
          
          const openai = (await import('openai')).default;
          const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
          
          const completion = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
            temperature: 0.7
          });
          
          const response = completion.choices[0].message.content || '';
          console.log(`  Suggested Response: ${response}`);
          console.log(`  PackieAI Tag: #FactCheck #PackieAI\n`);
          
          // For now, just log what we would do - don't actually post
          console.log('ℹ️  Would post educational comment if Reddit API permissions allowed posting');
          return true; // Found and processed clickbait
        }
      }
      
      console.log('✅ Scan complete - no high-confidence clickbait detected');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Reddit scan failed:', error);
    return false;
  }
}