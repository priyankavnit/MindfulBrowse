"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyContent = classifyContent;
exports.generateReflectionPrompt = generateReflectionPrompt;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const logger_1 = require("../utils/logger");
const bedrockClient = new client_bedrock_runtime_1.BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
});
const CLASSIFICATION_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';
const NUDGE_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
const TIMEOUT_MS = 5000;
async function classifyContent(domain, title, url) {
    const prompt = `Analyze this web page and classify its sentiment and category:

Domain: ${domain}
${url ? `URL: ${url}` : ''}
Title: ${title}

SENTIMENT RULES:
- "negative": War, conflict, disasters, death, crime, tragedy, disturbing content, bad news
- "positive": Uplifting stories, achievements, celebrations, good news, inspiring content
- "neutral": Factual information, tutorials, documentation, balanced reporting

CATEGORY RULES:
- "news": News sites (cnn.com, bbc.com, nytimes.com, etc.), current events, journalism, breaking news
- "social": Social media (twitter.com, facebook.com, instagram.com, reddit.com, linkedin.com)
- "entertainment": Videos, movies, TV, music, games, streaming (youtube.com, netflix.com, twitch.com)
- "education": Learning, tutorials, documentation, courses, academic content
- "other": Everything else (shopping, tools, utilities, etc.)

Respond with JSON only (no markdown, no explanation):
{
  "sentiment": "positive" | "neutral" | "negative",
  "category": "news" | "social" | "entertainment" | "education" | "other"
}`;
    try {
        const classification = await Promise.race([
            invokeBedrockClassification(prompt),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)),
        ]);
        return classification;
    }
    catch (error) {
        logger_1.logger.warn('Bedrock classification failed, using fallback', { error });
        return { sentiment: 'neutral', category: 'other' };
    }
}
async function invokeBedrockClassification(prompt) {
    const command = new client_bedrock_runtime_1.InvokeModelCommand({
        modelId: CLASSIFICATION_MODEL_ID,
        body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 100,
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
    const classification = JSON.parse(content);
    // Validate response format
    if (!classification.sentiment ||
        !classification.category ||
        !['positive', 'neutral', 'negative'].includes(classification.sentiment) ||
        !['news', 'social', 'entertainment', 'education', 'other'].includes(classification.category)) {
        throw new Error('Invalid classification format from Bedrock');
    }
    return classification;
}
async function generateReflectionPrompt(durationMinutes) {
    const prompt = `The user has been doomscrolling for ${durationMinutes} minutes, consuming primarily negative news content.

Generate a gentle reflection prompt with 2-3 actionable choices. Format as JSON:
{
  "prompt": "Short reflection question (max 80 chars)",
  "choices": [
    "Take a 5-minute break",
    "Switch to lighter content",
    "Continue mindfully"
  ]
}

Keep it non-judgmental and supportive. Example:
{
  "prompt": "You've been reading heavy news. What feels right?",
  "choices": ["Take a break", "Read something uplifting", "Keep going"]
}

Generate one reflection prompt:`;
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
        // Return default nudge
        return {
            prompt: "You've been browsing for a while. What feels right?",
            choices: ['Take a break', 'Continue mindfully', 'Switch content'],
        };
    }
}
//# sourceMappingURL=bedrock.js.map