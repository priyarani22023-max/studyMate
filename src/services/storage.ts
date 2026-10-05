import {
  Conversation,
  Habit,
  ModelConfig,
  NoteSummary,
  QuizSet,
  StudentProfile,
  StudyMetrics,
  Task,
} from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'studymate_conversations_v2',
  ACTIVE_CONVO_ID: 'studymate_active_convo_id',
  MODEL_CONFIG: 'studymate_model_config_v2',
  STUDENT_PROFILE: 'studymate_student_profile_v2',
  TASKS: 'studymate_tasks_v2',
  HABITS: 'studymate_habits_v2',
  NOTE_SUMMARIES: 'studymate_note_summaries_v2',
  QUIZ_SETS: 'studymate_quiz_sets_v2',
  METRICS: 'studymate_metrics_v2',
  DARK_MODE: 'studymate_dark_mode',
};

export const defaultModelConfig: ModelConfig = {
  provider: 'gemini',
  baseUrl: 'http://localhost:11434',
  model: 'gemma-2-27b-it',
  apiKey: '',
  temperature: 0.7,
};

export const defaultStudentProfile: StudentProfile = {
  name: 'Alex',
  major: 'Computer Science & Cognitive Psychology',
  university: 'State University',
  year: 'Junior (Year 3)',
  studyGoal: 'Master Data Structures & Finish Semester with 3.8+ GPA',
  preferredExplanationStyle: 'simple',
};

export const defaultMetrics: StudyMetrics = {
  questionsAsked: 14,
  notesSummarized: 6,
  quizzesCreated: 5,
  studySessions: 18,
  studyMinutes: 420,
};

export const defaultHabits: Habit[] = [
  { id: 'h1', title: 'Pomodoro Focus Block (50m)', streak: 6, completedToday: true, iconName: 'Brain', category: 'Focus' },
  { id: 'h2', title: 'Review Lecture Notes Before Bed', streak: 4, completedToday: false, iconName: 'BookOpen', category: 'Recall' },
  { id: 'h3', title: 'Active Recall Practice Quiz', streak: 8, completedToday: true, iconName: 'Sparkles', category: 'Testing' },
  { id: 'h4', title: 'Hydration & Posture Reset', streak: 11, completedToday: true, iconName: 'Activity', category: 'Wellness' },
];

export const defaultTasks: Task[] = [
  {
    id: 't1',
    text: 'Review Operating Systems: Virtual Memory & Translation Lookaside Buffer (TLB)',
    completed: false,
    priority: 'high',
    category: 'exam',
    timeEstimate: '45 mins',
    dueDate: 'Tomorrow',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 't2',
    text: 'Summarize Chapter 7 on Neuroplasticity & Memory Consolidation',
    completed: false,
    priority: 'medium',
    category: 'reading',
    timeEstimate: '30 mins',
    dueDate: 'In 2 days',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 't3',
    text: 'Take 5-Question Quiz on Binary Search Trees & Balanced Red-Black Rotations',
    completed: true,
    priority: 'high',
    category: 'study',
    timeEstimate: '20 mins',
    dueDate: 'Today',
    createdAt: Date.now() - 14400000,
  },
];

