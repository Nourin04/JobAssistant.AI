import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

# Load .env file
load_dotenv()

# Get API key
groq_api_key = os.getenv("GROQ_API_KEY")

# Initialize LLM
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=groq_api_key,
    temperature=0.7
)

# Test prompt
response = llm.invoke("Explain what a resume parser does in 2 lines")

print(response.content)