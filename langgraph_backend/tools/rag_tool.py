
"""
A simple RAG tool using FAISS and Langchain to retrieve relevant chunks from documents.
"""

import os
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import CharacterTextSplitter
from langchain.docstore.document import Document
import google.generativeai as genai
import numpy as np

# Load environment variables
load_dotenv()

# Example: Load documents from a local file (can be replaced with any loader)
def load_documents():
    """Load actual financial articles from the data/articles directory"""
    import os
    documents = []
    articles_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'articles')
    
    if os.path.exists(articles_dir):
        for filename in os.listdir(articles_dir):
            if filename.endswith('.txt'):
                filepath = os.path.join(articles_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Create document with metadata
                        doc = Document(
                            page_content=content,
                            metadata={"source": filename, "type": "financial_article"}
                        )
                        documents.append(doc)
                except Exception as e:
                    print(f"Error loading {filename}: {e}")
    
    # Fallback to demo data if no articles found
    if not documents:
        texts = [
            "Mutual funds are investment vehicles that pool money from many investors.",
            "Buying a new car is a significant financial decision and should be planned.",
            "SIP stands for Systematic Investment Plan, a way to invest in mutual funds.",
            "Reviewing monthly expenses helps in better financial planning.",
        ]
        documents = [Document(page_content=t) for t in texts]
    
    return documents



class GeminiEmbeddings:
    def __init__(self, api_key: str = None, model_name: str = "models/embedding-001"):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        self.model_name = model_name
        genai.configure(api_key=self.api_key)

    def embed_documents(self, texts):
        # Filter out empty strings
        texts = [t for t in texts if t and t.strip()]
        if not texts:
            return []
        embeddings = [genai.embed_content(model=self.model_name, content=t, task_type="retrieval_document")["embedding"] for t in texts]
        return embeddings

    def embed_query(self, text):
        if not text or not text.strip():
            raise ValueError("Query text for embedding is empty.")
        embedding = genai.embed_content(model=self.model_name, content=text, task_type="retrieval_query")["embedding"]
        return embedding

    def __call__(self, text):
        return self.embed_query(text)

def build_vectorstore():
    docs = load_documents()
    text_splitter = CharacterTextSplitter(chunk_size=100, chunk_overlap=0)
    split_docs = text_splitter.split_documents(docs)
    embeddings = GeminiEmbeddings()
    return FAISS.from_documents(split_docs, embeddings)

# Cache the vectorstore in memory for demo
_vectorstore = None

def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = build_vectorstore()
    return _vectorstore

def query_rag(query: str, k: int = 2) -> str:
    """
    Retrieve relevant chunks for the query using simple text matching.
    Fallback implementation when embeddings fail.
    """
    try:
        # Try to use the full vectorstore approach
        vs = get_vectorstore()
        docs = vs.similarity_search(query, k=k)
        return "\n".join([d.page_content for d in docs])
    except Exception as e:
        print(f"Vectorstore failed: {e}")
        # Fallback to simple keyword matching
        return query_rag_simple(query, k)


def query_rag_simple(query: str, k: int = 2) -> str:
    """
    Simple keyword-based retrieval as fallback.
    """
    docs = load_documents()
    query_lower = query.lower()
    
    # Score documents based on keyword matches
    scored_docs = []
    for doc in docs:
        content_lower = doc.page_content.lower()
        score = 0
        for word in query_lower.split():
            if word in content_lower:
                score += content_lower.count(word)
        if score > 0:
            scored_docs.append((score, doc))
    
    # Sort by score and return top k
    scored_docs.sort(key=lambda x: x[0], reverse=True)
    top_docs = scored_docs[:k]
    
    if not top_docs:
        return "No relevant financial information found for your query."
    
    # Return concatenated content from top documents
    results = []
    for score, doc in top_docs:
        # Extract first few paragraphs
        content = doc.page_content
        # Find relevant sections (first 1000 chars that contain query words)
        lines = content.split('\n')
        relevant_lines = []
        for line in lines:
            if any(word in line.lower() for word in query_lower.split()):
                relevant_lines.append(line)
                if len('\n'.join(relevant_lines)) > 500:
                    break
        
        if relevant_lines:
            results.append('\n'.join(relevant_lines))
        else:
            # Fallback to first 500 chars
            results.append(content[:500])
    
    return "\n\n---\n\n".join(results)


# Example usage (for testing only)
if __name__ == "__main__":
    result = query_rag("What are mutual funds?")
    print(result)