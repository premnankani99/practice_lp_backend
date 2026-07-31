import prisma from '../prismaClient';
import { 
    calculateTotalDays, 
    isInProbation, 
    calculateLeaveType, 
    sendLeaveEmails,
    computeWithdrawalUpdateData,
    sendStatusEmail,
    handlePendingOrApprovedWithdrawal,
    sendWithdrawalEmail,
    extractPaidDays
} from './leaveHelper';

export const applyNewLeaveService = async (employee_id: number, leave_type: string, start_date: Date, end_date: Date, reason: string, is_half_day: boolean, isApproved: boolean = false) => {
    const total_days = is_half_day ? 0.5 : await calculateTotalDays(start_date, end_date);
    const profile = await prisma.profiles.findUnique({ 
        where: { id: employee_id },
        include: { managers: { select: { email: true, full_name: true } } }
    });
    if (!profile) throw new Error("EMPLOYEE_NOT_FOUND");

    const joinedDate = profile.date_of_joining ? new Date(profile.date_of_joining) : new Date(profile.created_at);
    const inProbation = isInProbation(joinedDate);
    
    // Calculate leave type incorporating current available balance
    const finalLeaveType = await calculateLeaveType(inProbation, String(employee_id), total_days, leave_type, start_date, profile.available_leaves);

    // Calculate how many paid days were actually consumed
    const paidDays = extractPaidDays(finalLeaveType, total_days);
    
    // Immediately deduct consumed paid days from balance
    if (paidDays > 0) {
        await prisma.profiles.update({
            where: { id: employee_id },
            data: { available_leaves: { decrement: paidDays } }
        });
    }

    const newLeave = await prisma.leave_requests.create({
        data: { employee_id, leave_type: finalLeaveType, start_date, end_date, total_days, reason, status: isApproved ? 'approved' : 'pending' }
    });

    if (!isApproved) {
        await sendLeaveEmails(profile, total_days, start_date, end_date, reason);
    }
    return newLeave;
};

export const fetchEmployeeLeavesService = async (employee_id: number) => {
    return await prisma.leave_requests.findMany({
        where: { employee_id },
        orderBy: { created_at: 'desc' }
    });
};

export const fetchAllLeavesService = async () => {
    return await prisma.leave_requests.findMany({
        where: { employee: { is_deleted: false } },
        include: { employee: { include: { managers: { select: { id: true } } } } },
        orderBy: { created_at: 'desc' }
    });
};

export const processLeaveActionService = async (id: number, status: string, adminNote: string, user?: any) => {
    const leave = await prisma.leave_requests.findUnique({ 
        where: { id }, 
        include: { employee: { include: { managers: { select: { id: true } } } } } 
    });
    if (!leave) throw new Error("Leave request not found");

    if (user && user.role === 'admin' && !leave.employee.managers.some(m => m.id === user.id)) {
        throw new Error("UNAUTHORIZED_MANAGER");
    }

    const updateData = computeWithdrawalUpdateData(leave, status);
    if (adminNote) updateData.admin_note = adminNote;

    const updatedLeave = await prisma.leave_requests.update({
        where: { id }, data: updateData, include: { employee: true }
    });

    // Refund logic for rejected or cancelled (withdrawn) leaves
    let refundDays = 0;
    if (status === 'rejected' && leave.status === 'pending') {
        refundDays = extractPaidDays(leave.leave_type, leave.total_days || 0);
    } else if (status === 'cancelled') {
        const originalPaidDays = extractPaidDays(leave.leave_type, leave.total_days || 0);
        if (updateData.status === 'approved') {
            const newPaidDays = Math.min(originalPaidDays, updateData.total_days);
            refundDays = originalPaidDays - newPaidDays;
        } else {
            refundDays = originalPaidDays;
        }
    }

    if (refundDays > 0) {
        await prisma.profiles.update({
            where: { id: leave.employee_id },
            data: { available_leaves: { increment: refundDays } }
        });
    }

    await sendStatusEmail(updatedLeave, status, adminNote);
    return updatedLeave;
};

export const withdrawLeaveService = async (id: number, datesToWithdraw: any) => {
    const leave = await prisma.leave_requests.findUnique({ where: { id } });
    if (!leave) throw new Error("LEAVE_NOT_FOUND");
    if (leave.status !== 'pending' && leave.status !== 'approved') throw new Error("CANNOT_WITHDRAW");

    const { message, updateData } = handlePendingOrApprovedWithdrawal(leave, datesToWithdraw);

    const updatedLeave = await prisma.leave_requests.update({ 
        where: { id }, data: updateData, include: { employee: { include: { managers: { select: { email: true, full_name: true } } } } } 
    });

    let refundDays = 0;
    if (updateData.status === 'cancelled') {
        refundDays = extractPaidDays(leave.leave_type, leave.total_days || 0);
    } else if (updateData.status === 'pending' && updateData.total_days !== undefined) {
        const originalPaidDays = extractPaidDays(leave.leave_type, leave.total_days || 0);
        const newPaidDays = Math.min(originalPaidDays, updateData.total_days);
        refundDays = originalPaidDays - newPaidDays;
    }

    if (refundDays > 0) {
        await prisma.profiles.update({
            where: { id: leave.employee_id },
            data: { available_leaves: { increment: refundDays } }
        });
    }
    
    if (leave.status === 'approved') {
        await sendWithdrawalEmail(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message);
    }
    return { message, updatedLeave };
};
