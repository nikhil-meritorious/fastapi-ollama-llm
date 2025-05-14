from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
from config import get_settings
import json

settings = get_settings()
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    model: str
    prompt: str
    stream: bool = False


@app.get("/")
def root():
    return {"message": "Welcome to FastAPI Ollama integration"}

@app.post("/generate")
async def generate_text(req: GenerateRequest):
    payload = {
        "model": req.model,
        "prompt": req.prompt,
        "stream": req.stream
    }

    if req.stream:
        def stream_response():
            with requests.post(
                f"{settings.ollama_api_url}/api/generate", json=payload, stream=True
            ) as r:
                for line in r.iter_lines():
                    if line:
                        chunk = json.loads(line.decode("utf-8"))
                        yield chunk["response"]

        return StreamingResponse(stream_response(), media_type="text/plain")

    else:
        response = requests.post(f"{settings.ollama_api_url}/api/generate", json=payload)
        if response.status_code == 200:
            return JSONResponse(content=response.json())
        else:
            return JSONResponse(
                content={"error": "Failed to generate response"},
                status_code=response.status_code,
            )

