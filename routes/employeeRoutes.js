const router = require('express').Router();
const auth = require('../middleware/auth');
const employee = require('../controllers/employeeControllers.js');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get('/tasks', auth(['employee']), employee.getTasks);
router.post('/submit-work/:id', auth(['employee']), upload.single('photo'), employee.submitWork);
router.get('/dashboard', auth(['employee']), employee.dashboard);

module.exports = router;
