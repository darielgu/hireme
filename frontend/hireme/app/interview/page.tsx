"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Waves } from "@/components/ui/waves";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { VoicePoweredOrb } from "@/components/ui/voice-powered-orb";

export default function InterviewPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [question, setQuestion] = useState("Tell me about yourself.");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const lastResultIndexRef = useRef<number>(0);
  const finalTranscriptRef = useRef<string>("");

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          // Process only new results (starting from last processed index)
          for (let i = Math.max(event.resultIndex, lastResultIndexRef.current); i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            
            if (result.isFinal) {
              // Final result - add to final transcript
              finalTranscript += transcript + " ";
              lastResultIndexRef.current = i + 1;
            } else {
              // Interim result - store for display
              interimTranscript += transcript;
            }
          }

          // Update transcript state
          if (finalTranscript) {
            // Add final transcript to the permanent transcript
            finalTranscriptRef.current += finalTranscript;
            setTranscript(finalTranscriptRef.current + interimTranscript);
          } else if (interimTranscript) {
            // Show final transcript + current interim
            setTranscript(finalTranscriptRef.current + interimTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }

      // Initialize speech synthesis
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleVoiceStart = () => {
    if (recognitionRef.current && !isRecording) {
      // Reset tracking variables and transcript
      lastResultIndexRef.current = 0;
      finalTranscriptRef.current = "";
      setTranscript("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleVoiceStop = (duration: number) => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    setRecordingDuration(duration);
  };

  const speakQuestion = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  const handleStartInterview = () => {
    speakQuestion(question);
  };

  const questions = [
    "Tell me about yourself.",
    "What are your greatest strengths?",
    "Why do you want to work here?",
    "Tell me about a challenging project you worked on.",
    "Where do you see yourself in 5 years?",
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleSubmit = () => {
    // Handle submit logic here
    console.log("Submitting response:", transcript);
    // You can add API call or navigation logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 relative overflow-hidden">
      {/* Waves Background */}
      <Waves
        className="z-0"
        strokeColor="white"
        backgroundColor="transparent"
        pointerSize={0.5}
      />

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-black hover:opacity-80 transition-opacity bg-white/10 backdrop-blur-xl px-4 py-2 rounded-md shadow-lg border border-white/20"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Main Content - Column Layout */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl flex flex-col items-center gap-8">
          {/* Orb in Middle - Centered, No Background Box */}
          <div className="w-full h-[400px] flex items-center justify-center">
            <VoicePoweredOrb
              enableVoiceControl={isRecording}
              className="w-full h-full"
              hue={0}
              voiceSensitivity={1.5}
              maxRotationSpeed={1.2}
              maxHoverIntensity={0.8}
              onVoiceDetected={(detected) => {
                // Optional: handle voice detection
              }}
            />
          </div>

          {/* User Response - Wide Box Under Orb */}
          <div className="w-full bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-6">
            {/* <h2 className="text-xl font-bold text-gray-800 mb-4"></h2> */}
            <p className="text-base text-gray-700 mb-4">
              {question}
            </p>
            <hr className="border-gray-300 mb-4" />
            <div className="bg-white/50 rounded-lg p-4 min-h-[200px] mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {transcript || "Click the microphone to begin your response..."}
              </p>
            </div>
            
            {/* AI Voice Input Component */}
            <div className="mb-4">
              <AIVoiceInput 
                onStart={handleVoiceStart}
                onStop={handleVoiceStop}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-red-700 text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity hover:cursor-pointer"
            >
              Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
