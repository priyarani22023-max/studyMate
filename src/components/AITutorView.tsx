import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Trash2,
  Plus,
  Sparkles,
  Search,
  MessageSquare,
  GraduationCap,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Conversation, Message, ModelConfig, StudentProfile } from '../types';
import { streamChat } from '../services/api';

interface AITutorViewProps {
  conversations: Conversation[];
  activeConvoId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onUpdateConversation: (convo: Conversation) => void;
  onIncrementQuestionCount: () => void;
  modelConfig: ModelConfig;
  studentProfile: StudentProfile;
  darkMode: boolean;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  conversations,
  activeConvoId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onUpdateConversation,
  onIncrementQuestionCount,
  modelConfig,
  studentProfile,
  darkMode,
}) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConvo =
    conversations.find((c) => c.id === activeConvoId) || conversations[0] || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages, isGenerating]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || !activeConvo || isGenerating) return;

    onIncrementQuestionCount();

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      mode: 'tutor',
    };

    const updatedMessages = [...activeConvo.messages, userMessage];

    // Placeholder for assistant stream
    const assistantMsgId = 'msg_' + (Date.now() + 1);
    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      mode: 'tutor',
      modelUsed: modelConfig.model,
    };

    const convoWithAssistant: Conversation = {
      ...activeConvo,
      title:
        activeConvo.messages.length === 0
          ? text.slice(0, 32) + (text.length > 32 ? '...' : '')
          : activeConvo.title,
      messages: [...updatedMessages, initialAssistantMessage],
      updatedAt: new Date().toISOString(),
    };

    onUpdateConversation(convoWithAssistant);
    setInput('');
    setIsGenerating(true);

    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let streamAccumulator = '';

    await streamChat({
      messages: apiMessages,
      modelConfig,
      studentProfile,
      modeDescription:
        'You are an expert college AI Tutor. Give simple, clear, pedagogical explanations breaking down difficult academic concepts. Use intuitive analogies and highlight key takeaways.',
      onChunk: (chunk) => {
        streamAccumulator += chunk;
        onUpdateConversation({
          ...convoWithAssistant,
          messages: [
            ...updatedMessages,
            {
              ...initialAssistantMessage,
              content: streamAccumulator,
            },
          ],
        });
      },
      onDone: (full) => {
        setIsGenerating(false);
        onUpdateConversation({
          ...convoWithAssistant,
          messages: [
            ...updatedMessages,
            {
              ...initialAssistantMessage,
              content: full || streamAccumulator,
            },
          ],
        });
      },
      onError: (err) => {
        setIsGenerating(false);
        onUpdateConversation({
          ...convoWithAssistant,
          messages: [
            ...updatedMessages,
            {
              ...initialAssistantMessage,
              content: `*StudyMate AI Tutor encountered an inference error (${err}).*\n\nYou can re-send your question, verify your connection, or check inference settings.`,
            },
          ],
        });
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  const quickPrompts = [
    {
      title: 'Big-O Notation & Time Complexity',
      text: 'Can you give me a simple, intuitive explanation of Big-O notation with real-world analogies (O(1), O(log n), O(n), O(n^2))?',
      subject: 'Computer Science',
    },
    {
      title: 'Photosynthesis & ATP Synthase',
      text: 'Explain the light-dependent reactions of photosynthesis and how ATP synthase works in simple, clear terms for my biology exam.',
      subject: 'Biology',
    },
    {
      title: 'Fiscal vs. Monetary Policy',
      text: 'Break down the core differences between Central Bank Monetary Policy and Government Fiscal Policy during inflation.',
      subject: 'Economics',
    },
  ];

  const filteredConvos = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* History Drawer */}
      <div
        className={`${
          showHistoryDrawer ? 'w-64 border-r' : 'w-0'
        } transition-all duration-300 overflow-hidden flex flex-col shrink-0 ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
        }`}
      >
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Study Sessions
          </span>
          <button
            onClick={onNewConversation}
            className="p-1 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            title="New Question"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="p-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {filteredConvos.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectConversation(c.id)}
              className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                c.id === activeConvoId
                  ? 'bg-indigo-600 text-white font-medium'
                  : darkMode
                  ? 'text-slate-300 hover:bg-slate-800'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare size={13} className="shrink-0 opacity-70" />
                <span className="truncate">{c.title || 'Untitled Session'}</span>
              </div>
              {conversations.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(c.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity ${
                    c.id === activeConvoId ? 'text-white' : 'text-slate-400'
                  }`}
                  title="Delete session"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main AI Tutor Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Toggle drawer bar */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 text-xs text-slate-500">
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <MessageSquare size={14} />
            <span>{showHistoryDrawer ? 'Hide session history' : 'Session history'}</span>
            <span className="font-mono text-[11px] opacity-60">({conversations.length})</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              Style: {studentProfile.preferredExplanationStyle.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {(!activeConvo || activeConvo.messages.length === 0) && (
            <div className="max-w-2xl mx-auto py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-[1px] mx-auto mb-4 shadow-md shadow-indigo-500/10 flex items-center justify-center">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[15px] flex items-center justify-center">
                  <GraduationCap size={30} className="text-indigo-600 dark:text-cyan-400" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Ask StudyMate AI Tutor
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
                Stuck on a tricky lecture topic or assignment question? Ask below for a simple,
                step-by-step conceptual explanation powered by open-weight AI.
              </p>

              {/* Starter Question Cards */}
              <div className="grid sm:grid-cols-3 gap-3 mt-8 text-left">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt.text)}
                    className={`p-4 rounded-xl border text-left transition-all group flex flex-col justify-between ${
                      darkMode
                        ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                        {prompt.subject}
                      </span>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {prompt.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {prompt.text}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Ask question</span>
                      <ArrowRight size={12} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeConvo?.messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-3xl ${
                  isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <GraduationCap size={16} />
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[85%] sm:max-w-[80%]`}>
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                        : darkMode
                        ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words space-y-2">
                      {message.content ? (
                        message.content
                      ) : isGenerating ? (
                        <div className="flex items-center gap-2 py-1 text-xs text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          <span>StudyMate AI is preparing simple explanation...</span>
                        </div>
                      ) : (
                        <span className="italic text-slate-400">Empty response</span>
                      )}
                    </div>
                  </div>

                  {/* Message action bar */}
                  {!isUser && message.content && (
                    <div className="flex items-center gap-2 px-1 text-slate-400 text-xs">
                      <button
                        onClick={() => handleCopyText(message.id, message.content)}
                        className="p-1 rounded hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                        title="Copy explanation"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check size={13} className="text-emerald-500" />
                            <span className="text-[11px] text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(message.id, message.content)}
                        className="p-1 rounded hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                        title="Read aloud"
                      >
                        {speakingMsgId === message.id ? (
                          <>
                            <VolumeX size={13} className="text-indigo-500" />
                            <span className="text-[11px] text-indigo-500">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={13} />
                            <span className="text-[11px]">Read</span>
                          </>
                        )}
                      </button>

                      <span className="font-mono text-[10px] text-slate-400 ml-auto">
                        {message.modelUsed || modelConfig.model}
                      </span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User size={15} />
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 backdrop-blur-md bg-white/80 dark:bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`max-w-3xl mx-auto rounded-2xl border p-2 flex items-end gap-2 transition-all shadow-xs ${
              darkMode
                ? 'bg-slate-900 border-slate-700 focus-within:border-indigo-500'
                : 'bg-white border-slate-200 focus-within:border-indigo-500'
            }`}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask StudyMate AI any study or college question...`}
              className="flex-1 bg-transparent border-none focus:outline-none resize-none px-3 py-2 text-sm text-slate-900 dark:text-slate-100 max-h-32 min-h-[40px]"
            />

            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 disabled:opacity-40 transition-opacity shrink-0 shadow-xs"
              aria-label="Send Question"
            >
              <Send size={16} />
            </button>
          </form>

          <div className="max-w-3xl mx-auto mt-2 px-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Powered by open-weight AI (Gemma 2 / Local Ollama)</span>
            <span className="font-mono text-[10px]">
              Engine: {modelConfig.provider}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
