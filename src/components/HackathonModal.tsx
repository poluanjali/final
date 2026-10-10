import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Zap, 
  FileText, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Play, 
  Layers, 
  Code2, 
  Mic, 
  Video, 
  ShieldCheck, 
  Brain, 
  X, 
  Send,
  Loader2,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { EvaluationReport, InterviewSession } from '../types';
import { INTERVIEWERS } from '../lib/storage';

interface HackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchQuickMock: (session: InterviewSession) => void;
  onOpenReport: (reportId: string) => void;
  reports: EvaluationReport[];
}

const PRESET_SANDBOX_QUESTIONS = [
  {
    role: 'Frontend Developer',
    question: 'Explain how the Virtual DOM works in React and how the reconciliation algorithm minimizes actual DOM mutations.',
    sampleWeakAnswer: 'Virtual DOM is a copy of real DOM in memory. When state changes, it creates a new Virtual DOM and updates the screen.',
    sampleStrongAnswer: 'The Virtual DOM is a lightweight JavaScript object representation of the real DOM. When state changes, React creates a new tree and runs the Reconciliation algorithm (via the Fiber reconciler) to diff the new tree against the old tree in O(N) heuristic time instead of O(N^3). It batches changes, identifies unchanged nodes via keys, and computes minimal mutations before flushing them in the commit phase to prevent expensive layout thrashing.',
  },
  {
    role: 'Backend / Node.js Developer',
    question: 'How does the Node.js Event Loop process asynchronous I/O, and what is the difference between microtasks and macrotasks?',
    sampleWeakAnswer: 'Node.js is single-threaded and handles async tasks using callbacks and promises so it does not block the main thread.',
    sampleStrongAnswer: 'Node.js delegates asynchronous blocking I/O to the OS kernel or the libuv threadpool (default 4 threads). The event loop cycles through phases: timers (setTimeout), pending callbacks, idle/prepare, poll (incoming I/O), check (setImmediate), and close callbacks. Microtasks (process.nextTick and Promise.then) are drained immediately after every single synchronous turn before moving to the next macrotask, with process.nextTick having highest priority.',
  },
  {
    role: 'Full Stack / System Design',
    question: 'How would you design a scalable URL shortener service handling 100M active daily clicks and prevent hash collisions?',
    sampleWeakAnswer: 'I would use a database with an auto-incrementing ID or MD5 hash, store it in MySQL, and redirect users when they visit the short URL.',
    sampleStrongAnswer: 'To handle 100M clicks/day (~1,200 reads/sec, 10:1 read-to-write ratio), I would use Base62 encoding (a-z, A-Z, 0-9) on a distributed 64-bit unique ID generator (like Twitter Snowflake or a ZooKeeper key range range server) to produce 7-character URLs (3.5 trillion capacity) without hash collisions. For high-throughput reads, I would implement an in-memory Redis cluster caching the top 20% most accessed URLs with LRU eviction, backed by a distributed NoSQL key-value store (DynamoDB/Cassandra) with multi-region CDN edge caching.',
  },
];

