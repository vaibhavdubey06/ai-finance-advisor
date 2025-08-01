#!/usr/bin/env python3
"""
FinanceAI Document Ingestion Script

This script processes financial documents (PDF/TXT) and creates a FAISS vector store
using Google Gemini embeddings for efficient similarity search.

Usage:
    python ingest_docs.py --path data/
"""
import os
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.docstore.document import Document

# === Load environment variables from root .env ===
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# === Setup directories ===
ARTICLES_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'articles')
os.makedirs(ARTICLES_DIR, exist_ok=True)

# === Sample article URLs or keywords ===
ARTICLE_KEYWORDS = [
    "how to save money as a student",
    "what is mutual fund",
    "best investment plan for 2025",
]

# === Google Custom Search API (optional alternative to scraping) ===
# But here we’ll use simple scraping for now

def fetch_and_save_article(query: str):
    search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}&num=1"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    response = requests.get(search_url, headers=headers)

    soup = BeautifulSoup(response.text, "html.parser")
    first_result = soup.find("a")

    if first_result and "href" in first_result.attrs:
        url = first_result["href"]
        article_response = requests.get(url, headers=headers)
        article_soup = BeautifulSoup(article_response.text, "html.parser")
        paragraphs = article_soup.find_all("p")
        content = "\n".join([p.get_text() for p in paragraphs])

        filename = os.path.join(ARTICLES_DIR, f"{query.replace(' ', '_')}.txt")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[+] Saved article for: {query}")
    else:
        print(f"[!] Could not fetch article for: {query}")

# === Step 1: Download Articles ===
for query in ARTICLE_KEYWORDS:
    fetch_and_save_article(query)

# === Step 2: Load & Split Articles ===
def load_articles():
    documents = []
    for file_name in os.listdir(ARTICLES_DIR):
        with open(os.path.join(ARTICLES_DIR, file_name), "r", encoding="utf-8") as f:
            content = f.read()
            documents.append(Document(page_content=content, metadata={"source": file_name}))
    return documents

docs = load_articles()
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(docs)

# === Step 3: Generate Embeddings & Store in FAISS ===
embedding = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=os.getenv("GOOGLE_API_KEY"))
db = FAISS.from_documents(chunks, embedding)
db.save_local(os.path.join(os.path.dirname(__file__), '..', 'vectorstores', 'rag_articles'))

print("[✅] Ingestion completed. Embeddings stored in vectorstore.")
