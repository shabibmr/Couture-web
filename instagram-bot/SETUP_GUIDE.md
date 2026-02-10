# Instagram Graph API Setup Guide

> **Is this chargeable?**
> **No, the Instagram Graph API is completely free** for standard usage. However, there are rate limits (e.g., ~200 calls per hour per user), which is plenty for a typical comment bot. You will only pay if you use third-party services or exceed massive enterprise-scale limits that require special paid tiers (very rare for this use case).

---

## Step-by-Step Instructions

Follow these steps to get your `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_APP_SECRET`, and `INSTAGRAM_BUSINESS_ACCOUNT_ID`.

### 1. Prerequisites
- A **Facebook Account**.
- A **Facebook Page** (for your business/brand).
- An **Instagram Professional Account** (Business or Creator).
  - *Note: Connect this Instagram account to your Facebook Page.* (Go to Facebook Page Settings -> Linked Accounts -> Instagram -> Connect).

### 2. Create a Meta App
1.  Go to [developers.facebook.com](https://developers.facebook.com/).
2.  Click **"My Apps"** -> **"Create App"**.
3.  Select **"Other"** (or "Business") as the use case.
4.  Select **"Business"** as the app type.
5.  Fill in the **App Name** (e.g., "InstaBot") and **App Contact Email**.
6.  (Optional) Connect a **Business Account** if you have one.
7.  Click **Create App**.

### 3. Add Instagram Graph API
1.  In your App Dashboard, scroll down to find **"Instagram Graph API"**.
2.  Click **"Set Up"**.
3.  On the left sidebar, go to **Instagram Graph API** -> **Basic Display** (if you need it, but usually just **API Setup** is enough for comments).
    - actually, for comments, stick to the main **Instagram Graph API**.

### 4. Get `INSTAGRAM_APP_SECRET`
1.  On the left sidebar, go to **App Settings** -> **Basic**.
2.  Click **"Show"** next to **App Secret**.
3.  Copy this value. This is your `INSTAGRAM_APP_SECRET`.

### 5. Generate `INSTAGRAM_ACCESS_TOKEN`
*We will use the Graph API Explorer for the initial token.*

1.  Go to **Tools** -> **Graph API Explorer** (or verify your app is selected in the dropdown).
2.  **User or Page**: Select "User Token".
3.  **Permissions**: Add the following permissions:
    - `instagram_basic`
    - `instagram_manage_comments`
    - `instagram_manage_insights` (optional)
    - `pages_show_list`
    - `pages_read_engagement` (to read comments on the Page post linking to Insta)
4.  Click **"Generate Access Token"**.
5.  (Pop-up) Login with your Facebook account and **Select the Facebook Page** linked to your Instagram.
6.  **Important**: Keep this token safe.
    - *Note: This is a short-lived token (1 hour). to get a long-lived one (60 days), click the "info" icon next to the token -> "Open in Access Token Tool" -> "Extend Access Token".*
    - Copied Token = `INSTAGRAM_ACCESS_TOKEN`.

### 6. Get `INSTAGRAM_BUSINESS_ACCOUNT_ID`
1.  In the **Graph API Explorer** (with your new token selected), enter `me/accounts` in the query bar and click **Submit**.
2.  You will see a list of Pages. Find the one you connected.
3.  Copy the `id` of that Page (PAGE_ID).
4.  Now, query: `PAGE_ID?fields=instagram_business_account` (replace PAGE_ID with the ID you just copied).
5.  The response will look like:
    ```json
    {
      "instagram_business_account": {
        "id": "17841400000000000"
      },
      "id": "YOUR_PAGE_ID"
    }
    ```
6.  Copy the ID inside `instagram_business_account`. This is your `INSTAGRAM_BUSINESS_ACCOUNT_ID`.

### 7. set `INSTAGRAM_VERIFY_TOKEN`
- This is a string **YOU** invent. It can be anything, like `my_super_secret_verify_token_123`.
- Put this in your `.env` file.
- You will paste this same string into the Meta Dashboard when you set up the Webhook later (Step 4 in `walkthrough.md`).

---

### Summary for `.env`
Now you should have:
- `PORT=8000`
- `INSTAGRAM_ACCESS_TOKEN=` (From Step 5)
- `INSTAGRAM_APP_SECRET=` (From Step 4)
- `INSTAGRAM_VERIFY_TOKEN=` (From Step 7)
- `INSTAGRAM_BUSINESS_ACCOUNT_ID=` (From Step 6)

Save these in `instagram-bot/.env` and proceed with running the bot!
