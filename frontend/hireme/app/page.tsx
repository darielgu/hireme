"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Waves } from "@/components/ui/waves";

export default function Home() {
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0); // 0: laptop->db, 1: linkedin->laptop, 2: parsing, 3: creating plan
  
  const words = ["hired", "jobs", "prepared"];

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setOpacity(0);
      
      // After fade out completes, change word and fade in
      setTimeout(() => {
        setCurrentWord((prev) => (prev + 1) % words.length);
        setOpacity(1);
      }, 300); // Half of transition duration
    }, 2500); // Total cycle time (2s visible + 0.5s transition)

    return () => clearInterval(interval);
  }, [words.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  // Handle loading stage transitions - cycle through stages continuously while loading
  useEffect(() => {
    if (!isLoading) {
      return;
    }

    // Cycle through stages continuously
    const stageInterval = setInterval(() => {
      setLoadingStage((prev) => {
        if (prev === 0) return 1;
        if (prev === 1) return 2;
        if (prev === 2) return 3;
        return 0;
      });
    }, 3000); // Change stage every 3 seconds

    // Cleanup interval when loading stops
    return () => {
      clearInterval(stageInterval);
    };
  }, [isLoading]);

  const handleGetInsights = async () => {
    if (!resumeFile || !jobDescription || !linkedinUrl) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setLoadingStage(0);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("jobUrl", jobDescription);
      formData.append("linkedin", linkedinUrl);

      const response = await fetch("http://127.0.0.1:8000/pipeline", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Store the data in localStorage for the insights page
      localStorage.setItem("pipelineData", JSON.stringify(data));
      
      // Set final stage before navigating
      setLoadingStage(3);
      
      // Navigate to insights page after showing completion
      setTimeout(() => {
        setIsLoading(false);
        router.push("/insights");
      }, 1000);
    } catch (error) {
      console.error("Error fetching insights:", error);
      alert("Failed to fetch insights. Please try again.");
      setIsLoading(false);
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 flex items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          <AnimatePresence mode="wait">
            {/* Stage 0: Laptop to Database */}
            {loadingStage === 0 && (
              <motion.div
                key="stage0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-8 md:gap-16 mb-8">
                  {/* Laptop Icon */}
                  <div className="relative">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-700"
                    >
                      <rect x="2" y="4" width="20" height="12" rx="2" />
                      <path d="M2 16h20" />
                      <path d="M6 20h12" />
                    </svg>
                    {/* Files sliding out */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{
                          x: [0, 280, 280],
                          y: [0, -20, -20],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute top-1/2 left-1/2"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-red-700"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                          <path d="M10 9H8" />
                        </svg>
                      </motion.div>
                    ))}
                  </div>

                  {/* Arrow */}
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-600"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </motion.div>

                  {/* Database Icon */}
                  <div className="relative">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-700"
                    >
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  Processing job description...
                </h2>
              </motion.div>
            )}

            {/* Stage 1: LinkedIn to Laptop */}
            {loadingStage === 1 && (
              <motion.div
                key="stage1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="flex flex-col items-center justify-center gap-8 mb-8">
                  {/* LinkedIn Logo */}
                  <div className="relative">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="#0077B5"
                      className="text-blue-600"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    {/* Files sliding down */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{
                          x: [0, 0, 0],
                          y: [0, 120, 120],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute top-full left-1/2 -translate-x-1/2"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-blue-600"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                          <path d="M10 9H8" />
                        </svg>
                      </motion.div>
                    ))}
                  </div>

                  {/* Arrow Down */}
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-600"
                    >
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  </motion.div>

                  {/* Laptop Icon */}
                  <div className="relative">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-700"
                    >
                      <rect x="2" y="4" width="20" height="12" rx="2" />
                      <path d="M2 16h20" />
                      <path d="M6 20h12" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  Gathering LinkedIn data...
                </h2>
              </motion.div>
            )}

            {/* Stage 2: Parsing Information */}
            {loadingStage === 2 && (
              <motion.div
                key="stage2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-red-700"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                      <path d="M12 22.08V12" />
                    </svg>
                  </motion.div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  Parsing information...
                </h2>
                <div className="flex justify-center gap-1 mt-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                      className="w-2 h-2 bg-red-700 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stage 3: Creating Plan */}
            {loadingStage === 3 && (
              <motion.div
                key="stage3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block"
                  >
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-red-700"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                      <path d="M10 9H8" />
                    </svg>
                  </motion.div>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  Creating your study plan...
                </h2>
                <div className="flex justify-center gap-1 mt-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.2,
                        repeat: Infinity,
                      }}
                      className="w-2 h-2 bg-red-700 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Waves Background */}
      <Waves
        className="z-0"
        strokeColor="white"
        backgroundColor="transparent"
        pointerSize={0.5}
      />
      
      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Heading Section */}
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-2">
              Helping students get{" "}
              <span 
                className="text-red-700 transition-opacity duration-500 ease-in-out inline-block"
                style={{ opacity }}
              >
                {words[currentWord]}
              </span>
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              Upload your details and instantly get personalized interview insights.
            </p>
          </div>

          {/* Form - Floating without box */}
          <div className="mt-12">
            <form className="space-y-6">
              {/* Upload Resume */}
              <div>
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Upload Resume (PDF)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gray-100 file:text-gray-700
                      hover:file:bg-gray-200
                      border border-gray-300 rounded-md"
                  />
                </div>
                {resumeFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {resumeFile.name}
                  </p>
                )}
              </div>

              {/* Job Description Link */}
              <div>
                <label
                  htmlFor="jobDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Description Link
                </label>
                <input
                  type="url"
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent
                    text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* LinkedIn URL */}
              <div>
                <label
                  htmlFor="linkedinUrl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Interviewer LinkedIn URL
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="#0077B5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <input
                    type="url"
                    id="linkedinUrl"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent
                      text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Button to next page */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGetInsights}
              className="bg-red-700 text-white text-lg font-bold px-6 py-3 rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
            >
              get job specific insights
              <span className="text-white">→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
