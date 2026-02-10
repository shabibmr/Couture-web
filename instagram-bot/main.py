from fastapi import FastAPI, Request, BackgroundTasks
import uvicorn
import os
from dotenv import load_dotenv
from services.instagram_service import InstagramService
import logging

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
instagram_service = InstagramService()

@app.get("/")
def read_root():
    return {"message": "Instagram Bot is running!"}

@app.get("/webhook")
async def verify_webhook(request: Request):
    """
    Callback endpoint for Instagram webhook verification.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    verified_challenge = instagram_service.verify_webhook(mode, token, challenge)

    if verified_challenge:
        return int(verified_challenge)
    return {"status": "verification_failed", "message": "Tokens do not match."}

@app.post("/webhook")
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Callback endpoint for Instagram webhook events (new comments, etc.).
    """
    body = await request.json()
    
    # Send event processing to background task to respond quickly (within 20s as required by Meta)
    background_tasks.add_task(instagram_service.process_webhook_event, body)

    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
