# parsers.py
# Utility functions for parsing documents (e.g., PDF to text)

import pdfplumber
from docx import Document
import os

def parse_pdf(file_path: str) -> str:
    """
    Parse a PDF file to extract text.
    
    Args:
        file_path (str): Path to the PDF file.
    
    Returns:
        str: Extracted text from the PDF.
    """
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    return text

def parse_docx(file_path: str) -> str:
    """
    Parse a DOCX file to extract text.
    
    Args:
        file_path (str): Path to the DOCX file.
    
    Returns:
        str: Extracted text from the DOCX file.
    """
    text = ""
    doc = Document(file_path)
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def parse_text(file_path: str) -> str:
    """
    Read a plain text file and return its content.
    
    Args:
        file_path (str): Path to the text file.
    
    Returns:
        str: Content of the text file.
    """
    with open(file_path, "r") as file:
        return file.read()
