import { Router } from 'express';
import {
    getAvailableNumbers,
    purchaseNumber,
    getExtensions,
    assignNumber,
    getCallFlows,
    createCallFlow,
    getInventory,
    createTeam,
    getExtensionDetails,
    updateExtensionConfig,
    updateCallFlow,
    deleteCallFlow,
    getSipCredentials
} from '../controllers/numbers.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All number/extension routes now require authentication
router.use(authenticate);

router.get('/available', getAvailableNumbers);
router.post('/purchase', purchaseNumber);
router.get('/inventory', getInventory);
router.get('/extensions', getExtensions);
router.post('/extensions', createTeam);
router.get('/extensions/:uuid', getExtensionDetails);
router.put('/extensions/:uuid', updateExtensionConfig);
router.get('/call-flows', getCallFlows);
router.post('/call-flows', createCallFlow);
router.put('/call-flows/:uuid', updateCallFlow);
router.delete('/call-flows/:uuid', deleteCallFlow);
router.post('/assign', assignNumber);
router.get('/sip-credentials', getSipCredentials);

export default router;
