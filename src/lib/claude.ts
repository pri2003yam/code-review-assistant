import Anthropic from '@anthropic-ai/sdk';
import { ReviewResult } from '@/types';
import { CODE_REVIEW_PROMPT } from './prompts';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Please define the ANTHROPIC_API_KEY environment variable');
}

// Singleton Anthropic client
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

// Helper function to count lines of code
export function countLinesOfCode(code: string): number {
  return code.split('\n').length;
}

// Main function to review code using Claude
export async function reviewCode(code: string, language: string): Promise<ReviewResult> {
  const client = getAnthropicClient();
  const prompt = CODE_REVIEW_PROMPT.replace('{language}', language).replace('{code}', code);

  try {
    const startTime = Date.now();

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const endTime = Date.now();
    const analysisTime = endTime - startTime;

    // Extract text content from response
    const responseContent = message.content[0];
    if (responseContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    let reviewResult: ReviewResult;
    try {
      reviewResult = JSON.parse(responseContent.text);
    } catch {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse Claude response as JSON');
      }
      reviewResult = JSON.parse(jsonMatch[0]);
    }

    return {
      ...reviewResult,
      // Ensure the result has the expected structure
      issues: reviewResult.issues || [],
      improvements: reviewResult.improvements || [],
      positives: reviewResult.positives || [],
      summary: reviewResult.summary || 'Code review completed',
      overallScore: Math.min(10, Math.max(1, reviewResult.overallScore || 5)),
    };
  } catch (error) {
    console.error('Error reviewing code with Claude:', error);
    throw error;
  }
}

// Export client for testing or direct use
export function getClient(): Anthropic {
  return getAnthropicClient();
}
