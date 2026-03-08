import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { Classification } from '@mindful-browse/shared';
import { logger } from '../utils/logger';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const CLASSIFICATION_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';
const NUDGE_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0';
const TIMEOUT_MS = 5000;

export async function classifyContent(
  domain: string,
  title: string
): Promise<Classification> {
  const prompt = `Analyze this web page and classify it:
Domain: ${domain}
Title: ${title}

Respond with JSON only:
{
  "sentiment": "positive" | "neutral" | "negative",
  "category": "news" | "social" | "entertainment" | "education" | "other"
}`;

  try {
    const classification = await Promise.race([
      invokeBedrockClassification(prompt),
      new Promise<Classification>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
      ),
    ]);

    return classification;
  } catch (error) {
    logger.warn('Bedrock classification failed, using fallback', { error });
    return { sentiment: 'neutral', category: 'other' };
  }
}

async function invokeBedrockClassification(
  prompt: string
): Promise<Classification> {
  const command = new InvokeModelCommand({
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
  if (
    !classification.sentiment ||
    !classification.category ||
    !['positive', 'neutral', 'negative'].includes(classification.sentiment) ||
    !['news', 'social', 'entertainment', 'education', 'other'].includes(
      classification.category
    )
  ) {
    throw new Error('Invalid classification format from Bedrock');
  }

  return classification;
}

export interface NudgeResponse {
  prompt: string;
  choices: string[];
}

export async function generateReflectionPrompt(
  durationMinutes: number
): Promise<NudgeResponse> {
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
    const command = new InvokeModelCommand({
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
    if (
      !nudge.prompt ||
      !nudge.choices ||
      !Array.isArray(nudge.choices) ||
      nudge.choices.length < 2
    ) {
      throw new Error('Invalid nudge format from Bedrock');
    }

    return nudge;
  } catch (error) {
    logger.error('Bedrock nudge generation failed', { error });
    // Return default nudge
    return {
      prompt: "You've been browsing for a while. What feels right?",
      choices: ['Take a break', 'Continue mindfully', 'Switch content'],
    };
  }
}
