import threading
from concurrent.futures import ThreadPoolExecutor

from app.services.parallel_service import ParallelService
from app.services.parser import PDFParser
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

router = APIRouter()


@router.post("/pipeline")
async def create_pipeline(
    jobUrl: str = Form(...),
    linkedin: str = Form(...),
    file: UploadFile = File(...),
):
    # ------- FIRST STEP: PARSE THE PDF RESUME -------

    contents = await file.read()
    parser = PDFParser()
    try:
        result = parser.parse_bytes(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {e}")

    resume_text = " ".join(result)  # Combine all pages into single text

    try:
        structured_output = parser.structure_output(resume_text)  # type: ignore
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to structure resume: {e}")
    userData = structured_output

    # we have structured output of their resume here - kick off next steps async

    parallel = ParallelService()
    with ThreadPoolExecutor() as executor:
        # get the company name and job data in parallel
        future_company_name = executor.submit(parallel.extract_company_name, jobUrl)
        future_job_data = executor.submit(parallel.search_job_description, jobUrl)
        company_name = future_company_name.result()
        job_data = future_job_data.result()

        furture_interviewer_data = executor.submit(
            parallel.scrape_linkedin_profile, linkedin
        )
        future_fit_score = executor.submit(
            parallel.generate_fit_score, job_data, userData
        )  # type: ignore
        references = executor.submit(parallel.find_references, company_name)
        questions = executor.submit(
            parallel.create_interview_questions, job_data, userData
        )  # type: ignore

        interviewer_data = furture_interviewer_data.result()
        fit_score = future_fit_score.result()
        references = references.result()
        questions = questions.result()

    temp_data = {
        "company_name": company_name,
        "job_data": job_data,
        "profile_data": interviewer_data,
        "fit_score": fit_score,
        "references": references,
        "questions": questions,
    }
    cheat_sheet = parallel.cheat_sheet(temp_data)
    returnOut = {
        "company_name": company_name,
        "job_data": job_data,
        "profile_data": interviewer_data,
        "fit_score": fit_score,
        "references": references,
        "questions": questions,
        "cheat_sheet": cheat_sheet,
    }

    return returnOut


@router.post("/interview")
async def interview_dialogue(question: str, answer: str):
    parallel = ParallelService()
    response = parallel.interview_dialogue(question, answer)

    return {"response": response}
