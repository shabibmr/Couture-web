import unittest
from unittest.mock import patch, MagicMock
from services.instagram_service import InstagramService
import os

class TestInstagramService(unittest.TestCase):
    def setUp(self):
        self.service = InstagramService()
        # Mock environment variables
        os.environ["INSTAGRAM_VERIFY_TOKEN"] = "test_verify_token"
        os.environ["INSTAGRAM_ACCESS_TOKEN"] = "test_access_token"

    def test_verify_webhook_success(self):
        """Test successful webhook verification."""
        challenge = self.service.verify_webhook("subscribe", "test_verify_token", "12345")
        self.assertEqual(challenge, 12345)

    def test_verify_webhook_failure(self):
        """Test webhook verification failure with wrong token."""
        challenge = self.service.verify_webhook("subscribe", "wrong_token", "12345")
        self.assertIsNone(challenge)

    @patch("services.instagram_service.requests.post")
    def test_reply_to_comment(self, mock_post):
        """Test sending a reply via Graph API."""
        # Setup mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response

        self.service.reply_to_comment("comment_123", "Hello!")

        # Verify requests.post was called correctly
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        self.assertIn("https://graph.facebook.com/v18.0/comment_123/replies", args[0])
        self.assertEqual(kwargs["params"]["message"], "Hello!")
        self.assertEqual(kwargs["params"]["access_token"], "test_access_token")

    @patch("services.instagram_service.requests.post")
    def test_process_webhook_event(self, mock_post):
        """Test processing a webhook event with a comment."""
        # Setup mock response for the reply
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response

        # Sample webhook payload
        payload = {
            "object": "instagram",
            "entry": [{
                "changes": [{
                    "field": "comments",
                    "value": {
                        "id": "comment_123",
                        "text": "This is a test comment",
                        "from": {"username": "test_user"}
                    }
                }]
            }]
        }

        self.service.process_webhook_event(payload)

        # Verify that a reply was attempted
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        self.assertIn("Thanks for your comment, @test_user!", kwargs["params"]["message"])

if __name__ == "__main__":
    unittest.main()
