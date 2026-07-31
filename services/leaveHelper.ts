import prisma from '../prismaClient';
import { sendEmail, MAIN_ADMIN_EMAILS, getAdminAndHrEmails } from '../utils/emailService';
import { 
    leaveAppliedAdminTemplate, 
    leaveAppliedEmployeeTemplate, 
    leaveStatusUpdateTemplate, 
    leaveWithdrawalAdminTemplate 
} from '../utils/emailTemplates';
import { NUMBERS } from '../constants/numbers';
import { MESSAGES } from '../constants/strings';

export const calculateTotalDays = async (start: Date, end: Date): Promise<number> => {
    const holidays = await prisma.holidays.findMany({
        where: { date: { gte: start, lte: end } }
    });
    const holidayDateStrings = holidays.map(h => h.date.toISOString().split('T')[0]);

    let days = 0;
    const current = new Date(start);
    current.setUTCHours(0,0,0,0);
    const endUTC = new Date(end);
    endUTC.setUTCHours(0,0,0,0);

    while (current <= endUTC) {
        const dayOfWeek = current.getUTCDay();
        const dateStr = current.toISOString().split('T')[0];
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDateStrings.includes(dateStr)) days++;
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
};

export const isInProbation = (joinedDate: Date): boolean => {
    const now = new Date();
    const diffYears = now.getFullYear() - joinedDate.getFullYear();
    const diffMonths = now.getMonth() - joinedDate.getMonth();
    return ((diffYears * NUMBERS.MONTHS_IN_YEAR) + diffMonths) < NUMBERS.PROBATION_MONTHS;
};

export const calculateLeaveType = async (
    inProbation: boolean, employeeId: string, totalDays: number, leaveType: string, start: Date, availableLeaves: number = 0
): Promise<string> => {
    const availablePaid = availableLeaves;
    
    if (inProbation) {
        if (availablePaid >= totalDays) {
            return `${leaveType} (Paid)`;
        } else if (availablePaid > 0) {
            return `${leaveType} (${availablePaid} Paid, ${totalDays - availablePaid} Unpaid - Probation)`;
        } else {
            return `${leaveType} (Unpaid - Probation)`;
        }
    }

    if (totalDays > availablePaid) {
        return availablePaid > 0 
            ? `${leaveType} (${availablePaid} Paid, ${totalDays - availablePaid} Unpaid LOP)` 
            : `${leaveType} (Unpaid - LOP)`;
    }
    return `${leaveType} (Paid)`;
};

export const extractPaidDays = (leaveTypeStr: string, totalDays: number): number => {
    if (leaveTypeStr.includes('(Paid)')) return totalDays;
    const match = leaveTypeStr.match(/\((\d+(?:\.\d+)?)\s+Paid/);
    if (match) return parseFloat(match[1]);
    return 0;
};

export const computeWithdrawalUpdateData = (leave: any, status: string): any => {
    const updateData: any = { status };
    if (status === 'approved') {
        updateData.approved_at = new Date();
        if (leave.status === 'withdrawal_requested' && leave.withdrawn_dates) updateData.withdrawn_dates = null;
    } else if (status === 'rejected') {
        updateData.rejected_at = new Date();
    } else if (status === 'cancelled') {
        if (leave.withdrawn_dates) {
            let withdrawnArray: string[] = typeof leave.withdrawn_dates === 'string' ? JSON.parse(leave.withdrawn_dates) : leave.withdrawn_dates;
            if (withdrawnArray.length > 0 && withdrawnArray.length < leave.total_days) {
                updateData.total_days = Math.max(0, leave.total_days - withdrawnArray.length);
                updateData.status = 'approved';
            }
        } else {
            updateData.withdrawn_at = new Date();
        }
    }
    return updateData;
};

export const sendLeaveEmails = async (profile: any, totalDays: number, start: Date, end: Date, reason: string): Promise<void> => {
    const durationText = totalDays === 1 ? '1 day' : `${totalDays} days`;
    if (profile.email) {
        sendEmail({
            to: profile.email, subject: 'Leave Application Submitted', text: `Your leave for ${durationText} is submitted.`,
            html: leaveAppliedEmployeeTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        }).catch(err => console.error("Failed to send email to employee:", err));
    }
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
            subject: 'New Leave Request',
            text: `Employee ${profile.full_name} applied for ${durationText} of leave.`,
            html: leaveAppliedAdminTemplate(profile.full_name, durationText, start.toDateString(), end.toDateString(), reason)
        }).catch(err => console.error("Failed to send email to admin/managers:", err));
    }
};

