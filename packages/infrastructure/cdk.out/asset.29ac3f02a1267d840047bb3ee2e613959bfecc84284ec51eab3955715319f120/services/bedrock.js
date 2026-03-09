"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_HEURISTICS = void 0;
exports.classifyContent = classifyContent;
exports.generateReflectionPrompt = generateReflectionPrompt;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const client_comprehend_1 = require("@aws-sdk/client-comprehend");
const logger_1 = require("../utils/logger");
const bedrockClient = new client_bedrock_runtime_1.BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const comprehendClient = new client_comprehend_1.ComprehendClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const NUDGE_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
const TIMEOUT_MS = 5000;
// Domain heuristic mapping for faster and more accurate classification
exports.DOMAIN_HEURISTICS = {
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
async function classifyContent(domain, title, url) {
    // Normalize domain - remove www. prefix and convert to lowercase
    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
    // Check domain heuristics first for known domains
    const categoryFromHeuristic = exports.DOMAIN_HEURISTICS[normalizedDomain];
    if (categoryFromHeuristic) {
        // Map heuristic categories to Classification categories
        const mappedCategory = mapToClassificationCategory(categoryFromHeuristic);
        logger_1.logger.info('Using domain heuristic for category', {
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
        }
        catch (error) {
            logger_1.logger.warn('Comprehend sentiment analysis failed, using neutral', { error });
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
    }
    catch (error) {
        logger_1.logger.warn('Comprehend classification failed, using fallback', { error });
        return { sentiment: 'neutral', category: 'other' };
    }
}
// Map heuristic categories to Classification type categories
function mapToClassificationCategory(heuristicCategory) {
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
async function detectSentimentWithComprehend(text) {
    try {
        const command = new client_comprehend_1.DetectSentimentCommand({
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
    }
    catch (error) {
        logger_1.logger.error('Comprehend sentiment detection failed', { error });
        return 'neutral';
    }
}
async function generateReflectionPrompt(durationMinutes) {
    const prompt = `The user has been browsing for ${durationMinutes} minutes with high scroll activity.

Generate a gentle, caring nudge with 2-3 actionable choices. The tone should be warm, non-judgmental, and supportive - like a friend checking in.

Format as JSON:
{
  "prompt": "Short, gentle message (max 80 chars)",
  "choices": [
    "Take a 5-minute break",
    "Stretch and hydrate",
    "Continue browsing"
  ]
}

Examples of good prompts:
- "Looks like you've been browsing for quite some time. Maybe stretch your legs or grab some water?"
- "You've been scrolling for a while. How about a quick break?"
- "Time flies when browsing! Want to take a moment to rest your eyes?"

Keep it casual, caring, and never preachy. Generate one gentle nudge:`;
    try {
        const command = new client_bedrock_runtime_1.InvokeModelCommand({
            modelId: NUDGE_MODEL_ID,
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 150,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
        });
        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        // Extract JSON from response
        const content = responseBody.content[0].text;
        const nudge = JSON.parse(content);
        // Validate response format
        if (!nudge.prompt ||
            !nudge.choices ||
            !Array.isArray(nudge.choices) ||
            nudge.choices.length < 2) {
            throw new Error('Invalid nudge format from Bedrock');
        }
        return nudge;
    }
    catch (error) {
        logger_1.logger.error('Bedrock nudge generation failed', { error });
        // Return default gentle nudge
        return {
            prompt: "You've been browsing for a while. How about a quick break?",
            choices: ['Take a 5-min break', 'Stretch & hydrate', 'Keep browsing'],
        };
    }
}
//# sourceMappingURL=bedrock.js.map