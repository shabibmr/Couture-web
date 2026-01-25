# Development Workflow Guide
## Couture - Online Readymade Store

---

## Table of Contents
1. [Project Setup](#project-setup)
2. [Development Environment](#development-environment)
3. [Git Workflow](#git-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Strategy](#testing-strategy)
6. [Code Review Process](#code-review-process)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Deployment Workflow](#deployment-workflow)
9. [Daily Development Workflow](#daily-development-workflow)
10. [Tools & Commands](#tools--commands)

---

## 1. Project Setup

### 1.1 Recommended Tech Stack

#### Frontend (Customer & Admin)
```
Framework:     React 18+ with Vite
State:         React Context API + Zustand
Routing:       React Router v6
UI Library:    Material-UI (MUI) or Tailwind CSS
API Client:    Axios or TanStack Query
Forms:         React Hook Form + Zod validation
```

#### Backend (API Server)
```
Runtime:       Node.js 20+ LTS
Framework:     Express.js or Fastify
ORM:          Prisma or TypeORM
Validation:    Zod or Joi
Auth:          JWT + Refresh Tokens
Documentation: Swagger/OpenAPI
```

#### Database
```
Primary:       PostgreSQL 15+
Cache:         Redis 7+
Search:        Elasticsearch (optional)
```

#### DevOps
```
Containerization: Docker + Docker Compose
CI/CD:            GitHub Actions
Hosting:          AWS/DigitalOcean/Vercel
CDN:              Cloudflare/AWS CloudFront
```

### 1.2 Project Structure (Monorepo)

```
couture/
├── .github/
│   └── workflows/              # CI/CD pipelines
│       ├── ci.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
│
├── packages/
│   ├── frontend/               # Customer-facing app
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── common/     # Shared components
│   │   │   │   ├── layouts/
│   │   │   │   └── features/   # Feature-specific
│   │   │   ├── pages/
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   ├── services/       # API calls
│   │   │   ├── types/
│   │   │   └── App.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── admin/                  # Admin dashboard
│   │   └── [Similar structure to frontend]
│   │
│   ├── backend/                # Node.js API
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   ├── validators/
│   │   │   └── server.js
│   │   ├── tests/
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── shared/                 # Shared utilities
│       ├── types/              # TypeScript types
│       ├── constants/
│       └── utils/
│
├── scripts/                    # Utility scripts
│   ├── seed-database.js
│   ├── migrate-db.js
│   └── generate-test-data.js
│
├── docs/                       # Documentation
│   ├── api/
│   ├── setup/
│   └── guides/
│
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.admin
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json                # Root package
├── pnpm-workspace.yaml         # If using pnpm
└── README.md
```

### 1.3 Initial Setup Commands

```bash
# Clone repository
git clone https://github.com/your-org/couture.git
cd couture

# Install dependencies (using pnpm - recommended)
npm install -g pnpm
pnpm install

# Or using npm workspaces
npm install

# Setup environment files
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
cp packages/admin/.env.example packages/admin/.env

# Setup database
docker-compose up -d postgres redis

# Run migrations
cd packages/backend
pnpm db:migrate

# Seed database with test data
pnpm db:seed

# Start development servers
cd ../..
pnpm dev
```

---

## 2. Development Environment

### 2.1 Required Tools

```bash
# Essential
Node.js 20+ LTS
pnpm 8+ (or npm 10+)
Docker Desktop
Git
VS Code (recommended)

# VS Code Extensions (Recommended)
- ESLint
- Prettier
- GitLens
- Docker
- REST Client
- Prisma (if using Prisma ORM)
- ES7+ React/Redux/React-Native snippets
```

### 2.2 Environment Variables

#### Backend (.env)
```bash
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/couture_dev
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRY=7d

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-user
SMTP_PASS=your-pass
EMAIL_FROM=noreply@couture.com

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
MAX_FILE_SIZE=5242880  # 5MB

# Payment Gateway
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-secret

# Other
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Couture
VITE_RAZORPAY_KEY_ID=your-key-id
```

### 2.3 Docker Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: couture_db
    environment:
      POSTGRES_DB: couture_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: couture_cache
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mailhog:  # Email testing
    image: mailhog/mailhog
    container_name: couture_mail
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  postgres_data:
  redis_data:
```

---

## 3. Git Workflow

### 3.1 Branching Strategy (Git Flow)

```
main (production)
  ↓
develop (integration)
  ↓
feature/* (new features)
bugfix/* (bug fixes)
hotfix/* (urgent production fixes)
release/* (release preparation)
```

### 3.2 Branch Naming Conventions

```bash
# Features
feature/product-listing
feature/shopping-cart
feature/payment-integration

# Bug fixes
bugfix/cart-total-calculation
bugfix/image-upload-error

# Hotfixes
hotfix/critical-payment-error

# Releases
release/v1.0.0
release/v1.1.0
```

### 3.3 Commit Message Format

Follow **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**
```bash
feat(product): add product filtering by price range

Added price range slider to product listing page.
Users can now filter products between min and max price.

Closes #123

---

fix(cart): correct total calculation when coupon applied

Fixed bug where discount was applied before tax instead of after.

Fixes #456

---

docs(api): update authentication endpoint documentation
```

### 3.4 Git Workflow Steps

#### Creating a Feature
```bash
# 1. Create and switch to feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/product-search

# 2. Make changes and commit
git add .
git commit -m "feat(search): implement product search with filters"

# 3. Push to remote
git push origin feature/product-search

# 4. Create Pull Request on GitHub
# - Base: develop
# - Compare: feature/product-search
# - Add reviewers, labels, and link issues
```

#### Code Review & Merge
```bash
# After PR approval
git checkout develop
git pull origin develop
git merge --no-ff feature/product-search
git push origin develop

# Delete feature branch
git branch -d feature/product-search
git push origin --delete feature/product-search
```

#### Hotfix Flow
```bash
# 1. Create from main
git checkout main
git checkout -b hotfix/payment-gateway-fix

# 2. Fix and commit
git commit -m "hotfix(payment): fix razorpay webhook signature validation"

# 3. Merge to main
git checkout main
git merge --no-ff hotfix/payment-gateway-fix
git tag -a v1.0.1 -m "Hotfix: Payment gateway signature validation"
git push origin main --tags

# 4. Merge to develop
git checkout develop
git merge --no-ff hotfix/payment-gateway-fix
git push origin develop

# 5. Delete hotfix branch
git branch -d hotfix/payment-gateway-fix
```

### 3.5 Git Hooks (Husky)

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx commitlint --edit $1
```

---

## 4. Coding Standards

### 4.1 ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### 4.2 Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 4.3 Code Style Guidelines

#### React Components
```javascript
// ✅ Good: Functional component with proper naming and structure
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Product card component
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {Function} props.onAddToCart - Add to cart handler
 */
const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Cleanup logic
    return () => {
      // ...
    };
  }, []);

  const handleClick = () => {
    onAddToCart(product);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleClick}>Add to Cart</button>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
};

export default ProductCard;
```

#### Backend API Routes
```javascript
// ✅ Good: Express route with proper error handling
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateProduct } from '../validators/product.js';
import * as productController from '../controllers/product.js';

const router = express.Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with pagination and filters
 * @access  Public
 */
router.get('/', productController.getProducts);

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  validateProduct,
  productController.createProduct
);

export default router;
```

#### Error Handling
```javascript
// ✅ Good: Custom error class and async handler
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  
  res.json({ success: true, data: product });
});
```

### 4.4 Naming Conventions

```javascript
// File names
ProductCard.jsx          // React components (PascalCase)
productService.js        // Services (camelCase)
product.routes.js        // Routes (lowercase with dots)
useCart.js              // Custom hooks (camelCase starting with 'use')

