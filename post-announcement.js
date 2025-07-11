// Quick script to post PackieAI announcement to X
import { TwitterApi } from 'twitter-api-v2';

async function postAnnouncement() {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const tweet = "🗑️ PackieAI is coming! Our AI-powered trash panda will soon be detecting and responding to clickbait content across social media with helpful, factual summaries. Fighting misinformation one post at a time! #AI #FactCheck #PackieAI";

    const result = await client.v2.tweet(tweet);
    console.log('Tweet posted successfully!');
    console.log('Tweet ID:', result.data.id);
    console.log('Tweet text:', result.data.text);
    
    return result;
  } catch (error) {
    console.error('Error posting tweet:', error);
    if (error.code === 429) {
      console.log('Rate limit hit. Please try again in a few minutes.');
    }
    throw error;
  }
}

postAnnouncement().catch(console.error);