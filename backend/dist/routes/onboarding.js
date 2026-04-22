import { Router } from 'express';
import { upload, uploadKycDocument, getKycDocuments } from '../controllers/onboarding.js';
const router = Router();
// Get list of uploaded KYC docs
router.get('/kyc', getKycDocuments);
// Upload a new KYC document
// 'document' matches the frontend form-data field name
router.post('/kyc', upload.single('document'), uploadKycDocument);
export default router;
//# sourceMappingURL=onboarding.js.map