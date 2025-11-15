import json
import os
from typing import List

import fitz  # PyMuPDF
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


class PDFParser:
    def __init__(self):
        # self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        pass

    def parse_bytes(self, pdf_bytes: bytes) -> List[str]:
        """
        Parse a PDF provided as raw bytes and return a list of page texts.

        Args:
            pdf_bytes (bytes): The PDF file contents.

        Returns:
            List[str]: A list with the extracted text from each page.
        """
        if not pdf_bytes:
            raise ValueError("Empty PDF bytes provided")

        text_pages = []
        # PyMuPDF can open from a byte stream using the `stream` parameter
        # and specifying the filetype 'pdf' implicitly.
        with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf_document:
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                text = page.get_text()
                text_pages.append(text)

        return text_pages

    def structure_output(self, resume_text: List[str]) -> List[dict] | None:
        """
        Structure the extracted page texts into a list of dictionaries.

        Args:
            resume_text (List[str]): List of texts extracted from each page.

        Returns:
            List[dict]: A list of dictionaries with page number and text.
        """
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        prompt = f"""
        Extract structured data from the following resume.

        Return ONLY a valid JSON object. 
        No explanations, no markdown, no backticks.

        The JSON MUST contain these top-level keys:
        - user_info: {{name, email, phone, linkedin}}
        - education: [{{school, degree, graduation_date}}]
        - experience: [{{company, role, dates, bullets}}]
        - skills: [array of strings]
        Resume text:
{resume_text}
"""
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        return json.loads(response.choices[0].message.content)  # type: ignore
