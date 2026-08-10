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
    extractPaidDays,
    refundLeaveDays
} from './leaveHelper';

export const applyNewLeaveService = async (employee_id: number, leave_type: string, start_date: Date, end_date: Date, reason: string, is_half_day: boolean, isApproved: boolean = false) => {
    const total_days = is_half_day ? 0.5 : await calculateTotalDays(start_date, end_date);
    const profile = await prisma.profiles.findUnique({ 
        where: { id: employee_id },
        include: { managers: { select: { email: true, full_name: true } } }
    });
    if (!profile) throw new Error("EMPLOYEE_NOT_FOUND");

    // ==========================================
    // 🤖 AI TEAM AVAILABILITY PREDICTOR (SCARCITY MANAGER)
    // ==========================================
    if (profile.department_id && !isApproved) {
        const totalDeptEmployees = await prisma.profiles.count({
            where: { department_id: profile.department_id, is_deleted: false }
        });

        // Only enforce scarcity rules if the department has more than 1 active person
        if (totalDeptEmployees > 1) {
            const overlappingLeaves = await prisma.leave_requests.findMany({
                where: {
                    status: 'approved',
                    employee: { department_id: profile.department_id, is_deleted: false },
                    start_date: { lte: end_date },
                    end_date: { gte: start_date }
                },
                select: { employee_id: true }
            });

            const uniqueEmployeesOnLeave = new Set(overlappingLeaves.map((l: { employee_id: number }) => l.employee_id)).size;
            const absenceRatio = (uniqueEmployeesOnLeave + 1) / totalDeptEmployees;

            if (absenceRatio > 0.50) {
                throw new Error("AI Predictor Block: Department active workforce will fall below the critical 50% threshold. Request denied to prevent operational scarcity.");
            }
        }
    }
    // ==========================================

    const joinedDate = profile.date_of_joining ? new Date(profile.date_of_joining) : new Date(profile.created_at);
    const inProbation = isInProbation(joinedDate);
    
    // Calculate leave type incorporating current available balance
    const totalPaidLeaves = (profile.available_leaves || 0) + (profile.comp_off_leaves || 0);
    const finalLeaveType = await calculateLeaveType(inProbation, String(employee_id), total_days, leave_type, start_date, totalPaidLeaves);

    // Calculate how many paid days were actually consumed
    const paidDays = extractPaidDays(finalLeaveType, total_days);
    
    // Immediately deduct consumed days from balance, preferring comp_offs first
    if (total_days > 0) {
        let compOffsToDeduct = Math.min(total_days, profile.comp_off_leaves || 0);
        let regularToDeduct = total_days - compOffsToDeduct;
        
        console.log(`[DEBUG] Deduction logic: total_days=${total_days}, compOffBalance=${profile.comp_off_leaves}, regularBalance=${profile.available_leaves}`);
        console.log(`[DEBUG] Deducting compOffs=${compOffsToDeduct}, regular=${regularToDeduct}`);

        await prisma.profiles.update({
            where: { id: employee_id },
            data: { 
                comp_off_leaves: { decrement: compOffsToDeduct },
                available_leaves: { decrement: regularToDeduct }
            }
        });
    }

    const newLeave = await prisma.leave_requests.create({
        data: { 
            employee_id, 
            leave_type: finalLeaveType, 
            start_date, 
            end_date, 
            total_days, 
            paid_days: paidDays,
            reason, 
            status: isApproved ? 'approved' : 'pending',
            ...(isApproved ? { approved_at: new Date(), admin_note: 'Applied by Admin on behalf of employee' } : {})
        }
    });

    if (!isApproved) {
        if (profile.email) {
            sendLeaveEmails(profile, total_days, start_date, end_date, reason).catch(e => console.error("Failed to send leave apply email", e));
        }
    } else {
        if (profile.email) {
            const { sendEmail } = require('../utils/emailService');
            const durationText = total_days === 1 ? '1 day' : `${total_days} days`;
            sendEmail({
                to: profile.email,
                subject: 'Leave Applied on Your Behalf',
                text: `An Admin has applied for a leave of ${durationText} starting ${start_date.toDateString()} on your behalf.`,
                html: `
                  <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #7e57c2;">Leave Applied By Admin</h2>
                    <p>Hi ${profile.full_name},</p>
                    <p>An Admin has applied for a leave on your behalf.</p>
                    <ul>
                      <li><strong>Duration:</strong> ${durationText}</li>
                      <li><strong>From:</strong> ${start_date.toDateString()}</li>
                      <li><strong>To:</strong> ${end_date.toDateString()}</li>
                      <li><strong>Reason:</strong> ${reason}</li>
                    </ul>
                    <p>Please check your portal for more details.</p>
                  </div>
                `
            }).catch((e: any) => console.error("Failed to send admin applied leave email", e));
        }
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
        include: { employee: { include: { managers: { select: { id: true } }, department: { select: { id: true, name: true } } } } },
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
        refundDays = leave.total_days || 0;
    } else if (status === 'cancelled') {
        const originalTotal = leave.total_days || 0;
        if (updateData.status === 'approved') {
            const newTotal = updateData.total_days || 0;
            refundDays = Math.max(0, originalTotal - newTotal);
        } else {
            refundDays = originalTotal;
        }
    }

    if (refundDays > 0) {
        await refundLeaveDays(leave.employee_id, refundDays);
    }

    sendStatusEmail(updatedLeave, status, adminNote).catch(e => console.error('Failed to send status email', e));
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
        refundDays = leave.total_days || 0;
    } else if (updateData.status === 'pending' && updateData.total_days !== undefined) {
        const originalTotal = leave.total_days || 0;
        const newTotal = updateData.total_days || 0;
        refundDays = Math.max(0, originalTotal - newTotal);
    }

    if (refundDays > 0) {
        await refundLeaveDays(leave.employee_id, refundDays);
    }
    
    if (leave.status === 'approved') {
        sendWithdrawalEmail(updatedLeave.employee, updatedLeave.start_date, updatedLeave.end_date, message).catch(e => console.error(e));
    }
    return { message, updatedLeave };
};
