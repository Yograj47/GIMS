import { BrevoClient, logging } from "@getbrevo/brevo";
import logger from "../logger/logger.js";

export const createEmailTemplate = (
    title,
    content,
    buttonText = "",
    buttonUrl = "",
    color = "#2563eb"
) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            .wrapper {
                background-color: #f1f5f9;
                padding: 30px 10px;
                font-family: 'Segoe UI', Tahoma, sans-serif;
            }

            .main-card {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }

            .top-bar {
                height: 5px;
                background-color: ${color};
            }

            .header {
                padding: 25px;
                text-align: center;
                border-bottom: 1px solid #f1f5f9;
            }

            .header h1 {
                margin: 0;
                color: #1e293b;
                font-size: 22px;
                letter-spacing: 1px;
            }

            .content {
                padding: 40px 30px;
                color: #334155;
                line-height: 1.7;
            }

            .content h2 {
                color: #0f172a;
                margin-top: 0;
                font-size: 20px;
            }

            .cta-container {
                text-align: center;
                margin: 30px 0;
            }

            .btn {
                background-color: ${color};
                color: #ffffff !important;
                padding: 12px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                display: inline-block;
            }

            .footer {
                padding: 25px;
                text-align: center;
                font-size: 12px;
                color: #94a3b8;
                line-height: 1.5;
            }
        </style>
    </head>

    <body>
        <div class="wrapper">
            <div class="main-card">
                <div class="top-bar"></div>

                <div class="header">
                    <h1>Grocery Pro</h1>
                </div>

                <div class="content">
                    <h2>${title}</h2>

                    ${content}

                    ${buttonText
            ? `
                        <div class="cta-container">
                            <a href="${buttonUrl}" class="btn">
                                ${buttonText}
                            </a>
                        </div>
                    `
            : ""
        }
                </div>

                <div class="footer">
                    Sent by Grocery Pro<br />
                    &copy; ${new Date().getFullYear()} Grocery Pro.
                    All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,

    logging: {
        level:
            process.env.NODE_ENV === "development"
                ? logging.LogLevel.Debug
                : logging.LogLevel.Error,

        logger: new logging.ConsoleLogger(),
    },
});

export const sendEmail = async (to, subject, htmlContent) => {
    try {
        const emailData = {
            subject,

            sender: {
                name: "Grocery Pro",
                email: process.env.SENDER_EMAIL,
            },

            to: [{ email: to }],

            htmlContent,
        };

        const result =
            await brevo.transactionalEmails.sendTransacEmail(emailData);

        logger.info(`Email sent successfully to ${to}`);

        return result;
    } catch (error) {
        logger.error(`Email sending failed: ${error.message}`);

        throw error;
    }
};