// Variables and Functions
const productList = [];              // camelCase
const MAX_ITEMS_PER_PAGE = 20;      // UPPER_SNAKE_CASE for constants
function calculateTotal() {}         // camelCase
const handleSubmit = () => {};       // camelCase

// Components
const ProductCard = () => {};        // PascalCase
const useProducts = () => {};        // Custom hooks: camelCase with 'use'

// Classes
class ProductService {}              // PascalCase
class ApiError extends Error {}      // PascalCase
```

---

## 5. Testing Strategy

### 5.1 Testing Pyramid

```
       /\
      /  \
     / E2E \     (Few - Critical user flows)
    /______\
   /        \
  / Integration\  (Some - API endpoints, component integration)
 /____________\
/              \
/  Unit Tests   \  (Many - Business logic, utilities)
/________________\
```

### 5.2 Testing Tools

```json
// package.json
{
  "devDependencies": {
    "vitest": "^1.0.0",           // Unit testing
    "testing-library/react": "^14.0.0",  // React testing
    "testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.40.0",       // E2E testing
    "supertest": "^6.3.0",         // API testing
    "msw": "^2.0.0"                // API mocking
  }
}
```

### 5.3 Unit Tests

```javascript
// productService.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateDiscount } from './productService';

describe('ProductService', () => {
  describe('calculateDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const price = 100;
      const discount = { type: 'percentage', value: 20 };
      
      const result = calculateDiscount(price, discount);
      
      expect(result).toBe(80);
    });

    it('should calculate fixed discount correctly', () => {
      const price = 100;
      const discount = { type: 'fixed', value: 25 };
      
      const result = calculateDiscount(price, discount);
      
      expect(result).toBe(75);
    });

    it('should not allow negative final price', () => {
      const price = 100;
      const discount = { type: 'fixed', value: 150 };
      
      const result = calculateDiscount(price, discount);
      
      expect(result).toBe(0);
    });
  });
});
```

### 5.4 Integration Tests (API)

```javascript
// product.routes.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { setupTestDB, teardownTestDB } from './helpers/db';

