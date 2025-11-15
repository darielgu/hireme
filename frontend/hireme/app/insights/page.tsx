"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ============================================================================
// TYPE DEFINITIONS - Backend team should match these interfaces
// ============================================================================

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface LeetCodeQuestion {
  title: string;
  difficulty: Difficulty;
}

export interface StudyDay {
  day: number;
  title: string;
  description: string;
  leetcodeQuestions: LeetCodeQuestion[];
  resources: string[];
}

export interface PracticeQuestion {
  id: string;
  category: string;
  difficulty: Difficulty;
  estimatedTime: number; // in minutes
  title: string;
  description: string;
  keyDiscussionPoints: string[];
}

export interface Person {
  name: string;
  role: string;
  yearsInRole: number;
  background: string;
  interviewTip: string;
  waysToConnect: string[];
}

export interface InterviewerIntel {
  yearsOfExperience: string;
  technicalSpecialties: string;
  predictedQuestionAreas: string;
  backgroundSummary: string;
}

export interface FitScore {
  score: number; // 0-100
  skillsGaps: string;
  recommendedImprovements: string;
}

export interface CompanyResearch {
  companyValues: string;
  hiringStyle: string;
  cultureSummary: string;
  interviewPatterns: string;
}

export interface InsightsData {
  topics: string[];
  interviewerIntel: InterviewerIntel | null;
  fitScore: FitScore | null;
  companyResearch: CompanyResearch | null;
  studyPlan: StudyDay[];
  practiceQuestions: PracticeQuestion[];
  peopleInRole: Person[];
}

// ============================================================================
// MOCK DATA - Replace with API calls
// ============================================================================

const MOCK_TOPICS = [
  "System Design",
  "Distributed Systems",
  "Database Optimization",
  "API Design",
  "Scalability",
  "Cloud Architecture",
];

const MOCK_INTERVIEWER_INTEL: InterviewerIntel = {
  yearsOfExperience: "8+ years",
  technicalSpecialties: "Backend Systems, Cloud Architecture",
  predictedQuestionAreas: "System Design, Scalability",
  backgroundSummary: "Senior Engineer at Tech Corp",
};

const MOCK_FIT_SCORE: FitScore = {
  score: 78,
  skillsGaps: "Kubernetes, Advanced AWS Services",
  recommendedImprovements:
    "Study cloud deployment patterns and container orchestration",
};

const MOCK_COMPANY_RESEARCH: CompanyResearch = {
  companyValues: "Innovation, Reliability, Impact",
  hiringStyle: "Technical depth + Problem-solving skills",
  cultureSummary: "Fast-paced, collaborative, growth-focused",
  interviewPatterns: "45 min technical + 15 min behavioral",
};

const MOCK_STUDY_PLAN: StudyDay[] = [
  {
    day: 1,
    title: "Arrays + Strings",
    description: "Master fundamental array and string manipulation techniques",
    leetcodeQuestions: [
      { title: "Two Sum", difficulty: "Easy" },
      { title: "Valid Parentheses", difficulty: "Easy" },
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium" },
    ],
    resources: ["LeetCode Array Problems", "Python Algorithms Guide"],
  },
  {
    day: 2,
    title: "System Design Basics",
    description: "Understand the fundamentals of scalable system design",
    leetcodeQuestions: [
      { title: "Design a URL Shortener", difficulty: "Medium" },
      { title: "Design a Cache System", difficulty: "Medium" },
    ],
    resources: ["System Design Primer", "Design Pattern Videos"],
  },
  {
    day: 3,
    title: "Database & Scaling",
    description: "Learn database optimization and horizontal scaling strategies",
    leetcodeQuestions: [
      { title: "Database Query Optimization", difficulty: "Hard" },
      { title: "Distributed Cache Design", difficulty: "Hard" },
    ],
    resources: ["PostgreSQL Documentation", "Scaling Databases Course"],
  },
  {
    day: 4,
    title: "API Design Patterns",
    description: "Master RESTful API design and best practices",
    leetcodeQuestions: [
      { title: "Design Rate Limiter", difficulty: "Medium" },
      { title: "Design API Gateway", difficulty: "Hard" },
    ],
    resources: ["REST API Best Practices", "API Design Guide"],
  },
  {
    day: 5,
    title: "Distributed Systems",
    description: "Dive deep into distributed systems concepts",
    leetcodeQuestions: [
      { title: "Design Distributed Task Queue", difficulty: "Hard" },
      { title: "Consensus Algorithm Implementation", difficulty: "Hard" },
    ],
    resources: ["Distributed Systems Notes", "Consensus Algorithms"],
  },
  {
    day: 6,
    title: "Mock Interview 1",
    description: "Full-length mock interview simulation",
    leetcodeQuestions: [
      { title: "Design Social Network Feed", difficulty: "Hard" },
      { title: "Design Real-Time Notification System", difficulty: "Hard" },
    ],
    resources: ["Mock Interview Template", "Evaluation Rubric"],
  },
  {
    day: 7,
    title: "Final Review & Tips",
    description: "Review key concepts and interview preparation tips",
    leetcodeQuestions: [
      { title: "High-Frequency Interview Questions", difficulty: "Medium" },
    ],
    resources: ["Quick Reference Guide", "Last-Minute Tips"],
  },
];

