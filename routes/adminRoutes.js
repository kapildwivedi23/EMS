const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const adminController = require('../controllers/adminControllers');

// Existing multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'photo') {
      cb(null, './uploads/profiles/');
    } else {
      cb(null, './uploads/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Existing routes
router.post('/employee', auth(['admin']), upload.single('photo'), adminController.addEmployee);
router.get('/employees', auth(['admin']), adminController.getEmployees);
router.post('/assign-task', auth(['admin']), adminController.assignTask);
router.post('/assign-task-to-all', auth(['admin']), adminController.assignTaskToAll);
router.get('/report', auth(['admin']), adminController.getReport);
router.post('/complete-task/:id', auth(['admin']), adminController.completeTask);
router.get('/task-history/:taskId', auth(['admin']), adminController.getTaskHistory);

// NEW: Group Management Routes
router.post('/groups', auth(['admin']), adminController.createGroup);
router.get('/groups', auth(['admin']), adminController.getGroups);
router.delete('/groups/:groupId', auth(['admin']), adminController.deleteGroup);
router.post('/assign-task-to-group', auth(['admin']), adminController.assignTaskToGroup);

module.exports = router;
