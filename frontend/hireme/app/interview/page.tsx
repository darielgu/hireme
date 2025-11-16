"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Waves } from "@/components/ui/waves";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { VoicePoweredOrb } from "@/components/ui/voice-powered-orb";

interface Question {
  question: string;
}

interface BackendPipelineResponse {
  questions?: {
    questions: Question[];
  };
}

export default function InterviewPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastResultIndexRef = useRef<number>(0);
  const finalTranscriptRef = useRef<string>("");

  // Load questions from localStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem("pipelineData");
      if (storedData) {
        const data: BackendPipelineResponse = JSON.parse(storedData);
        if (data.questions?.questions && data.questions.questions.length > 0) {
          setQuestions(data.questions.questions);
        } else {
          // Fallback to default questions
          setQuestions([
            { question: "Tell me about yourself." },
            { question: "What are your greatest strengths?" },
            { question: "Why do you want to work here?" },
          ]);
        }
      } else {
        // Fallback to default questions
        setQuestions([
          { question: "Tell me about yourself." },
          { question: "What are your greatest strengths?" },
          { question: "Why do you want to work here?" },
        ]);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      setQuestions([
        { question: "Tell me about yourself." },
        { question: "What are your greatest strengths?" },
        { question: "Why do you want to work here?" },
      ]);
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (
            let i = Math.max(event.resultIndex, lastResultIndexRef.current);
            i < event.results.length;
            i++
          ) {
            const result = event.results[i];
            const transcript = result[0].transcript;

            if (result.isFinal) {
              finalTranscript += transcript + " ";
              lastResultIndexRef.current = i + 1;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            finalTranscriptRef.current += finalTranscript;
            setTranscript(finalTranscriptRef.current + interimTranscript);
          } else if (interimTranscript) {
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
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load audio for current question
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      loadAudioForQuestion(questions[currentQuestionIndex].question);
    }
  }, [currentQuestionIndex, questions]);

  const loadAudioForQuestion = async (questionText: string) => {
    setIsLoadingAudio(true);
    try {
      const response = await fetch(
        `/api/audio?text=${encodeURIComponent(questionText)}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        console.error("Failed to load audio");
      }
    } catch (error) {
      console.error("Error loading audio:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleVoiceStart = () => {
    if (recognitionRef.current && !isRecording) {
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

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      alert("Please record an answer before submitting.");
      return;
    }

    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return;
    }

    const currentQuestion = questions[currentQuestionIndex].question;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formData = new URLSearchParams();
      formData.append("question", currentQuestion);
      formData.append("answer", transcript);

      const response = await fetch("http://localhost:8000/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.response || "Feedback received");
      } else {
        const errorText = await response.text();
        console.error("Error submitting answer:", errorText);
        setFeedback("Error getting feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setFeedback("Error getting feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTranscript("");
      setFeedback(null);
      finalTranscriptRef.current = "";
      lastResultIndexRef.current = 0;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTranscript("");
      setFeedback(null);
      finalTranscriptRef.current = "";
      lastResultIndexRef.current = 0;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  const currentQuestion =
    questions.length > 0 && currentQuestionIndex < questions.length
      ? questions[currentQuestionIndex].question
      : "Loading question...";

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

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl flex flex-col items-center gap-8">
          {/* Question Counter */}
          {questions.length > 0 && (
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          )}

          {/* Orb in Middle */}
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

          {/* Question and Response Box */}
          <div className="w-full bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-6 space-y-4">
            {/* Question Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Question
              </h2>
              <p className="text-base text-gray-700 mb-4">{currentQuestion}</p>

              {/* Audio Player */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handlePlayPause}
                  disabled={!audioUrl || isLoadingAudio}
                  className="flex items-center justify-center w-12 h-12 bg-red-700 text-white rounded-full hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingAudio ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : isPlaying ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </button>
                <span className="text-sm text-gray-600">
                  {isLoadingAudio
                    ? "Loading audio..."
                    : isPlaying
                      ? "Playing..."
                      : "Click to play question"}
                </span>
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* Answer Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Your Answer
              </h2>
              <div className="bg-white/50 rounded-lg p-4 min-h-[200px] mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {transcript || "Click the microphone to begin your response..."}
                </p>
              </div>

              {/* AI Voice Input Component */}
              <div className="mb-4">
                <AIVoiceInput onStart={handleVoiceStart} onStop={handleVoiceStop} />
              </div>
            </div>

            {/* Feedback Section */}
            {feedback && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Feedback
                </h3>
                <p className="text-sm text-blue-800 whitespace-pre-wrap">
                  {feedback}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={!transcript.trim() || isSubmitting}
                className="flex-1 bg-red-700 text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex >= questions.length - 1}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
