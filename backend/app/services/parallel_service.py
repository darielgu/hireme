import json
import os
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from openai import OpenAI
from parallel import Parallel

load_dotenv()


class ParallelService:
    linkedIn_prompt = """Extract and analyze publicly available information from a 
        provided LinkedIn profile URL in order to automatically generate structured insights
        about the interviewer, including: total years of professional experience,
        key technical specialties, predicted areas of technical questioning, and 
        a concise background summary. The purpose of this API step is to transform 
        an unstructured public web profile into reliable, standardized data fields that
        support interview preparation workflows.
        """
    job_description_prompt = """Extract the full job description from a user-submitted 
        job posting URL and convert the page’s public content into a structured text field.
        This API call retrieves the role overview, responsibilities, required qualifications,
        preferred skills, and any additional notes provided in the posting, 
        preparing the data for downstream interview-preparation workflows.
        """
    generate_fit_score_prompt = """
       You are generating a hiring "Fit Score" analysis.

You will be given:
1. A parsed resume (JSON).
2. A parsed job description (JSON).

Your task:
- Compare the resume and job description realistically.
- DO NOT hallucinate skills, experience, or details not present in the input.
- Provide a numeric score for each category (0–100).
- Provide a short, factual explanation for each score.
- Provide an overall fit score (0–100), based on weighted reasoning.
- Return ONLY valid JSON. No comments, no markdown.

The JSON you MUST return:

{{
  "overall_fit_score": 0,
  "categories": {{
    "technical_skills_match": {{
      "score": 0,
      "reason": ""
    }},
    "experience_alignment": {{
      "score": 0,
      "reason": ""
    }},
    "education_background": {{
      "score": 0,
      "reason": ""
    }},
    "gpa_and_academics": {{
      "score": 0,
      "reason": ""
    }},
    "previous_company_experience": {{
      "score": 0,
      "reason": ""
    }},
    "leadership_and_involvement": {{
      "score": 0,
      "reason": ""
    }}
  }}
}}

Scoring guidelines:
- Use only information explicitly found in the resume and job description.
- If a category has insufficient information, score it lower and explain why.
- Scores should be proportional and realistic, not inflated.
- Explanations must be 1–2 sentences max.
        Job Description: {job_description}
        User Data: {user_data}
        """
    structure_job_prompt = """
        Convert the following messy job description text into a well-structured JSON object.
        Do not add or hallucinate data. Only reorganize and lightly normalize what is present
        (e.g., splitting bullet points, trimming whitespace, combining clearly related fragments).

        Return ONLY valid JSON. No explanations.

        Expected structure:
        {
        "job_info": {
        "title": "",
        "company": "",
        "location": "",
        "employment_type": "",        // e.g. "Full-time", "Internship", "Contract"
        "seniority_level": "",        // e.g. "Junior", "Mid-level", "Senior"
        "department_or_team": "",     // e.g. "Engineering", "Data Science"
        "job_id_or_ref": "",
        "job_url": ""
        },
        "description": {
        "summary": "",                // short high-level overview of the role
        "responsibilities": [         // list of responsibilities / what you’ll do
            ""
        ],
        "requirements": {             // what the company expects from candidates
            "must_have": [
            ""
            ],
            "nice_to_have": [
            ""
            ]
        },
        "skills": {
            "technical": [
            ""
            ],
            "soft": [
            ""
            ],
            "tools_and_technologies": [
            ""
            ]
        },
        "compensation_and_benefits": {
            "salary_range": "",
            "equity": "",
            "bonus": "",
            "benefits": [
            ""
            ]
        },
        
        "location_details": "",       // remote / hybrid / on-site notes
        "visa_or_sponsorship_info": "",
        "application_instructions": "", // how to apply, links, contact info
        "other_notes": ""             // anything relevant that doesn’t fit above
        }
        }

        Raw content:
        {raw_data[0]}
    """

    def __init__(self):
        self.client = Parallel(api_key=os.getenv("PARALLEL_API_KEY"))

    def scrape_linkedin_profile(self, linkedIn_url: str):  # WORKS
        """
        Scrape a LinkedIn profile using the Parallel API.

        Args:
            linkedIn_url (str): The URL of the LinkedIn profile to scrape.

        Returns:
            dict: The scraped profile data.
        """

        extract = self.client.beta.search(
            search_queries=[
                linkedIn_url,
                f"linkedin profile for {linkedIn_url.strip().split('/')[-2]}",
            ],
            max_results=11,
            max_chars_per_result=10000,
            objective=self.linkedIn_prompt,
        )
        # HERE CALL STRUCTURE OUTPUT FUNCTION TO PARSE INTO DICT -- OPENAI CALL
        structured_output = self.structure_linkedin(extract.results[0].excerpts)  # type: ignore
        return structured_output
        # return extract.results[0].excerpts  # type: ignore

    def search_job_description(self, job_url: str) -> dict:  # WORKS
        """
        Search a job description using the Parallel API.

        Args:
            job_url (str): The URL of the job description to search.

        Returns:
            dict: The job description data.
        """

        extract = self.client.beta.extract(
            urls=[job_url],
            objective=self.job_description_prompt,
            excerpts=True,
            full_content=False,
        )
        return self.structure_job(extract.results[0].excerpts)  # type: ignore

    def extract_company_name(self, job_url: str) -> str:
        """
        Extract company information from a job URL using the Parallel API.

        Args:
            job_url (str): The URL of the job posting.
        Returns:"""
        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "user",
                    "content": f"Extract the company NAME from this job URL: {job_url}",
                }
            ],
            temperature=0,
        )
        company_name = response.choices[0].message.content  # type: ignore
        return company_name  # type: ignore

    def company_research(self, company_name: str):
        """
        Research a company using the Parallel API.

        Args:
            company_name (str): The name of the company to research.

        Returns:
            dict: The researched company data.
        """

        extract = self.client.beta.search(
            # Make the objective clear, contextual, and retrieval-focused
            objective=(
                f"Collect reliable public-web content about {company_name} that is highly relevant for a software engineer preparing for an interview. "
                "Focus on  interview process (coding, system design, behavioral), common LeetCode topics, mission and values. "
                "Avoid generic marketing pages, job listings, cookie banners or purely benefits-oriented content."
            ),
            search_queries=[
                f"{company_name} mission statement core values engineering culture",
                f"{company_name} software engineer interview process questions",
                f"{company_name} common interview questions software engineer",
                f"{company_name} leetcode company topics {company_name}",
                f"{company_name} recent technology news announcement",
            ],
            max_results=10,
            excerpts={"max_chars_per_result": 10000},
            mode="one-shot",  # using default retrieval mode as per best practice for single-step queries
        )
        return self.structure_research(extract.results)

    def generate_fit_score(self, job_description: dict, user_data: dict) -> dict | None:
        """
        Generate a fit score based on company research.

        Args:
            job_description (dict): The researched company data.
            user_data (dict): The user data for comparison.

        Returns:
            int: The fit score.
        """
        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "user",
                    "content": self.generate_fit_score_prompt.format(
                        job_description=job_description,
                        user_data=user_data,
                    ),
                }
            ],
            temperature=0,
        )
        return json.loads(response.choices[0].message.content)  # type: ignore

    def structure_job(
        self,
        raw_data: list,
    ) -> dict | None:
        prompt = f"""
        Convert the following messy job description text into a well-structured JSON object.
        Do not add or hallucinate data. Only reorganize and lightly normalize what is present
        (e.g., splitting bullet points, trimming whitespace, combining clearly related fragments).

        Return ONLY valid JSON. No explanations.

        Expected structure:
        {{
        "job_info": {{
            "title": "",
            "company": "",
            "location": "",
            "seniority_level": "",
            "department_or_team": "",
            "job_url": ""
        }},
        "description": {{
            "summary": "",
            "responsibilities": [
            ""
            ],
            "requirements": {{
            "must_have": [
                ""
            ],
            "nice_to_have": [
                ""
            ]
            }},
            "skills": {{
            "technical": [
                ""
            ],
            "soft": [
                ""
            ],
            
            "tools_and_technologies": [
                ""
            ]
            }},
            "compensation_and_benefits": {{
            "salary_range": "",
            "equity": "",
            "bonus": "",
            "benefits": [
                ""
            ]
            }}
        }}
        }}

        Raw content:
        {raw_data[0]}
        """

        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
        )
        return json.loads(response.choices[0].message.content)  # type: ignore

    def structure_linkedin(self, raw_data: list) -> dict | None:
        prompt = f""" Convert the following LinkedIn-style search output into a well-structured JSON object.
                Do not add or hallucinate data. Only reorganize what is present.

                Return ONLY valid JSON. No explanations.

                Expected structure:
                {{
                "user_info": {{
                    "name": "",
                    "headline": "",
                    "location": "",
                    "connections": 0,
                    "avatar": "",
                    "linkedin_url": ""
                }},
                "experience": [
                    {{
                    "title": "",
                    "company": "",
                    "location": "",
                    "start_date": "",
                    "end_date": "",
                    "description": ""
                    }}
                ],
                "education": [
                    {{
                    "school": "",
                    "degree": "",
                    "field": "",
                    "start_year": "",
                    "end_year": "",
                    "description": ""
                    }}
                ],
                "organizations": [],
                "languages": [],
                "projects": [],
                "activity": []
                }}

                Raw content:
                {raw_data[0]}
                    """
        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
        )
        return json.loads(response.choices[0].message.content)  # type: ignore

    def structure_research(self, raw_data: list) -> dict | None:
        flattened = "\n\n".join("\n".join(item.excerpts or []) for item in raw_data)
        prompt = f""" Convert the following company research search output into a well-structured JSON object.
                IF you do not find relevant information for a field, fill it in with data you find from your own knowledge base.

                Return ONLY valid JSON. No explanations.

                Expected structure:
                {{
                "company_info": {{
                    "mission_statement": "",
                    "core_values": "",
                    "engineering_culture": "",
                    "interview_process": "",
                    "common_interview_questions": [],
                    "leetcode_topics": [],
                    "recent_news": []
                }}
                }}
    
                Raw content:
                {flattened[:8000]}
                    """
        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
        )
        raw = response.choices[0].message.content

        if not raw or raw.strip() == "":
            print("Empty response from LLM:")
            print(response)
            return None

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            print("Invalid JSON output:")
            print(raw)
            return None

    def find_references(self, company_name: str) -> list:
        """
        Find references for a company using the Parallel API.

        Args:
            company_name (str): The name of the company to find references for.
        Returns:

            dict: The references data.
        """

        extract = self.client.beta.search(
            search_queries=[
                f"find all user profiles that have worked at {company_name} and hold or held in the past the position described in the following job description: software engineer intern.",
            ],
            max_results=11,
            max_chars_per_result=10000,
            objective="Find user profiles that have worked at the specified company and held the position described in the job description. Provide name and linkedIn profile URL for each user.",
        )
        # print(extract.results)
        final = self.structure_references(extract.results)
        return final  # type: ignore

    def structure_references(self, raw_data: list) -> dict | None:
        # func here to turn raw_data into string
        flattened = "\n\n".join("\n".join(item.excerpts or []) for item in raw_data)
        prompt = f""" Convert the following references search output into a well-structured JSON object.
                Do not add or hallucinate data. Only reorganize what is present.

                Return ONLY valid JSON. No explanations.

                Go through the input json find and extract name, linkedin_url, and email for each reference.
                Only retun those fields. No exceptions

                Expected structure:
                {{
                "references": [
                    {{
                    "name": "",
                    "linkedin_url": ""
                    "email": ""
                    }}
                ]
                }}

                Raw content:
                {flattened}
                    """
        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
        )
        return json.loads(response.choices[0].message.content)  # type: ignore

    def get_leetcode(self, company_data: dict, company_name: str) -> dict:
        topics = company_data.get("leetcode_topics", [])
        prompt = f"""search the best 3 leetcode problems that are frequently asked by {
            company_name
        } for software engineer interviews. Use the list of topics, {
            topics
        }, and search for problems that cover thosetopics. If the list does not give enough context, look on the web for known problems to be asked by {
            company_name
        }. If still there is not enough context take your best guess at what leetcode problems the intervier could ask based on the kind of work {
            company_name
        } does.Return ONLY valid JSON.
        Format:
        [
        {
            "problem_name": "",
            "url": ""
        }
        ]
        """

        """
        Get LeetCode problems for a company using the Parallel API.

        Args:
            company_name (str): The name of the company to get LeetCode problems for.
            topics (list): The list of topics to get LeetCode problems for.
        Returns:
            dict: The LeetCode problems data.
        """
        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
        )
        print("raw leetcode response:", response.choices[0].message.content)  # type: ignore
        return json.loads(response.choices[0].message.content)  # type: ignore

    def create_interview_questions(
        self, job_data: dict, user_data: dict
    ) -> dict | None:
        """):
        Create practice questions based on job and user data.
        """
        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "user",
                    "content": f"Create 5 practice interview questions based on the following job description and users resume. Ask something an interviewer would ask from that company for a Intern Level Software Engineer. Provide questions in JSON format. Job Description: {job_data} User Data: {user_data}",
                }
            ],
            temperature=0,
        )
        return json.loads(response.choices[0].message.content)  # type: ignore

    def interview_dialogue(self, question: str, answer: str) -> dict | None:
        """
        Generate interview dialogue based on a question and answer.
        """
        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "user",
                    "content": f"Given the interview question: {question} and the user's answer: {answer}, Generate feedback on the answer, including strengths and areas for improvement.",
                }
            ],
            temperature=0,
        )
        return response.choices[0].message.content  # type: ignore

    def cheat_sheet(self, data: dict) -> dict | None:
        """
        Create a cheat sheet based on job and user data.
        """
        prompt = f"""You are an expert interview-analysis engine. 

Given a deeply structured JSON payload describing:
- job posting data
- company research
- interview process patterns
- candidate profile
- interviewer profile
- fit score analysis
- references
- LinkedIn scraped data
- news
- leetcode topics
- people in similar roles

…return a SINGLE JSON object with the fields below, containing the most 
useful and distilled insights for interview preparation.

IMPORTANT:
- Do NOT return HTML.
- Do NOT return markdown.
- Only return valid pure JSON.
- Do NOT include commentary.
- Summaries must be short, actionable, and conversationally useful.

------------------------------------------
EXPECTED OUTPUT SHAPE (strict):

{{
  "speakPoints": string[],
  "companyMustKnows": string[],
  "recentNews": string[],
  "peopleExperience": [
    {{
      "name": string,
      "role": string,
      "interviewTip": string
    }}
  ],
  "leetcodeTopics": string[],
  "interviewerIntel": {{
    "technicalSpecialties": string[],
    "affiliations": string[],
    "backgroundSummary": string
  }},
  "fitScoreSummary": {{
    "overall": number,
    "skillsGaps": string[],
    "recommendedImprovements": string[]
  }}
}}

------------------------------------------
HOW TO GENERATE THESE FIELDS:

1. **speakPoints (8 max)**
   Based on:
   - interviewer technical specialties
   - interviewer background summary
   - shared affiliations or alma maters
   - common roles seen in similar professionals
   - skill gaps from the fit score
   - company values or interview patterns
   - anything high-leverage for conversational hooks
   Must be actionable, not generic.

2. **companyMustKnows**
   From:
   - mission statement
   - core values
   - engineering culture
   - interview process patterns
   - culture summary
   Should be 3–5 bullets.

3. **recentNews**
    derive from job context.

4. **peopleExperience**
   Use:
   - search web for glassdoor of people who have interviewed at the company for similar roles
   provide: role, interview tip, overall experience 1/55

5. **leetcodeTopics**
   From:
   - company_data.leetcode_topics
   Limit to 10.

6. **interviewerIntel**
   Should summarize:
   - technical specialty areas inferred from experience
   - affiliations (schools, orgs, shared connections)
   - a 1–2 sentence background summary

7. **Recommendee Action**
   From the fit_score object:
   - Give some specific, actionable recommendations to improve based on skill gaps.
   - 

------------------------------------------

Now generate the JSON output using the following data:

{data}

------------------------------------------
REMINDER:
Only return valid JSON. No commentary, no markdown, no explanations.
        """
        Oclient = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = Oclient.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
        )
        return json.loads(response.choices[0].message.content)  # type: ignore


