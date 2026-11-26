//====객체 불러오기====
const express = require('express');
const logincontroller = require('../controllers/auth/login-controller');
const signincontroller = require('../controllers/auth/signin-controller');
const matchsignin = require('../middlewares/auth/signin-middle');

//===객체 선언===
const router = express.Router();

//===경로 정의===
router.post('/login',logincontroller.login);
router.post('/signin',matchsignin,signincontroller.signin);


module.exports = router;