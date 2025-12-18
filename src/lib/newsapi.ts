import { NewsArticle } from '@/types';

const NEWS_API_KEY = process.env.NEWSAPI_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

interface NewsAPIArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

// Fetch crypto news from the last 3 days
export async function fetchCryptoNews(): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NewsAPI key not configured, using mock data');
    return getMockNews();
  }

  // Calculate date 3 days ago
  const fromDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const query = 'Crypto OR Bitcoin OR Coindesk OR Cointelegraph';
  const url = `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=popularity&apiKey=${NEWS_API_KEY}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data: NewsAPIResponse = await response.json();

    return data.articles
      .filter((article) => article.title && article.description)
      .map((article) => ({
        title: article.title,
        description: article.description,
      }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return getMockNews();
  }
}

// Mock news data for development
function getMockNews(): NewsArticle[] {
  return [
    {
      title: 'Bitcoin ETF Inflows Reach New Highs as Institutional Adoption Grows',
      description: 'Spot Bitcoin ETFs continue to see strong inflows as major financial institutions increase their crypto exposure.',
    },
    {
      title: 'Federal Reserve Signals Potential Rate Pause in 2025',
      description: 'Fed officials indicate a more cautious approach to monetary policy, potentially benefiting risk assets like cryptocurrencies.',
    },
    {
      title: 'Ethereum Layer 2 Solutions See Record Transaction Volumes',
      description: 'Arbitrum and Optimism continue to dominate Layer 2 scaling, with combined daily transactions exceeding Ethereum mainnet.',
    },
    {
      title: 'Solana DeFi TVL Surges Past $10 Billion Milestone',
      description: 'The Solana ecosystem experiences unprecedented growth as new DeFi protocols attract significant capital.',
    },
    {
      title: 'Major Bank Announces Crypto Custody Services for Institutional Clients',
      description: 'Traditional finance continues to embrace digital assets with new custody and trading offerings.',
    },
    {
      title: 'Regulatory Clarity Improves as New Crypto Framework Proposed',
      description: 'Lawmakers introduce comprehensive legislation aimed at providing clear guidelines for cryptocurrency businesses.',
    },
    {
      title: 'NFT Market Shows Signs of Recovery with Increased Trading Volume',
      description: 'After months of decline, the NFT market experiences renewed interest from collectors and investors.',
    },
    {
      title: 'Cross-Chain Bridges Process Record $5 Billion in Monthly Volume',
      description: 'Interoperability solutions continue to gain traction as users move assets across different blockchain networks.',
    },
  ];
}
