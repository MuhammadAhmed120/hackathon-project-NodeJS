import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
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

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

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

        const today = new Date();
        const formattedToday = formatDate(today);

        // Check if the user has already checked in
        let alreadyCheckedIn = false;

        if (user.attendance.length > 0) {
            const lastCheckInTime = new Date(user.attendance[user.attendance.length - 1].checkInTime);
            const timeDifference = today.getTime() - lastCheckInTime.getTime();
            const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours

            // If the last check-in is within 24 hours, prevent check-in
            if (hoursDifference < 24) {
                alreadyCheckedIn = true;
            }
        }

        if (alreadyCheckedIn) {
            return res.status(400).json({ message: 'User checked in within the last 24 hours' });
        }

        if (alreadyCheckedIn) {
            return res.status(400).json({ message: 'User has already checked in today' });
        }

        const newAttendance = {
            checkInTime: formatDate(today),
            checkInLocation,
            selfieImage,
        };

        const userAttend = await UserModel.updateOne(
            { _id: userID },
            { $push: { attendance: newAttendance } },
            { new: true }
        );

        return res.status(200).json({ message: 'Attendance checked in successfully', userAttend });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
