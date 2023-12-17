import express from "express";
import cors from 'cors'
import router from "./routes/index.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 3002

const app = express()
app.use(express.json())
app.use(cors())

app.use('/', router)


const startServerIfReady = () => {
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}.`);
    });
};

let { userDB, panelDB } = connectDB()

userDB.on('error', console.error.bind(console, ('User DB connection error:')));
userDB.once('open', function () {
    console.log(('User DB connected!'));
});

panelDB.on('error', console.error.bind(console, ('Admin DB connection error:')));
panelDB.once('open', function () {
    console.log(('Admin DB connected!'));
    startServerIfReady();
});