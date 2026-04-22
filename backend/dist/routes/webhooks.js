import { Router } from 'express';
import { sysconfigWebhookHandler, getCdrs } from '../controllers/webhooks.js';
const router = Router();
// Sysconfig will POST event data to this endpoint
router.post('/sysconfig', sysconfigWebhookHandler);
// Dashboard will GET records from here
router.get('/cdrs', getCdrs);
export default router;
//# sourceMappingURL=webhooks.js.map