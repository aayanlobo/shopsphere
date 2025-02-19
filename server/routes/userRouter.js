const express = require('express');
const userCtrl = require('../controllers/userCtrl');
const router = express.Router();
const auth = require('../middleware/auth');
router.post('/register',userCtrl.register);
router.post('/login',userCtrl.login);
router.post('/refreshtoken',userCtrl.refreshtoken);
router.get('/logout',userCtrl.logout);
router.get('/infor',auth,userCtrl.getUser);

module.exports = router; 