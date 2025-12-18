import OpenAI from 'openai';
import { NewsArticle, SentimentResult } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SENTIMENT_PROMPT = `You are a highly intelligent and accurate sentiment analyzer specializing in cryptocurrency markets. Analyze the sentiment of the provided text using a two-part approach:

1. Short-Term Sentiment:
   - Evaluate the immediate market reaction, recent news impact, and technical volatility.
   - Determine a sentiment category: "Positive", "Neutral", or "Negative".
   - Calculate a numerical score between -1 (extremely negative) and 1 (extremely positive).
   - Provide a concise rationale explaining the short-term sentiment (give a detailed response with appropriate headlines for major events, and cryptocurrencies).

2. Long-Term Sentiment:
   - Evaluate the overall market outlook, fundamentals, and regulatory or macroeconomic factors.
   - Determine a sentiment category: "Positive", "Neutral", or "Negative".
   - Calculate a numerical score between -1 (extremely negative) and 1 (extremely positive).
   - Provide a detailed rationale explaining the long-term sentiment (give a detailed response with appropriate headlines for major events, and cryptocurrencies).

Your output must be exactly a JSON object with exactly two keys: "shortTermSentiment" and "longTermSentiment". The value of each key must be an object with three keys: "category", "score", and "rationale". Do not output any additional text.

For example, your output should look like:
{
  "shortTermSentiment": {
    "category": "Positive",
    "score": 0.7,
    "rationale": "....."
  },
  "longTermSentiment": {
    "category": "Neutral",
    "score": 0.0,
    "rationale": "....."
  }
}`;

export async function analyzeSentiment(
  articles: NewsArticle[]
): Promise<SentimentResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, using mock sentiment');
    return getMockSentiment();
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SENTIMENT_PROMPT,
        },
        {
          role: 'user',
          content: `Now, analyze the following text and produce your JSON output:\n${JSON.stringify(articles)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Safely parse JSON with error handling
    let result: SentimentResult;
    try {
      result = JSON.parse(content) as SentimentResult;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw content:', content.substring(0, 500));
      return getMockSentiment();
    }

    // Validate required fields exist
    if (!result.shortTermSentiment || !result.longTermSentiment) {
      console.error('Invalid sentiment structure in OpenAI response');
      return getMockSentiment();
    }

    return result;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return getMockSentiment();
  }
}

function getMockSentiment(): SentimentResult {
  return {
    shortTermSentiment: {
      category: 'Positive',
      score: 0.65,
      rationale:
        'Recent ETF inflows and institutional adoption continue to drive positive sentiment. Bitcoin holding above key support levels with increasing volume suggests bullish momentum in the near term.',
    },
    longTermSentiment: {
      category: 'Positive',
      score: 0.45,
      rationale:
        'Long-term fundamentals remain strong with growing institutional adoption and regulatory clarity improving globally. However, macroeconomic uncertainties and potential rate changes could introduce volatility.',
    },
  };
}
