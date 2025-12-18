import { GoogleGenerativeAI } from '@google/generative-ai';
import { SentimentResult, ExchangeId } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateTradingSignals(
  symbol: string,
  exchange: ExchangeId,
  candleData: { timeframe: string; candles: number[][] }[],
  sentiment: SentimentResult
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using mock analysis');
    return getMockAnalysis(symbol, exchange, candleData);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const now = new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const prompt = `Here is combined market data for ${symbol}USDT for you to reference:

Technical Data:
${JSON.stringify(candleData)}

Sentiment Analysis:
${JSON.stringify(sentiment)}

This is a JSON array where each element is a candlestick data object for a crypto asset. Each object has the following structure:

timeframe: either "5m", "15m", "1h", "4h", "1d" or "1w"
candles: an array of values in the following order:
[openTime, open, high, low, close, volume, closeTime, quoteVolume, trades, takerBuyBaseVolume, takerBuyQuoteVolume, ignore]
Sentiment Data: At the end of the JSON array there is also a long term and short term sentiment analysis based on crypto news headlines for the past 7 days.

Please perform the following steps:

Group the Data:

Group the candlestick objects by timeframe into six groups:

- Short-term data3: "5m" candles
- Short-term data4: "15m" candles
- Medium-term data1: "1h" candles
- Medium-term data2: "4h" candles
- Long-term data1: "1d" candles
- Long-term data2: "1w" candles

Analyze the Data in Detail:

Short-term Analysis:
Use the 5m to 15m candles (with supportive insights from the 1h and 4h candles) to evaluate volatility and determine near-term support and resistance levels. In your analysis, combine traditional lagging indicators (such as MACD, RSI, and OBV) as confirmation tools with direct price action elements—like key support/resistance zones, trendlines, and divergence patterns. Focus on these price-based signals to capture immediate market sentiment and structural levels.

Long-term Analysis:
Use the 1d and 1w candles (and relevant insights from the 1h and 4h candles) to assess the overall market direction and major support/resistance zones. Here, integrate long-term trendlines and divergence signals along with lagging indicators to understand the broader market context and potential structural shifts.

Generate Trading Recommendations:

For Spot Trading:

Action: (buy, sell, or hold)
Entry Price:
Stop-Loss Level:
Take Profit (TP) Level:
Rationale: Provide an extremely detailed explanation of your recommendation. Break down your rationale into three parts:
  a. Primary Signals: Describe key price action insights (support/resistance zones, trendline breakouts or bounces, divergence patterns).
  b. Lagging Indicators: Explain how indicators (MACD, RSI, OBV, etc.) confirm or supplement these signals.
  c. Sentiment Analysis: Discuss volume trends, market sentiment, and macro factors. Combine these elements into one comprehensive explanation.

For Leveraged Trading:

Position: (Long or short)
Recommended Leverage: (e.g., 3x, 5x, etc.)
Entry Price:
Stop-Loss Level:
Take Profit (TP) Level:
Rationale: Provide a detailed explanation that similarly breaks down your rationale into:
    a. Primary Price Action Signals: Outline key support/resistance levels, trendlines, and divergence patterns.
    b. Lagging Indicator Confirmation: Describe how indicators validate these signals.
    c. Sentiment & Macro Analysis: Include analysis of volume trends, overall market sentiment, and broader economic factors.

Output Format:
Return the final result as plain text with consistent styling.

Use clear section headers and organize the information with proper spacing.
Use line breaks between sections for readability.
Do not use any HTML, Markdown, or special characters for formatting.

${symbol}USDT analysis for ${now}
Exchange: ${exchange.toUpperCase()}

Spot Recommendations:

Short-term:
- Action: …
- Entry Price: …
- Stop Loss: …
- Take Profit: …
- Rationale: …
  – Primary Signals: …
  – Lagging Indicators: …
  – Sentiment Analysis: …

Long-term:
- Action: …
- Entry Price: …
- Stop Loss: …
- Take Profit: …
- Rationale: …
  – Primary Signals: …
  – Lagging Indicators: …
  – Sentiment Analysis: …

Leveraged Recommendations:

Short-term:
Position: ...
Leverage: ...
Entry Price: ...
Stop Loss: ...
Take Profit: ...
Rationale:
  – Primary Price Action Signals: ...
  – Lagging Indicator Confirmation: ...
  – Sentiment & Macro Analysis: ...

Long-term:
Position: ...
Leverage: ...
Entry Price: ...
Stop Loss: ...
Take Profit: ...
Rationale:
  – Primary Price Action Signals: ...
  – Lagging Indicator Confirmation: ...
  – Sentiment & Macro Analysis: ...`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generating trading signals:', error);
    return getMockAnalysis(symbol, exchange, candleData);
  }
}

