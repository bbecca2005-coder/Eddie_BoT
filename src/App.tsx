import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Sparkles, Terminal, Info, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { chatWithEddy, type Message } from "./services/claudeService";
import EddyAvatar from "./components/EddyAvatar";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Speech Recognition Type Definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "System online. I'm Eddy. I've been told my intellect is 'intimidating,' so I'll try to keep things simple for you. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const lastEddyMessage = [...messages].reverse().find(m => m.role === "model")?.content;

  // Text to Speech
  const speak = useCallback((text: string) => {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.8;
    utterance.rate = 1.1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Speech to Text
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Initial greeting speech
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(messages[0].content);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithEddy(newHistory);
      setMessages((prev) => [...prev, { role: "model", content: response }]);
      speak(response);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Header Controls */}
      <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"
          title={isMuted ? "Unmute Eddy" : "Mute Eddy"}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Main Eddy Display */}
      <div className="flex flex-col items-center gap-12 w-full max-w-4xl">
        <div>
          <EddyAvatar isSpeaking={isSpeaking} size="lg" />
        </div>

        {/* Last Response Bubble */}
        <AnimatePresence mode="wait">
          {lastEddyMessage && (
            <motion.div
              key={lastEddyMessage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl"
            >
              <div className="text-xl md:text-2xl font-medium leading-relaxed text-gray-800">
                <ReactMarkdown>{lastEddyMessage}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-2 items-center">
            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-black rounded-full" />
            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-black rounded-full" />
            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-black rounded-full" />
          </div>
        )}
      </div>

      {/* Input Controls */}
      <div className="fixed bottom-12 left-0 right-0 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-full p-2 shadow-sm focus-within:shadow-md focus-within:border-gray-300 transition-all">
          <button
            onClick={toggleListening}
            className={cn(
              "p-4 rounded-full transition-all active:scale-95",
              isListening ? "bg-red-500 text-white animate-pulse" : "text-gray-400 hover:text-black hover:bg-gray-100"
            )}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "Listening..." : "Speak or type to Eddy..."}
            className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-4 text-lg text-black placeholder:text-gray-400"
          />
          
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-4 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full transition-all active:scale-95 flex items-center justify-center"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
