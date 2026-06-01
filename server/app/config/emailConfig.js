import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

/**
 * GIMS Universal Email Wrapper
 * @param {string} title - The heading of the email
 * @param {string} content - The main body HTML
 * @param {string} buttonText - Optional CTA text
 * @param {string} buttonUrl - Optional CTA link
 * @param {string} color - Primary accent color (default GIMS Blue)
 */
export const wrapEmail = (title, content, buttonText = '', buttonUrl = '', color = '#2563eb') => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            .wrapper { background-color: #f1f5f9; padding: 30px 10px; font-family: 'Segoe UI', Tahoma, sans-serif; }
            .main-card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .top-bar { height: 5px; background-color: ${color}; }
            .header { padding: 25px; text-align: center; border-bottom: 1px solid #f1f5f9; }
            .header h1 { margin: 0; color: #1e293b; font-size: 22px; letter-spacing: 1px; }
            .content { padding: 40px 30px; color: #334155; line-height: 1.7; }
            .content h2 { color: #0f172a; margin-top: 0; font-size: 20px; }
            .cta-container { text-align: center; margin: 30px 0; }
            .btn { background-color: ${color}; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
            .footer { padding: 25px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="main-card">
                <div class="top-bar"></div>
                <div class="header"><h1>GIMS</h1></div>
                <div class="content">
                    <h2>${title}</h2>
                    ${content}
                    ${buttonText ? `
                        <div class="cta-container">
                            <a href="${buttonUrl}" class="btn">${buttonText}</a>
                        </div>` : ''}
                </div>
                <div class="footer">
                    Sent by GIMS Inventory Management<br>
                    &copy; 2026. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};


const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for 465 (SSL), false for 587 (TLS)
    auth: {
        user: process.env.SMTP_USER,    
        pass: process.env.SMTP_PASS    
    },
    pool: {
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 2000,
        rateLimit: 5
    },
    logger: process.env.NODE_ENV === 'development' ? true : false,
    debug: process.env.NODE_ENV === 'development' ? true : false
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP ERROR:", error);
    } else {
        console.log("SMTP READY");
    }
});

export default transporter;