export const defaultNoteSummaries: NoteSummary[] = [
  {
    id: 'ns_sample_1',
    title: 'Operating Systems: Virtual Memory & Page Tables',
    subject: 'Computer Science',
    originalNotes: `Virtual memory provides an illusion of a large, contiguous memory space to each process. It maps virtual addresses to physical RAM addresses using page tables. When a page is not present in physical RAM, a page fault occurs and the OS fetches it from secondary storage (swap/disk). The Translation Lookaside Buffer (TLB) acts as a high-speed hardware cache for virtual-to-physical address mappings to minimize the penalty of page table walks. Common page replacement algorithms include LRU (Least Recently Used), FIFO, and the Second Chance (Clock) algorithm. Thrashing occurs when a process spends more time swapping pages in and out than executing instructions due to inadequate physical frames.`,
    conciseSummary: `Virtual memory abstracts physical RAM, granting each process an isolated address space mapped via page tables. TLBs cache address translations to prevent costly memory lookups, while page faults fetch missing data from storage. Systems must carefully manage frame allocations to avoid thrashing.`,
    importantPoints: [
      'Page tables translate virtual addresses into physical frames in RAM.',
      'A page fault triggers an interrupt when a requested memory page is on disk/swap instead of physical RAM.',
      'The TLB (Translation Lookaside Buffer) is a critical hardware cache that speeds up address translations.',
      'Thrashing occurs when memory demand exceeds physical RAM, causing constant disk I/O and collapsing throughput.',
      'Page replacement algorithms like LRU (Least Recently Used) decide which page to evict during a fault.',
    ],
    keyTerms: [
      { term: 'Page Table', definition: 'Data structure maintained by the OS to map virtual pages to physical frame numbers.' },
      { term: 'TLB (Translation Lookaside Buffer)', definition: 'A fast hardware cache of recent virtual-to-physical address translations.' },
      { term: 'Page Fault', definition: 'A hardware interrupt raised by the MMU when a program accesses a page not currently in RAM.' },
      { term: 'Thrashing', definition: 'A severe state where a system spends more time paging data than executing CPU instructions.' },
    ],
    createdAt: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  },
];

export const defaultQuizSets: QuizSet[] = [
  {
    id: 'qs_sample_1',
    topic: 'Computer Systems: Virtual Memory & Caching',
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    score: 4,
    questions: [
      {
        id: 'q1',
        question: 'What is the primary function of the Translation Lookaside Buffer (TLB)?',
        options: [
          'To compress swap files on disk',
          'To cache recent virtual-to-physical address translations and speed up memory access',
          'To allocate heap memory for C programs',
          'To encrypt kernel instructions from userland',
        ],
        correctIndex: 1,
        explanation: 'The TLB is a dedicated hardware cache on the CPU that stores recent mappings, avoiding multi-level page table traversals in RAM.',
        userSelection: 1,
      },
      {
        id: 'q2',
        question: 'What hardware event occurs when a CPU references a virtual page marked invalid in the page table?',
        options: [
          'Kernel panic immediately',
          'TLB shootdown',
          'Page fault interrupt',
          'Context switch to idle thread',
        ],
        correctIndex: 2,
        explanation: 'A page fault interrupt alerts the OS kernel that the page is either not mapped or needs to be swapped in from disk.',
        userSelection: 2,
      },
      {
        id: 'q3',
        question: 'Which page replacement algorithm evicts the page that has not been accessed for the longest period of time?',
        options: [
          'First-In, First-Out (FIFO)',
          'Least Recently Used (LRU)',
          'Random Replacement',
          'Optimal Offline Algorithm (Belady)',
        ],
        correctIndex: 1,
        explanation: 'LRU tracks historical usage timestamps or doubly linked lists to evict the page that has sat dormant the longest.',
        userSelection: 1,
      },
      {
        id: 'q4',
        question: 'What phenomenon occurs when a computer spends virtually all its time moving pages between RAM and swap storage?',
        options: [
          'Race condition',
          'Memory leak',
          'Thrashing',
          'Deadlock',
        ],
        correctIndex: 2,
        explanation: 'Thrashing happens when the working set of all active processes exceeds physical RAM capacity, causing near-100% disk utilization.',
        userSelection: 2,
      },
      {
        id: 'q5',
        question: 'Why are open-weight AI models especially advantageous for college students working with sensitive coursework?',
        options: [
          'They bypass academic honor codes automatically',
          'They allow inference to run completely locally, keeping research data and notes sovereign on the student’s computer',
          'They run faster than the speed of light',
          'They guarantee an A+ on every multiple-choice test',
        ],
        correctIndex: 1,
        explanation: 'Open-weight models (like Gemma 2 or Llama) can be run on-device, meaning confidential research notes and class essays never leave the student’s hardware.',
        userSelection: 1,
      },
    ],
  },
];

