import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReviewResult, IssueSeverity, IssueCategory } from '@/types';
import { CODE_REVIEW_PROMPT } from './prompts';

// Singleton Gemini client
let geminiClient: GoogleGenerativeAI | null = null;
let availableModels: string[] | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Please define the GEMINI_API_KEY environment variable');
  }
  
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }
  return geminiClient;
}

// List available models from Gemini API
async function getAvailableModels(): Promise<string[]> {
  if (availableModels) {
    return availableModels;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    // Try to fetch available models via REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from models.list API`);
    }

    const data = await response.json();
    
    // Extract Gemini model names
    const models = (data.models || [])
      .map((m: any) => m.name?.replace('models/', '') || '')
      .filter((name: string) => name && name.includes('gemini') && name.includes('generative'))
      .sort(); // Sort for consistency

    if (models.length > 0) {
      console.log('✅ Available Gemini models (from API):', models);
      availableModels = models;
      return models;
    } else {
      throw new Error('No Gemini models found in API response');
    }
  } catch (error) {
    console.warn('⚠️ Could not fetch models from API:', error instanceof Error ? error.message : error);
    
    // Fallback to known best models if listing fails
    console.log('📋 Using fallback model list');
    availableModels = [
      'gemini-2.5-pro',          // High quality for serious code reviews
      'gemini-2.5-flash',        // Good balance of quality and speed
      'gemini-2.5-flash-lite',   // Cost-efficient backup
      'gemini-2.0-flash',        // Stable option
      'gemini-1.5-pro',          // Previous generation pro
      'gemini-1.5-flash',        // Previous generation flash
    ];
    return availableModels;
  }
}

// Helper function to validate review quality
function isValidReview(reviewResult: ReviewResult): boolean {
  // Must have structured feedback
  if (!reviewResult.issues && !reviewResult.improvements && !reviewResult.positives) {
    return false;
  }
  
  // Must have at least some analysis
  if (
    (!reviewResult.issues || reviewResult.issues.length === 0) &&
    (!reviewResult.improvements || reviewResult.improvements.length === 0)
  ) {
    return false;
  }

  // Must have summary
  if (!reviewResult.summary || reviewResult.summary.length < 20) {
    return false;
  }

  // Must have reasonable score
  if (reviewResult.overallScore === undefined || reviewResult.overallScore < 1 || reviewResult.overallScore > 10) {
    return false;
  }

  return true;
}

// Helper function to count lines of code
export function countLinesOfCode(code: string): number {
  return code.split('\n').length;
}

// Main function to review code using Gemini
export async function reviewCode(code: string, language: string): Promise<ReviewResult> {
  console.log('🔵 reviewCode called with:', { language, codeLength: code.length });
  
  const client = getGeminiClient();
  const prompt = CODE_REVIEW_PROMPT.replace('{language}', language).replace('{code}', code);

  // Get available models
  const models = await getAvailableModels();
  
  if (models.length === 0) {
    throw new Error('No Gemini models available. Please check your API key and ensure you have access to Gemini models.');
  }

  console.log(`📋 Available models: ${models.join(', ')}`);

  // Try models in priority order
  for (const modelName of models) {
    try {
      console.log(`📤 Attempting review with model: ${modelName}...`);
      const startTime = Date.now();
      
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const endTime = Date.now();
      const analysisTime = endTime - startTime;
      
      console.log(`✅ Received response from Gemini (${modelName}, ${analysisTime}ms)`);

      // Parse the JSON response
      let reviewResult: ReviewResult;
      try {
        reviewResult = JSON.parse(text);
      } catch {
        // If parsing fails, try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not parse response as valid JSON');
        }
        reviewResult = JSON.parse(jsonMatch[0]);
      }

      // Normalize the response structure
      const normalizedReview: ReviewResult = {
        ...reviewResult,
        issues: reviewResult.issues || [],
        improvements: reviewResult.improvements || [],
        positives: reviewResult.positives || [],
        summary: reviewResult.summary || 'Code review completed',
        overallScore: Math.min(10, Math.max(1, reviewResult.overallScore || 5)),
      };

      // Validate review quality
      if (!isValidReview(normalizedReview)) {
        console.warn(
          `⚠️ Model ${modelName} produced low-quality review. Moving to next model.`
        );
        continue; // Try next model
      }

      console.log(`✅ Review validated successfully from ${modelName}`);
      return normalizedReview;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️ Model ${modelName} failed: ${errorMsg}`);
      
      // Continue to next model
      continue;
    }
  }

  // All models failed
  throw new Error(
    `All available Gemini models failed to generate a valid review. Tried: ${models.join(', ')}. ` +
    `Please verify your API key has access to Gemini models and try again.`
  );
}

// Export client for testing or direct use
export function getClient(): GoogleGenerativeAI {
  return getGeminiClient();
}
