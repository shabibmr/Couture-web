# Coding Tasks: Database-Driven Tax System Implementation

> **For**: Coding Agent  
> **Project**: Couture E-commerce (Database-Driven Tax System)  
> **Related Documents**: [`implementation_plan.md`](file:///Users/admin/.gemini/antigravity/brain/e80eb8bd-2b14-49eb-a9e9-85f998189efa/implementation_plan.md)

---

## Task Overview

Implement a database-driven tax system where tax rates are stored in the database and referenced by products. Replace hardcoded frontend tax calculations with backend API calls.

**Context**:
- Tax table already exists in database schema (`setup_db.sql` lines 448-459)
- Current state: CartPage has tax=0, CartDrawer has tax=18% (inconsistent)
- Goal: Single source of truth for tax rates in database

---

## Database Tasks

### TASK-DB-1: Create Migration for tax_id Column

**File**: `backend/schema/add_product_tax.sql` (NEW)

```sql
-- Add tax_id foreign key to products table
ALTER TABLE products 
ADD COLUMN tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_tax ON products(tax_id);

-- Optional: Set default tax for existing products
-- UPDATE products SET tax_id = (SELECT id FROM taxes WHERE rate = 18 LIMIT 1);
```

### TASK-DB-2: Seed Tax Table

**File**: `backend/schema/seed_taxes.sql` (NEW)

```sql
-- Insert 0% tax rate (no tax)
INSERT INTO taxes (id, name, region, rate, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'No Tax',
    'default',
    0.00,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- Insert 18% GST tax rate
INSERT INTO taxes (id, name, region, rate, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'GST 18%',
    'India',
    18.00,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;
```

---

## Backend Tasks

### TASK-BE-1: Create Tax Model

**File**: `backend/src/modules/catalog/models/tax.model.js` (NEW)

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const Tax = sequelize.define('Tax', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    region: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'taxes',
    timestamps: true,
    underscored: true,
});

