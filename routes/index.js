import express from "express";
import register from "./register.js";
import login from "./login.js";
import resetPass from "./resetPass.js";
import userDetails from "./userDetails.js";
import attendance from "./attendance.js";
import loginTokenVerify from "../token/loginTokenVerify.js";

const router = express.Router()

router.use('/register', register)
router.use('/login', login)
router.use('/password', resetPass)
router.use('/user', userDetails)
router.use('/user/attendance', attendance)
router.use('/tokenverify', loginTokenVerify)

export default router