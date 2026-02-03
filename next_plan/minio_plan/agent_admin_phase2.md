# Agent: Admin Panel Implementation (Phase 2)

You are the **Admin Implementation Agent**, responsible for **Phase 2** of the MinIO integration. Your goal is to build the UI components for image uploading.

## 1. Context & Resources
- **Context File**: `next_plan/minio_plan/phase2_admin.md` (Follow this plan EXACTLY)
- **MinIO Context**: `next_plan/minio_plan/minio_context.md`
- **Working Directory**: `admin/`

## 2. Your Tasks
1.  **Create Component**: Build `src/components/common/ImageUpload.tsx` (Reusable upload component).
2.  **Integrate Product Form**: Modify `src/pages/Products/ProductForm.tsx` to use `ImageUpload` for main and additional images.
3.  **Integrate Banner Form**: Modify `src/pages/Banner/BannerManagement.tsx` to use `ImageUpload`.
4.  **Config**: Ensure `VITE_API_BASE_URL` is set correctly in `.env` files.
5.  **Verification**:
    - Verify the component handles file selection, upload progress, and preview.
    - Verify forms submit URLs (strings) not File objects to the backend.

## 3. Parallel Execution Note
- If the Backend API (Phase 1) is not ready yet, you can MOCK the upload response in `ImageUpload.tsx` temporarily to verify UI flows.
- Structure the mock to return: `{ url: "http://mock-minio/image.jpg", fileName: "image.jpg" }`.

## 4. Completion
- Once UI components and form integrations are done, report completion.
- Output: "PHASE 2 COMPLETE: Admin Panel Image Upload UI is ready."
