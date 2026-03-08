/**
 * Classification result from Amazon Bedrock
 */
export interface Classification {
    sentiment: 'positive' | 'neutral' | 'negative';
    category: 'news' | 'social' | 'entertainment' | 'education' | 'other';
}
/**
 * Nudge response with reflection prompt and choices
 */
export interface NudgeResponse {
    prompt: string;
    choices: string[];
}
//# sourceMappingURL=classification.d.ts.map