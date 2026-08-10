import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import prisma from '../prismaClient';

dotenv.config();

const port = parseInt(process.env.SMTP_PORT || '465');
const isSecure = port === 465 || process.env.SMTP_SECURE === 'true';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure, // true for 465 (SSL/TLS), false for 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false // avoids SSL certificate verification errors on shared hosting / cPanel
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
} as any);

export interface SendEmailOptions {
    to: string | string[];
    cc?: string | string[];
    subject: string;
    text: string;
    html?: string;
}

export const MAIN_ADMIN_EMAILS = [
    'gyanani.harish@gmail.com',
    'qapil.sharma1702@gmail.com',
    'kamlani.vijay@gmail.com'
];

export const MAIN_HR_EMAIL = 'kanjaniprerna1@gmail.com';

export const getAdminAndHrEmails = async (): Promise<string[]> => {
    try {
        const users = await prisma.profiles.findMany({
            where: { role: { in: ['admin', 'hr'] } },
            select: { email: true }
        });
        return users.map(u => u.email).filter(e => !!e) as string[];
    } catch (e) {
        console.error("Error fetching admin and HR emails:", e);
        return [...MAIN_ADMIN_EMAILS, MAIN_HR_EMAIL]; // fallback
    }
};

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
    try {
        // Construct the CC array based on existing options
        let ccArray: string[] = [];
        if (options.cc) {
            if (Array.isArray(options.cc)) {
                ccArray = [...options.cc];
            } else {
                ccArray = [options.cc];
            }
        }

        let fromAddress = process.env.FROM_EMAIL;
        if (!fromAddress || !fromAddress.includes('@')) {
            const userEmail = process.env.SMTP_USER || 'info@landmaarkdeveloper.com';
            fromAddress = `"Leave Portal" <${userEmail}>`;
        }

        console.log('Sending email. TO:', options.to, 'CC:', ccArray, 'FROM:', fromAddress);
        const mailOptions = {
            from: fromAddress,
            to: options.to,
            cc: ccArray.length > 0 ? ccArray : undefined,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
