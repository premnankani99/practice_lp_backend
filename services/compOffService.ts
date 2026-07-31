import prisma from '../prismaClient';
import { logger } from '../utils/logger';
import { sendEmail, getAdminAndHrEmails } from '../utils/emailService';
import { compOffAppliedAdminTemplate, compOffStatusUpdateTemplate } from '../utils/emailTemplates';

export const requestCompOffService = async (employee_id: number, total_days: number, reason: string, workedDates: string[]) => {
    logger.info("[Backend] Executing requestCompOffService in compOffService.ts");
    const compOff = await prisma.compOffGrant.create({
        data: {
            employeeId: Number(employee_id),
            grantedAt: new Date(),
            workedDates: workedDates,
            daysGranted: total_days,
            reason: reason,
            status: 'pending'
        }
    });

    try {
        const profile = await prisma.profiles.findUnique({
            where: { id: employee_id },
            include: { managers: { select: { email: true } } }
        });

        if (profile) {
            let targetEmails: string[] = [];
            if (profile.managers && profile.managers.length > 0) {
                targetEmails = profile.managers.map((m: any) => m.email).filter(Boolean);
            }

            const adminAndHrEmails = await getAdminAndHrEmails();

            if (targetEmails.length === 0) {
                targetEmails = adminAndHrEmails;
            }

            if (targetEmails.length > 0) {
                const ccEmails = adminAndHrEmails.filter(email => !targetEmails.includes(email));
                
                sendEmail({
                    to: targetEmails,
                    cc: ccEmails,
                    subject: 'New Comp-Off Request',
                    text: `Employee ${profile.full_name} applied for ${total_days} days of Comp-Off.`,
                    html: compOffAppliedAdminTemplate(profile.full_name, total_days, reason, workedDates)
                }).catch(err => console.error("Failed to send email to admin/managers:", err));
            }
        }
    } catch (e) {
        console.error("Failed to process comp-off email:", e);
    }

    return compOff;
};

export const fetchPendingCompOffsService = async (user?: any) => {
    logger.info("[Backend] Executing fetchPendingCompOffsService in compOffService.ts");
    
    let whereClause: any = { 
        status: 'pending',
        employee: { is_deleted: false }
    };
    if (user && user.role === 'admin') {
        whereClause.employee.managers = { some: { id: user.id } };
    }

    return await prisma.compOffGrant.findMany({
        where: whereClause,
        include: { employee: true },
        orderBy: { grantedAt: 'desc' }
    });
};

export const fetchMyCompOffsService = async (employee_id: number) => {
    logger.info("[Backend] Executing fetchMyCompOffsService in compOffService.ts");
    return await prisma.compOffGrant.findMany({
        where: { employeeId: Number(employee_id) },
        orderBy: { grantedAt: 'desc' }
    });
};

export const actionCompOffService = async (id: number, admin_id: number, status: string, adminNote: string) => {
    logger.info("[Backend] Executing actionCompOffService in compOffService.ts");
    const request = await prisma.compOffGrant.findUnique({ 
        where: { id: Number(id) },
        include: { employee: true }
    });
    if (!request) throw new Error("Request not found");
    if (request.status !== 'pending') throw new Error("Request is already processed");

    await prisma.$transaction(async (tx) => {
        await tx.compOffGrant.update({
            where: { id: Number(id) },
            data: { status, adminNote, grantedBy: admin_id }
        });
        if (status === 'approved') {
            await tx.profiles.update({
                where: { id: request.employeeId },
                data: { available_leaves: { increment: request.daysGranted } }
            });
        }
    });

    try {
        if (request.employee && request.employee.email) {
            const adminAndHrEmails = await getAdminAndHrEmails();
            const ccEmails = adminAndHrEmails.filter(email => email !== request.employee.email);
            
            sendEmail({
                to: request.employee.email,
                cc: ccEmails,
                subject: `Comp-Off Request ${status.toUpperCase()}`,
                text: `Your Comp-Off request has been ${status}.`,
                html: compOffStatusUpdateTemplate(request.employee.full_name, request.daysGranted, status, adminNote)
            }).catch(err => console.error("Failed to send comp-off status email:", err));
        }
    } catch (e) {
        console.error("Failed to send email on comp-off action:", e);
    }
};
