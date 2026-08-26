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
  HelpCircle,
  Pause,
  Play,
  Square
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  ChatMessage,
  AdvisorContext,
  generateAdvisorResponse
} from '../services/advisorBotService';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  startSpeechRecognition,
  stopSpeechRecognition,
  speakText,
  stopSpeechSynthesis,
  pauseSpeechSynthesis,
  resumeSpeechSynthesis
} from '../services/speechService';
import { CompleteAnalysisReport, UserBusinessInput, LocationData } from '../types';

interface AdvisorChatbotProps {
  currentInput?: UserBusinessInput;
  currentLocation?: LocationData;
  analysisReport?: CompleteAnalysisReport | null;
}

export const AdvisorChatbot: React.FC<AdvisorChatbotProps> = ({
  currentInput,
  currentLocation,
  analysisReport
}) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Initial welcome greeting on first open or language change
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMap: Record<string, string> = {
        hi: 'नमस्ते! मैं आपका UDYORA बिजनेस एडवाइजर हूँ। आप अपने व्यवसाय, ऋण ईएमआई, सरकारी योजनाओं या जोखिमों के बारे में पूछ सकते हैं।',
        mr: 'नमस्कार! मी आपला UDYORA बिझनेस सल्लागार आहे. आपण प्रकल्प खर्च, कर्ज हप्ता किंवा योजनांबद्दल प्रश्न विचारू शकता.',
        te: 'నమస్కారం! నేను మీ UDYORA బిజినెస్ అడ్వైజర్‌ని. మీ వ్యాపార ప్రాజెక్ట్ ఖర్చు, బ్యాంక్ రుణం, ఈఎమ్‌ఐ లేదా ప్రభుత్వ పథకాల గురించి నన్ను అడగవచ్చు.',
        kn: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ UDYORA ವ್ಯಾಪಾರ ಸಲಹೆಗಾರ. ನಿಮ್ಮ ಯೋಜನೆ, ಬ್ಯಾಂಕ್ ಸಾಲ ಅಥವಾ ಸಬ್ಸಿಡಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು.',
        en: 'Namaste! I am your UDYORA Business Advisor. Ask me about your business feasibility, monthly EMI, matched government schemes, or risk mitigations.'
      };

      setMessages([
        {
          id: 'welcome_1',
          sender: 'assistant',
          text: welcomeMap[language] || welcomeMap.en,
          timestamp: new Date().toISOString(),
          topic: 'general'
        }
      ]);
    }
  }, [language, messages.length]);

  // Clean up speech synthesis and recognition on unmount or close
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      stopSpeechSynthesis();
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    // Stop active speech recognition or synthesis
    stopSpeechRecognition();
    setIsListening(false);
    stopSpeechSynthesis();
    setSpeakingMessageId(null);
    setVoiceNotice(null);

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
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
      const response = await generateAdvisorResponse(query, context, messages);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error('Advisor response error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'I am unable to connect to the advisory service right now. You can continue using the structured UDYORA tools.',
          timestamp: new Date().toISOString(),
          topic: 'general'
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Toggle Voice Input (Microphone)
  const toggleVoiceInput = () => {
    if (isListening) {
      stopSpeechRecognition();
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setVoiceNotice('Voice input is not supported in this browser. Please use text input.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    setVoiceNotice(null);
    const started = startSpeechRecognition({
      language,
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript, isFinal) => {
        if (isFinal) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setInterimTranscript('');
        } else {
          setInterimTranscript(transcript);
        }
      },
      onError: (errMsg) => {
        setIsListening(false);
        setInterimTranscript('');
        setVoiceNotice(errMsg);
        setTimeout(() => setVoiceNotice(null), 4000);
      },
      onEnd: () => {
        setIsListening(false);
        setInterimTranscript('');
      }
    });

    if (!started) {
      setIsListening(false);
    }
  };

  // Toggle Voice Output (Speech Synthesis) for an Assistant message
  const handleToggleSpeech = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      if (isSpeechPaused) {
        resumeSpeechSynthesis();
        setIsSpeechPaused(false);
      } else {
        pauseSpeechSynthesis();
        setIsSpeechPaused(true);
      }
      return;
    }

    stopSpeechSynthesis();
    setSpeakingMessageId(msg.id);
    setIsSpeechPaused(false);

    speakText({
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
        setVoiceNotice('Voice output is unavailable. You can read the response instead.');
        setTimeout(() => setVoiceNotice(null), 4000);
      }
    });
  };

  const handleStopSpeech = () => {
    stopSpeechSynthesis();
    setSpeakingMessageId(null);
    setIsSpeechPaused(false);
  };

  const handleResetChat = () => {
    stopSpeechSynthesis();
    stopSpeechRecognition();
    setSpeakingMessageId(null);
    setIsListening(false);
    setMessages([]);
  };

  const quickPrompts: { label: string; query: string }[] = [
    {
      label: language === 'te' ? 'ఈఎమ్‌ఐ ఎంత అవుతుంది?' : language === 'hi' ? 'मेरी मासिक ईएमआई कितनी है?' : 'What is my monthly EMI?',
      query: 'What is my monthly EMI and total project cost?'
    },
    {
      label: language === 'te' ? 'ఏ పథకం సరిపోతుంది?' : language === 'hi' ? 'कौन सी सरकारी योजना मिलेगी?' : 'Which scheme matches?',
      query: 'Which government scheme matches my business?'
    },
    {
      label: language === 'te' ? 'ముఖ్యమైన రిస్క్‌లు ఏమిటి?' : language === 'hi' ? 'मुख्य जोखिम क्या हैं?' : 'What are my main risks?',
      query: 'What are the main business risks and mitigations?'
    },
    {
      label: language === 'te' ? 'మార్కెట్ డిమాండ్ ఎలా ఉంది?' : language === 'hi' ? 'बाजार मांग कैसी है?' : 'How is market demand?',
      query: 'How is the local catchment market demand in this village?'
    }
  ];

  return (
    <>
      {/* 1. Floating Chatbot Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open UDYORA Business Advisor"
            className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-slate-900 text-white font-bold text-xs shadow-xl hover:bg-blue-900 transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 border border-slate-700 cursor-pointer"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-blue-300" />
              {/* Subtle Pulsing Active Indicator */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="hidden sm:inline tracking-wide font-bold">
              UDYORA Advisor
            </span>
          </button>
        </div>
      )}

      {/* 2. Floating Chatbot Panel / Modal */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[420px] md:w-[450px] h-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-800 text-blue-100 flex items-center justify-center font-bold text-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-tight text-white">
                    UDYORA Business Advisor
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-950 text-blue-300 px-1.5 py-0.2 rounded border border-blue-800">
                    AI Agent
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {currentLocation?.village ? `${currentLocation.village} • ` : ''}
                  {currentInput?.businessIdea || 'Rural Business Advisory'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetChat}
                title="Clear Chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  stopSpeechSynthesis();
                  stopSpeechRecognition();
                  setIsOpen(false);
                }}
                title="Close Advisor"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Notification Alert */}
          {voiceNotice && (
            <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2 text-[11px] text-amber-900 font-medium flex items-center gap-2 shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{voiceNotice}</span>
            </div>
          )}

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-blue-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-900 text-white rounded-tr-xs shadow-xs font-medium'
                      : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200 shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Audio Speaker Controls beside Assistant Responses */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleSpeech(msg)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                            speakingMessageId === msg.id
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {speakingMessageId === msg.id ? (
                            isSpeechPaused ? (
                              <>
                                <Play className="w-3 h-3 text-blue-700" />
                                <span>Resume</span>
                              </>
                            ) : (
                              <>
                                <Pause className="w-3 h-3 text-blue-700" />
                                <span className="animate-pulse">Speaking...</span>
                              </>
                            )
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-slate-600" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {speakingMessageId === msg.id && (
                          <button
                            onClick={handleStopSpeech}
                            title="Stop Audio"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Square className="w-2.5 h-2.5 fill-current" />
                          </button>
                        )}
                      </div>

                      <span className="text-[9px] font-mono text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-900 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Agent Processing Indicator */}
            {isThinking && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-md bg-slate-900 text-blue-300 flex items-center justify-center shrink-0 text-[10px]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-[11px]">Auditing agent evidence...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 whitespace-nowrap transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Voice Listening Waveform Status */}
          {isListening && (
            <div className="bg-blue-50 border-t border-blue-200 px-3.5 py-2 flex items-center justify-between text-xs text-blue-900 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-bold">Listening in {language.toUpperCase()}...</span>
                {interimTranscript && (
                  <span className="italic text-slate-600 truncate max-w-[180px]">
                    "{interimTranscript}"
                  </span>
                )}
              </div>
              <button
                onClick={toggleVoiceInput}
                className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            {/* Voice Input Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop Recording' : 'Speak to UDYORA Advisor'}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              placeholder={isListening ? 'Speak now...' : 'Ask about loan, schemes, or risks...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isThinking}
              aria-label="Send query"
              className="p-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