export default Tax;
```

### TASK-BE-2: Update Product Model

**File**: [`backend/src/modules/catalog/models/product.model.js`](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/backend/src/modules/catalog/models/product.model.js)

**Changes**:
1. Import Tax model: `import Tax from './tax.model.js';`
2. Add tax_id field after brand_id (around line 27):
```javascript
tax_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
        model: Tax,
        key: 'id'
    }
},
```
3. Add relationship after line 76:
```javascript
Product.belongsTo(Tax, { foreignKey: 'tax_id' });
```

### TASK-BE-3: Create Calculate Cart Totals Endpoint

**File**: [`backend/src/modules/order/cart.controller.js`](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/backend/src/modules/order/cart.controller.js)

**Add new function** (at end of file, before closing):

```javascript
export const calculateCartTotals = async (req, res) => {
    try {
        const customer_id = req.user.id;
        
        // Get cart with items and product details including tax
        const cart = await Cart.findOne({
            where: { customer_id },
            include: [{
                model: CartItem,
                as: 'items',
                include: [{
                    model: ProductVariant,
                    include: [{
                        model: Product,
                        include: [{ model: Tax }]
                    }]
                }]
            }]
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.json({
                subtotal: 0,
                tax: 0,
                shipping: 0,
                discount: 0,
                total: 0
            });
        }

        let subtotal = 0;
        let totalTax = 0;

        // Calculate subtotal and tax for each item
        for (const item of cart.items) {
            const variant = item.ProductVariant;
            const product = variant.Product;
            const price = parseFloat(variant.variant_price) || 
                         parseFloat(product.sale_price) || 
                         parseFloat(product.base_price);
            
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;

            // Calculate tax if product has tax rate
            if (product.Tax && product.Tax.is_active) {
                const taxRate = parseFloat(product.Tax.rate);
                const itemTax = (itemTotal * taxRate) / 100;
                totalTax += itemTax;
            }
        }

        const shipping = 50.00; // Fixed shipping for now
        const discount = 0; // TODO: Apply coupon if provided
        const total = subtotal + totalTax + shipping - discount;

        res.json({
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(totalTax.toFixed(2)),
            shipping: parseFloat(shipping.toFixed(2)),
            discount: parseFloat(discount.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        });
    } catch (error) {
        console.error('Error calculating cart totals:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
```

### TASK-BE-4: Add Route for Calculate Totals

**File**: [`backend/src/modules/order/cart.routes.js`](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/backend/src/modules/order/cart.routes.js)

**Changes**:
1. Import the new function in imports section:
```javascript
import { getCart, addToCart, updateCartItem, removeCartItem, calculateCartTotals } from './cart.controller.js';
```

2. Add route (after existing routes):
```javascript
router.post('/calculate-totals', calculateCartTotals);
```

### TASK-BE-5: Update Order Creation Tax Logic

**File**: [`backend/src/modules/order/order.controller.js`](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/backend/src/modules/order/order.controller.js#L136-L148)

**Replace lines 136-148** with:

```javascript
// 3. Calculate Totals with Database Tax Rates
const shipping_amount = 50.00; // Fixed for now
let tax_amount = 0;
let discount_amount = 0;

// Calculate tax for each order item based on product's tax rate
for (const item of orderItemsData) {
    const variant = await ProductVariant.findByPk(item.variant_id, {
        include: [{
            model: Product,
            include: [{ model: Tax }]
        }]
    });
    
    if (variant?.Product?.Tax && variant.Product.Tax.is_active) {
        const taxRate = parseFloat(variant.Product.Tax.rate);
        const itemTax = (item.total_price * taxRate) / 100;
        tax_amount += itemTax;
    }
}

const total_amount = subtotal + shipping_amount + tax_amount - discount_amount;
```

**Also add Tax import** at the top of file:
```javascript
import Tax from '../catalog/models/tax.model.js';
```

---

## Frontend Tasks

### TASK-FE-1: Add Calculate Totals Endpoint to Config

**File**: [`customer/src/config/api.config.ts`](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/customer/src/config/api.config.ts)

**Add to API_ENDPOINTS**:
```typescript
CART: {
    CALCULATE_TOTALS: '/cart/calculate-totals'
}
```

### TASK-FE-2: Update CartPage to Use Backend Tax

**File**: [`customer/src/pages/CartPage.tsx`](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/customer/src/pages/CartPage.tsx)

**Changes**:

1. Add state for totals (after line 26):
```typescript
const [totals, setTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 });
const [totalsLoading, setTotalsLoading] = useState(false);
```

2. Add function to fetch totals (after parsePrice function):
```typescript
const fetchCartTotals = async () => {
    if (cart.length === 0) {
        setTotals({ subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 });
        return;
    }
    
    setTotalsLoading(true);
    try {
        const response = await api.post(API_ENDPOINTS.CART.CALCULATE_TOTALS);
        setTotals(response.data);
    } catch (error) {
        console.error('Error fetching cart totals:', error);
    } finally {
        setTotalsLoading(false);
    }
};
```

3. Add useEffect to fetch totals when cart changes (after line 19):
```typescript
React.useEffect(() => {
    fetchCartTotals();
}, [cart]);
```

4. **Replace lines 55-61** (subtotal and tax calculation) with:
```typescript
// Use totals from backend
const subtotal = totals.subtotal;
const tax = totals.tax;
const total = totals.total;
const discount = totals.discount;
```

5. Update checkout navigation (line 98) to use backend totals:
```typescript
navigate('/checkout', { state: { 
    subtotal: totals.subtotal, 
    tax: totals.tax, 
    discount: totals.discount, 
    total: totals.total 
}});
```

### TASK-FE-3: Update CartDrawer to Use Backend Tax

**File**: [`customer/src/components/CartDrawer.tsx`](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/customer/src/components/CartDrawer.tsx)

**Changes**:

1. Add state for totals (after line 11):
```typescript
const [totals, setTotals] = React.useState({ subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 });
```

2. Add import for api:
```typescript
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
```

3. Add useEffect to fetch totals (after line 22):
```typescript
React.useEffect(() => {
    const fetchTotals = async () => {
        if (cart.length === 0 || !isCartOpen) return;
        
        try {
            const response = await api.post(API_ENDPOINTS.CART.CALCULATE_TOTALS);
            setTotals(response.data);
        } catch (error) {
            console.error('Error fetching cart totals:', error);
        }
    };
    
    if (isCartOpen) {
        fetchTotals();
    }
}, [cart, isCartOpen]);
```

4. **Replace lines 115-125** (entire checkout onClick calculation) with:
```typescript
onClick={() => {
    setIsCartOpen(false);
    if (!requireAuth({ returnTo: '/checkout' })) return;
    
    navigate('/checkout', { state: totals });
}}
```

5. Update subtotal display (lines 100-107) to use `totals.subtotal`:
```typescript
<span className="font-medium text-xl text-stone-900">
    {formatPrice(totals.subtotal)}
</span>
```

### TASK-FE-4: Update CheckoutPage

**File**: [`customer/src/pages/CheckoutPage.tsx`](file:///Users/admin/code/ruvera/ruveraweb/v1/Couture-web-V1/customer/src/pages/CheckoutPage.tsx)

**Changes**:

1. Add fallback to fetch totals if not in state (after line 44):
```typescript
React.useEffect(() => {
    const fetchTotals = async () => {
        if (orderData.total === 0) {
            try {
                const response = await api.post(API_ENDPOINTS.CART.CALCULATE_TOTALS);
                setOrderData(response.data);
            } catch (error) {
                console.error('Error fetching totals:', error);
            }
        }
    };
    
    fetchTotals();
}, []);
```

2. Add necessary imports:
```typescript
import api from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
```

---

## Verification Tasks

### TASK-VF-1: Database Verification

Run these SQL commands:
```sql
-- Verify taxes table has 2 records
SELECT * FROM taxes;

-- Verify products table has tax_id column
\d products;

-- Check if any products have tax assigned
SELECT COUNT(*) FROM products WHERE tax_id IS NOT NULL;
```

### TASK-VF-2: Test Calculate Totals Endpoint

```bash
# Get auth token
TOKEN="<get_from_backend_login>"

# Test calculate totals
curl -X POST http://localhost:5000/api/cart/calculate-totals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Expected response format:
```json
{
  "subtotal": 5000.00,
  "tax": 900.00,
  "shipping": 50.00,
  "discount": 0,
  "total": 5950.00
}
```

---

## Execution Order

1. **Database tasks first**: TASK-DB-1, TASK-DB-2
2. **Backend models**: TASK-BE-1, TASK-BE-2
3. **Backend controllers**: TASK-BE-3, TASK-BE-4, TASK-BE-5
4. **Frontend config**: TASK-FE-1
5. **Frontend components**: TASK-FE-2, TASK-FE-3, TASK-FE-4
6. **Verification**: TASK-VF-1, TASK-VF-2

---

## Success Criteria

- [ ] Tax table has 2 records (0% and 18%)
- [ ] Products table has tax_id foreign key column
- [ ] Backend `/cart/calculate-totals` endpoint returns correct tax
- [ ] CartPage displays tax from backend (not hardcoded)
- [ ] CartDrawer displays same tax as CartPage
- [ ] CheckoutPage receives and displays correct tax
- [ ] Order creation stores correct tax_amount in database
- [ ] No hardcoded tax calculations in frontend (0 or 0.18)
