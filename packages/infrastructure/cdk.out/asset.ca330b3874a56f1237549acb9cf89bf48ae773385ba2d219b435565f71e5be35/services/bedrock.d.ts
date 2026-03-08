import { Classification } from '@mindful-browse/shared';
export declare function classifyContent(domain: string, title: string): Promise<Classification>;
export interface NudgeResponse {
    prompt: string;
    choices: string[];
}
export declare function generateReflectionPrompt(durationMinutes: number): Promise<NudgeResponse>;
//# sourceMappingURL=bedrock.d.ts.map