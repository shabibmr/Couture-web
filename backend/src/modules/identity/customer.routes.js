import express from 'express';
import { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } from './customer.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
