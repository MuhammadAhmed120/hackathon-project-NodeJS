import express from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import UserModel from "../models/user.js";
import PanelModel from "../models/admin.js";

const router = express.Router()


// USER LOGIN
const loginValidate = Joi.object({
    userEmail: Joi.string()
        .email({ tlds: { allow: false } })
        .message('Email address is invalid.')
        .required(),
    userPassword: Joi.string()
        .required()
});

router.post('/user', async (req, res) => {
    try {
        await loginValidate.validateAsync(req.body)

        const { userEmail, userPassword } = req.body

        const loginUser = await UserModel.findOne({ userEmail: userEmail })

        if (loginUser !== null) {
            // const comparePassword = await bcrypt.compare(userPassword, loginUser.hashPassword);

            if (loginUser.userPassword == userPassword) {
                const loginToken = jwt.sign({ user_id: loginUser._id, userEmail: loginUser.userEmail }, process.env.JWT_SECRET, { expiresIn: '365d' })

                return res.status(200).send({ status: 200, message: 'You are successfully logged in.', user: loginUser, token: loginToken })
            }

            return res.status(401).send({ status: 401, message: 'Password you entered is incorrect.' })
        } else {
            return res.status(404).send({ status: 404, message: 'Email address is not found.' })
        }
    } catch (error) {
        if (error.message.includes('"user')) {
            const errorUpdate = error.message.slice(5).replace('"', '')

            return res.status(300).send({ status: 300, error: error.message, message: errorUpdate })
        }

        return res.status(300).send({ status: 300, message: error.message })
    }
})



// ADMIN LOGIN
const adminValidate = Joi.object({
    panelEmail: Joi.string()
        .email({ tlds: { allow: false } })
        .message('Email address is invalid.')
        .required(),
    panelPassword: Joi.string()
        .required()
});

router.post('/admin', async (req, res) => {
    try {
        await adminValidate.validateAsync(req.body)

        const { panelEmail, panelPassword } = req.body

        const loginPanel = await PanelModel.findOne({ panelEmail: panelEmail })

        if (loginPanel !== null) {
            const comparePassword = await bcrypt.compare(panelPassword, loginPanel.panelPassword);

            if (comparePassword) {
                const loginToken = jwt.sign({ panel_id: loginPanel._id, panelEmail: loginPanel.panelEmail }, process.env.JWT_SECRET, { expiresIn: '365d' })

                const { panel } = loginPanel.toObject();

                return res.status(200).send({ status: 200, message: 'Admin is successfully logged in.', panel, token: loginToken })
            }

            return res.status(401).send({ status: 401, message: 'Password you entered is incorrect.' })
        } else {
            return res.status(404).send({ status: 404, message: 'Email address is not found.' })
        }
    } catch (error) {
        if (error.message.includes('"panel')) {
            const errorUpdate = error.message.slice(6).replace('"', '')

            return res.status(300).send({ status: 300, error: error.message, message: errorUpdate })
        }

        return res.status(300).send({ status: 300, message: error.message })
    }
})


export default router