import { Router } from 'express';
import { upload, uploadKycDocument, getKycDocuments } from '../controllers/onboarding.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all onboarding routes
router.use(authenticate);

// Get list of uploaded KYC docs
router.get('/kyc', getKycDocuments);

// Upload a new KYC document
router.post('/kyc', upload.single('document'), uploadKycDocument);

export default router;
