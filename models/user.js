import { Schema } from "mongoose";
import connectDB from "../db/index.js";

const userSchema = new Schema({
    userName: { type: String, required: true },
    userCourse: { type: String, required: true },
    userEmail: { type: String, required: true, unique: true },
    userPassword: { type: String, required: true },
    userNumber: { type: String, required: false, unique: true },
    userID: { type: String, required: false, unique: true },
    userProfileImage: { type: String },
    attendance: [
        {
            checkInTime: { type: String, required: true },
            checkOutTime: { type: Date },
            attend: { type: Boolean },
            checkInLocation: { type: String },
            selfieImage: { type: String },
        },
        {
            timestamps: true,
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
})

const { userDB } = connectDB()

const UserModel = userDB.model('Users', userSchema)

export default UserModel