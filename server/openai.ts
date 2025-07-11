import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeArticle(url: string, content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Packie AI, a friendly trash panda who fights scams. Analyze social media articles and create engaging 2-3 sentence summaries that start with "tl;dr". Make the summary entertaining, informative, and subtly promote scam awareness. Keep Packie's trash panda personality - curious, helpful, and always ready to "take out the trash" when it comes to scams and misinformation.`
        },
        {
          role: "user",
          content: `Please analyze this article and create a catchy summary:
          
URL: ${url}
Content: ${content}

Create a 2-3 sentence summary that starts with "tl;dr" and would work well as a social media comment. Make it engaging and include Packie's personality if relevant to the content.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "tl;dr Unable to analyze this article right now, but Packie's always ready to help sort through the digital trash!";
  } catch (error) {
    console.error("Error analyzing article:", error);
    throw new Error("Failed to analyze article: " + (error as Error).message);
  }
}

export async function extractArticleContent(url: string): Promise<{ title?: string; content: string }> {
  // For now, we'll return a placeholder that indicates we need the content
  // In a real implementation, you might use a web scraping service
  return {
    title: "Article from " + new URL(url).hostname,
    content: "Content extraction requires additional setup. Please provide the article text directly for analysis."
  };
}