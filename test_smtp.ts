import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const port = parseInt(process.env.SMTP_PORT || '465');
const isSecure = port === 465 || process.env.SMTP_SECURE === 'true';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify().then(() => {
    console.log('SMTP Connection Successful!');
    return transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: process.env.SMTP_USER,
        subject: 'Test Email',
        text: 'This is a test email to verify SMTP configuration.'
    });
}).then(info => {
    console.log('Email sent:', info.messageId);
}).catch(err => {
    console.error('Error:', err);
});
