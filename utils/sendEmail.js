const nodemailer = require("nodemailer");
require("dotenv");

const sendEmail = async (email, subject, text) => {
    try {
        if (!email || !subject || !text) {
            throw new Error("Email, subject, and text are required.");
        }
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // upgrade later with STARTTLS
            auth: {
              user: process.env.EMAIL,
              pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
              },
          });
    
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject,
            text
        });
    }
    catch (error) {
        console.error("Error in sendEmail function:", error.message);
        throw new Error("Failed to send email.");
    }
   
};

module.exports = sendEmail;
