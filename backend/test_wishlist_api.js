#!/usr/bin/env node

/**
 * Test script for wishlist API endpoints
 * This script demonstrates the expected JSON format and tests the complete wishlist flow
 */

const API_BASE = 'http://localhost:5000/api';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null, token = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const responseData = await response.json();

    return { status: response.status, data: responseData };
}

async function testWishlistAPI() {
    log('\n=== Wishlist API Test Script ===\n', 'blue');

    // Step 1: Authenticate (you'll need to provide real credentials)
    log('Step 1: Authenticate user', 'yellow');
    log('Please ensure you have a valid user account in the database');
    log('Replace EMAIL and PASSWORD below with real credentials\n');

    // For this demo, we'll assume you have a token
    // In real testing, you'd get this from the auth endpoint
    const TEST_EMAIL = 'test@example.com'; // Replace with real email
    const TEST_PASSWORD = 'password123'; // Replace with real password

    try {
        // Authenticate to get token
        const authResponse = await makeRequest('POST', '/auth/firebase-sync', {
            email: TEST_EMAIL,
            uid: 'test-uid'
        });

        if (authResponse.status !== 200) {
            log(`Authentication failed: ${JSON.stringify(authResponse.data)}`, 'red');
            log('\nPlease update the script with valid credentials', 'yellow');
            return;
        }

        const token = authResponse.data.backendToken;
        log(`✓ Authentication successful`, 'green');
        log(`Token: ${token.substring(0, 20)}...\n`, 'green');

        // Step 2: Get initial wishlist (should be empty)
        log('Step 2: Get wishlist (GET /api/wishlist)', 'yellow');
        const getWishlistResponse = await makeRequest('GET', '/wishlist', null, token);
        log(`Response: ${JSON.stringify(getWishlistResponse.data, null, 2)}`, 'green');

        // Step 3: Add product to wishlist
        log('\nStep 3: Add product to wishlist (POST /api/wishlist/items)', 'yellow');
        log('Expected JSON format:', 'blue');
        log(JSON.stringify({ product_id: 'uuid-string' }, null, 2), 'blue');

        // You'll need a valid product ID from your database
        const TEST_PRODUCT_ID = 'replace-with-real-product-uuid';

        const addResponse = await makeRequest(
            'POST',
            '/wishlist/items',
            { product_id: TEST_PRODUCT_ID },
            token
        );

        log(`\nResponse (${addResponse.status}):`, 'green');
        log(JSON.stringify(addResponse.data, null, 2), 'green');

        if (addResponse.status === 201 || addResponse.status === 200) {
            const wishlistItemId = addResponse.data.item?.id;

            // Step 4: Get wishlist again (should contain the product)
            log('\nStep 4: Get updated wishlist', 'yellow');
            const updatedWishlist = await makeRequest('GET', '/wishlist', null, token);
            log(`Response: ${JSON.stringify(updatedWishlist.data, null, 2)}`, 'green');

            // Step 5: Remove product from wishlist
            if (wishlistItemId) {
                log('\nStep 5: Remove product from wishlist (DELETE /api/wishlist/items/:id)', 'yellow');
                const removeResponse = await makeRequest(
                    'DELETE',
                    `/wishlist/items/${wishlistItemId}`,
                    null,
                    token
                );
                log(`Response: ${JSON.stringify(removeResponse.data, null, 2)}`, 'green');

                // Step 6: Verify wishlist is empty
                log('\nStep 6: Verify wishlist is empty', 'yellow');
                const finalWishlist = await makeRequest('GET', '/wishlist', null, token);
                log(`Response: ${JSON.stringify(finalWishlist.data, null, 2)}`, 'green');
            }
        }

        log('\n=== Test Complete ===\n', 'blue');
    } catch (error) {
        log(`\nError: ${error.message}`, 'red');
        log('Make sure the backend server is running on http://localhost:5000', 'yellow');
    }
}

// Run the tests
testWishlistAPI();
