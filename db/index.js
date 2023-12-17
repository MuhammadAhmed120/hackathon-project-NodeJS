import mongoose from "mongoose";
import 'dotenv/config'

const { USER_URI, ADMIN_PANEL_URI } = process.env

const connectDB = () => {
    try {
        const userDB = mongoose.createConnection(USER_URI);
        const panelDB = mongoose.createConnection(ADMIN_PANEL_URI);

        return { userDB, panelDB };
    } catch (error) {
        console.error(`Error =====> ${error.message}`);
        process.exit(1);
    }
}

export default connectDB