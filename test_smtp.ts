import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
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
