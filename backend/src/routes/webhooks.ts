import { Router } from 'express';
import { sysconfigWebhookHandler, getCdrs } from '../controllers/webhooks.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Sysconfig will POST event data to this endpoint (public, called by PBX)
router.post('/sysconfig', sysconfigWebhookHandler);

// Dashboard will GET records from here (requires auth)
router.get('/cdrs', authenticate, getCdrs);

export default router;
