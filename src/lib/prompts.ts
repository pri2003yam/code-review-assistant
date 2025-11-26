export const CODE_REVIEW_PROMPT = `You are an expert code reviewer with deep knowledge of software engineering best practices. Analyze the following {language} code thoroughly.

## Code to Review:
\`\`\`{language}
{code}
\`\`\`

## Your Task:
Perform a comprehensive code review covering:
1. **Readability**: Variable naming, code formatting, comments, clarity
2. **Modularity**: Function size, separation of concerns, reusability
3. **Potential Bugs**: Logic errors, edge cases, null checks, type issues
4. **Performance**: Inefficient operations, unnecessary computations, memory leaks
5. **Security**: Input validation, injection vulnerabilities, data exposure
6. **Best Practices**: Design patterns, language idioms, modern conventions

## Response Format:
Respond ONLY with a valid JSON object (no markdown, no explanation outside JSON):

{
  "summary": "Brief 2-3 sentence overview of the code quality",
  "overallScore": <number 1-10>,
  "issues": [
    {
      "severity": "critical" | "warning" | "suggestion",
      "category": "readability" | "modularity" | "bug" | "performance" | "security" | "best-practice",
      "line": <line number or null>,
      "description": "Clear explanation of the issue",
      "suggestion": "Specific actionable fix",
      "codeSnippet": "Corrected code if applicable"
    }
  ],
  "improvements": ["List of recommended improvements"],
  "positives": ["List of things done well in the code"]
}

Be thorough but fair. Acknowledge good practices. Prioritize issues by severity. Provide actionable, specific suggestions.`;

export function populatePrompt(code: string, language: string): string {
  return CODE_REVIEW_PROMPT
    .replace(/{language}/g, language)
    .replace(/{code}/g, code);
}
