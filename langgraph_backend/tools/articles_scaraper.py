# article_scraper.py

import requests
from bs4 import BeautifulSoup
import os
import re
import time

# More reliable financial article URLs
ARTICLE_URLS = [
    "https://www.investopedia.com/terms/f/financial-analysis.asp",
    "https://www.investopedia.com/terms/m/mutualfund.asp",
    "https://www.investopedia.com/terms/s/sip.asp",
    "https://www.investopedia.com/terms/c/compoundinterest.asp",
    "https://www.investopedia.com/terms/r/retirement-planning.asp"
]

SAVE_DIR = "data/articles"
os.makedirs(SAVE_DIR, exist_ok=True)

def clean_filename(title):
    """Clean title for use as filename"""
    # Remove special characters and limit length
    clean_title = re.sub(r'[^\w\s-]', '', title)
    clean_title = re.sub(r'[-\s]+', '_', clean_title)
    return clean_title[:50]  # Limit to 50 characters

def extract_investopedia_content(soup):
    """Extract content specifically from Investopedia articles"""
    # Try multiple selectors for Investopedia content
    content_selectors = [
        '.article-content',
        '.content',
        'article',
        '.post-content',
        '#content',
        '.article-body'
    ]
    
    for selector in content_selectors:
        content_elem = soup.select_one(selector)
        if content_elem:
            # Remove navigation, ads, and other non-content elements
            for elem in content_elem.find_all(['nav', 'aside', 'script', 'style', 'header', 'footer']):
                elem.decompose()
            
            # Get text with proper spacing
            content = content_elem.get_text(separator='\n', strip=True)
            if len(content) > 500:  # Ensure we have substantial content
                return content
    
    # Fallback: get all paragraphs
    paragraphs = soup.find_all('p')
    content = '\n\n'.join([
        p.get_text().strip() for p in paragraphs 
        if p.get_text().strip() and len(p.get_text().strip()) > 50
    ])
    
    return content

def fetch_articles():
    """Fetch articles using requests and BeautifulSoup"""
    headers = {
        'User-Agent': ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                      'AppleWebKit/537.36 (KHTML, like Gecko) '
                      'Chrome/91.0.4472.124 Safari/537.36')
    }
    
    successful_scrapes = 0
    
    for url in ARTICLE_URLS:
        try:
            print(f"[🔄] Fetching: {url}")
            
            # Fetch the webpage
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            title_tag = soup.find('title')
            title = title_tag.get_text().strip() if title_tag else "Untitled"
            
            # Extract content based on domain
            if 'investopedia.com' in url:
                content = extract_investopedia_content(soup)
            else:
                # Generic content extraction
                content_selectors = ['article', '.content', 'main', '.post-content']
                content = None
                for selector in content_selectors:
                    content_elem = soup.select_one(selector)
                    if content_elem:
                        content = content_elem.get_text(separator='\n', strip=True)
                        break
                
                if not content:
                    paragraphs = soup.find_all('p')
                    content = '\n\n'.join([
                        p.get_text().strip() for p in paragraphs 
                        if p.get_text().strip()
                    ])
            
            if not content or len(content) < 200:
                print(f"[⚠️] Insufficient content found for {url}")
                continue
            
            # Clean filename and save
            clean_title = clean_filename(title)
            path = os.path.join(SAVE_DIR, f"{clean_title}.txt")
            
            with open(path, "w", encoding="utf-8") as f:
                f.write(f"Title: {title}\n")
                f.write(f"URL: {url}\n")
                f.write(f"Scraped: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"{'='*50}\n\n")
                f.write(content)
            
            print(f"[✅] Saved: {clean_title}.txt ({len(content)} characters)")
            successful_scrapes += 1
            
            # Be respectful - add delay between requests
            time.sleep(2)
            
        except requests.RequestException as e:
            print(f"[❌] Network error fetching {url}: {e}")
        except Exception as e:
            print(f"[❌] Failed to fetch {url}: {e}")
    
    print(f"\n📊 Scraping Summary:")
    print(f"   Total URLs: {len(ARTICLE_URLS)}")
    print(f"   Successful: {successful_scrapes}")
    print(f"   Failed: {len(ARTICLE_URLS) - successful_scrapes}")

if __name__ == "__main__":
    print("🚀 Starting financial article scraping...")
    print(f"📁 Saving articles to: {os.path.abspath(SAVE_DIR)}")
    fetch_articles()
    print("✨ Article scraping completed!")
