import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client on server-side
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { userInput, context } = await request.json();

    // Check if AI is enabled and configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_claude_api_key_here') {
      return NextResponse.json({
        success: false,
        error: 'AI service not configured',
        fallback: true,
      });
    }

    const systemPrompt = buildQuestionGenerationPrompt(context);
    const userPrompt = buildUserQuestionPrompt(userInput, context);

    const response = await anthropic.messages.create({
      model: process.env.AI_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const questions = parseQuestionResponse(content.text);
      return NextResponse.json({
        success: true,
        questions: questions.map(q => q.question),
      });
    }

    throw new Error('Invalid response format from Claude');
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate questions',
      fallback: true,
    });
  }
}

function buildQuestionGenerationPrompt(context?: { previousQuestions?: string[]; userThinkingStyle?: string; sessionTopic: string; insights?: string[] }): string {
  return `You are a master of the Socratic method, helping people think deeper about their challenges and opportunities. Your goal is to generate thoughtful questions that guide users to discover their own insights.

CORE PRINCIPLES:
- Use the Socratic method: Ask questions that lead to self-discovery
- Mix complexity levels: Some simple, some deep, adapt to the user
- Be genuinely curious, not prescriptive
- Focus on assumptions, root causes, and different perspectives
- Avoid questions that can be answered with simple yes/no

QUESTION CATEGORIES (aim for a mix):
1. EXPLORATORY: "What aspects of this situation haven't you considered?"
2. ANALYTICAL: "What patterns do you notice here?"
3. CREATIVE: "What would this look like if you approached it completely differently?"
4. SOLUTION-ORIENTED: "What would need to change for this to resolve naturally?"
5. ASSUMPTION-CHALLENGING: "What assumptions are you making about this?"

CONTEXT AWARENESS:
${context ? `
- Previous questions: ${context.previousQuestions?.slice(-3).join(', ') || 'None'}
- User thinking style: ${context.userThinkingStyle || 'Unknown'}
- Session topic: ${context.sessionTopic}
- Key insights so far: ${context.insights?.join(', ') || 'None'}
` : '- This is a new session with no prior context'}

RESPONSE FORMAT:
Return exactly 8 questions in this JSON format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Your question here",
      "category": "exploratory|analytical|creative|solution-oriented|assumption-challenging",
      "complexity": "simple|medium|complex",
      "priority": 1-10
    }
  ]
}

QUALITY STANDARDS:
- Each question should be unique and add value
- Questions should build on each other naturally
- Avoid repetitive or obvious questions
- Make questions specific to the user's situation
- Ensure questions encourage deep thinking`;
}

function buildUserQuestionPrompt(userInput: string, context?: { previousQuestions?: string[]; previousAnswers?: string[] }): string {
  let prompt = `Generate 8 thoughtful Socratic questions for this topic: "${userInput}"`;
  
  if (context && context.previousAnswers && context.previousAnswers.length > 0 && context.previousQuestions) {
    prompt += `\n\nPrevious insights from this session:`;
    context.previousAnswers.forEach((answer: string, index: number) => {
      if (answer.trim() && context.previousQuestions && context.previousQuestions[index]) {
        prompt += `\n- Question ${index + 1}: "${context.previousQuestions[index]}" → Answer: "${answer.slice(0, 100)}..."`;
      }
    });
    prompt += `\n\nBuild on these insights and help the user go deeper.`;
  }
  
  return prompt;
}

function parseQuestionResponse(response: string): Array<{ id: string; question: string; category: string; complexity: string; priority: number }> {
  try {
    const parsed = JSON.parse(response);
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions.map((q: { id?: string; question: string; category?: string; complexity?: string; priority?: number }, index: number) => ({
        id: q.id || `q${index + 1}`,
        question: q.question,
        category: q.category || 'exploratory',
        complexity: q.complexity || 'medium',
        priority: q.priority || 5,
      }));
    }
  } catch (error) {
    console.error('Error parsing question response:', error);
  }
  
  // Fallback: try to extract questions from text
  const questions = response.split('\n').filter(line => 
    line.trim().length > 10 && 
    (line.includes('?') || line.match(/^\d+\./))
  );
  
  return questions.slice(0, 8).map((q, index) => ({
    id: `q${index + 1}`,
    question: q.replace(/^\d+\.\s*/, '').trim(),
    category: 'exploratory',
    complexity: 'medium',
    priority: 5,
  }));
} 