const MOCK_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: "1",
    category: "System Design",
    difficulty: "Hard",
    estimatedTime: 45,
    title: "Design a highly scalable URL shortener service",
    description:
      "You need to design a URL shortening service like bit.ly. Handle millions of users and provide analytics.",
    keyDiscussionPoints: [
      "Horizontal scaling across multiple regions",
      "Cache strategy with Redis",
      "Database optimization for lookups",
      "Collision handling for short URLs",
    ],
  },
  {
    id: "2",
    category: "Scalability",
    difficulty: "Hard",
    estimatedTime: 50,
    title: "How would you handle 10 million concurrent users?",
    description:
      "Design an architecture that can support 10 million concurrent users with minimal latency.",
    keyDiscussionPoints: [
      "Load balancing strategies",
      "Database replication and sharding",
      "Cache layers and CDN",
      "Rate limiting and throttling",
    ],
  },
  {
    id: "3",
    category: "Database Optimization",
    difficulty: "Medium",
    estimatedTime: 30,
    title: "Explain your approach to database sharding",
    description: "Discuss strategies for horizontal partitioning of database data.",
    keyDiscussionPoints: [
      "Shard key selection",
      "Consistent hashing",
      "Cross-shard queries",
      "Rebalancing strategies",
    ],
  },
  {
    id: "4",
    category: "System Design",
    difficulty: "Hard",
    estimatedTime: 45,
    title: "Design a real-time notification system",
    description:
      "Build a system that delivers notifications in real-time to millions of users.",
    keyDiscussionPoints: [
      "Message queue architecture",
      "WebSocket implementation",
      "Fan-out patterns",
      "Delivery guarantees",
    ],
  },
  {
    id: "5",
    category: "Architecture",
    difficulty: "Medium",
    estimatedTime: 35,
    title: "How do you ensure system reliability and uptime?",
    description:
      "Discuss strategies for maintaining high availability and disaster recovery.",
    keyDiscussionPoints: [
      "Redundancy and failover",
      "Health checks and monitoring",
      "Automated recovery",
      "Data backup strategies",
    ],
  },
  {
    id: "6",
    category: "System Design",
    difficulty: "Hard",
    estimatedTime: 60,
    title: "Design Social Network Feed",
    description:
      "Design the feed system for a social network like Facebook or Twitter.",
    keyDiscussionPoints: [
      "Fan-out on write vs fan-out on read",
      "Ranking and sorting algorithms",
      "Timeline storage",
      "Cache invalidation",
    ],
  },
];

const MOCK_PEOPLE_IN_ROLE: Person[] = [
  {
    name: "Alex Chen",
    role: "Senior Backend Engineer",
    yearsInRole: 3,
    background: "Started as a Full Stack Developer, specialized in Backend",
    interviewTip:
      "Focus on system design fundamentals and practice explaining your architecture decisions clearly.",
    waysToConnect: ["LinkedIn Message", "Email", "Company Alumni Network"],
  },
  {
    name: "Jordan Martinez",
    role: "Staff Engineer",
    yearsInRole: 8,
    background: "Tech Lead focused on distributed systems and scalability",
    interviewTip:
      "Be prepared to discuss real production challenges. They ask about trade-offs and pragmatic solutions.",
    waysToConnect: ["LinkedIn Message", "Twitter DM"],
  },
  {
    name: "Casey Rodriguez",
    role: "Engineering Manager",
    yearsInRole: 5,
    background: "Transitioned from IC to management, responsible for team hiring",
    interviewTip:
      "Show your growth mindset and collaborative skills. They care about cultural fit as much as technical skills.",
    waysToConnect: ["LinkedIn Message", "Company Event"],
  },
  {
    name: "Morgan Lee",
    role: "Platform Engineer",
    yearsInRole: 4,
    background: "Infrastructure and DevOps specialist",
    interviewTip:
      "Deep knowledge of deployment pipelines and infrastructure is crucial. Know your containerization.",
    waysToConnect: ["LinkedIn Message", "Open Office Hours"],
  },
];

