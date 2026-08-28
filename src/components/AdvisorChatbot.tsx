import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  Pause,
  Play,
  Square,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';
import {
  ChatMessage,
  AdvisorContext,
  generateAdvisorResponse
} from '../services/advisorBotService';
import {
  isSpeechRecognitionAvailable,
  startVoiceRecognition,
  stopVoiceRecognition,
  SPEECH_LANG_MAP
} from '../services/speechRecognition';
import {
  isSpeechSynthesisAvailable,
  playVoiceOutput,
  stopVoiceOutput,
  pauseVoiceOutput,
  resumeVoiceOutput
} from '../services/speechSynthesis';
import { CompleteAnalysisReport, UserBusinessInput, LocationData } from '../types';

interface AdvisorChatbotProps {
  currentInput?: UserBusinessInput;
  currentLocation?: LocationData;
  analysisReport?: CompleteAnalysisReport | null;
  onUpdateInput?: (updated: Partial<UserBusinessInput>) => void;
  onTriggerAnalysis?: () => void;
  onResetAnalysis?: () => void;
}

export const AdvisorChatbot: React.FC<AdvisorChatbotProps> = ({
  currentInput,
  currentLocation,
  analysisReport,
  onUpdateInput,
  onTriggerAnalysis,
  onResetAnalysis
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen, interimTranscript]);

  // Initial welcome greeting on first open or language change
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMap: Record<SupportedLanguage, string> = {
        en: 'Hello! I am your **UDYORA AI Business Advisor**. I can give you exact answers on your **monthly EMI**, **loan calculations**, **government schemes (PMEGP/Mudra)**, **business risks**, or **market evidence** in your selected village. What would you like to explore?',
        hi: 'नमस्ते! मैं आपका **UDYORA AI व्यवसाय सलाहकार** हूँ। मैं आपको आपकी **मासिक EMI**, **सरकारी योजनाओं (PMEGP/Mudra)**, **व्यवसाय के जोखिमों** या **बाज़ार आंकड़ों** के सटीक उत्तर दे सकता हूँ। आप क्या जानना चाहते हैं?',
        te: 'నమస్కారం! నేను మీ **UDYORA AI వ్యాపార సలహాదారుని**. మీ **నెలవారీ EMI**, **ప్రభుత్వ పథకాలు (PMEGP/ముద్ర)**, **వ్యాపార రిస్కులు**, మరియు **మార్కెట్ డేటా** పై ఖచ్చితమైన సమాచారం ఇవ్వగలను. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు?',
        mr: 'नमस्कार! मी तुमचा **UDYORA AI व्यवसाय सल्लागार** आहे. मी तुम्हाला तुमचा **मासिक EMI**, **शासकीय योजना (PMEGP/Mudra)**, **व्यवसायातील जोखीम** किंवा **बाजार माहिती** याबद्दल अचूक माहिती देऊ शकतो.',
        kn: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ **UDYORA AI ಉದ್ಯಮ ಸಲಹೆಗಾರ**. ನಿಮ್ಮ **ಮಾಸಿಕ EMI**, **ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು (PMEGP/ಮುದ್ರ)**, **ವ್ಯವಹಾರದ ಅಪಾಯಗಳು** ಮತ್ತು **ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ** ಬಗ್ಗೆ ನಿಖರವಾದ ಉತ್ತರಗಳನ್ನು ನೀಡಬಲ್ಲೆ.'
      };

      setMessages([
        {
          id: 'welcome_1',
          sender: 'assistant',
          text: welcomeMap[language] || welcomeMap.en,
          timestamp: new Date().toISOString(),
          topic: 'general',
          dataQuality: 'VERIFIED'
        }
      ]);
    }
  }, [language, messages.length]);

  // Quick Suggestion Prompts
  const quickPromptsMap: Record<SupportedLanguage, string[]> = {
    en: [
      'What is my EMI?',
      'Which scheme matches me?',
      'What are my biggest risks?',
      'Where did this data come from?',
      'Summarize my report'
    ],
    hi: [
      'मेरी EMI कितनी है?',
      'कौन सी योजना सही है?',
      'मुख्य जोखिम क्या हैं?',
      'डेटा कहाँ से आया?',
      'रिपोर्ट का सारांश बताएं'
    ],
    te: [
      'నా EMI ఎంత?',
      'నాకు ఏ పథకం సరిపోతుంది?',
      'ప్రధాన రిస్కులు ఏంటి?',
      'ఈ డేటా ఎక్కడి నుండి వచ్చింది?',
      'నా రిపోర్ట్ సారాంశం చెప్పండి'
    ],
    mr: [
      'माझी EMI किती आहे?',
      'कोणती शासकीय योजना मिळेल?',
      'मुख्य धोके कोणते?',
      'डेटा कुठून आला?',
      'अहवालाचा सारांश द्या'
    ],
    kn: [
      'ನನ್ನ EMI ಎಷ್ಟು?',
      'ಯಾವ ಯೋಜನೆ ಸೂಕ್ತ?',
      'ಮುಖ್ಯ ಅಪಾಯಗಳು ಯಾವುವು?',
      'ಮಾಹಿತಿಯ ಮೂಲ ಯಾವುದು?',
      'ವರದಿಯ ಸಾರಾಂಶ ತಿಳಿಸಿ'
    ]
  };

  const quickPrompts = quickPromptsMap[language] || quickPromptsMap.en;

  // Multilingual listening label
  const listeningLabels: Record<SupportedLanguage, string> = {
    en: 'Listening in English...',
    hi: 'हिन्दी में सुन रहा हूँ...',
    te: 'తెలుగులో వింటున్నాను...',
    mr: 'मराठीत ऐकत आहे...',
    kn: 'ಕನ್ನಡದಲ್ಲಿ ಆಲಿಸಲಾಗುತ್ತಿದೆ...'
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    // Stop speaking if new query arrives
    stopVoiceOutput();
    setSpeakingMessageId(null);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setInterimTranscript('');
    setIsThinking(true);

    const context: AdvisorContext = {
      userInput: currentInput,
      location: currentLocation,
      analysisReport,
      language
    };

    try {
      const assistantMsg = await generateAdvisorResponse(text, context, newHistory);
      setMessages([...newHistory, assistantMsg]);
    } catch (err) {
      console.error('Advisor response error:', err);
      const fallbackMsg: ChatMessage = {
        id: `assistant_err_${Date.now()}`,
        sender: 'assistant',
        text: 'I apologize, but an error occurred while processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        topic: 'general'
      };
      setMessages([...newHistory, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Voice Input Recognition Handler
  const handleToggleVoiceInput = () => {
    if (!isSpeechRecognitionAvailable()) {
      setVoiceNotice('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    if (isListening) {
      stopVoiceRecognition();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      setIsListening(true);
      setVoiceNotice(null);

      startVoiceRecognition({
        language,
        onStart: () => {
          setIsListening(true);
        },
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            setInputText(transcript);
            setInterimTranscript('');
            setIsListening(false);
          } else {
            setInterimTranscript(transcript);
          }
        },
        onError: (err) => {
          console.warn('[Chatbot Voice Input Error]:', err);
          setIsListening(false);
          setInterimTranscript('');
        },
        onEnd: () => {
          setIsListening(false);
          setInterimTranscript('');
        }
      });
    }
  };

  // Voice Output Speech Synthesis Handler
  const handleSpeakMessage = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      if (isSpeechPaused) {
        resumeVoiceOutput();
        setIsSpeechPaused(false);
      } else {
        pauseVoiceOutput();
        setIsSpeechPaused(true);
      }
      return;
    }

    stopVoiceOutput();
    setSpeakingMessageId(msg.id);
    setIsSpeechPaused(false);

    const success = playVoiceOutput({
      text: msg.text,
      language,
      onStart: () => {
        setSpeakingMessageId(msg.id);
        setIsSpeechPaused(false);
      },
      onEnd: () => {
        setSpeakingMessageId(null);
        setIsSpeechPaused(false);
      },
      onError: () => {
        setSpeakingMessageId(null);
        setIsSpeechPaused(false);
        setVoiceNotice('Voice playback is unavailable for this language on this browser.');
        setTimeout(() => setVoiceNotice(null), 3000);
      }
    });

    if (!success) {
      setSpeakingMessageId(null);
    }
  };

  const handleStopSpeaking = () => {
    stopVoiceOutput();
    setSpeakingMessageId(null);
    setIsSpeechPaused(false);
  };

  const handleResetChat = () => {
    stopVoiceOutput();
    setSpeakingMessageId(null);
    setMessages([]);
  };

  // Get most recent intent from last assistant message for debug display
  const latestAssistantMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
  const latestIntent = latestAssistantMsg?.intentResult;

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden">
      {/* Floating Chat Trigger Button (Fixed Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open UDYORA AI Advisor"
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer border border-slate-700/80 text-xs font-bold"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
          <span>Ask UDYORA</span>
        </button>
      )}

      {/* Main Chat Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:bottom-4 sm:right-4 sm:inset-auto w-full sm:w-[420px] md:w-[460px] h-[92vh] sm:h-[620px] max-h-[100vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-fadeIn backdrop-blur-md z-50">
          {/* Drawer Top Header */}
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight text-white">
                    UDYORA AI Business Advisor
                  </span>
                  <span className="text-[9px] font-mono uppercase bg-blue-900 text-blue-200 px-1.5 py-0.2 rounded border border-blue-700">
                    Live
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Contextual • Deterministic Engine
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Development Debug Toggle */}
              {process.env.NODE_ENV !== 'production' && (
                <button
                  onClick={() => setShowDebugPanel(!showDebugPanel)}
                  title="Toggle Intelligence Debug Inspector"
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    showDebugPanel ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleResetChat}
                title="Clear conversation history"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  stopVoiceOutput();
                  stopVoiceRecognition();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Development Debug Inspector Strip */}
          {showDebugPanel && latestIntent && (
            <div className="bg-slate-950 text-slate-300 px-3 py-2 text-[10px] font-mono border-b border-slate-800 shrink-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">Intent: {latestIntent.intent}</span>
                <span className="text-emerald-400">Confidence: {(latestIntent.confidence * 100).toFixed(0)}%</span>
                <span className="text-blue-300">Locale: {SPEECH_LANG_MAP[language]}</span>
              </div>
              <div className="text-slate-400 truncate">
                Service: <span className="text-slate-200">{latestIntent.serviceCalled}</span>
              </div>
            </div>
          )}

          {/* Notice Feedback Banner */}
          {voiceNotice && (
            <div className="p-2 bg-blue-50 border-b border-blue-200 text-xs text-blue-900 font-medium flex items-center justify-between">
              <span>{voiceNotice}</span>
              <button onClick={() => setVoiceNotice(null)} className="text-blue-600 font-bold ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Chat Messages Scroll Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeakingThis = speakingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="max-w-[85%] space-y-1">
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs'
                      }`}
                    >
                      {/* Formatted Message Body with Markdown formatting */}
                      <div className="whitespace-pre-line">
                        {msg.text.split('\n').map((line, idx) => {
                          const isBold = line.startsWith('**') && line.endsWith('**');
                          const isBullet = line.startsWith('• ') || line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ');

                          if (isBold) {
                            return (
                              <p key={idx} className="font-bold text-slate-950 mt-1">
                                {line.replace(/\*\*/g, '')}
                              </p>
                            );
                          }

                          return (
                            <p key={idx} className={isBullet ? 'pl-2 text-slate-800' : ''}>
                              {line.split('**').map((chunk, cIdx) => (
                                cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-slate-950">{chunk}</strong> : chunk
                              ))}
                            </p>
                          );
                        })}
                      </div>

                      {/* Quick Action Suggestions for Out of Scope / Unclear */}
                      {msg.suggestedQuickActions && msg.suggestedQuickActions.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {msg.suggestedQuickActions.map((actionLabel, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handleSend(actionLabel)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors cursor-pointer"
                            >
                              {actionLabel}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action trigger button if suggested by agent */}
                      {msg.suggestedAction === 'TRIGGER_ANALYSIS' && onTriggerAnalysis && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              onTriggerAnalysis();
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-blue-900 transition-colors cursor-pointer shadow-xs"
                          >
                            <span>▶ Run Multi-Agent Analysis</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {msg.suggestedAction === 'RESET_ANALYSIS' && onResetAnalysis && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              onResetAnalysis();
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shadow-xs"
                          >
                            <span>↺ Reset Session</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Meta Bar (Timestamp, Provenance Badge & TTS speaker) */}
                    {!isUser && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pl-1">
                        {msg.dataQuality && (
                          <span
                            className={`font-mono uppercase px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              msg.dataQuality === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {msg.dataQuality}
                          </span>
                        )}

                        <button
                          onClick={() => handleSpeakMessage(msg)}
                          title={isSpeakingThis ? 'Pause / Resume Speech' : 'Read aloud in selected language'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                            isSpeakingThis
                              ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold animate-pulse'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isSpeakingThis ? (
                            isSpeechPaused ? <Play className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5 text-blue-700" />
                          ) : (
                            <Volume2 className="w-2.5 h-2.5" />
                          )}
                          <span>{isSpeakingThis ? (isSpeechPaused ? 'Paused' : 'Speaking...') : 'Listen'}</span>
                        </button>

                        {isSpeakingThis && (
                          <button
                            onClick={handleStopSpeaking}
                            title="Stop speech"
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
                          >
                            <Square className="w-2.5 h-2.5 fill-current" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Calculating Spinner */}
            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs max-w-[200px]">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span>Computing localized data...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isThinking}
                className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-300 border border-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Live Listening Status Banner */}
          {isListening && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between text-xs text-blue-900 font-bold shrink-0 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>{listeningLabels[language] || listeningLabels.en}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 truncate max-w-[180px]">
                {interimTranscript || 'Speak now...'}
              </span>
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            {/* Voice Input Mic Toggle */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              title={isListening ? 'Stop Listening' : `Voice Dictation in ${language.toUpperCase()}`}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-50 border-rose-300 text-rose-600 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Query Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? (interimTranscript || 'Listening...') : 'Ask about EMI, schemes, risks, or market...'}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
            />

            {/* Send CTA */}
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-blue-900 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
