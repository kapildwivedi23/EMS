const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../controllers/adminControllers.js');

router.post('/employee', auth(['admin']), admin.addEmployee);
router.get('/employees', auth(['admin']), admin.getEmployees);
router.post('/assign-task', auth(['admin']), admin.assignTask);
router.get('/report', auth(['admin']), admin.getReport);

module.exports = router;