describe('Product API', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/v1/products', () => {
    it('should return all products', async () => {
      const res = await request(app).get('/api/v1/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should filter products by category', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ category: 'men' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(p => p.category === 'men')).toBe(true);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create product when authenticated as admin', async () => {
      const token = 'valid-admin-token'; // Get from test helper
      const newProduct = {
        name: 'Test Product',
        price: 99.99,
        category: 'men',
      };

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe(newProduct.name);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Test' });

      expect(res.statusCode).toBe(401);
    });
  });
});
```

### 5.5 React Component Tests

```javascript
// ProductCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    image: '/test-image.jpg',
  };

  it('should render product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  it('should call onAddToCart when button clicked', () => {
    const mockAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);

    const button = screen.getByText('Add to Cart');
    fireEvent.click(button);

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
  });
});
```

### 5.6 E2E Tests (Playwright)

```javascript
// checkout.spec.js
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('user can complete purchase', async ({ page }) => {
    // Navigate to product page
    await page.goto('http://localhost:3000/products/test-product');

    // Add to cart
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('.cart-count')).toHaveText('1');

    // Go to cart
    await page.click('a:has-text("Cart")');
    await expect(page).toHaveURL(/.*cart/);

    // Proceed to checkout
    await page.click('button:has-text("Proceed to Checkout")');

    // Fill shipping information
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="fullName"]', 'John Doe');
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="city"]', 'New York');
    await page.fill('input[name="zip"]', '10001');

    // Continue to payment
    await page.click('button:has-text("Continue to Payment")');

    // Select payment method
    await page.click('input[value="card"]');

    // Place order
    await page.click('button:has-text("Place Order")');

    // Verify order confirmation
    await expect(page.locator('.order-confirmation')).toBeVisible();
    await expect(page.locator('.order-number')).toContain Text('#');
  });
});
```

### 5.7 Test Commands

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 6. Code Review Process

### 6.1 Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Added product search functionality
- Updated product listing component
- Added search API endpoint

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Changes are backward compatible

## Reviewer Notes
[Any specific areas to focus on during review]
```

### 6.2 Review Checklist

**Code Quality**
- [ ] Code is clean and readable
- [ ] Functions are small and focused
- [ ] Variable names are descriptive
- [ ] No commented-out code
- [ ] No console.logs (except error handling)

**Functionality**
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Input validation present

**Testing**
- [ ] Tests are comprehensive
- [ ] Tests pass
- [ ] Coverage is adequate

**Security**
- [ ] No sensitive data exposed
- [ ] Input sanitization implemented
- [ ] Authentication/authorization checked
- [ ] SQL injection prevented

**Performance**
- [ ] No N+1 queries
- [ ] Efficient algorithms used
- [ ] Proper indexing in place
- [ ] Caching implemented where needed

### 6.3 Review Response Time