def run_all():
    ps = ParallelService()  # type: ignore
    url = "https://careers.salesforce.com/en/jobs/jr308796/summer-2026-intern-software-engineer/"
    company_name = ps.extract_company_name(url)
    job_data = ps.search_job_description(url)

    profile_data = ps.scrape_linkedin_profile(
        "https://www.linkedin.com/in/dariel-gutierrez/"
    )

    with ThreadPoolExecutor() as executor:
        # Run all 3 functions at the same time
        future_company_data = executor.submit(ps.company_research, company_name)

        future_fit_score = executor.submit(
            ps.generate_fit_score,
            job_data,
            profile_data,  # type: ignore
        )  # type: ignore
        future_references = executor.submit(ps.find_references, company_name)

        company_data = future_company_data.result()

        leetcode_problems = executor.submit(ps.get_leetcode, company_data)  # type: ignore
        # Wait for each to finish and get results

        fit_score = future_fit_score.result()
        references = future_references.result()
        leetcode_problems = leetcode_problems.result()

    # references = ps.find_references(company_name)
    run_output = {
        "company_name": company_name,
        "job_data": job_data,
        "profile_data": profile_data,
        "company_data": company_data,
        "fit_score": fit_score,
        "references": references,
        "leetcode_problems": leetcode_problems,
    }

    save_run(run_output)


