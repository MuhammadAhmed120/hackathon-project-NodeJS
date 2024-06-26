import express from 'express';
import UserModel from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from "joi";
import transporter from "../mail/index.js";

const router = express.Router();

const forgotPasswordSchema = Joi.object({
    userEmail: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().min(6).required()
});

router.post('/forgot', async (req, res) => {
    try {
        const { error } = forgotPasswordSchema.validate(req.body);

        if (error) {
            const errorUpdate = error.message.slice(5).replace('"', '')
            return res.status(400).send({ message: errorUpdate });
        }

        const { userEmail } = req.body;
        const user = await UserModel.findOne({ userEmail });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const token = jwt.sign({ email: userEmail }, process.env.JWT_SECRET, { expiresIn: '10m' });

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 600000; // 10 minutes in milliseconds

        await user.save();

        const mailOptions = {
            from: 'muhammadahmed120192@gmail.com',
            to: userEmail,
            subject: 'Reset your password',
            html: `
                <p>Dear User,</p>
                <p>We received a request to reset your account password. To proceed with resetting your password, please click the link below:</p>
                <a href="https://${process.env.SERVER_URL}/reset-password/${token}">Reset Password</a>
                <p>This link will expire in 10 minutes for security purposes. If you didnot request this change, you can safely ignore this email; your account remains secure.</p>
                <p>If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
                <p>Best regards,</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: 'Failed to send reset email' });
            }
            console.log('Email sent: ' + info.response);
            res.status(200).send({ message: 'Reset email sent successfully.' });
        });
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});


router.post('/reset/:token', async (req, res) => {
    try {
        const { error } = resetPasswordSchema.validate(req.body);

        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.userPassword = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).send({ message: 'Password reset successful.' });
    } catch (error) {
        res.status(404).send({ message: error });
    }
});

export default router;