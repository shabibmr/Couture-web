# Backend Refactor: `featured_image` to `image`

## Goal Description
The backend currently stores the main product image in a column named `featured_image`. The frontend has been refactored to expect `image`. To complete the unification, the backend database schema and API responses must be updated to use `image` natively, removing the need for frontend normalization.

## User Review Required
> [!WARNING]
> This refactor involves a **database schema change**. `featured_image` column will be renamed to `image`. This is a breaking change for any other consumers of this API (if any exist).

## Proposed Changes

### Database Schema
#### [MODIFY] [product.model.js](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/backend/src/modules/catalog/models/product.model.js)
- Rename `featured_image` column definition to `image`.

### Controllers
#### [MODIFY] [product.controller.js](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/backend/src/modules/catalog/product.controller.js)
- Update `getAllProducts`, `getProductById`, `getProductBySlug` to return `image` instead of `featured_image`.
- Update `createProduct` to save `mainImage` to `image` field.
- Update `updateProduct` to update `image` field.

### Verification Plan
1.  **API Response Check**: Call `GET /products` and ensure response objects contain `image` and NOT `featured_image`.
2.  **Frontend Check**: Remove the temporary normalization logic in `ShopContext` and pages, and verify images still load correctly.

---

# Backend Refactor Tasks
- [x] Analyze `featured_image` usage in backend <!-- id: 9 -->
- [x] Create implementation plan for backend refactor <!-- id: 10 -->
- [ ] Refactor Database Schema/Models <!-- id: 11 -->
- [ ] Refactor Controllers/API Responses <!-- id: 12 -->
- [ ] Verify backend changes <!-- id: 13 -->
