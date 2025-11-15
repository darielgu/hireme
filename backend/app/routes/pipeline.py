import threading

from app.services.parallel_service import ParallelService
from app.services.parser import PDFParser
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

router = APIRouter()


class Pipeline(BaseModel):
    jobUrl: str
    linkedin: str


@router.post("/pipeline")
async def create_pipeline(
    pipeline: Pipeline,
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
    company_name = parallel.extract_company_name(pipeline.jobUrl)
    job_data = parallel.search_job_description(pipeline.jobUrl)
    interviewer_data = parallel.scrape_linkedin_profile(pipeline.linkedin)
    fit_score = parallel.generate_fit_score(job_data, userData)  # type: ignore
    references = parallel.find_references(company_name)

    returnOut = {
        "company_name": company_name,
        "job_data": job_data,
        "profile_data": interviewer_data,
        "fit_score": fit_score,
        "references": references,
    }

    return returnOut