export const HackathonModal: React.FC<HackathonModalProps> = ({
  isOpen,
  onClose,
  onLaunchQuickMock,
  onOpenReport,
  reports,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'sandbox' | 'architecture'>('demo');

  // Sandbox state
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customRole, setCustomRole] = useState(PRESET_SANDBOX_QUESTIONS[0].role);
  const [customQuestion, setCustomQuestion] = useState(PRESET_SANDBOX_QUESTIONS[0].question);
  const [customAnswer, setCustomAnswer] = useState(PRESET_SANDBOX_QUESTIONS[0].sampleWeakAnswer);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (idx: number, type: 'weak' | 'strong') => {
    setSelectedPresetIndex(idx);
    const preset = PRESET_SANDBOX_QUESTIONS[idx];
    setCustomRole(preset.role);
    setCustomQuestion(preset.question);
    setCustomAnswer(type === 'strong' ? preset.sampleStrongAnswer : preset.sampleWeakAnswer);
    setSandboxResult(null);
  };

  const handleRunSandboxEvaluation = async () => {
    if (!customQuestion.trim() || !customAnswer.trim()) return;
    setIsEvaluating(true);
    setSandboxResult(null);

    try {
      const res = await fetch('/api/evaluate-single-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: customRole,
          question: customQuestion,
          candidateAnswer: customAnswer,
        }),
      });
      const data = await res.json();
      setSandboxResult(data);
    } catch (e) {
      console.error('Failed to run sandbox evaluation:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleStartFastTrackMock = () => {
    const quickSession: InterviewSession = {
      id: 'sess-judge-' + Date.now(),
      mode: 'quick',
      title: 'Software Developer - Technical (Hackathon Fast-Track)',
      role: 'Software Developer',
      company: 'Tech Recruiter',
      difficulty: 'Campus / Entry',
      interviewer: INTERVIEWERS[0],
      topics: ['Technical', 'Problem Solving', 'Communication'],
      createdAt: Date.now(),
      status: 'in_progress',
      totalQuestions: 2,
      permissionsApproved: true,
    };
    onClose();
    onLaunchQuickMock(quickSession);
  };

  const handleViewBenchmarkReport = () => {
    if (reports.length > 0) {
      onOpenReport(reports[0].id);
    }
    onClose();
  };

  const handleCopySampleAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header with Problem Statement & Badges */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#1E1B4B] text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span>Hackathon Showcase & Evaluation Guide</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-medium">
                  Problem Statement Solution
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Conduct AI-powered mock interviews and provide detailed feedback
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed max-w-2xl">
                MockMate simulates high-stakes campus placement and technical interviews with live multimodal probing, strict 100-point scoring, missing concept extraction, and concrete actionable feedback.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Close Guide"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-5 border-t border-indigo-400/20 pt-3">
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-indigo-200 hover:bg-white/10'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>⚡ Judge Fast-Track</span>
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sandbox'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-indigo-200 hover:bg-white/10'
              }`}
            >
              <Brain className="h-3.5 w-3.5" />
              <span>🧪 Live AI Grading Sandbox</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-white text-indigo-950 shadow-sm'
                  : 'text-indigo-200 hover:bg-white/10'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>🏛️ System Architecture</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: JUDGE FAST-TRACK */}
          {activeTab === 'demo' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Action 1: Launch 2-Min Live Mock */}
                <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white hover:border-[#5452F6] hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-[#5452F6] text-[11px] font-extrabold uppercase tracking-wider">
                        Fast 2-Question Loop
                      </span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        ⏱️ ~2 Minutes
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      1-Click Live Mock Interview
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Experience the live interactive interview with voice synthesis, real-time speech transcription, dynamic adaptive follow-up probing, webcam composure telemetry, and auto-submit on silence.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Interactive AI Recruiter (Aria) speaks questions out loud</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Instant demo presets available inside the room for noise-free testing</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Generates full feedback report upon completion</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={handleStartFastTrackMock}
                    className="mt-5 w-full py-3 px-4 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>Launch 2-Min Live Mock Now</span>
                  </button>
                </div>

                {/* Action 2: Inspect Gold-Standard Evaluation Report */}
                <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wider">
                        Full Diagnostics
                      </span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        🎯 Instant Inspection
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Inspect Detailed Feedback Report
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Directly review the comprehensive evaluation report card built for campus placement and engineering bar-raiser evaluations.
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Score out of 100</strong> with 5-category rubric breakdown</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Missing Concepts Highlighted</strong> per question</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Why it needs improvement</strong> & mark deduction explanation</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Stronger Sample Answers</strong> with STAR / production criteria</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={handleViewBenchmarkReport}
                    className="mt-5 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Open Detailed Evaluation Report</span>
                  </button>
                </div>

              </div>

              {/* What makes this hackathon-ready callout */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#5452F6]" />
                  <span>Key Differentiators for Hackathon Judges</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="font-bold text-slate-900">1. Multimodal Real-Time</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">Live Web Speech API + Gemini 3.5 Transcribe audio fallback, decibel sound meter, and webcam composure monitoring.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="font-bold text-slate-900">2. Adaptive Dynamic Follow-ups</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">AI dynamically detects omissions in the candidate's answer and asks targeted follow-ups just like a real tech lead.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="font-bold text-slate-900">3. Zero Grade Inflation</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">Unanswered prompts receive 0/100. Pinpoints exact missing concepts instead of generic "good job" placeholders.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE AI GRADING SANDBOX */}
          {activeTab === 'sandbox' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Live AI Answer Evaluation Sandbox
                  </h3>
                  <p className="text-xs text-slate-500">
                    Test Gemini 3.8 Flash live on any question and answer to see real-time 100-point scoring, missing concept extraction, and model answer creation.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-[11px] font-semibold text-slate-500">Preset:</span>
                  {PRESET_SANDBOX_QUESTIONS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(idx, 'weak')}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedPresetIndex === idx
                          ? 'bg-[#5452F6] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.role.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Forms */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Target Role</label>
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Interview Question</label>
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Candidate's Submitted Answer</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectPreset(selectedPresetIndex, 'weak')}
                        className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded cursor-pointer"
                        title="Load answer missing key concepts to see deduction"
                      >
                        ⚠️ Load Incomplete Answer
                      </button>
                      <button
                        onClick={() => handleSelectPreset(selectedPresetIndex, 'strong')}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded cursor-pointer"
                        title="Load benchmark answer to see high score"
                      >
                        ✨ Load Strong Answer
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder="Type or paste a candidate answer to grade..."
                    className="w-full mt-1 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleRunSandboxEvaluation}
                    disabled={isEvaluating}
                    className="py-2.5 px-5 rounded-xl bg-[#5452F6] hover:bg-[#4341E8] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Evaluating with Gemini 3.8 Flash...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 fill-white" />
                        <span>Run AI Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Evaluation Result View */}
              {sandboxResult && (
                <div className="p-5 rounded-2xl bg-white border-2 border-indigo-200 shadow-md space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Live AI Evaluation Score</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black ${
                          sandboxResult.score >= 80 ? 'text-emerald-600' : sandboxResult.score >= 60 ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {sandboxResult.score}
                        </span>
                        <span className="text-slate-400 font-bold text-sm">/ 100</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          sandboxResult.score >= 80 ? 'bg-emerald-100 text-emerald-800' : sandboxResult.score >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sandboxResult.score >= 80 ? 'Placement Ready' : sandboxResult.score >= 60 ? 'Near Ready' : 'Needs Practice'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 font-medium">Evaluator: Gemini 3.8 Flash</span>
                      <p className="text-xs text-slate-700 font-semibold max-w-xs">{sandboxResult.feedback}</p>
                    </div>
                  </div>

                  {/* Missing Concepts Highlighted */}
                  {sandboxResult.missingConcepts && sandboxResult.missingConcepts.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                        <span>Missing Concepts (Why marks were lost)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sandboxResult.missingConcepts.map((concept: string, cIdx: number) => (
                          <span
                            key={cIdx}
                            className="px-2.5 py-1 rounded-md bg-white border border-rose-300 text-rose-900 text-xs font-semibold shadow-2xs"
                          >
                            🔍 {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Why it needs improvement */}
                  {sandboxResult.whyItNeedsImprovement && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 leading-relaxed">
                      <span className="font-bold text-amber-900 block mb-1">
                        ⚠️ Why this answer needs improvement:
                      </span>
                      {sandboxResult.whyItNeedsImprovement}
                    </div>
                  )}

                  {/* Stronger Sample Answer */}
                  {sandboxResult.sampleAnswer && (
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs leading-relaxed space-y-2">
                      <div className="flex items-center justify-between text-indigo-300 font-bold">
                        <span>💡 Stronger Model Answer (Benchmark Standard):</span>
                        <button
                          onClick={() => handleCopySampleAnswer(sandboxResult.sampleAnswer)}
                          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white cursor-pointer"
                        >
                          {copiedAnswer ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedAnswer ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-slate-200">{sandboxResult.sampleAnswer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYSTEM ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900">
                End-to-End System Architecture
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Mic className="h-4 w-4" />
                    <span>1. Multimodal Intake Layer</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Uses Web Speech API continuous speech recognition for zero-latency in-browser transcription. When ambient noise or unaccented speech occurs, sends audio chunks to <strong>gemini-3.5-transcribe</strong> on the server. Simultaneously runs Web Audio AnalyserNode to calculate candidate voice decibels and silence auto-submission countdown.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Brain className="h-4 w-4" />
                    <span>2. Adaptive Follow-up Engine</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Powered by <strong>gemini-3.8-flash</strong>. After the candidate responds to a primary technical question, the engine analyzes their exact transcript. If architectural mechanics or trade-offs were omitted, the AI immediately asks a dynamic follow-up to test resilience.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Target className="h-4 w-4" />
                    <span>3. 100-Point Rubric Pipeline</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Applies ruthless campus placement grading: 0/100 for silence or skipped prompts, 20-50 for superficial answers, and 85-95 only for answers that integrate Big-O complexity, edge cases, and architectural trade-offs. Generates structured JSON matching types.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>4. Proctoring & Actionable Plan</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tracks tab switches, face mirror orientation, full-screen maintenance, and calculates a Proctor Trust Score. Synthesizes a personalized 7-Day remediation drill plan with markdown and PDF export.
                  </p>
                </div>

              </div>

              {/* Tech Stack Pills */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Production Tech Stack</span>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Google GenAI SDK (@google/genai)</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">gemini-3.8-flash</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">gemini-3.5-transcribe</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">React 19 + TypeScript</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Tailwind CSS</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Express + Node.js (tsx)</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Web Speech API</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Web Audio API</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Ready to evaluate? Use the quick actions or test the live grading engine.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
