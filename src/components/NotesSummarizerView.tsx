import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Trash2,
  BookOpen,
  ArrowRight,
  ListChecks,
  KeyRound,
  Download,
} from 'lucide-react';
import { ModelConfig, NoteSummary, StudentProfile } from '../types';
import { streamChat } from '../services/api';

interface NotesSummarizerViewProps {
  noteSummaries: NoteSummary[];
  onSaveSummaries: (summaries: NoteSummary[]) => void;
  onIncrementNotesCount: () => void;
  modelConfig: ModelConfig;
  studentProfile: StudentProfile;
  darkMode: boolean;
}

export const NotesSummarizerView: React.FC<NotesSummarizerViewProps> = ({
  noteSummaries,
  onSaveSummaries,
  onIncrementNotesCount,
  modelConfig,
  studentProfile,
  darkMode,
}) => {
  const [notesInput, setNotesInput] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('General');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<{
    conciseSummary: string;
    importantPoints: string[];
    keyTerms: { term: string; definition: string }[];
  } | null>(null);
  const [rawStreamText, setRawStreamText] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selectedSummaryId, setSelectedSummaryId] = useState<string | null>(
    noteSummaries[0]?.id || null
  );

  const sampleNotes = [
    {
      title: 'Neurobiology: Action Potentials & Synaptic Transmission',
      subject: 'Biology',
      text: `Neurons communicate via electrochemical signals. The resting membrane potential is typically -70mV, maintained by the sodium-potassium ATPase pump (3 Na+ out, 2 K+ in). When a stimulus depolarizes the membrane past the threshold (around -55mV), voltage-gated Na+ channels rapidly open, causing a sharp influx of sodium (depolarization). At roughly +30mV, sodium channels inactivate and voltage-gated K+ channels open, allowing potassium efflux (repolarization). Hyperpolarization briefly occurs before returning to resting state. The refractory period ensures unidirectional propagation. At the axon terminal, voltage-gated Ca2+ channels trigger the exocytosis of neurotransmitter vesicles into the synaptic cleft, binding to ligand-gated ion channels on the postsynaptic dendrite.`,
    },
    {
      title: 'Economics: Market Structures & Price Elasticity',
      subject: 'Economics',
      text: `Market equilibrium occurs where quantity demanded equals quantity supplied. Price elasticity of demand (PED) measures the responsiveness of quantity demanded to a price change. When PED > 1, demand is elastic; when PED < 1, demand is inelastic. In perfect competition, numerous firms produce identical products and act as price takers, with zero economic profit in the long run. In a monopoly, a single firm with significant barriers to entry sets price and quantity, creating deadweight loss. Monopolistic competition features many firms selling differentiated goods with downward-sloping demand curves. Oligopoly involves a few dominant firms exhibiting strategic interdependence, often analyzed using game theory (such as the Nash Equilibrium and Prisoner's Dilemma).`,
    },
    {
      title: 'Data Structures: Hash Tables & Collision Resolution',
      subject: 'Computer Science',
      text: `A hash table implements an associative array abstract data type that maps keys to values using a mathematical hash function. An ideal hash function distributes keys uniformly across slots. Collisions occur when two distinct keys produce the same hash index. Two standard collision resolution strategies are separate chaining and open addressing. In separate chaining, each bucket holds a linked list or red-black tree of colliding entries. In open addressing, collisions are placed in alternative empty slots via linear probing, quadratic probing, or double hashing. The load factor (alpha = n/k) determines performance; when alpha exceeds 0.7 to 0.75, resizing and rehashing to a larger array is necessary to maintain average O(1) time complexity.`,
    },
  ];

  const handleSummarize = async () => {
    if (!notesInput.trim() || isSummarizing) return;

    setIsSummarizing(true);
    setRawStreamText('');
    setCurrentSummary(null);

    const prompt = `Please analyze and summarize these college lecture notes:
Title / Subject: ${noteTitle || 'Lecture Notes'} (${noteSubject})

Notes text:
"${notesInput}"

Format your response strictly as valid JSON with this exact structure:
{
  "conciseSummary": "A clear, 2-3 sentence executive summary capturing the core premise and significance.",
  "importantPoints": [
    "Key high-yield takeaway 1",
    "Key high-yield takeaway 2",
    "Key high-yield takeaway 3",
    "Key high-yield takeaway 4",
    "Key high-yield takeaway 5"
  ],
  "keyTerms": [
    {"term": "Term 1", "definition": "Clear, concise academic definition."},
    {"term": "Term 2", "definition": "Clear, concise academic definition."},
    {"term": "Term 3", "definition": "Clear, concise academic definition."}
  ]
}
Return ONLY the raw JSON object, without code fence markers or conversational preamble.`;

    let accumulated = '';

    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      modelConfig,
      studentProfile,
      modeDescription:
        'You are an expert college notes summarizer. Extract concise summaries, testable bullet points, and key definitions in strict JSON format.',
      onChunk: (chunk) => {
        accumulated += chunk;
        setRawStreamText(accumulated);
      },
      onDone: (full) => {
        setIsSummarizing(false);
        onIncrementNotesCount();
        const textToParse = full || accumulated;
        try {
          const cleaned = textToParse.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed.conciseSummary && Array.isArray(parsed.importantPoints)) {
            const summaryObj: NoteSummary = {
              id: 'ns_' + Date.now(),
              title: noteTitle.trim() || 'Lecture Notes Summary',
              subject: noteSubject.trim() || 'General',
              originalNotes: notesInput,
              conciseSummary: parsed.conciseSummary,
              importantPoints: parsed.importantPoints,
              keyTerms: parsed.keyTerms || [],
              createdAt: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            };

            setCurrentSummary(parsed);
            onSaveSummaries([summaryObj, ...noteSummaries]);
            setSelectedSummaryId(summaryObj.id);
          }
        } catch (e) {
          console.error('Notes JSON parsing error', e);
          // Fallback parsing
          const fallbackObj: NoteSummary = {
            id: 'ns_fb_' + Date.now(),
            title: noteTitle.trim() || 'Lecture Notes Summary',
            subject: noteSubject.trim() || 'General',
            originalNotes: notesInput,
            conciseSummary: textToParse.slice(0, 300),
            importantPoints: ['Core principles analyzed', 'Key lecture themes extracted'],
            keyTerms: [{ term: 'Subject Overview', definition: textToParse.slice(0, 100) }],
            createdAt: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          };
          setCurrentSummary(fallbackObj);
          onSaveSummaries([fallbackObj, ...noteSummaries]);
          setSelectedSummaryId(fallbackObj.id);
        }
      },
      onError: (err) => {
        setIsSummarizing(false);
        alert(`Summarization failed: ${err}`);
      },
    });
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDeleteSummary = (id: string) => {
    const updated = noteSummaries.filter((s) => s.id !== id);
    onSaveSummaries(updated);
    if (selectedSummaryId === id && updated.length > 0) {
      setSelectedSummaryId(updated[0].id);
    }
  };

  const selectedSummary =
    noteSummaries.find((s) => s.id === selectedSummaryId) || noteSummaries[0] || null;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="text-blue-600 dark:text-blue-400" />
              <span>Lecture Notes Summarizer</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Transform dense textbooks and lecture notes into concise summaries, key points, and terminology.
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {noteSummaries.length}
            </span>
            <span>Summaries Archived</span>
          </div>
        </div>

        {/* 1. Input Box */}
        <div
          className={`p-6 rounded-3xl border transition-all ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lecture / Topic Title
              </label>
              <input
                type="text"
                placeholder="e.g. Bio 101: Cell Respiration & ATP"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Biology, Economics, CS"
                value={noteSubject}
                onChange={(e) => setNoteSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Paste Lecture Notes or Textbook Excerpt
            </label>
            <textarea
              rows={6}
              placeholder="Paste raw lecture notes, slide transcriptions, or reading materials here..."
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Sample Notes Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-400">Load sample college lecture:</span>
            {sampleNotes.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setNoteTitle(sample.title);
                  setNoteSubject(sample.subject);
                  setNotesInput(sample.text);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                {sample.subject}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              {notesInput.length} characters
            </span>

            <button
              onClick={handleSummarize}
              disabled={!notesInput.trim() || isSummarizing}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-95 disabled:opacity-40 transition-opacity flex items-center gap-1.5 text-xs shadow-xs"
            >
              <Sparkles size={14} />
              <span>{isSummarizing ? 'Analyzing & Summarizing...' : 'Generate Notes Summary'}</span>
            </button>
          </div>
        </div>

        {/* 2. Structured Summary Display */}
        {selectedSummary && (
          <div className="space-y-6">
            {/* Header of summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {selectedSummary.subject}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedSummary.title}
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  Summarized on {selectedSummary.createdAt}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy(
                      `${selectedSummary.title}\n\nSummary:\n${selectedSummary.conciseSummary}\n\nKey Points:\n${selectedSummary.importantPoints.join(
                        '\n'
                      )}`,
                      'all'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  {copiedType === 'all' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copiedType === 'all' ? 'Copied' : 'Copy All'}</span>
                </button>

                <button
                  onClick={() => handleDeleteSummary(selectedSummary.id)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500"
                  title="Delete summary"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* A. Concise Summary Card */}
            <div
              className={`p-6 rounded-3xl border ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                <BookOpen size={15} />
                <span>Concise Summary</span>
              </div>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                {selectedSummary.conciseSummary}
              </p>
            </div>

            {/* B. Important Points Card */}
            <div
              className={`p-6 rounded-3xl border ${
                darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
                <ListChecks size={15} />
                <span>Important Points & Takeaways</span>
              </div>

              <ul className="space-y-2.5">
                {selectedSummary.importantPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* C. Key Terms Card */}
            {selectedSummary.keyTerms && selectedSummary.keyTerms.length > 0 && (
              <div
                className={`p-6 rounded-3xl border ${
                  darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4">
                  <KeyRound size={15} />
                  <span>Key Terms & Definitions</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {selectedSummary.keyTerms.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1"
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        {item.term}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Archive Drawer / Past Summaries */}
        {noteSummaries.length > 1 && (
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Saved Lecture Summaries
            </h3>

            <div className="grid sm:grid-cols-3 gap-3">
              {noteSummaries.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSummaryId(s.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    s.id === selectedSummaryId
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400 block mb-0.5">
                    {s.subject}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                    {s.conciseSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