export const sendStatusEmail = async (leave: any, status: string, adminNote: string): Promise<void> => {
    if (leave.employee?.email) {
        let managerEmails: string[] = [];
        if (leave.employee.managers && leave.employee.managers.length > 0) {
            managerEmails = leave.employee.managers.map((m: any) => m.email).filter(Boolean);
        }
        
        const adminAndHrEmails = await getAdminAndHrEmails();
        const ccEmails = [...managerEmails, ...adminAndHrEmails].filter(
            (email, index, self) => self.indexOf(email) === index && email !== leave.employee.email
        );

        sendEmail({
            to: leave.employee.email,
            cc: ccEmails,
            subject: `Leave Request ${status.toUpperCase()}`,
            text: `Your leave has been ${status}.`,
            html: leaveStatusUpdateTemplate(leave.employee.full_name, leave.start_date.toDateString(), leave.end_date.toDateString(), status, adminNote || '')
        }).catch(err => console.error("Failed to send status email:", err));
    }
};

export const handlePendingOrApprovedWithdrawal = (leave: any, datesToWithdraw: any): { message: string, updateData: any } => {
    let updateData: any = {};
    let message = "";
    
    // Parse existing withdrawn dates
    let existingWithdrawn: string[] = [];
    if (leave.withdrawn_dates) {
        if (typeof leave.withdrawn_dates === 'string') {
            try { existingWithdrawn = JSON.parse(leave.withdrawn_dates); } catch(e){}
        } else if (Array.isArray(leave.withdrawn_dates)) {
            existingWithdrawn = leave.withdrawn_dates;
        }
    }
    
    let newWithdrawnCount = 0;
    if (datesToWithdraw && Array.isArray(datesToWithdraw) && datesToWithdraw.length > 0) {
        const newlyAdded = datesToWithdraw.filter((d: string) => !existingWithdrawn.includes(d));
        newWithdrawnCount = newlyAdded.length;
        if (newWithdrawnCount > 0) {
            updateData.withdrawn_dates = Array.from(new Set([...existingWithdrawn, ...datesToWithdraw]));
        } else {
            updateData.withdrawn_dates = existingWithdrawn;
        }
    }

    if (leave.status === 'pending') {
        if (datesToWithdraw && Array.isArray(datesToWithdraw) && datesToWithdraw.length > 0) {
            if (newWithdrawnCount >= leave.total_days) {
                updateData.status = 'cancelled';
                updateData.withdrawn_at = new Date();
                updateData.withdrawn_dates = null;
                message = MESSAGES.LEAVE_CANCELLED;
            } else if (newWithdrawnCount > 0) {
                updateData.status = 'pending';
                updateData.total_days = Math.max(0, leave.total_days - newWithdrawnCount);
                message = "Partial leave withdrawn instantly as it was still pending.";
            } else {
                updateData.status = 'pending';
                message = "No new dates were withdrawn.";
            }
        } else {
            updateData.status = 'cancelled';
            updateData.withdrawn_at = new Date();
            message = MESSAGES.LEAVE_CANCELLED;
        }
    } else if (leave.status === 'approved') {
        updateData.status = 'withdrawal_requested';
        updateData.withdrawal_requested_at = new Date();
        message = updateData.withdrawn_dates ? MESSAGES.LEAVE_WITHDRAWN_PARTIAL : MESSAGES.LEAVE_WITHDRAWN_FULL;
    }
    return { message, updateData };
};

export const sendWithdrawalEmail = async (employee: any, start: Date, end: Date, reason: string): Promise<void> => {
    let targetEmails: string[] = [];
    if (employee.managers && employee.managers.length > 0) {
        targetEmails = employee.managers.map((m: any) => m.email).filter(Boolean);
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
            subject: 'Leave Request Withdrawn/Cancelled',
            text: `Employee ${employee.full_name} has withdrawn/cancelled their leave from ${start.toDateString()} to ${end.toDateString()}. Reason: ${reason}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
                    <h2 style="color: #6a1b9a;">Leave Request Cancelled</h2>
                    <p><strong>Employee:</strong> ${employee.full_name}</p>
                    <p><strong>Dates:</strong> ${start.toDateString()} - ${end.toDateString()}</p>
                    <p><strong>Status:</strong> Cancelled/Withdrawn</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                </div>
            `
        }).catch(err => console.error("Failed to send withdrawal email to admin/managers:", err));
    }
};
