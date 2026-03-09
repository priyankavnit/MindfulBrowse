import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';
import { Classification } from '@mindful-browse/shared';
import { logger } from '../utils/logger';

const comprehendClient = new ComprehendClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Domain heuristic mapping for faster and more accurate classification
export const DOMAIN_HEURISTICS: Record<string, string> = {
  // SEARCH
  'google.com': 'search',
  'bing.com': 'search',
  'duckduckgo.com': 'search',
  'yahoo.com': 'search',
  // SOCIAL MEDIA
  'twitter.com': 'social',
  'x.com': 'social',
  'facebook.com': 'social',
  'instagram.com': 'social',
  'reddit.com': 'social',
  'snapchat.com': 'social',
  'threads.net': 'social',
  'discord.com': 'social',
  'quora.com': 'social',
  'kooapp.com': 'social',
  // ENTERTAINMENT / VIDEO
  'youtube.com': 'entertainment',
  'youtu.be': 'entertainment',
  'tiktok.com': 'entertainment',
  'netflix.com': 'entertainment',
  'primevideo.com': 'entertainment',
  'hotstar.com': 'entertainment',
  'disneyplus.com': 'entertainment',
  'twitch.tv': 'entertainment',
  'mxplayer.in': 'entertainment',
  'sonyliv.com': 'entertainment',
  'zee5.com': 'entertainment',
  'voot.com': 'entertainment',
  'jiosaavn.com': 'entertainment',
  'gaana.com': 'entertainment',
  'spotify.com': 'entertainment',
  'wynk.in': 'entertainment',
  // INDIAN NEWS
  'timesofindia.com': 'news',
  'indiatimes.com': 'news',
  'hindustantimes.com': 'news',
  'ndtv.com': 'news',
  'thehindu.com': 'news',
  'indianexpress.com': 'news',
  'news18.com': 'news',
  'livemint.com': 'news',
  'moneycontrol.com': 'news',
  'business-standard.com': 'news',
  'economictimes.com': 'news',
  'firstpost.com': 'news',
  'scroll.in': 'news',
  'theprint.in': 'news',
  'opindia.com': 'news',
  'thewire.in': 'news',
  'swarajyamag.com': 'news',
  // INTERNATIONAL NEWS
  'bbc.com': 'news',
  'cnn.com': 'news',
  'reuters.com': 'news',
  'nytimes.com': 'news',
  'theguardian.com': 'news',
  'washingtonpost.com': 'news',
  'bloomberg.com': 'news',
  'aljazeera.com': 'news',
  // SHOPPING / ECOMMERCE INDIA
  'amazon.in': 'shopping',
  'amazon.com': 'shopping',
  'flipkart.com': 'shopping',
  'myntra.com': 'shopping',
  'ajio.com': 'shopping',
  'snapdeal.com': 'shopping',
  'tatacliq.com': 'shopping',
  'meesho.com': 'shopping',
  'nykaa.com': 'shopping',
  'lenskart.com': 'shopping',
  'bigbasket.com': 'shopping',
  'jiomart.com': 'shopping',
  // FINANCE / MARKETS INDIA
  'zerodha.com': 'finance',
  'groww.in': 'finance',
  'upstox.com': 'finance',
  'angelone.in': 'finance',
  'nseindia.com': 'finance',
  'bseindia.com': 'finance',
  'screener.in': 'finance',
  'tickertape.in': 'finance',
  'tradingview.com': 'finance',
  'investing.com': 'finance',
  // CRYPTO / FINANCE
  'coinmarketcap.com': 'finance',
  'coingecko.com': 'finance',
  'binance.com': 'finance',
  'coinbase.com': 'finance',
  'wazirx.com': 'finance',
  // SPORTS (CRICKET HEAVY)
  'espncricinfo.com': 'sports',
  'cricbuzz.com': 'sports',
  'sportstar.thehindu.com': 'sports',
  'sports.ndtv.com': 'sports',
  'icc-cricket.com': 'sports',
  // EDUCATION / LEARNING
  'wikipedia.org': 'education',
  'coursera.org': 'education',
  'edx.org': 'education',
  'udemy.com': 'education',
  'khanacademy.org': 'education',
  'byjus.com': 'education',
  'unacademy.com': 'education',
  'vedantu.com': 'education',
  // WORK / DEVELOPMENT
  'github.com': 'work',
  'gitlab.com': 'work',
  'bitbucket.org': 'work',
  'stackoverflow.com': 'work',
  'stackexchange.com': 'work',
  // PRODUCTIVITY
  'notion.so': 'productivity',
  'trello.com': 'productivity',
  'asana.com': 'productivity',
  'slack.com': 'productivity',
  'zoom.us': 'productivity',
  'meet.google.com': 'productivity',
  // EMAIL
  'mail.google.com': 'email',
  'outlook.live.com': 'email',
  'outlook.office.com': 'email',
  'proton.me': 'email',
  // JOBS / CAREER INDIA
  'naukri.com': 'work',
  'foundit.in': 'work',
  'linkedin.com': 'work',
  'internshala.com': 'work',
  'cutshort.io': 'work',
  // TRAVEL INDIA
  'makemytrip.com': 'travel',
  'goibibo.com': 'travel',
  'yatra.com': 'travel',
  'irctc.co.in': 'travel',
  'cleartrip.com': 'travel',
  // GOVERNMENT INDIA
  'uidai.gov.in': 'government',
  'india.gov.in': 'government',
  'gst.gov.in': 'government',
  'incometax.gov.in': 'government',
  'mygov.in': 'government',
  // AI TOOLS
  'chat.openai.com': 'productivity',
  'openai.com': 'productivity',
  'claude.ai': 'productivity',
  'perplexity.ai': 'productivity',
};