function getMockAnalysis(
  symbol: string,
  exchange: ExchangeId,
  candleData: { timeframe: string; candles: number[][] }[]
): string {
  const now = new Date().toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Extract price data from candles - try to get the most recent close price
  let currentPrice = 0;
  let high24h = 0;
  let low24h = 0;

  // Try to find candle data to extract prices
  for (const tf of candleData) {
    if (tf.candles && tf.candles.length > 0) {
      // Candle format: [timestamp, open, high, low, close, volume]
      const latestCandle = tf.candles[tf.candles.length - 1];
      if (latestCandle && latestCandle.length >= 5) {
        currentPrice = latestCandle[4]; // close price

        // Calculate 24h high/low from recent candles
        const recentCandles = tf.candles.slice(-24);
        high24h = Math.max(...recentCandles.map(c => c[2] || 0));
        low24h = Math.min(...recentCandles.filter(c => c[3] > 0).map(c => c[3]));
        break;
      }
    }
  }

  // If no candle data, indicate analysis cannot be performed
  if (currentPrice === 0) {
    return `${symbol}USDT analysis for ${now}
Exchange: ${exchange.toUpperCase()}

=====================================
ANALYSIS UNAVAILABLE
=====================================

Unable to generate trading analysis for ${symbol} due to:
- No candlestick data available from ${exchange.toUpperCase()} or fallback exchanges
- The token may not be listed with a USDT trading pair

Please try:
1. Selecting a different exchange where ${symbol} is listed
2. Verifying the token symbol is correct
3. Trying again later if this is a temporary API issue

=====================================
RISK DISCLAIMER
=====================================
This analysis is for educational purposes only. Cryptocurrency trading involves significant risk. Never trade with funds you cannot afford to lose. Always do your own research.`;
  }

  // Format price based on magnitude
  const formatPrice = (price: number): string => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    if (price >= 0.0001) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(8)}`;
  };

  // Calculate dynamic levels based on actual price
  const volatility = high24h > 0 && low24h > 0 ? (high24h - low24h) / currentPrice : 0.05;
  const shortTermStopLoss = currentPrice * (1 - Math.max(0.02, volatility * 0.5));
  const shortTermTakeProfit = currentPrice * (1 + Math.max(0.03, volatility * 0.75));
  const longTermStopLoss = currentPrice * (1 - Math.max(0.05, volatility * 1.5));
  const longTermTakeProfit = currentPrice * (1 + Math.max(0.10, volatility * 2));
  const leveragedStopLoss = currentPrice * (1 - Math.max(0.01, volatility * 0.3));
  const leveragedTakeProfit = currentPrice * (1 + Math.max(0.02, volatility * 0.5));

  return `${symbol}USDT analysis for ${now}
Exchange: ${exchange.toUpperCase()}

=====================================
SPOT RECOMMENDATIONS
=====================================

Short-term:
- Action: HOLD
- Entry Price: ${formatPrice(currentPrice)}
- Stop Loss: ${formatPrice(shortTermStopLoss)}
- Take Profit: ${formatPrice(shortTermTakeProfit)}

Rationale:
  - Primary Signals: Analysis based on available market data. Current price at ${formatPrice(currentPrice)}. 24h range: ${formatPrice(low24h)} - ${formatPrice(high24h)}.

  - Lagging Indicators: Full analysis temporarily unavailable. Please retry for complete technical indicator analysis.

  - Sentiment Analysis: Unable to provide sentiment-based recommendations at this time. Monitor news and social sentiment manually.

Long-term:
- Action: HOLD
- Entry Price: ${formatPrice(currentPrice)}
- Stop Loss: ${formatPrice(longTermStopLoss)}
- Take Profit: ${formatPrice(longTermTakeProfit)}

Rationale:
  - Primary Signals: Long-term analysis requires full pattern recognition. Current market price provided for reference.

  - Lagging Indicators: Full indicator analysis temporarily unavailable.

  - Sentiment Analysis: Please retry for comprehensive long-term sentiment analysis.

=====================================
LEVERAGED RECOMMENDATIONS
=====================================

Short-term:
- Position: NEUTRAL (Wait for full analysis)
- Leverage: 2x (Conservative)
- Entry Price: ${formatPrice(currentPrice)}
- Stop Loss: ${formatPrice(leveragedStopLoss)}
- Take Profit: ${formatPrice(leveragedTakeProfit)}

Rationale:
  - Primary Price Action Signals: Leveraged trading requires full analysis for accurate entry/exit points. Use caution with reduced position sizes.

  - Lagging Indicator Confirmation: Full analysis needed for proper indicator confirmation.

  - Sentiment & Macro Analysis: Please retry for comprehensive sentiment analysis.

Long-term:
- Position: NEUTRAL (Wait for full analysis)
- Leverage: 2x (Conservative)
- Entry Price: ${formatPrice(currentPrice)}
- Stop Loss: ${formatPrice(longTermStopLoss)}
- Take Profit: ${formatPrice(longTermTakeProfit)}

Rationale:
  - Primary Price Action Signals: Long-term leveraged positions require comprehensive analysis.

  - Lagging Indicator Confirmation: Full technical analysis temporarily unavailable.

  - Sentiment & Macro Analysis: Analysis service temporarily at capacity. Please retry shortly.

=====================================
NOTICE
=====================================
Analysis service is temporarily at capacity (rate limited). The prices shown above are based on actual ${symbol} market data. For full technical analysis with comprehensive recommendations, please try again in a few minutes.

=====================================
RISK DISCLAIMER
=====================================
This analysis is for educational purposes only. Cryptocurrency trading involves significant risk. Never trade with funds you cannot afford to lose. Always do your own research.`;
}
