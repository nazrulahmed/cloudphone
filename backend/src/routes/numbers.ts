import { Router } from 'express';
import { getAvailableNumbers, purchaseNumber } from '../controllers/numbers.js';

const router = Router();

router.get('/available', getAvailableNumbers);
router.post('/purchase', purchaseNumber);

export default router;
