import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Check,
  ArrowRight,
  BookOpen,
  Award,
  Trash2,
} from 'lucide-react';
import { ModelConfig, QuizQuestion, QuizSet, StudentProfile } from '../types';
import { streamChat } from '../services/api';

interface QuizGeneratorViewProps {
  quizSets: QuizSet[];
  onSaveQuizSets: (sets: QuizSet[]) => void;
  onIncrementQuizCount: () => void;
  modelConfig: ModelConfig;
  studentProfile: StudentProfile;
  darkMode: boolean;
}

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({
  quizSets,
  onSaveQuizSets,
  onIncrementQuizCount,
  modelConfig,
  studentProfile,
  darkMode,
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuizSet, setActiveQuizSet] = useState<QuizSet>(
    quizSets[0] || {
      id: 'qs_default',
      topic: 'Computer Systems & Memory',
      questions: [],
      createdAt: new Date().toLocaleDateString(),
    }
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sampleTopics = [
    'Organic Chemistry: Reaction Mechanisms',
    'Cognitive Psychology: Memory Models',
    'Microeconomics: Elasticity & Market Equilibrium',
    'Computer Science: Algorithms & Asymptotic Notation',
    'Cellular Biology: Mitosis & Meiosis',
  ];

  const handleGenerateQuiz = async (selectedTopic?: string) => {
    const topic = selectedTopic || topicInput;
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setIsSubmitted(false);

    const prompt = `Generate exactly 5 college-level multiple-choice questions (MCQs) testing conceptual understanding of: "${topic}".
Output MUST be strictly valid JSON array of 5 question objects with this exact structure:
[
  {
    "question": "Clear, precise academic question text here?",
    "options": [
      "Distractor Option A",
      "Distractor Option B",
      "Correct Option C",
      "Distractor Option D"
    ],
    "correctIndex": 2,
    "explanation": "Clear 2-sentence explanation of why the correct option is right and others are false."
  }
]
IMPORTANT:
- Exactly 5 questions.
- Exactly 4 options per question.
- "correctIndex" must be 0, 1, 2, or 3.
- Return ONLY the raw JSON array. No markdown code blocks, no preamble.`;

    let accumulated = '';

    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      modelConfig,
      studentProfile,
      modeDescription:
        'You are a rigorous university professor generating a 5-question multiple choice active recall test in strict JSON format.',
      onChunk: (chunk) => (accumulated += chunk),
      onDone: (full) => {
        setIsGenerating(false);
        onIncrementQuizCount();
        const raw = full || accumulated;
        try {
          const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length >= 3) {
            const formattedQuestions: QuizQuestion[] = parsed.slice(0, 5).map((q, idx) => ({
              id: 'q_' + Date.now() + '_' + idx,
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex ?? 0,
              explanation: q.explanation || 'No explanation provided.',
            }));

            const newSet: QuizSet = {
              id: 'qs_' + Date.now(),
              topic: topic.trim(),
              questions: formattedQuestions,
              createdAt: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            };

            setActiveQuizSet(newSet);
            onSaveQuizSets([newSet, ...quizSets]);
            setTopicInput('');
          }
        } catch (e) {
          console.error('Quiz JSON parse error', e);
          alert('Could not parse 5-question quiz format. Please try again or test with another topic.');
        }
      },
      onError: (err) => {
        setIsGenerating(false);
        alert(`Failed to generate quiz: ${err}`);
      },
    });
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setActiveQuizSet((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, userSelection: optionIndex } : q
      ),
    }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    activeQuizSet.questions.forEach((q) => {
      if (q.userSelection === q.correctIndex) score++;
    });

    const updated = {
      ...activeQuizSet,
      score,
      completedAt: new Date().toLocaleDateString(),
    };

    setActiveQuizSet(updated);
    setIsSubmitted(true);

    const updatedSets = quizSets.map((s) => (s.id === updated.id ? updated : s));
    onSaveQuizSets(updatedSets);
  };

  const handleResetQuiz = () => {
    setIsSubmitted(false);
    setActiveQuizSet((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => ({ ...q, userSelection: undefined })),
    }));
  };

  const answeredCount = activeQuizSet.questions.filter((q) => q.userSelection !== undefined).length;
  const totalQuestions = activeQuizSet.questions.length;
  const currentScore = activeQuizSet.score ?? 0;
  const percentage = totalQuestions > 0 ? Math.round((currentScore / totalQuestions) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="text-emerald-600 dark:text-emerald-400" />
              <span>5-Question MCQ Quiz Generator</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active recall testing: generate 5 exam-grade multiple choice questions on any college subject.
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2 font-mono">
            <span>{quizSets.length} Quizzes in Archive</span>
          </div>
        </div>

        {/* 1. Generator Input Box */}
        <div
          className={`p-6 rounded-3xl border transition-all ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            Enter Study Topic or Exam Chapter
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Distributed Consensus, Cognitive Dissonance, Photosynthesis, Fiscal Policy..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateQuiz()}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleGenerateQuiz()}
              disabled={!topicInput.trim() || isGenerating}
              className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 text-xs shrink-0 shadow-xs"
            >
              <Sparkles size={14} />
              <span>{isGenerating ? 'Generating 5 MCQs...' : 'Generate 5 MCQs'}</span>
            </button>
          </div>

          {/* Sample Topic Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-400">Try college topics:</span>
            {sampleTopics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopicInput(topic);
                  handleGenerateQuiz(topic);
                }}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline decoration-slate-300 dark:decoration-slate-700"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Active Quiz Questions & Score Card */}
        {activeQuizSet.questions.length > 0 && (
          <div className="space-y-6">
            {/* Top Score Banner if submitted */}
            {isSubmitted && (
              <div
                className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  percentage >= 70
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                    <Award size={24} className={percentage >= 70 ? 'text-emerald-500' : 'text-amber-500'} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      Quiz Complete: {currentScore} / {totalQuestions} Correct ({percentage}%)
                    </h3>
                    <p className="text-xs opacity-80 mt-0.5">
                      {percentage >= 80
                        ? 'Excellent mastery! You have a solid conceptual grasp on this subject.'
                        : 'Good effort! Review the detailed explanations below to cement your understanding.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResetQuiz}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-current text-xs font-semibold hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>Retry Quiz</span>
                </button>
              </div>
            )}

            {/* Quiz Topic Title */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Active Practice Test
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {activeQuizSet.topic}
                </h2>
              </div>

              {/* Progress counter */}
              <div className="text-xs text-slate-500">
                Answered:{' '}
                <strong className="text-slate-900 dark:text-slate-100 font-mono">
                  {answeredCount} / {totalQuestions}
                </strong>
              </div>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {activeQuizSet.questions.map((q, qIndex) => {
                const isSelected = q.userSelection !== undefined;
                const isCorrect = q.userSelection === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-6 rounded-3xl border transition-all ${
                      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Question {qIndex + 1} of {totalQuestions}
                      </span>

                      {isSubmitted && isSelected && (
                        <span
                          className={`font-semibold flex items-center gap-1 ${
                            isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          <span>{isCorrect ? 'Correct (+1)' : 'Incorrect'}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                      {q.question}
                    </h3>

                    {/* 4 Options */}
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => {
                        const isChosen = q.userSelection === optIdx;
                        let optionStyle = darkMode
                          ? 'border-slate-800 hover:bg-slate-800 text-slate-200'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800';

                        if (isChosen) {
                          optionStyle =
                            'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium';
                        }

                        if (isSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle =
                              'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500';
                          } else if (isChosen && !isCorrect) {
                            optionStyle =
                              'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{option}</span>
                            {isSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation if submitted */}
                    {isSubmitted && q.explanation && (
                      <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-100 block mb-1">
                          Conceptual Reasoning:
                        </strong>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Submit Controls */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-xs text-slate-500">
                {!isSubmitted
                  ? `${answeredCount} of ${totalQuestions} questions answered`
                  : `Score recorded: ${currentScore} / ${totalQuestions}`}
              </span>

              {!isSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={answeredCount === 0}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-xs"
                >
                  Submit Quiz & Calculate Score
                </button>
              ) : (
                <button
                  onClick={handleResetQuiz}
                  className="px-5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Past Quizzes Archive */}
        {quizSets.length > 1 && (
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Archived Practice Tests
            </h3>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {quizSets.map((set) => (
                <div
                  key={set.id}
                  onClick={() => {
                    setActiveQuizSet(set);
                    setIsSubmitted(Boolean(set.score !== undefined));
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    set.id === activeQuizSet.id
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {set.topic}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{set.questions.length} Questions</span>
                    {set.score !== undefined && (
                      <span className="font-semibold text-emerald-600 font-mono">
                        Score: {set.score}/{set.questions.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