// ============================================================================
// API FUNCTIONS - Backend team should implement these endpoints
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Fetch all insights data from the backend
 * TODO: Backend team - implement GET /api/insights endpoint
 */
async function fetchInsightsData(): Promise<InsightsData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/insights`);
    if (!response.ok) {
      throw new Error("Failed to fetch insights data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching insights data:", error);
    // Return mock data as fallback
    return {
      topics: MOCK_TOPICS,
      interviewerIntel: MOCK_INTERVIEWER_INTEL,
      fitScore: MOCK_FIT_SCORE,
      companyResearch: MOCK_COMPANY_RESEARCH,
      studyPlan: MOCK_STUDY_PLAN,
      practiceQuestions: MOCK_PRACTICE_QUESTIONS,
      peopleInRole: MOCK_PEOPLE_IN_ROLE,
    };
  }
}

/**
 * Save a practice question for later
 * TODO: Backend team - implement POST /api/practice-questions/:id/save endpoint
 */
async function savePracticeQuestion(questionId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/practice-questions/${questionId}/save`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to save practice question");
    }
  } catch (error) {
    console.error("Error saving practice question:", error);
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function InsightsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Home");
  const [loading, setLoading] = useState(true);

  // Data state - populated from API
  const [topics, setTopics] = useState<string[]>(MOCK_TOPICS);
  const [interviewerIntel, setInterviewerIntel] =
    useState<InterviewerIntel | null>(MOCK_INTERVIEWER_INTEL);
  const [fitScore, setFitScore] = useState<FitScore | null>(MOCK_FIT_SCORE);
  const [companyResearch, setCompanyResearch] = useState<CompanyResearch | null>(
    MOCK_COMPANY_RESEARCH
  );
  const [studyPlan, setStudyPlan] = useState<StudyDay[]>(MOCK_STUDY_PLAN);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>(
    MOCK_PRACTICE_QUESTIONS
  );
  const [peopleInRole, setPeopleInRole] = useState<Person[]>(MOCK_PEOPLE_IN_ROLE);

  const tabs = ["Home", "7-Day Study Plan", "Practice Questions", "People in Role"];

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchInsightsData();
        setTopics(data.topics);
        setInterviewerIntel(data.interviewerIntel);
        setFitScore(data.fitScore);
        setCompanyResearch(data.companyResearch);
        setStudyPlan(data.studyPlan);
        setPracticeQuestions(data.practiceQuestions);
        setPeopleInRole(data.peopleInRole);
      } catch (error) {
        console.error("Error loading insights data:", error);
        // Keep mock data as fallback
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSavePracticeQuestion = async (questionId: string) => {
    await savePracticeQuestion(questionId);
    // Optionally show a toast notification
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Hard":
        return "bg-red-700 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Tabs */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-red-700 text-white"
                    : "text-black bg-white hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-black hover:opacity-80 transition-opacity bg-white px-4 py-2 rounded-md shadow-sm"
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

        {/* Tab Content */}
        {activeTab === "Home" && (
          <div className="space-y-6">
            {/* Predicted Interview Topics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-black mb-4">
                Predicted Interview Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interviewer Intel */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-black mb-4">
                  Interviewer Intel
                </h2>
                {interviewerIntel ? (
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        Years of Experience
                      </p>
                      <p className="text-base font-medium text-black">
                        {interviewerIntel.yearsOfExperience}
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        Technical Specialties
                      </p>
                      <p className="text-base font-medium text-black">
                        {interviewerIntel.technicalSpecialties}
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        Predicted Question Areas
                      </p>
                      <p className="text-base font-medium text-black">
                        {interviewerIntel.predictedQuestionAreas}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Background Summary
                      </p>
                      <p className="text-base font-medium text-black">
                        {interviewerIntel.backgroundSummary}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No interviewer data available</p>
                )}
              </div>

              {/* Fit Score */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-black mb-4">Fit Score</h2>
                {fitScore ? (
                  <div className="flex flex-col items-center">
                    {/* Circular Progress Bar */}
                    <div className="relative w-32 h-32 mb-6">
                      <svg
                        className="transform -rotate-90"
                        width="128"
                        height="128"
                      >
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#991b1b"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - fitScore.score / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-red-700">
                          {fitScore.score}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full space-y-4">
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-1">Skills Gaps</p>
                        <p className="text-base font-medium text-black">
                          {fitScore.skillsGaps}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Recommended Improvements
                        </p>
                        <p className="text-base font-medium text-black">
                          {fitScore.recommendedImprovements}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No fit score data available</p>
                )}
              </div>
            </div>

            {/* Company Research */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-black mb-4">
                Company Research
              </h2>
              {companyResearch ? (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Company Values</p>
                    <p className="text-base font-medium text-black">
                      {companyResearch.companyValues}
                    </p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Hiring Style</p>
                    <p className="text-base font-medium text-black">
                      {companyResearch.hiringStyle}
                    </p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <p className="text-sm text-gray-600 mb-1">Culture Summary</p>
                    <p className="text-base font-medium text-black">
                      {companyResearch.cultureSummary}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Interview Patterns
                    </p>
                    <p className="text-base font-medium text-black">
                      {companyResearch.interviewPatterns}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No company research data available</p>
              )}
            </div>
          </div>
        )}

        {/* 7-Day Study Plan */}
        {activeTab === "7-Day Study Plan" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                7-Day Custom Study Plan
              </h1>
              <p className="text-gray-600">
                Complete daily topics with tagged LeetCode questions and resources
              </p>
            </div>

            {/* Study Plan Sections */}
            <div className="space-y-6">
              {studyPlan.map((day) => (
                <div key={day.day} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 mb-1">
                        {day.title}
                      </h2>
                      <p className="text-gray-600">{day.description}</p>
                    </div>
                  </div>

                  <div className="ml-16 space-y-4">
                    {/* LeetCode Questions */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 mb-3">
                        LeetCode Tagged Questions ({day.leetcodeQuestions.length})
                      </h3>
                      <div className="space-y-2">
                        {day.leetcodeQuestions.map((question, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#991b1b"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              <span className="text-gray-800">{question.title}</span>
                            </div>
                            <span
                              className={`${getDifficultyColor(
                                question.difficulty
                              )} px-3 py-1 rounded-full text-sm font-medium`}
                            >
                              {question.difficulty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 mb-3">
                        Resources
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {day.resources.map((resource, idx) => (
                          <button
                            key={idx}
                            className="bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            {resource}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Questions */}
        {activeTab === "Practice Questions" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Practice Questions
              </h1>
              <p className="text-gray-600">
                Work through these tailored questions to master interview topics
              </p>
            </div>

            {/* Question Cards */}
            <div className="space-y-6">
              {practiceQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2">
                      <span className="bg-pink-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        {question.category}
                      </span>
                      <span
                        className={`${getDifficultyColor(
                          question.difficulty
                        )} px-3 py-1 rounded-full text-sm font-medium`}
                      >
                        {question.difficulty}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {question.estimatedTime} mins
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {question.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{question.description}</p>
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                      Key Discussion Points
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {question.keyDiscussionPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-red-700 text-white px-6 py-2 rounded-md font-medium hover:opacity-90 transition-opacity">
                      Start Practice
                    </button>
                    <button
                      onClick={() => handleSavePracticeQuestion(question.id)}
                      className="bg-white text-red-700 border border-red-700 px-6 py-2 rounded-md font-medium hover:bg-red-50 transition-colors"
                    >
                      Save for Later
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People in Role */}
        {activeTab === "People in Role" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                People Currently in This Role
              </h1>
              <p className="text-gray-600">
                Connect with current employees and learn from their interview experiences.
              </p>
            </div>

            {/* Employee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {peopleInRole.map((person, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {person.name}
                  </h2>
                  <p className="text-lg font-bold text-red-700 mb-2">
                    {person.role}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {person.yearsInRole} years in this role
                  </p>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Background:
                    </p>
                    <p className="text-gray-600">{person.background}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Interview Tip:
                    </p>
                    <p className="text-gray-600">{person.interviewTip}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-800 mb-3">
                      Ways to Connect:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {person.waysToConnect.map((method, methodIdx) => (
                        <button
                          key={methodIdx}
                          className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors"
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "Home" &&
          activeTab !== "7-Day Study Plan" &&
          activeTab !== "Practice Questions" &&
          activeTab !== "People in Role" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-black mb-4">
                {activeTab}
              </h2>
              <p className="text-gray-600">
                Content for {activeTab} will be displayed here.
              </p>
            </div>
          )}
      </main>
    </div>
  );
}
