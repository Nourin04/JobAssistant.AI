from pypdf import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        text += page.extract_text() + "\n"

    return text


import re

def extract_name(text: str) -> str:
    lines = text.strip().split("\n")

    for line in lines:
        line = line.strip()

        # simple heuristic: first clean line (likely name)
        if line and re.match(r"^[A-Za-z ]+$", line) and len(line.split()) <= 4:
            return line

    return "Unknown"