export async function classifyContent(
  domain: string,
  title: string,
  url?: string
): Promise<Classification> {
  // Normalize domain - remove www. prefix and convert to lowercase
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  
  // Check domain heuristics first for known domains
  const categoryFromHeuristic = DOMAIN_HEURISTICS[normalizedDomain];
  
  if (categoryFromHeuristic) {
    // Map heuristic categories to Classification categories
    const mappedCategory = mapToClassificationCategory(categoryFromHeuristic);
    
    logger.info('Using domain heuristic for category', { 
      domain, 
      normalizedDomain,
      heuristicCategory: categoryFromHeuristic,
      mappedCategory 
    });
    
    // Use Amazon Comprehend for sentiment analysis
    try {
      const sentiment = await detectSentimentWithComprehend(title);
      return {
        sentiment,
        category: mappedCategory,
      };
    } catch (error) {
      logger.warn('Comprehend sentiment analysis failed, using neutral', { error });
      return {
        sentiment: 'neutral',
        category: mappedCategory,
      };
    }
  }

  // No heuristic match, use Comprehend for sentiment and default category
  try {
    const sentiment = await detectSentimentWithComprehend(title);
    return {
      sentiment,
      category: 'other',
    };
  } catch (error) {
    logger.warn('Comprehend classification failed, using fallback', { error });
    return { sentiment: 'neutral', category: 'other' };
  }
}

// Map heuristic categories to Classification type categories
function mapToClassificationCategory(
  heuristicCategory: string
): Classification['category'] {
  switch (heuristicCategory) {
    case 'news':
      return 'news';
    case 'social':
      return 'social';
    case 'entertainment':
      return 'entertainment';
    case 'education':
      return 'education';
    // Map all other categories to 'other'
    case 'search':
    case 'shopping':
    case 'finance':
    case 'sports':
    case 'work':
    case 'productivity':
    case 'email':
    case 'travel':
    case 'government':
    default:
      return 'other';
  }
}

// Use Amazon Comprehend for sentiment detection
async function detectSentimentWithComprehend(
  text: string
): Promise<Classification['sentiment']> {
  try {
    const command = new DetectSentimentCommand({
      Text: text,
      LanguageCode: 'en',
    });

    const response = await comprehendClient.send(command);
    
    // Map Comprehend sentiment to our Classification sentiment
    // Comprehend returns: POSITIVE, NEGATIVE, NEUTRAL, MIXED
    switch (response.Sentiment) {
      case 'POSITIVE':
        return 'positive';
      case 'NEGATIVE':
        return 'negative';
      case 'NEUTRAL':
      case 'MIXED':
      default:
        return 'neutral';
    }
  } catch (error) {
    logger.error('Comprehend sentiment detection failed', { error });
    return 'neutral';
  }
}

export interface NudgeResponse {
  prompt: string;
  choices: string[];
}

// Pre-defined gentle nudges for different durations
const GENTLE_NUDGES = [
  {
    prompt: "You've been browsing for a while. How about a quick break?",
    choices: ['Take a 5-min break', 'Stretch & hydrate', 'Keep browsing'],
  },
  {
    prompt: "Time flies when browsing! Want to take a moment to rest your eyes?",
    choices: ['Rest my eyes', 'Stretch a bit', 'Continue'],
  },
  {
    prompt: "Looks like you've been scrolling for quite some time. Maybe stretch your legs or grab some water?",
    choices: ['Take a walk', 'Get some water', 'Keep going'],
  },
  {
    prompt: "You've been at it for a while. A short break might feel good?",
    choices: ['Take a break', 'Do some stretches', 'Not now'],
  },
  {
    prompt: "Been browsing for a bit. How about a quick pause to recharge?",
    choices: ['Pause & recharge', 'Quick stretch', 'Continue browsing'],
  },
];

export async function generateReflectionPrompt(
  durationMinutes: number
): Promise<NudgeResponse> {
  // Select a nudge based on duration (adds variety)
  const index = Math.floor(durationMinutes / 5) % GENTLE_NUDGES.length;
  const nudge = GENTLE_NUDGES[index];
  
  logger.info('Generated nudge', { durationMinutes, nudgeIndex: index });
  
  return nudge;
}
