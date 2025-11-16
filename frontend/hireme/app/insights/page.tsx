"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, useScroll, useTransform, MotionValue } from "framer-motion";
import { NavBar } from "@/components/ui/nav-bar";
import { Home, Calendar, HelpCircle, Users } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect-card";
import { Waves } from "@/components/ui/waves";

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
  affiliations?: string[];
  contactInfo?: {
    linkedinUrl?: string;
    email?: string;
  };
}

export interface FitScoreCategory {
  name: string;
  score: number;
  reason: string;
}

export interface FitScore {
  score: number; // 0-100
  skillsGaps: string;
  recommendedImprovements: string;
  categories: FitScoreCategory[];
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
// BACKEND RESPONSE TYPES
// ============================================================================

interface BackendPipelineResponse {
  company_name: string;
  job_data: {
    job_info: {
      title: string;
      company: string;
      location: string;
      seniority_level: string;
      department_or_team: string;
      job_url: string;
    };
    description: {
      summary: string;
      responsibilities: string[];
      requirements: {
        must_have: string[];
        nice_to_have: string[];
      };
      skills: {
        technical: string[];
        soft: string[];
        tools_and_technologies: string[];
      };
      compensation_and_benefits: {
        salary_range: string;
        equity: string;
        bonus: string;
        benefits: string[];
      };
    };
  };
  profile_data: {
    user_info: {
      name: string;
      headline: string;
      location: string;
      connections: number;
      avatar: string;
      linkedin_url: string;
    };
    experience: Array<{
      title: string;
      company: string;
      location: string;
      start_date: string;
      end_date: string;
      description: string;
    }>;
    education: Array<{
      school: string;
      degree: string;
      field: string;
      start_year: string;
      end_year: string;
      description: string;
    }>;
    organizations: any[];
    languages: any[];
    projects: any[];
    activity: any[];
    certifications: any[];
    volunteer_experience: any[];
  };
  fit_score: {
    overall_fit_score: number;
    categories: {
      technical_skills_match: {
        score: number;
        reason: string;
      };
      experience_alignment: {
        score: number;
        reason: string;
      };
      education_background: {
        score: number;
        reason: string;
      };
      gpa_and_academics: {
        score: number;
        reason: string;
      };
      previous_company_experience: {
        score: number;
        reason: string;
      };
      leadership_and_involvement: {
        score: number;
        reason: string;
      };
    };
  };
  references: {
    references: Array<{
      name: string;
      linkedin_url: string;
      email: string | null;
    }>;
  };
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
  categories: [
    { name: "Technical Skills Match", score: 80, reason: "Strong technical foundation" },
    { name: "Experience Alignment", score: 75, reason: "Relevant project experience" },
    { name: "Education Background", score: 90, reason: "Excellent academic background" },
  ],
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
// DATA MAPPING FUNCTIONS
// ============================================================================

/**
 * Map backend pipeline response to frontend InsightsData format
 */
function mapBackendDataToInsights(backendData: BackendPipelineResponse): InsightsData {
  // Extract topics from job skills
  const topics = [
    ...(backendData.job_data?.description?.skills?.technical || []),
    ...(backendData.job_data?.description?.skills?.tools_and_technologies || []),
  ].filter((topic, index, self) => self.indexOf(topic) === index); // Remove duplicates

  // Map interviewer intel from profile data
  const profile = backendData.profile_data;
  
  // Calculate years of experience from start dates
  let experienceYears = "Experience not available";
  if (profile.experience && profile.experience.length > 0) {
    const firstExp = profile.experience[0];
    if (firstExp.start_date) {
      const startYear = parseInt(firstExp.start_date.split(" ")[1] || new Date().getFullYear().toString());
      const currentYear = new Date().getFullYear();
      const years = currentYear - startYear;
      experienceYears = years > 0 ? `${years}+ years` : "Recent experience";
    } else {
      experienceYears = `${profile.experience.length}+ positions`;
    }
  }
  
  // Extract technical specialties from experience titles
  const technicalSpecialties = profile.experience
    ?.slice(0, 3)
    .map((exp) => exp.title)
    .filter(Boolean)
    .join(", ") || profile.user_info?.headline || "Not specified";
  
  // Use job skills for predicted question areas
  const predictedQuestionAreas = topics.slice(0, 4).join(", ") || "General technical questions";
  
  // Build background summary
  const backgroundSummary = profile.user_info?.headline || 
    `${profile.user_info?.name || "Interviewer"}${profile.experience?.[0]?.company ? ` at ${profile.experience[0].company}` : ""}`;

  // Extract affiliations from education and organizations
  const affiliations: string[] = [];
  if (profile.education && profile.education.length > 0) {
    profile.education.forEach((edu) => {
      if (edu.school) {
        affiliations.push(edu.school);
      }
    });
  }
  if (profile.organizations && profile.organizations.length > 0) {
    profile.organizations.forEach((org: any) => {
      if (org.name || org.title) {
        affiliations.push(org.name || org.title);
      }
    });
  }

  const interviewerIntel: InterviewerIntel = {
    yearsOfExperience: experienceYears,
    technicalSpecialties: technicalSpecialties,
    predictedQuestionAreas: predictedQuestionAreas,
    backgroundSummary: backgroundSummary,
    affiliations: affiliations.length > 0 ? affiliations : undefined,
    contactInfo: {
      linkedinUrl: profile.user_info?.linkedin_url,
      email: undefined, // Email not available in backend response
    },
  };

  // Map fit score with categories
  const fitScoreCategories = backendData.fit_score?.categories || {};
  const allReasons = Object.values(fitScoreCategories)
    .map((cat: any) => cat.reason)
    .filter(Boolean);
  
  const skillsGaps = allReasons
    .filter((reason: string) => 
      reason.toLowerCase().includes("gap") || 
      reason.toLowerCase().includes("missing") ||
      reason.toLowerCase().includes("lack")
    )
    .join(". ") || "No significant gaps identified";
  
  const recommendedImprovements = allReasons.join(". ") || "Continue building on your strengths";

  // Map categories with readable names
  const categoryMap: Record<string, string> = {
    technical_skills_match: "Technical Skills Match",
    experience_alignment: "Experience Alignment",
    education_background: "Education Background",
    gpa_and_academics: "GPA & Academics",
    previous_company_experience: "Previous Company Experience",
    leadership_and_involvement: "Leadership & Involvement",
  };

  const categories: FitScoreCategory[] = Object.entries(fitScoreCategories).map(([key, value]: [string, any]) => ({
    name: categoryMap[key] || key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    score: value.score || 0,
    reason: value.reason || "",
  }));

  const fitScore: FitScore = {
    score: backendData.fit_score?.overall_fit_score || 0,
    skillsGaps: skillsGaps,
    recommendedImprovements: recommendedImprovements,
    categories: categories,
  };

  // Map company research
  const jobData = backendData.job_data;
  const companyName = backendData.company_name?.replace("The company name is ", "").replace(".", "") || jobData?.job_info?.company || "Company";
  
  const companyValues = jobData?.description?.summary || 
    `${companyName} is looking for talented individuals to join their team.`;
  
  const hiringStyle = jobData?.description?.requirements?.must_have?.slice(0, 3).join(", ") || 
    jobData?.description?.requirements?.nice_to_have?.slice(0, 3).join(", ") || 
    "Not specified";
  
  const cultureSummary = jobData?.description?.summary || 
    `Join ${companyName} for an exciting opportunity in ${jobData?.job_info?.location || "their team"}.`;
  
  const interviewPatterns = `Position: ${jobData?.job_info?.title || "Software Engineer"} | ` +
    `Level: ${jobData?.job_info?.seniority_level || "Not specified"} | ` +
    `Location: ${jobData?.job_info?.location || "Not specified"}`;

  const companyResearch: CompanyResearch = {
    companyValues: companyValues,
    hiringStyle: hiringStyle,
    cultureSummary: cultureSummary,
    interviewPatterns: interviewPatterns,
  };

  // Map references to people in role
  const peopleInRole: Person[] = (backendData.references?.references || []).map((ref) => ({
    name: ref.name,
    role: "Current Employee",
    yearsInRole: 0, // Not available in backend response
    background: ref.linkedin_url ? `LinkedIn Profile: ${ref.linkedin_url}` : "Employee at company",
    interviewTip: "Reach out to learn more about the interview process and company culture",
    waysToConnect: [
      ref.linkedin_url || "",
      ref.email ? `Email: ${ref.email}` : "",
    ].filter(Boolean),
  }));

  return {
    topics: topics.length > 0 ? topics : MOCK_TOPICS,
    interviewerIntel,
    fitScore,
    companyResearch,
    studyPlan: MOCK_STUDY_PLAN, // Keep mock data for now, can be enhanced later
    practiceQuestions: MOCK_PRACTICE_QUESTIONS, // Keep mock data for now, can be enhanced later
    peopleInRole: peopleInRole.length > 0 ? peopleInRole : MOCK_PEOPLE_IN_ROLE,
  };
}

/**
 * Get insights data from localStorage or return mock data
 */
function getInsightsData(): InsightsData {
  try {
    const storedData = localStorage.getItem("pipelineData");
    if (storedData) {
      const backendData: BackendPipelineResponse = JSON.parse(storedData);
      return mapBackendDataToInsights(backendData);
    }
  } catch (error) {
    console.error("Error parsing stored data:", error);
  }
  
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

/**
 * Save a practice question for later
 * TODO: Backend team - implement POST /api/practice-questions/:id/save endpoint
 */
async function savePracticeQuestion(questionId: string): Promise<void> {
  // Placeholder for future implementation
  console.log("Saving practice question:", questionId);
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

  const tabs = ["Home", "7-Day Study Plan", "People in Role", "Mock Interview"];

  // NavBar items configuration
  const navItems = [
    { name: "Home", id: "Home", icon: Home },
    { name: "7-Day Study Plan", id: "7-Day Study Plan", icon: Calendar },
    { name: "People in Role", id: "People in Role", icon: Users },
    { name: "Mock Interview", id: "Mock Interview", icon: HelpCircle },
  ];

  // Fetch data on component mount
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        const data = getInsightsData();
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

  // Scroll animation component with ContainerScroll effect
  const AnimatedScrollSection = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start 0.9", "start 0.1"],
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => {
        window.removeEventListener("resize", checkMobile);
      };
    }, []);