export const storage = {
  getModelConfig(): ModelConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODEL_CONFIG);
      return data ? { ...defaultModelConfig, ...JSON.parse(data) } : defaultModelConfig;
    } catch {
      return defaultModelConfig;
    }
  },
  saveModelConfig(config: ModelConfig) {
    try {
      localStorage.setItem(STORAGE_KEYS.MODEL_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  },

  getStudentProfile(): StudentProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE);
      return data ? { ...defaultStudentProfile, ...JSON.parse(data) } : defaultStudentProfile;
    } catch {
      return defaultStudentProfile;
    }
  },
  saveStudentProfile(profile: StudentProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  },

  getMetrics(): StudyMetrics {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.METRICS);
      return data ? { ...defaultMetrics, ...JSON.parse(data) } : defaultMetrics;
    } catch {
      return defaultMetrics;
    }
  },
  saveMetrics(metrics: StudyMetrics) {
    try {
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
    } catch (e) {
      console.error(e);
    }
  },
  incrementMetric(key: keyof StudyMetrics, amount = 1) {
    const current = storage.getMetrics();
    current[key] += amount;
    storage.saveMetrics(current);
    return current;
  },

  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }

    const initialConvo: Conversation = {
      id: 'convo_initial',
      title: 'Welcome to StudyMate AI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: 'tutor',
      messages: [
        {
          id: 'msg_welcome',
          role: 'assistant',
          content: `Hi Alex! Welcome to **StudyMate AI** — your AI-powered private study companion. *Study Smarter. Learn Better.*\n\nHere is how I can help you ace your college classes today:\n- **AI Tutor**: Ask any question for simple, intuitive explanations, Feynman breakdowns, and practice checks.\n- **Notes Summarizer**: Paste your lecture notes or textbook chapters to instantly extract concise summaries, important takeaways, and key terminology.\n- **Quiz Generator**: Generate 5 exam-grade MCQs on any subject to test your active recall with immediate feedback.\n- **Study Planner**: Turn chaotic syllabi and exam deadlines into structured daily study blocks.\n\nAll your notes and study data remain 100% private on your own device. What subject are we tackling first?`,
          timestamp: new Date().toISOString(),
          modelUsed: 'gemma-2-27b-it',
        },
      ],
    };
    return [initialConvo];
  },
  saveConversations(convos: Conversation[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convos));
    } catch (e) {
      console.error(e);
    }
  },

  getActiveConvoId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVO_ID) || 'convo_initial';
  },
  saveActiveConvoId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVO_ID, id);
  },

  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : defaultTasks;
    } catch {
      return defaultTasks;
    }
  },
  saveTasks(tasks: Task[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  },

  getHabits(): Habit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : defaultHabits;
    } catch {
      return defaultHabits;
    }
  },
  saveHabits(habits: Habit[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (e) {
      console.error(e);
    }
  },

  getNoteSummaries(): NoteSummary[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTE_SUMMARIES);
      return data ? JSON.parse(data) : defaultNoteSummaries;
    } catch {
      return defaultNoteSummaries;
    }
  },
  saveNoteSummaries(summaries: NoteSummary[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTE_SUMMARIES, JSON.stringify(summaries));
    } catch (e) {
      console.error(e);
    }
  },

  getQuizSets(): QuizSet[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_SETS);
      return data ? JSON.parse(data) : defaultQuizSets;
    } catch {
      return defaultQuizSets;
    }
  },
  saveQuizSets(sets: QuizSet[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.QUIZ_SETS, JSON.stringify(sets));
    } catch (e) {
      console.error(e);
    }
  },

  getDarkMode(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  },
  saveDarkMode(isDark: boolean) {
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDark));
    } catch (e) {
      console.error(e);
    }
  },

  exportAllData(): string {
    const exportObject = {
      app: 'StudyMate AI',
      tagline: 'Study Smarter. Learn Better.',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      studentProfile: storage.getStudentProfile(),
      metrics: storage.getMetrics(),
      conversations: storage.getConversations(),
      tasks: storage.getTasks(),
      habits: storage.getHabits(),
      noteSummaries: storage.getNoteSummaries(),
      quizSets: storage.getQuizSets(),
      modelConfig: storage.getModelConfig(),
    };
    return JSON.stringify(exportObject, null, 2);
  },

  clearAllData() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
