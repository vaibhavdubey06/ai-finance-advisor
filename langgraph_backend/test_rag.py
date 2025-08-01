#!/usr/bin/env python3
"""Simple test script for RAG system"""

import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_rag_system():
    """Test the RAG system with a simple query"""
    try:
        from tools.rag_tool import query_rag
        
        print("🧪 Testing RAG system...")
        print("Query: What are mutual funds?")
        
        result = query_rag("What are mutual funds?")
        
        print("\n📝 Result:")
        if len(result) > 300:
            print(result[:300] + "...")
        else:
            print(result)
            
        print(f"\n✅ RAG test completed successfully!")
        print(f"📊 Result length: {len(result)} characters")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure all dependencies are installed:")
        print("   pip install langchain langchain-community faiss-cpu google-generativeai")
    except Exception as e:
        print(f"❌ Error testing RAG system: {e}")

if __name__ == "__main__":
    test_rag_system() 