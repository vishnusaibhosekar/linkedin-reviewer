import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env before any imports
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

import OpenAI from 'openai';

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://linkedin-reviewer.app',
        'X-Title': 'LinkedIn Reviewer',
    },
});

const SCORING_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';

async function testModel() {
    console.log('🧪 Testing OpenRouter Model: ' + SCORING_MODEL + '\n');

    try {
        // Test 1: Simple text completion
        console.log('📝 Test 1: Text-only completion...');
        const textResponse = await openrouter.chat.completions.create({
            model: SCORING_MODEL,
            messages: [
                {
                    role: 'user',
                    content: 'What is 2+2? Respond with just the number.'
                }
            ],
            max_tokens: 10,
        });

        const textAnswer = textResponse.choices[0]?.message?.content;
        console.log(`✅ Text response: ${textAnswer}\n`);

        // Test 2: Vision capability (with image URL)
        console.log('🖼️  Test 2: Vision/image input...');
        const visionResponse = await openrouter.chat.completions.create({
            model: SCORING_MODEL,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'What do you see in this image? Describe briefly.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: 'https://vetmed.tamu.edu/wp-content/uploads/2023/05/AdobeStock_472713009.jpeg',
                                detail: 'low'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 100,
        });

        const visionAnswer = visionResponse.choices[0]?.message?.content;
        console.log(`✅ Vision response: ${visionAnswer?.substring(0, 150)}...\n`);

        console.log('='.repeat(60));
        console.log('🎉 All tests passed! Model is working correctly.');
        console.log('='.repeat(60));

    } catch (error: any) {
        console.error('\n❌ Model test failed!');
        console.error('Error:', error.message);
        console.error('\nStatus:', error.status);
        console.error('Code:', error.code);

        if (error.error) {
            console.error('Provider error:', JSON.stringify(error.error, null, 2));
        }

        console.error('\nStack trace:');
        console.error(error.stack);
        process.exit(1);
    }
}

// Run test
testModel();