def test_run_all():
    ps = ParallelService()  # type: ignore
    url = "https://careers.salesforce.com/en/jobs/jr308796/summer-2026-intern-software-engineer/"
    company_name = ps.extract_company_name(url)
    job_data = ps.search_job_description(url)

    profile_data = ps.scrape_linkedin_profile(
        "https://www.linkedin.com/in/dariel-gutierrez/"
    )

    company_data = ps.company_research(company_name)

    fit_score = ps.generate_fit_score(
        job_data,
        profile_data,  # type: ignore
    )  # type: ignore

    references = ps.find_references(company_name)
    cheat_sheet = ps.cheat_sheet(
        {
            "company_name": company_name,
            "job_data": job_data,
            "profile_data": profile_data,
            "fit_score": fit_score,
            "references": references,
        }
    )
    interview_questions = ps.create_interview_questions(job_data, profile_data)  # type: ignore
    # leetcode_problems = ps.get_leetcode(company_data, company_name)  # type: ignore

    run_output = {
        "company_name": company_name,
        "job_data": job_data,
        "profile_data": profile_data,
        "company_data": company_data,
        "fit_score": fit_score,
        "references": references,
        # "leetcode_problems": leetcode_problems,
        "cheat_sheet": cheat_sheet,
        "questions": interview_questions,
    }

    save_run(run_output, filename="test_runs.json")


def test_get_leetcode():
    ps = ParallelService()  # type: ignore
    company_data = {"leetcode_topics": ["arrays", "strings", "dynamic programming"]}
    company_name = "Google"
    leetcode_problems = ps.get_leetcode(company_data, company_name)
    print("output: ", leetcode_problems)


def save_run(run_output, filename="runs.json"):
    # Load existing file or start fresh
    if os.path.exists(filename):
        with open(filename, "r") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
    else:
        data = []

    # append new run
    data.append(run_output)

    # write back out
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    test_get_leetcode()
