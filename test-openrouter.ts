import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env before any imports
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

console.log('Environment loaded. OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✓ Set' : '✗ Missing');
console.log('');

import { openrouter, SCORING_MODEL } from './lib/ai/openrouter';

async function testOpenRouter() {
    console.log('🧪 Testing OpenRouter Integration...\n');
    console.log(`Model: ${SCORING_MODEL}\n`);

    try {
        console.log('📤 Sending test request to OpenRouter...');

        const completion = await openrouter.chat.completions.create({
            model: SCORING_MODEL,
            messages: [
                {
                    role: 'user',
                    content: 'Say "Hello from LinkedIn Reviewer!" and confirm you can analyze LinkedIn profiles.'
                }
            ],
            max_tokens: 100,
            temperature: 0.7,
        });

        const response = completion.choices[0]?.message?.content;

        console.log('✅ Success! Response received:\n');
        console.log('---');
        console.log(response);
        console.log('---\n');

        console.log('📊 Usage stats:');
        console.log(`  - Prompt tokens: ${completion.usage?.prompt_tokens || 'N/A'}`);
        console.log(`  - Completion tokens: ${completion.usage?.completion_tokens || 'N/A'}`);
        console.log(`  - Total tokens: ${completion.usage?.total_tokens || 'N/A'}`);

        console.log('\n✅ OpenRouter integration is working correctly!');

    } catch (error: any) {
        console.error('❌ Test failed!');
        console.error('Error:', error.message);

        if (error.status) {
            console.error('Status:', error.status);
        }

        if (error.status === 401) {
            console.error('\n💡 Tip: Check your OPENROUTER_API_KEY in .env.local');
        } else if (error.status === 429) {
            console.error('\n💡 Tip: Rate limit exceeded. Try again in a few minutes.');
        } else if (error.status === 502 || error.status === 503) {
            console.error('\n💡 Tip: OpenRouter service temporarily unavailable. Retry later.');
        }

        process.exit(1);
    }
}

// Test JSON mode (used in scoring API)
async function testJsonMode() {
    console.log('\n\n🧪 Testing JSON response mode...\n');

    try {
        const completion = await openrouter.chat.completions.create({
            model: SCORING_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a test assistant. Return ONLY valid JSON.'
                },
                {
                    role: 'user',
                    content: 'Return a JSON object with these fields: {"name": "your name", "score": a number between 1-100, "status": "excellent|good|fair|poor"}'
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 200,
            temperature: 0.3,
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error('Empty response');
        }

        const parsed = JSON.parse(response);

        console.log('✅ JSON mode working! Response:');
        console.log(JSON.stringify(parsed, null, 2));
        console.log('\n✅ JSON parsing successful!');

    } catch (error: any) {
        console.error('❌ JSON mode test failed!');
        console.error('Error:', error.message);

        if (error.message.includes('JSON')) {
            console.error('\n💡 Tip: Model may not support JSON mode. Check model capabilities.');
        }

        process.exit(1);
    }
}

// Run tests
async function main() {
    await testOpenRouter();
    await testJsonMode();

    console.log('\n\n🎉 All tests passed! Your AI processing pipeline is ready to use.');
    process.exit(0);
}

main();
