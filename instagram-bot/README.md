# Instagram Comment Auto-Reply Bot

This is a standalone Python service using FastAPI to automatically reply to Instagram comments.

## Setup

1.  **Navigate to the project directory:**
    ```bash
    cd instagram-bot
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    - Copy `.env.example` to `.env`:
        ```bash
        cp .env.example .env
        ```
    - Open `.env` and fill in your Instagram/Facebook credentials:
        - `INSTAGRAM_ACCESS_TOKEN`: Your page access token.
        - `INSTAGRAM_APP_SECRET`: Your app secret (from Meta Dashboard).
        - `INSTAGRAM_VERIFY_TOKEN`: A random string you create (used for webhook verification).
        - `INSTAGRAM_BUSINESS_ACCOUNT_ID`: Your Instagram Business Account ID.

## Running the Application

To start the server:

```bash
uvicorn main:app --reload --port 8000
```

The server will be running at `http://localhost:8000`.

## Webhook Configuration (Meta Dashboard)

1.  **Expose your local server** using ngrok:
    ```bash
    ngrok http 8000
    ```
    Copy the HTTPS URL (e.g., `https://your-ngrok-url.com`).

2.  **Go to your Meta App Dashboard** -> **Instagram Graph API** -> **Webhooks**.
3.  **Subscribe to the `comments` field**.
4.  **Enter the Callback URL**: `https://your-ngrok-url.com/webhook`.
5.  **Enter the Verify Token**: The same string you put in your `.env` file.
6.  **Verify and Save**.

## Testing

Post a comment on one of your Instagram posts. You should see the event logged in your terminal and an automatic reply posted to the comment.