    const scaleDimensions = () => {
      return isMobile ? [0.95, 1] : [0.98, 1];
    };

    const rotate = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, -10, 0, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 0.98, 1, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 0.7, 1, 1]);

    return (
      <div
        ref={containerRef}
        className="w-full py-2 md:py-4"
        style={{
          perspective: "1000px",
        }}
      >
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            opacity,
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 relative">
      {/* Waves Background */}
      <Waves
        className="z-0"
        strokeColor="white"
        backgroundColor="transparent"
        pointerSize={0.5}
      />
      
      {/* New NavBar Component */}
      <NavBar
        items={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 pt-20 sm:pt-24 pb-24 sm:pb-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-black hover:opacity-80 transition-opacity bg-white/10 backdrop-blur-xl px-4 py-2 rounded-md shadow-lg border border-white/20"
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
            {/* Company Research */}
            <AnimatedScrollSection>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-6">
                <GlowingEffect
                  variant="red"
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <div className="relative">
                  <h2 className="text-xl font-bold text-black mb-4">
                    Company Research
                  </h2>
                  {(() => {
                    const storedData = localStorage.getItem("pipelineData");
                    if (storedData) {
                      try {
                        const data: BackendPipelineResponse = JSON.parse(storedData);
                        const companyName = data.company_name?.replace("The company name is ", "").replace(".", "") || 
                          data.job_data?.job_info?.company || "";
                        const jobData = data.job_data;
                        const jobInfo = jobData?.job_info;
                        const description = jobData?.description;
                        
                          return (
                          <div className="space-y-4">
                            {/* Job Info */}
                            {jobInfo && (
                              <div className="border-b border-gray-200 pb-4">
                                <div className="mb-2">
                              <p className="text-sm text-gray-600 mb-1">Position</p>
                              <p className="text-lg font-bold text-red-700">
                                    {jobInfo.title || ""} {companyName ? `at ${companyName}` : ""}
                                  </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  {jobInfo.location && (
                                    <div>
                                      <p className="text-gray-600 mb-1">📍 Location</p>
                                      <p className="text-black">{jobInfo.location}</p>
                                    </div>
                                  )}
                                  {jobInfo.seniority_level && (
                                    <div>
                                      <p className="text-gray-600 mb-1">Level</p>
                                      <p className="text-black">{jobInfo.seniority_level}</p>
                                    </div>
                                  )}
                                  {jobInfo.department_or_team && (
                                    <div>
                                      <p className="text-gray-600 mb-1">Department</p>
                                      <p className="text-black">{jobInfo.department_or_team}</p>
                                    </div>
                                  )}
                                  {jobInfo.job_url && (
                                    <div>
                                      <p className="text-gray-600 mb-1">Job Posting</p>
                                      <a 
                                        href={jobInfo.job_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-red-700 hover:underline text-sm"
                                      >
                                        View Original Posting →
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Summary */}
                            {description?.summary && (
                              <div className="border-b border-gray-200 pb-4">
                                <p className="text-sm text-gray-600 mb-2 font-semibold">About the Role</p>
                                <p className="text-sm text-black leading-relaxed">{description.summary}</p>
                              </div>
                            )}

                            {/* Requirements Grid */}
                            {(description?.requirements?.must_have?.length > 0 || description?.requirements?.nice_to_have?.length > 0) && (
                              <div className="border-b border-gray-200 pb-4">
                                <p className="text-sm text-gray-600 mb-3 font-semibold">Requirements</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {description.requirements.must_have && description.requirements.must_have.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-red-700 mb-2">Must Have</p>
                                      <ul className="space-y-1.5">
                                        {description.requirements.must_have.map((req, idx) => (
                                          <li key={idx} className="text-xs text-black flex items-start gap-2">
                                            <span className="text-red-700 mt-1">✓</span>
                                            <span>{req}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {description.requirements.nice_to_have && description.requirements.nice_to_have.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-600 mb-2">Nice to Have</p>
                                      <ul className="space-y-1.5">
                                        {description.requirements.nice_to_have.map((req, idx) => (
                                          <li key={idx} className="text-xs text-black flex items-start gap-2">
                                            <span className="text-gray-500 mt-1">+</span>
                                            <span>{req}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Skills */}
                            {description?.skills && (
                              <div className="border-b border-gray-200 pb-4">
                                <p className="text-sm text-gray-600 mb-3 font-semibold">Skills</p>
                                <div className="space-y-3">
                                  {description.skills.technical && description.skills.technical.length > 0 && (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-2">Technical</p>
                                      <div className="flex flex-wrap gap-2">
                                        {description.skills.technical.map((skill, idx) => (
                                          <span key={idx} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {description.skills.soft && description.skills.soft.length > 0 && (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-2">Soft Skills</p>
                                      <div className="flex flex-wrap gap-2">
                                        {description.skills.soft.map((skill, idx) => (
                                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {description.skills.tools_and_technologies && description.skills.tools_and_technologies.length > 0 && (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-2">Tools & Technologies</p>
                                      <div className="flex flex-wrap gap-2">
                                        {description.skills.tools_and_technologies.map((tool, idx) => (
                                          <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                            {tool}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Compensation & Benefits */}
                            {description?.compensation_and_benefits && (
                              <div>
                                <p className="text-sm text-gray-600 mb-3 font-semibold">Compensation & Benefits</p>
                                <div className="space-y-3">
                                  {description.compensation_and_benefits.salary_range && (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Salary Range</p>
                                      <p className="text-sm font-medium text-black">{description.compensation_and_benefits.salary_range}</p>
                                    </div>
                                  )}
                                  {description.compensation_and_benefits.equity && (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Equity</p>
                                      <p className="text-sm font-medium text-black">{description.compensation_and_benefits.equity}</p>
                                    </div>
                                  )}
                                  {description.compensation_and_benefits.bonus && (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-1">Bonus</p>
                                      <p className="text-sm font-medium text-black">{description.compensation_and_benefits.bonus}</p>
                                    </div>
                                  )}
                                  {description.compensation_and_benefits.benefits && description.compensation_and_benefits.benefits.length > 0 && (
                                    <div>
                                      <p className="text-xs text-gray-600 mb-2">Benefits</p>
                                      <div className="flex flex-wrap gap-2">
                                        {description.compensation_and_benefits.benefits.map((benefit, idx) => (
                                          <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                            {benefit}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            </div>
                          );
                      } catch (e) {
                        // Ignore parsing errors
                      }
                    }
                    // Fallback to mapped data
                    return companyResearch ? (
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
                    );
                  })()}
                </div>
              </div>
            </AnimatedScrollSection>

            {/* Two Column Layout */}
            <AnimatedScrollSection>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interviewer Intel */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-6">
                  <GlowingEffect
                    variant="red"
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div className="relative">
                    <h2 className="text-xl font-bold text-black mb-4">
                      Interviewer Intel
                    </h2>
                    {(() => {
                      const storedData = localStorage.getItem("pipelineData");
                      if (storedData) {
                        try {
                          const data: BackendPipelineResponse = JSON.parse(storedData);
                          const interviewer = data.profile_data?.user_info;
                          if (interviewer?.name || interviewer?.avatar) {
                            return (
                              <div className="mb-4 pb-4 border-b border-gray-200 flex items-center gap-3">
                                {interviewer.avatar && (
                                  <img
                                    src={interviewer.avatar}
                                    alt={interviewer.name || "Interviewer"}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="text-base font-bold text-red-700">
                                    {interviewer.name || "Interviewer"}
                                  </p>
                                  {interviewer.headline && (
                                    <p className="text-sm text-gray-600">{interviewer.headline}</p>
                                  )}
                                  {interviewer.location && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      📍 {interviewer.location}
                                    </p>
                                  )}
                                  {interviewer.linkedin_url && (
                                    <a
                                      href={interviewer.linkedin_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                    >
                                      View LinkedIn Profile
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        } catch (e) {
                          // Ignore parsing errors
                        }
                      }
                      return null;
                    })()}
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
                    <div className="border-b border-gray-200 pb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        Background Summary
                      </p>
                      <p className="text-base font-medium text-black">
                        {interviewerIntel.backgroundSummary}
                      </p>
                    </div>
                    {interviewerIntel.affiliations && interviewerIntel.affiliations.length > 0 && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-2">Affiliations</p>
                        <div className="flex flex-wrap gap-2">
                          {interviewerIntel.affiliations.map((affiliation, idx) => (
                            <span
                              key={idx}
                              className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {affiliation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {interviewerIntel.contactInfo && (
                      <div className="border-b border-gray-200 pb-3">
                        <p className="text-sm text-gray-600 mb-2">Ways to Reach Out</p>
                        <div className="flex flex-wrap gap-2">
                          {interviewerIntel.contactInfo.linkedinUrl && (
                            <a
                              href={interviewerIntel.contactInfo.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                            >
                              LinkedIn
                            </a>
                          )}
                          {interviewerIntel.contactInfo.email && (
                            <a
                              href={`mailto:${interviewerIntel.contactInfo.email}`}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                            >
                              Email
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Experience Timeline */}
                    {(() => {
                      const storedData = localStorage.getItem("pipelineData");
                      if (storedData) {
                        try {
                          const data: BackendPipelineResponse = JSON.parse(storedData);
                          const experience = data.profile_data?.experience || [];
                          if (experience.length > 0) {
                            return (
                              <div className="border-t border-gray-200 pt-3">
                                <p className="text-sm text-gray-600 mb-3 font-semibold">Experience Timeline</p>
                                <div className="space-y-4 max-h-96 overflow-y-auto p-4 pr-2">
                                  {experience.map((exp, idx) => (
                                    <div key={idx} className="relative pl-6 border-l-2 border-red-200">
                                      <div className="absolute -left-2 top-0 w-4 h-4 bg-red-700 rounded-full border-2 border-white"></div>
                                      <div className="pb-2">
                                        <p className="text-sm font-semibold text-gray-800">{exp.title}</p>
                                        <p className="text-xs text-gray-600">{exp.company}</p>
                                        {exp.location && (
                                          <p className="text-xs text-gray-500">📍 {exp.location}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                          {exp.start_date} - {exp.end_date}
                                        </p>
                                        {exp.description && (
                                          <p className="text-xs text-gray-600 mt-2 line-clamp-3">{exp.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        } catch (e) {
                          // Ignore parsing errors
                        }
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <p className="text-gray-500">No interviewer data available</p>
                )}
                  </div>
                </div>

                {/* Fit Score */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-6">
                  <GlowingEffect
                    variant="red"
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />
                  <div className="relative">
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
                      {/* Category Scores */}
                      {fitScore.categories && fitScore.categories.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Category Breakdown</p>
                          {fitScore.categories.map((category, idx) => (
                            <div key={idx} className="relative group cursor-pointer">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700">{category.name}</span>
                                <span className="text-sm font-semibold text-red-700">{category.score}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 relative">
                                <div
                                  className="bg-red-700 h-2 rounded-full transition-all group-hover:bg-red-800"
                                  style={{ width: `${category.score}%` }}
                                />
                              </div>
                              {/* Hover Tooltip */}
                              <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                                <p className="font-semibold mb-1">{category.name}</p>
                                <p className="text-gray-300">{category.reason}</p>
                                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3">
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
              </div>
            </AnimatedScrollSection>

            {/* Predicted Interview Topics */}
            <AnimatedScrollSection>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-6">
                <GlowingEffect
                  variant="red"
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <div className="relative">
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
              </div>
            </AnimatedScrollSection>
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

            {/* Interview Process Overview */}
            <AnimatedScrollSection>
              <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Interview Process Overview</h2>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Recruiter Call",
                      duration: "30 minutes",
                      details: "Initial screening and background check",
                      tip: "Be ready to discuss your background and why you're interested in this role",
                    },
                    {
                      step: 2,
                      title: "Online Coding Assessment",
                      duration: "120 minutes",
                      details: "2-3 LeetCode medium-level problems",
                      tip: "Medium difficulty problems focus on arrays, strings, and hash maps",
                    },
                    {
                      step: 3,
                      title: "Technical Coding Round",
                      duration: "60 minutes",
                      details: "Greedy algorithms and stack problems",
                      tip: "Explain your approach, discuss trade-offs, and optimize your solution",
                    },
                    {
                      step: 4,
                      title: "System Design Round",
                      duration: "60 minutes",
                      details: "Scalable system design for real-world scenarios",
                      tip: "Focus on trade-offs, scalability, and practical solutions",
                    },
                    {
                      step: 5,
                      title: "Behavioral Interview",
                      duration: "30 minutes",
                      details: "Leadership, teamwork, and problem-solving stories",
                      tip: "Use STAR method, emphasize collaboration and growth",
                    },
                  ].map((process) => (
                    <div
                      key={process.step}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {process.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-800">{process.title}</h3>
                            <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                              {process.duration}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{process.details}</p>
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                            <p className="text-xs font-semibold text-blue-800 mb-1">💡 Tip:</p>
                            <p className="text-xs text-blue-700">{process.tip}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedScrollSection>

            {/* Study Plan Sections */}
            <div className="space-y-6">
              {studyPlan.map((day) => (
                <AnimatedScrollSection key={day.day}>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-6">
                    <GlowingEffect
                      variant="red"
                      spread={40}
                      glow={true}
                      disabled={false}
                      proximity={64}
                      inactiveZone={0.01}
                    />
                    <div className="relative">
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
                  </div>
                </AnimatedScrollSection>
              ))}
            </div>
          </div>
        )}

        {/* Mock Interview */}
        {activeTab === "Mock Interview" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Mock Interview
              </h1>
              <p className="text-gray-600">
                Practice with AI-powered mock interviews to prepare for your upcoming interview
              </p>
            </div>

            {/* Start Mock Interview Button */}
            <AnimatedScrollSection>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-8 text-center">
                <GlowingEffect
                  variant="red"
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Ready to Start Your Mock Interview?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Practice answering interview questions with AI-powered feedback
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push("/interview");
                    }}
                    className="relative z-50 bg-red-700 text-white text-lg font-bold px-8 py-4 rounded-md hover:opacity-90 transition-opacity shadow-lg hover:cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    Start Mock Interview
                  </button>
                </div>
              </div>
            </AnimatedScrollSection>

            {/* Practice Questions List */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Practice Questions
              </h2>
              <p className="text-gray-600 mb-4">
                Review these questions before your mock interview
              </p>
            </div>

            {/* Question Cards */}
            <div className="space-y-6">
              {practiceQuestions.map((question) => (
                <AnimatedScrollSection key={question.id}>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-6">
                    <GlowingEffect
                      variant="red"
                      spread={40}
                      glow={true}
                      disabled={false}
                      proximity={64}
                      inactiveZone={0.01}
                    />
                    <div className="relative">
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
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                      Key Discussion Points
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {question.keyDiscussionPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                    </div>
                  </div>
                </AnimatedScrollSection>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {peopleInRole.map((person, idx) => {
                const linkedinUrl = person.waysToConnect.find((m) => m.includes("linkedin.com")) || "";
                const email = person.waysToConnect.find((m) => m.includes("@") || m.startsWith("Email:")) || "";
                const emailAddress = email.includes(": ") ? email.split(": ")[1] : email;
                
                return (
                <AnimatedScrollSection key={idx}>
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      {/* Header */}
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {person.name}
                  </h2>
                        <p className="text-base font-bold text-red-800 mb-1">
                    {person.role}
                  </p>
                        <p className="text-sm text-gray-500">
                          Professional Connection
                  </p>
                      </div>

                      {/* Profile Section */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Profile:
                        </p>
                        <p className="text-sm text-gray-600">
                          {person.background.includes("LinkedIn Profile:") 
                            ? "Experienced professional who can speak to technical depth and work ethic"
                            : person.background || "Professional connection at the company"}
                        </p>
                  </div>

                      {/* Outreach Section */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Outreach:
                        </p>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            const storedData = localStorage.getItem("pipelineData");
                            if (storedData) {
                              try {
                                const data: BackendPipelineResponse = JSON.parse(storedData);
                                const companyName = data.company_name?.replace("The company name is ", "").replace(".", "") || 
                                  data.job_data?.job_info?.company || "the company";
                                return `Email or LinkedIn message - Reference for ${companyName} internship interview`;
                              } catch (e) {
                                return "Email or LinkedIn message - Reference for internship interview";
                              }
                            }
                            return "Email or LinkedIn message - Reference for internship interview";
                          })()}
                        </p>
                  </div>

                      {/* Contact Section */}
                  <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Contact
                        </p>
                        <div className="space-y-2">
                          {linkedinUrl && (
                            <a
                              href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-red-800 hover:text-red-900 transition-colors"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="text-red-800"
                              >
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                              <span className="text-sm font-medium">View LinkedIn Profile</span>
                            </a>
                          )}
                          {emailAddress && (
                            <a
                              href={`mailto:${emailAddress}`}
                              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
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
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                              </svg>
                              <span className="text-sm">{emailAddress}</span>
                            </a>
                          )}
                  </div>
                    </div>
                  </div>
                </AnimatedScrollSection>
                );
              })}
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "Home" &&
          activeTab !== "7-Day Study Plan" &&
          activeTab !== "Mock Interview" &&
          activeTab !== "People in Role" && (
            <div className="relative bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20 p-6">
              <GlowingEffect
                variant="red"
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <div className="relative">
                <h2 className="text-xl font-bold text-black mb-4">
                  {activeTab}
                </h2>
                <p className="text-gray-600">
                  Content for {activeTab} will be displayed here.
                </p>
              </div>
            </div>
          )}

        {/* Footer copywriting section */}
        <div className="mt-16 mb-8 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 py-12">
           
            
            <div className="pt-8">
              <p className="text-sm opacity-0">
                Good luck with your interview preparation!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
