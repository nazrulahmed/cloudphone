import { Router } from 'express';
import { getAvailableNumbers, purchaseNumber, getExtensions, assignNumber, getCallFlows, createCallFlow, getExtensionDetails, updateExtensionConfig, updateCallFlow, deleteCallFlow, getSipCredentials } from '../controllers/numbers.js';
const router = Router();
router.get('/available', getAvailableNumbers);
router.post('/purchase', purchaseNumber);
router.get('/extensions', getExtensions);
router.get('/extensions/:uuid', getExtensionDetails);
router.put('/extensions/:uuid', updateExtensionConfig);
router.get('/call-flows', getCallFlows);
router.post('/call-flows', createCallFlow);
router.put('/call-flows/:uuid', updateCallFlow);
router.delete('/call-flows/:uuid', deleteCallFlow);
router.post('/assign', assignNumber);
router.get('/sip-credentials', getSipCredentials);
export default router;
//# sourceMappingURL=numbers.js.map