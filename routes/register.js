import express from 'express'
import Joi from 'joi'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import UserModel from '../models/user.js'
import PanelModel from '../models/admin.js'

const router = express.Router()

let { CLOUDINARY_NAME, CLOUDINARY_API, CLOUDINARY_SECRET } = process.env

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API,
    api_secret: CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "User_Picture",
        public_id: (req, file) => `UserImage`
    },
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.includes('image/')) {
            return cb(new Error('Only images allowed!'));
        }

        const allowedExtensions = ['image/jpeg', 'image/png'];
        if (!allowedExtensions.includes(file.mimetype)) {
            return cb(new Error('Only JPG, JPEG, and PNG files are allowed!'));
        }

        cb(null, true); // Accept the file if everything is OK
    }
});

// router.use('/image', upload.single('userProfileImage'), async (req, res) => {
//     try {
//         console.log(req.file)

//         return res.status(200).send({ status: 200, message: 'User image.', user: req.file.path });
//     } catch (error) {
//         // if (error.message.includes('"user')) {
//         //     const errorUpdate = error.message.slice(5).replace('"', '')

//         //     return res.status(300).send({ status: 300, error: error.message, message: errorUpdate })
//         // }

//         return res.status(300).send({ status: 300, message: error })
//     }
// })

// USER REGISTER

const registerUserValidate = Joi.object({
    userEmail: Joi.string()
        .email({ tlds: { allow: false } })
        .message('Email address is invalid.')
        .required(),
    userName: Joi.string()
        .min(2)
        .max(30)
        .required(),
    userCourse: Joi.string()
        .min(2)
        .required(),
    userPassword: Joi.string()
        .min(6)
        .required()
        .pattern(/^(?=.*[a-zA-Z])(?=.*\d)/)
        .message('Password must include alphabets, and atleast one number.'),
    userID: Joi.string()
        .required(),
    userNumber: Joi.string()
        .pattern(/^[0-9]{11}$/)
        .message('Phone number must be exactly 11 digits.'),
})

router.post('/user', upload.single('userProfileImage'), async (req, res) => {
    try {
        const validateError = await registerUserValidate.validateAsync(req.body);

        // Create the user with Cloudinary image URL
        const registerUser = await UserModel.create({ ...req.body, userProfileImage: req.file.path });


        if (!registerUser) {
            return res.status(400).send({ status: 400, message: 'Something went wrong, try again later.' });
        }

        return res.status(200).send({ status: 200, message: 'User is successfully registered.', user: registerUser });

    } catch (error) {
        if (error.message.includes('"user')) {
            const errorUpdate = error.message.slice(5).replace('"', '')

            return res.status(300).send({ status: 300, error: error.message, message: errorUpdate })
        }

        return res.status(300).send({ status: 300, message: error.message })
    }
})




// ADMIN REGISTER
const registerAdminValidate = Joi.object({
    panelEmail: Joi.string()
        .email({ tlds: { allow: false } })
        .message('Email address is invalid.')
        .required(),
    panelName: Joi.string()
        .min(2)
        .max(30)
        .required(),
    panelPassword: Joi.string()
        .min(6)
        .required()
        .pattern(/^(?=.*[a-zA-Z])(?=.*\d)/)
        .message('Password must include alphabets, and atleast one number.'),
})

const generateToken = (panelData) => {
    return jwt.sign(
        { panel_id: panelData._id, panelEmail: panelData.panelEmail },
        process.env.JWT_SECRET,
        { expiresIn: '15d' }
    );
};

router.post('/admin', async (req, res) => {
    try {
        const validateError = await registerAdminValidate.validateAsync(req.body);

        const { panelPassword } = req.body
        const hashPassword = await bcrypt.hash(panelPassword, 10)

        const registerAdmin = await PanelModel.create({ ...req.body, panelPassword: hashPassword }).then(res => res.toObject())

        const loginToken = generateToken(registerAdmin);

        delete registerAdmin.panelPassword

        if (!registerAdmin) {
            return res.status(400).send({ status: 400, message: 'Something went wrong, try again later.' });
        }

        return res.status(200).send({ status: 200, message: 'admin is successfully registered.', admin: registerAdmin, token: loginToken });

    } catch (error) {
        if (error.message.includes('"panel')) {
            const errorUpdate = error.message.slice(6).replace('"', '')

            return res.status(300).send({ status: 300, error: error.message, message: errorUpdate })
        }

        return res.status(300).send({ status: 300, message: error.message })
    }
})

export default router