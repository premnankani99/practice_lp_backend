import { Router } from 'express';
import { getPendingVerifications, getVerifiedEmployees, updateVerificationStatus, deleteEmployee, updateEmployee, grantCompOff, getCompOffHistory, getManagers, adjustLeaveBalance, getAdjustBalanceHistory, markLop, getLopHistory } from '../controllers/admin';
import { verifyToken } from '../middleware/auth';
import { hasPermission } from '../middleware/rbac';

const router = Router();

router.use(verifyToken as any);

router.get('/pending', hasPermission('employees:read') as any, getPendingVerifications);
router.get('/verified', hasPermission('employees:read') as any, getVerifiedEmployees);
router.get('/managers', hasPermission('employees:read') as any, getManagers);
router.patch('/verification/:id', hasPermission('employees:write') as any, updateVerificationStatus);
router.delete('/employee/:id', hasPermission('employees:write') as any, deleteEmployee);
router.put('/employee/:id', hasPermission('employees:write') as any, updateEmployee);

router.post('/comp-off/grant', hasPermission('employees:write') as any, grantCompOff as any);
router.get('/comp-off/history', hasPermission('employees:read') as any, getCompOffHistory as any);
router.post('/adjust-balance', hasPermission('employees:write') as any, adjustLeaveBalance as any);
router.get('/adjust-balance/history', hasPermission('employees:read') as any, getAdjustBalanceHistory as any);
router.post('/mark-lop', hasPermission('employees:write') as any, markLop as any);
router.get('/lop/history', hasPermission('employees:read') as any, getLopHistory as any);

export default router;
