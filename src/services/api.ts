import { ModelConfig, StudentProfile } from '../types';

export interface StreamChatParams {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  modelConfig: ModelConfig;
  studentProfile: StudentProfile;
  modeDescription?: string;
  onChunk: (chunk: string) => void;
  onDone: (fullText: string) => void;
  onError: (err: string) => void;
}

export function buildSystemPrompt(studentProfile: StudentProfile, modeContext?: string): string {
  const styleMap = {
    simple: 'Clear, intuitive, straightforward explanations with real-world analogies and zero unnecessary academic fluff.',
    exam_prep: 'High-yield, exam-oriented, highlighting frequently tested definitions, edge cases, formulas, and common pitfalls.',
    deep_dive: 'Rigorous, undergraduate / technical depth, explaining underlying theoretical architecture and formal mechanics.',
    analogies: 'Story and analogy-first pedagogical style, grounding abstract abstractions into memorable physical comparisons.',
  };

  const selectedStyle = styleMap[studentProfile.preferredExplanationStyle] || styleMap.simple;

  return `You are StudyMate AI, an AI-powered private study companion for college students.
Tagline: "Study Smarter. Learn Better."
Student: ${studentProfile.name}
Major / Field: ${studentProfile.major} (${studentProfile.university}, ${studentProfile.year})
Current Academic Goal: ${studentProfile.studyGoal}
Preferred Pedagogical Style: ${selectedStyle}
${modeContext ? `Task Context: ${modeContext}` : ''}

Core Academic Rules:
1. Break down complex college-level concepts into intuitive, digestible explanations.
2. Structure answers clearly with markdown: bold key concepts, bullet lists, short readable paragraphs, and code blocks where relevant.
3. Champion open-weight AI principles: data sovereignty, student privacy, and unmonitored curiosity.
4. If summarizing notes or generating quizzes, prioritize high-yield testable points and clear conceptual definitions.`;
}

export async function streamChat({
  messages,
  modelConfig,
  studentProfile,
  modeDescription,
  onChunk,
  onDone,
  onError,
}: StreamChatParams) {
  const systemInstruction = buildSystemPrompt(studentProfile, modeDescription);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemInstruction,
        provider: modelConfig.provider,
        baseUrl: modelConfig.baseUrl,
        model: modelConfig.model,
        apiKey: modelConfig.apiKey,
        temperature: modelConfig.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body returned from stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            continue;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              onChunk(parsed.text);
            }
          } catch {
            // Ignore parse errors on raw tokens
          }
        }
      }
    }

    onDone(accumulatedText);
  } catch (error: any) {
    console.error('streamChat error:', error);
    onError(error.message || 'Failed to complete chat request');
  }
}

export async function pingServerUrl(url: string): Promise<{ success: boolean; latencyMs: number; error?: string; status?: number }> {
  try {
    const res = await fetch('/api/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, latencyMs: 0, error: err.message };
  }
}

export async function checkServerStatus() {
  try {
    const res = await fetch('/api/status');
    return await res.json();
  } catch {
    return { status: 'offline', hasGeminiKey: false };
  }
}
