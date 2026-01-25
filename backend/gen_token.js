import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const studentId = '36246113-e441-49c7-92b6-2d04c71143dd'; // Our test customer from DB
const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

const token = jwt.sign({ id: studentId, role: 'customer', type: 'customer' }, secret, {
    expiresIn: '7d',
});

console.log('Customer Token:');
console.log(token);
