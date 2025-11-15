"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
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
              onClick={() => router.push("/insights")}
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
