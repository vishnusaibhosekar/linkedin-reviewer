import OpenAI from 'openai';

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

export const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://linkedin-reviewer.app',
        'X-Title': 'LinkedIn Reviewer',
    },
});

// Paid vision model - GPT-4o-mini (fast, reliable, cheap)
export const SCORING_MODEL = 'openai/gpt-4o-mini';
