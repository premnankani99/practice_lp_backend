import express, { Request, Response } from 'express';
import cors from 'cors';
import { sendEmail } from './utils/emailService';
import authRoutes from './routes/auth';
import leaveRoutes from './routes/leaves';
import adminRoutes from './routes/admin';
import holidaysRoutes from './routes/holidays';
import { initCronJobs } from './cron/leaveAccrual';

const app = express();
const PORT = process.env.PORT || 5000;

// Catch uncaught errors gracefully without crashing the server
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(cors());
app.use(express.json());

// Log every incoming request for debugging
app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
});

import { HTTP_STATUS } from './constants/httpCodes';

// Test API Route
app.get(['/', '/api', '/api/'], (_req: Request, res: Response) => {
    res.send("Backend API is running in TypeScript!");
});

// Test Email API
app.get('/api/test-email', async (req: Request, res: Response) => {
    const receiverEmail = req.query.email as string || process.env.ADMIN_EMAIL;
    
    if (!receiverEmail) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No email provided." });
        return;
    }
    
    const success = await sendEmail({
        to: receiverEmail,
        subject: "SMTP Connection Test",
        text: "Congratulations! Your SMTP connection in the Leave Portal is working perfectly! 🎉"
    });

    if (success) {
        res.status(HTTP_STATUS.OK).json({ message: `Test email sent successfully to ${receiverEmail}! Please check your inbox.` });
    } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to send email." });
    }
});

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/leaves', '/leaves'], leaveRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/holidays', '/holidays'], holidaysRoutes);

// 404 Handler for Unmatched Routes
app.use((req: Request, res: Response) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({ 
        error: "Route not found", 
        path: req.originalUrl 
    });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
    console.error("[Unhandled Error]:", err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        error: err.message || "Internal Server Error" 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    initCronJobs();
});