- **Priority**: Critical bug fixes - 2 hours
- **High**: Features blocking others - 1 day
- **Normal**: Regular features - 2 days
- **Low**: Documentation/refactoring - 3 days

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: packages/*/dist
```

### 7.2 Deployment Workflow

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/couture-frontend:$IMAGE_TAG -f docker/Dockerfile.frontend .
          docker build -t $ECR_REGISTRY/couture-backend:$IMAGE_TAG -f docker/Dockerfile.backend .
          docker push $ECR_REGISTRY/couture-frontend:$IMAGE_TAG
          docker push $ECR_REGISTRY/couture-backend:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          # Update ECS service with new image
          aws ecs update-service --cluster couture-staging --service frontend --force-new-deployment
          aws ecs update-service --cluster couture-staging --service backend --force-new-deployment
```

---

## 8. Deployment Workflow

### 8.1 Environment Strategy

```
Development  →  Staging  →  Production
   (local)      (auto)      (manual)
```

### 8.2 Deployment Checklist

#### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Backup taken
- [ ] Rollback plan prepared

#### Deployment Steps
1. **Merge to main** (for production)
2. **Run migrations** (if any)
3. **Build Docker images**
4. **Push to registry**
5. **Update services**
6. **Run smoke tests**
7. **Monitor logs**

#### Post-Deployment
- [ ] Verify critical flows
- [ ] Check error rates
- [ ] Monitor performance
- [ ] Update changelog
- [ ] Notify team

### 8.3 Rollback Procedure

```bash
# Quick rollback to previous version
aws ecs update-service \
  --cluster couture-prod \
  --service backend \
  --task-definition couture-backend:45  # Previous revision

# Or use Docker tags
docker pull couture/backend:v1.2.3  # Previous stable version
```

---

## 9. Daily Development Workflow

### 9.1 Morning Routine

```bash
# 1. Update local develop branch
git checkout develop
git pull origin develop

# 2. Check for dependency updates
pnpm outdated

# 3. Start development environment
docker-compose up -d
pnpm dev

# 4. Review assigned issues
# Check GitHub issues/project board
```

### 9.2 Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/product-filters

# 2. Develop with frequent commits
git add .
git commit -m "feat(products): add price range filter"

# 3. Run tests locally
pnpm test
pnpm lint

# 4. Push and create PR
git push origin feature/product-filters
# Create PR on GitHub

# 5. Address review comments
# Make changes, commit, push

# 6. Merge when approved
# Use "Squash and merge" on GitHub
```

### 9.3 Bug Fix Workflow

```bash
# 1. Create bugfix branch
git checkout -b bugfix/cart-calculation

# 2. Write failing test first (TDD)
# Write test that reproduces the bug

# 3. Fix the bug
# Make minimal changes to fix

# 4. Verify test passes
pnpm test

# 5. Create PR with "Fixes #issue-number"
```

---

## 10. Tools & Commands

### 10.1 Package Scripts

```json
// Root package.json
{
  "scripts": {
    "dev": "concurrently \"pnpm:dev:*\"",
    "dev:frontend": "cd packages/frontend && pnpm dev",
    "dev:admin": "cd packages/admin && pnpm dev",
    "dev:backend": "cd packages/backend && pnpm dev",
    
    "build": "pnpm -r build",
    "build:frontend": "cd packages/frontend && pnpm build",
    "build:admin": "cd packages/admin && pnpm build",
    "build:backend": "cd packages/backend && pnpm build",
    
    "test": "pnpm -r test",
    "test:coverage": "pnpm -r test:coverage",
    "test:e2e": "cd packages/frontend && pnpm test:e2e",
    
    "lint": "pnpm -r lint",
    "lint:fix": "pnpm -r lint:fix",
    "format": "prettier --write \"**/*.{js,jsx,json,md}\"",
    
    "db:migrate": "cd packages/backend && pnpm db:migrate",
    "db:seed": "cd packages/backend && pnpm db:seed",
    "db:reset": "cd packages/backend && pnpm db:reset",
    
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  }
}
```

### 10.2 Useful Commands

```bash
# Database
pnpm db:migrate        # Run migrations
pnpm db:seed           # Seed database
pnpm db:reset          # Reset and reseed
pnpm db:studio         # Open Prisma Studio (if using Prisma)

# Testing
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Generate coverage
pnpm test:e2e          # Run E2E tests
pnpm test:e2e:ui       # E2E with UI

# Linting & Formatting
pnpm lint              # Lint all packages
pnpm lint:fix          # Auto-fix issues
pnpm format            # Format with Prettier

# Docker
pnpm docker:up         # Start containers
pnpm docker:down       # Stop containers
pnpm docker:logs       # View logs
docker-compose exec postgres psql -U postgres -d couture_dev  # Access DB

# Build & Deploy
pnpm build             # Build all packages
pnpm preview           # Preview production build
```

### 10.3 Debugging Tools

```javascript
// Debug backend with VS Code
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/packages/backend/src/server.js",
      "envFile": "${workspaceFolder}/packages/backend/.env"
    }
  ]
}
```

---

## 11. Team Collaboration

### 11.1 Communication Channels

- **Daily Standups**: 15 min sync (9:00 AM)
- **Slack/Discord**: Real-time chat
- **GitHub Issues**: Task tracking
- **GitHub Projects**: Sprint planning
- **Weekly Review**: Friday retrospective

### 11.2 Documentation Standards

- **Code Comments**: For complex logic only
- **API Documentation**: OpenAPI/Swagger
- **README**: Each package needs one
- **Architecture Decisions**: Document in /docs
- **Changelog**: Keep updated with releases

---

## 12. Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Issue: Database Connection Failed
```bash
# Check if database is running
docker ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue: Tests Failing Locally
```bash
# Clear test cache
pnpm test --clearCache

# Update snapshots
pnpm test -u

# Run specific test
pnpm test ProductCard.test.jsx
```

---

## Summary

This workflow guide provides:
- ✅ Complete project setup instructions
- ✅ Git workflow with branching strategy
- ✅ Coding standards and conventions
- ✅ Comprehensive testing strategy
- ✅ Code review process
- ✅ CI/CD pipeline configuration
- ✅ Deployment procedures
- ✅ Daily development workflows
- ✅ Essential commands and tools

Follow these guidelines to maintain code quality, improve collaboration, and ensure smooth development and deployment processes.
