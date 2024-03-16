import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import cron from 'node-cron';
import UserModel from '../models/user.js';

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // Specify the folder where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name for the uploaded file
    },
});

const upload = multer({ storage: storage });

// FORAMTTING DATE
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


const checkTimeSpan = (user, todayDate) => {
    console.log("CHECK TIME")
    const today = todayDate || new Date()

    const lastCheckInTime = new Date(user.attendance[user.attendance?.length - 1]?.checkInTime);
    const timeDifference = today.getTime() - lastCheckInTime.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours

    // If the last check-in is within 24 hours, prevent check-in - ALREADY CHECKED
    if (hoursDifference <= 24) {
        return true;
    }

    return false
}

// Mark users as not checked in at 10PM (Mon, Wed, Fri)
cron.schedule('0 22 * * 1,3,5', async () => {
    console.log("ENTERED CRON")
    try {

        const allUsers = await UserModel.find()
        const todayDate = formatDate(new Date());

        const newAttendance = {
            checkInTime: todayDate,
            attend: false,
            checkInLocation: 'None',
            selfieImage: null
        }

        for (const user of allUsers) {
            let updateQuery;
            if (user.attendance?.length > 0) {
                const checked = checkTimeSpan(user);

                if (!checked) {
                    updateQuery = {
                        $push: { attendance: newAttendance }
                    };
                }
            } else {
                updateQuery = {
                    $push: { attendance: newAttendance }
                };
            }

            if (updateQuery) {
                await UserModel.findOneAndUpdate(
                    { _id: user._id },
                    updateQuery,
                    { new: true }
                );
            }
        }
    }
    catch (error) {
        console.error("Error in attendFalse:", error);
    }
})

// Attendance check-in route with file upload
router.post('/checkin', upload.single('file'), async (req, res) => {
    try {
        const { userId, checkInLocation } = req.body;
        const selfieImage = req.file ? req.file.path : null; // Get the file path if uploaded

        const userID = new mongoose.Types.ObjectId(userId)

        const user = await UserModel.findById({ _id: userID });

        if (!userId) {
            return res.status(404).json({ message: 'User not found' });
        }

        const formattedToday = formatDate(new Date());

        // Check if the user has already checked in
        let alreadyCheckedIn = false;


        if (user.attendance !== null && user.attendance?.length > 0) {
            const checked = checkTimeSpan(user)
            alreadyCheckedIn = checked
        }

        // IF CHECKED IN PREVENT
        if (alreadyCheckedIn) {
            return res.status(200).json({ message: 'User checked in within the last 24 hours', attend: true });
        }

        // ELSE CHECKED ATTENDANCE
        const newAttendance = {
            checkInTime: formattedToday,
            attend: true,
            checkInLocation,
            selfieImage,
        };

        const userAttend = await UserModel.updateOne(
            { _id: userID },
            { $push: { attendance: newAttendance } },
            { new: true }
        );

        return res.status(200).json({ message: 'Attendance checked in successfully', userAttend, attend: 'done' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
