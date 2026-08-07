import prisma from '../prismaClient';

/**
 * Recalculates and updates the available_leaves for an employee based on:
 * 1. Earned Leaves: 1 leave per month completed after 6 months of joining.
 * 2. Comp-Offs: Sum of approved Comp-Off days granted.
 * 3. Taken Leaves: Sum of paid_days from approved/pending paid leaves.
 */
export const syncEmployeeLeaveBalance = async (employeeId: number) => {
    try {
        const employee = await prisma.profiles.findUnique({
            where: { id: employeeId }
        });

        if (!employee) return;

        let earnedLeaves = 0;

        if (employee.date_of_joining) {
            const today = new Date();
            const joinDate = new Date(employee.date_of_joining);
            
            // Calculate exact months difference
            let monthsDiff = (today.getFullYear() - joinDate.getFullYear()) * 12;
            monthsDiff -= joinDate.getMonth();
            monthsDiff += today.getMonth();

            if (today.getDate() < joinDate.getDate()) {
                monthsDiff--;
            }

            // Earned leaves: 1 per month after 6 months
            earnedLeaves = Math.max(0, monthsDiff - 5);
        }

        // Fetch granted comp-offs
        const compOffs = await prisma.compOffGrant.aggregate({
            where: {
                employeeId: employeeId,
                status: 'approved'
            },
            _sum: {
                daysGranted: true
            }
        });
        const compOffsGranted = compOffs._sum.daysGranted || 0;

        // Fetch taken paid leaves
        const takenLeaves = await prisma.leave_requests.aggregate({
            where: {
                employee_id: employeeId,
                status: { in: ['approved', 'pending', 'withdrawal_requested'] },
                leave_type: { in: ['Paid Leave', 'Half Day (Paid)'] }
            },
            _sum: {
                paid_days: true
            }
        });
        const paidLeavesTaken = takenLeaves._sum.paid_days || 0;

        // Calculate new balance
        const newBalance = earnedLeaves + compOffsGranted - paidLeavesTaken;

        // Update DB
        await prisma.profiles.update({
            where: { id: employeeId },
            data: {
                available_leaves: newBalance
            }
        });

        console.log(`[Sync] Resynced balance for ${employee.email}: Earned(${earnedLeaves}) + CompOffs(${compOffsGranted}) - Taken(${paidLeavesTaken}) = ${newBalance}`);
        return newBalance;
    } catch (error) {
        console.error(`[Sync] Error syncing balance for employee ${employeeId}:`, error);
        throw error;
    }
};
