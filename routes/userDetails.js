import express from "express";
import mongoose from "mongoose";
import verifyToken from "../token/verifyToken.js";
import UserModel from "../models/user.js";
import PanelModel from "../models/admin.js";

const router = express.Router()


// USER ACCOUNT - STUDENT PORTAL

router.get("/my-account", verifyToken, async (req, res) => {
    try {
        const { decodedToken } = req

        console.log(decodedToken)

        const userID = new mongoose.Types.ObjectId(decodedToken.user_id)
        const userData = await UserModel.findById({ _id: userID }).select('-userPassword')

        if (userData && userID) {
            return res.status(200).send({ status: 200, userData });
        } else {
            return res.status(404).send({ status: 404, message: 'User not found.' })
        }
    } catch (error) {
        return res.status(500).send({ status: 500, message: error.message })
    }
})

// router.put("/user-edit", verifyToken, async (req, res) => {
//     try {
//         const { decodedToken, body } = req;
// const userID = new mongoose.Types.ObjectId(decodedToken.customer_id);

//         const updatedUser = await UserModel.findByIdAndUpdate(
//             userID,
//             body,
//             { new: true }
//         );

//         if (updatedUser) {
//             return res.status(200).send({ status: 200, updatedUser, message: "Successfully updated." });
//         } else {
//             return res.status(404).send({ status: 404, error: 'User not found.' });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({ status: 500, error: error.message, message: "Internal Server Error" });
//     }
// });




// ALL USERS IN ADMIN PANEL 

router.get("/all-users", async (req, res) => {
    try {
        const allUserData = await UserModel.find()

        if (allUserData) {
            return res.status(200).send({ status: 200, allUserData });
        } else {
            return res.status(404).send({ status: 404, message: 'Users not found.' })
        }
    } catch (error) {
        return res.status(500).send({ status: 500, message: error.message })
    }
})

router.post("/user-delete", verifyToken, async (req, res) => {
    try {
        console.log(req.body)
        const { UID } = req.body

        const userID = new mongoose.Types.ObjectId(UID);

        const deleteUser = await UserModel.deleteOne({ _id: userID });

        if (deleteUser) {
            return res.status(200).send({ message: 'Deleted' })
        }

        return res.status(404).send({ message: 'User not deleted.' })
    } catch (error) {
        return res.status(400).send({ message: error })
    }
})


// ADMIN DATA

router.get("/admin-account", verifyToken, async (req, res) => {
    try {
        const { decodedToken } = req

        const panelID = new mongoose.Types.ObjectId(decodedToken.panel_id)
        const panelData = await PanelModel.findById({ _id: panelID }).select('-panelPassword')

        if (panelData && panelID) {
            return res.status(200).send({ status: 200, panelData });
        } else {
            return res.status(404).send({ status: 404, message: 'Admin not found.' })
        }
    } catch (error) {
        return res.status(500).send({ status: 500, message: error.message })
    }
})


export default router;