import os
import requests
import logging

logger = logging.getLogger(__name__)

INSTAGRAM_API_URL = "https://graph.facebook.com/v18.0"

class InstagramService:
    def verify_webhook(self, mode: str, token: str, challenge: str):
        """
        Verifies the webhook subscription request from Facebook.
        """
        verify_token = os.getenv("INSTAGRAM_VERIFY_TOKEN")
        if mode and token:
            if mode == "subscribe" and token == verify_token:
                logger.info("Webhook Verified!")
                return int(challenge)
            else:
                logger.error("Verification failed: Tokens do not match.")
                return None
        return None

    def process_webhook_event(self, body: dict):
        """
        Processes incoming webhook events.
        """
        logger.info(f"Received webhook event: {body}")
        
        try:
            if body.get("object") == "instagram":
                for entry in body.get("entry", []):
                    for change in entry.get("changes", []):
                        if change.get("field") == "comments":
                            value = change.get("value", {})
                            comment_id = value.get("id")
                            text = value.get("text")
                            media_id = value.get("media", {}).get("id")
                            from_user = value.get("from", {}).get("username")
                            
                            logger.info(f"New comment from {from_user}: {text}")

                            # Here you can implement logic to determine the reply
                            # For now, a simple echo reply
                            reply_text = f"Thanks for your comment, @{from_user}! We'll get back to you shortly."
                            
                            # Post reply
                            self.reply_to_comment(comment_id, reply_text)
                            
        except Exception as e:
            logger.error(f"Error processing webhook event: {e}")

    def reply_to_comment(self, comment_id: str, message: str):
        """
        Replies to a specific comment ID using the Graph API.
        """
        access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
        if not access_token:
            logger.error("Instagram Access Token is missing.")
            return

        url = f"{INSTAGRAM_API_URL}/{comment_id}/replies"
        params = {
            "message": message,
            "access_token": access_token
        }

        try:
            response = requests.post(url, params=params)
            if response.status_code == 200:
                logger.info(f"Successfully replied to comment {comment_id}")
            else:
                logger.error(f"Failed to reply. Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            logger.error(f"Exception while replying to comment: {e}")
