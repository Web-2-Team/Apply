//====객체 불러오기====
const express = require('express');
const authrouter = require('./router/auth-router.js');


//===객체 선언===
const app = express();
const auth = authrouter();

//===JSON 접근 설정===
app.use(express.json());

//===라우터 등록===
app.use('/auth', auth);