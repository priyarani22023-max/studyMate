export type AppMode = 'home' | 'tutor' | 'notes' | 'quiz' | 'planner' | 'privacy';

export type ModelProvider = 'gemini' | 'ollama' | 'openai_compatible' | 'offline';

export interface ModelConfig {
  provider: ModelProvider;
  baseUrl: string;
  model: string;
  apiKey: string;
  temperature: number;
}

export interface StudentProfile {
  name: string;
  major: string;
  university: string;
  year: string;
  studyGoal: string;
  preferredExplanationStyle: 'simple' | 'exam_prep' | 'deep_dive' | 'analogies';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: AppMode;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  mode: AppMode;
  messages: Message[];
}

export interface NoteSummary {
  id: string;
  title: string;
  subject: string;
  originalNotes: string;
  conciseSummary: string;
  importantPoints: string[];
  keyTerms: { term: string; definition: string }[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  userSelection?: number;
}

export interface QuizSet {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  score?: number;
  completedAt?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'study' | 'assignment' | 'exam' | 'reading';
  timeEstimate?: string;
  dueDate?: string;
  createdAt: number;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
  iconName: string;
  category: string;
}

export interface StudyMetrics {
  questionsAsked: number;
  notesSummarized: number;
  quizzesCreated: number;
  studySessions: number;
  studyMinutes: number;
}
