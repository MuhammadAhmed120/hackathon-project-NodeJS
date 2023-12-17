import { Schema } from "mongoose";
import connectDB from "../db/index.js";

const panelSchema = new Schema({
    panelName: { type: String, required: true },
    panelEmail: { type: String, required: true, unique: true },
    panelPassword: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
})

const { panelDB } = connectDB()

const PanelModel = panelDB.model('admin', panelSchema)

export default PanelModel