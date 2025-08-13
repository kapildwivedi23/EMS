const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');

// ✅ IMPORT INDIVIDUAL FUNCTIONS (Not the whole object)
const adminController = require('../controllers/adminControllers.js');

// Multer configuration for profile photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const fileExtension = file.originalname.split('.').pop();
    cb(null, 'profile-' + uniqueSuffix + '.' + fileExtension)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});
// ✅ ROUTES WITH PROPER CONTROLLER REFERENCE
router.post('/employee', auth(['admin']), upload.single('photo'), adminController.addEmployee);
router.get('/employees', auth(['admin']), adminController.getEmployees);
router.post('/assign-task', auth(['admin']), adminController.assignTask);
router.get('/report', auth(['admin']), adminController.getReport);
router.post('/complete-task/:id', auth(['admin']), adminController.completeTask);
// ADD this new route to adminRoutes.js
router.get('/task-history/:taskId', auth(['admin']), adminController.getTaskHistory);
router.post('/assign-task-to-all', auth(['admin']), adminController.assignTaskToAll);
// ADD this route

module.exports = router;
