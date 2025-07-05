// Types for AI service
export interface QuestionGenerationRequest {
  userInput: string;
  context?: SessionContext;
  questionCount?: number;
}

export interface AnswerAnalysisRequest {
  question: string;
  answer: string;
  context?: SessionContext;
}

export interface AnswerAnalysisResponse {
  shouldFollowUp: boolean;
  followUpQuestion?: string;
  reasoningType: 'vague' | 'emotional' | 'assumption' | 'contradiction' | 'breakthrough' | 'clear';
  clarity: number; // 1-10 scale
  depth: number; // 1-10 scale
}

export interface SessionContext {
  previousQuestions: string[];
  previousAnswers: string[];
  userThinkingStyle?: 'analytical' | 'creative' | 'practical' | 'emotional';
  sessionTopic: string;
  insights: string[];
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  category: 'exploratory' | 'analytical' | 'creative' | 'solution-oriented' | 'assumption-challenging';
  complexity: 'simple' | 'medium' | 'complex';
  priority: number; // 1-10 scale
}

class AIService {
  /**
   * Generate intelligent questions based on user input using Socratic method
   */
  async generateQuestions(request: QuestionGenerationRequest): Promise<GeneratedQuestion[]> {
    try {
      const { userInput, context } = request;
      
      // Call server-side API route
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          context,
        }),
      });

      const data = await response.json();

      if (data.success && data.questions) {
        // Convert API response to GeneratedQuestion format
        return data.questions.map((question: string, index: number) => ({
          id: `ai-q${index + 1}`,
          question,
          category: 'exploratory' as const,
          complexity: 'medium' as const,
          priority: 5,
        }));
      }

      // If API fails or returns fallback flag, use fallback questions
      if (data.fallback || !data.success) {
        console.log('Using fallback questions:', data.error || 'AI service not available');
        return this.getFallbackQuestions(request.userInput);
      }

      throw new Error('Invalid response from AI service');
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.getFallbackQuestions(request.userInput);
    }
  }

  /**
   * Analyze user answer to determine if follow-up is needed
   */
  async analyzeAnswer(request: AnswerAnalysisRequest): Promise<AnswerAnalysisResponse> {
    try {
      const { answer } = request;
      
      // For now, use simple client-side analysis
      // We can add a server-side API route for this later
      return this.getFallbackAnalysis(answer);
    } catch (error) {
      console.error('Error analyzing answer:', error);
      return this.getFallbackAnalysis(request.answer);
    }
  }

  /**
   * Get fallback questions if AI fails
   */
  private getFallbackQuestions(userInput: string): GeneratedQuestion[] {
    const fallbackQuestions = [
      `What is the real problem you're trying to solve with "${userInput}"?`,
      "What assumptions are you making about this situation?",
      "How would you explain this challenge to a 5-year-old?",
      "What would happen if you ignored this completely?",
      "What factors led to this situation?",
      "Which of these causes can you actually control?",
      "What patterns do you notice in similar past situations?",
      "What would need to change for this problem to disappear?",
    ];

    return fallbackQuestions.map((q, index) => ({
      id: `fallback-q${index + 1}`,
      question: q,
      category: 'exploratory' as const,
      complexity: 'medium' as const,
      priority: 5,
    }));
  }

  /**
   * Get fallback analysis if AI fails
   */
  private getFallbackAnalysis(answer: string): AnswerAnalysisResponse {
    const wordCount = answer.split(' ').length;
    const hasEmotionalWords = /feel|frustrated|angry|sad|excited|worried|confused/i.test(answer);
    const isVague = wordCount < 10 || /don't know|complicated|maybe|not sure/i.test(answer);

    return {
      shouldFollowUp: isVague || hasEmotionalWords,
      followUpQuestion: isVague 
        ? "Can you tell me more about what specifically makes this challenging?"
        : hasEmotionalWords 
        ? "What's behind that feeling?"
        : undefined,
      reasoningType: isVague ? 'vague' : hasEmotionalWords ? 'emotional' : 'clear',
      clarity: wordCount > 20 ? 7 : 3,
      depth: wordCount > 30 ? 6 : 2,
    };
  }

  /**
   * Check if AI is enabled and properly configured
   */
  isEnabled(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_AI_ENABLED === 'true'
    );
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService; 