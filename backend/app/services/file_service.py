from io import BytesIO
from typing import Optional

try:
    import PyPDF2  # type: ignore
except Exception:
    PyPDF2 = None  # Will raise informative error when used

class FileService:
    def __init__(self):
        pass
    
    def extract_text_from_pdf(self, pdf_file) -> str:
        """Extract text from a PDF file-like object (Werkzeug FileStorage) using PyPDF2.
        Returns a single cleaned string.
        """
        if PyPDF2 is None:
            raise RuntimeError("PyPDF2 is not installed. Please add PyPDF2 to requirements and install.")
        raw = pdf_file.read()
        if not raw:
            return ''
        pdf_file.seek(0)
        reader = PyPDF2.PdfReader(BytesIO(raw))
        parts = []
        for page in reader.pages:
            try:
                text = page.extract_text() or ''
            except Exception:
                text = ''
            parts.append(text)
        combined = "\n".join(parts)
        return self._clean_text(combined)
    
    def _clean_text(self, text: str) -> str:
        # Basic cleanup: normalize whitespace, remove excessive blank lines
        lines = [l.strip() for l in text.splitlines()]
        # Collapse multiple blanks
        cleaned_lines = []
        blank_count = 0
        for l in lines:
            if not l:
                blank_count += 1
                if blank_count > 1:
                    continue
            else:
                blank_count = 0
            cleaned_lines.append(l)
        return "\n".join(cleaned_lines).strip()
    
    def extract_text_from_pptx(self, pptx_file) -> str:
        """Extract text from PowerPoint."""
        # TODO: Implement PPTX text extraction
        pass
    
    def extract_text_from_image(self, image_file) -> str:
        """Extract text from image using OCR."""
        # TODO: Implement OCR
        pass

