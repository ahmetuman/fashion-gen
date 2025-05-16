from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AzureOpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Azure OpenAI credentials from environment variables
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "https://bitirme-odevi.openai.azure.com/")
deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview")
subscription_key = os.getenv("AZURE_OPENAI_API_KEY", "")

# Initialize Azure GPT client
client = AzureOpenAI(
    api_version=api_version,
    azure_endpoint=endpoint,
    api_key=subscription_key,
)

# System prompt for fashion prompt engineering
system_prompt = """You are an AI stylist and fashion prompt engineer. Your job is to translate a casual or vague user request into a detailed, specific outfit description suitable for a Stable Diffusion model.

Guidelines:
- Focus only on the outfit and clothing attributes. Ignore background, lighting, photo style, camera settings.
- Use the user's message to infer context (weather, event, intent) and adjust the outfit accordingly.
- Your output should describe:
  - Garment type(s) (e.g., T-shirt, formal jacket, linen shirt)
  - Gender and body type (if inferable)
  - Fit (tight, relaxed, oversized)
  - Sleeve length, neckline, tucking
  - Length (cropped, hip, long)
  - Material (e.g., cotton, denim, wool)
  - Color(s), pattern (e.g., striped, floral)
  - Formality (casual, formal, semi-formal)
- Write the prompt as a comma-separated string, describing what the person is wearing
- Do not describe face, hair, background, mood, or artistic style

Respond with only the prompt — no explanations, notes, or extra words."""

class PromptRequest(BaseModel):
    prompt: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Fashion Generation API"}

@app.post("/generate")
async def generate_fashion(request: PromptRequest):
    user_input = request.prompt
    
    # Check if API key is available
    if not subscription_key:
        return {"response": "API key not configured. Please set the AZURE_OPENAI_API_KEY environment variable."}
    
    try:
        # Call GPT-4o via Azure OpenAI
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            max_tokens=200,
            temperature=0.6,
            top_p=1.0,
            model=deployment
        )
        
        generated_prompt = response.choices[0].message.content.strip()
        
        return {"response": generated_prompt}
    except Exception as e:
        return {"response": f"Error generating prompt: {str(e)}"} 