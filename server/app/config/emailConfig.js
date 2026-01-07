import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

// @desc Create a transporter using Brevo SMTP settings
// @desc Make sure to set STMP_USER and STMP_PASS in your environment variables
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,  
        pass: process.env.SMTP_PASS   
    }
});

export default transporter;