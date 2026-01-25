import fetch from 'node-fetch';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM2MjQ2MTEzLWU0NDEtNDljNy05MmI2LTJkMDRjNzExNDNkZCIsInJvbGUiOiJjdXN0b21lciIsInR5cGUiOiJjdXN0b21lciIsImlhdCI6MTc2OTM1OTg3MiwiZXhwIjoxNzY5OTY0NjcyfQ.vxUcRdTNY4tUDhRy5TBQs1QWxk5o2oGEZ5yCZJ82P8c';
const BASE_URL = 'http://localhost:5000/api';
const PRODUCT_ID = 'a308d5d7-7256-4774-bfc1-0b8e463a3b6e';

async function debugProduct() {
    try {
        const res = await fetch(`${BASE_URL}/products/id/${PRODUCT_ID}`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

debugProduct();
