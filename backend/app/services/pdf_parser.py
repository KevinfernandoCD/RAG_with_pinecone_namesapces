"""
PDF parsing and text chunking service.
Uses PyPDF2 for PDF parsing and custom text splitter.
"""
import logging
from typing import List, Dict, Any
from io import BytesIO
from PyPDF2 import PdfReader
from app.core.config import settings

logger = logging.getLogger(__name__)


class SimpleTextSplitter:
    """Simple text splitter with overlap."""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def split_text(self, text: str) -> List[str]:
        """Split text into chunks with overlap."""
        if not text:
            return []
        
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + self.chunk_size
            
            # Try to break at sentence or word boundary
            if end < text_length:
                # Look for sentence end
                for sep in ['. ', '! ', '? ', '\n\n', '\n']:
                    last_sep = text.rfind(sep, start, end)
                    if last_sep != -1:
                        end = last_sep + len(sep)
                        break
                else:
                    # Look for word boundary
                    last_space = text.rfind(' ', start, end)
                    if last_space != -1:
                        end = last_space + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = end - self.chunk_overlap if end < text_length else text_length
        
        return chunks


class PDFParser:
    """Service for parsing PDFs and chunking text."""
    
    def __init__(self):
        """Initialize PDF parser with text splitter."""
        self.text_splitter = SimpleTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap
        )
        logger.info(
            f"Initialized PDFParser with chunk_size={settings.chunk_size}, "
            f"overlap={settings.chunk_overlap}"
        )
    
    def extract_text_from_pdf(self, file_content: bytes, filename: str) -> str:
        """
        Extract text from PDF file.
        
        Args:
            file_content: PDF file content as bytes
            filename: Name of the PDF file
            
        Returns:
            Extracted text from PDF
            
        Raises:
            Exception: If PDF parsing fails
        """
        try:
            pdf_file = BytesIO(file_content)
            pdf_reader = PdfReader(pdf_file)
            
            text_parts = []
            for page_num, page in enumerate(pdf_reader.pages, 1):
                text = page.extract_text()
                if text.strip():
                    text_parts.append(text)
            
            full_text = "\n\n".join(text_parts)
            logger.info(
                f"Extracted {len(full_text)} characters from {filename} "
                f"({len(pdf_reader.pages)} pages)"
            )
            
            return full_text
            
        except Exception as e:
            logger.error(f"Failed to extract text from {filename}: {str(e)}")
            raise Exception(f"Failed to parse PDF: {str(e)}")
    
    def chunk_text(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Chunk text using simple text splitter.
        
        Args:
            text: Text to chunk
            metadata: Optional metadata to attach to each chunk
            
        Returns:
            List of chunks with metadata
        """
        try:
            # Split text into chunks
            chunks = self.text_splitter.split_text(text)
            
            # Create chunk objects with metadata
            chunk_objects = []
            for i, chunk in enumerate(chunks):
                chunk_metadata = {
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    **(metadata or {})
                }
                chunk_objects.append({
                    "text": chunk,
                    "metadata": chunk_metadata
                })
            
            logger.info(f"Created {len(chunk_objects)} chunks from text")
            return chunk_objects
            
        except Exception as e:
            logger.error(f"Failed to chunk text: {str(e)}")
            raise
    
    def process_pdf(
        self,
        file_content: bytes,
        filename: str,
        additional_metadata: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Process PDF: extract text and chunk it.
        
        Args:
            file_content: PDF file content as bytes
            filename: Name of the PDF file
            additional_metadata: Optional additional metadata
            
        Returns:
            List of text chunks with metadata
        """
        # Extract text from PDF
        text = self.extract_text_from_pdf(file_content, filename)
        
        if not text.strip():
            raise Exception(f"No text could be extracted from {filename}")
        
        # Prepare metadata
        metadata = {
            "filename": filename,
            "source": "pdf",
            **(additional_metadata or {})
        }
        
        # Chunk the text
        chunks = self.chunk_text(text, metadata)
        
        logger.info(f"Processed {filename}: {len(chunks)} chunks created")
        return chunks


# Global PDF parser instance
pdf_parser = PDFParser()
