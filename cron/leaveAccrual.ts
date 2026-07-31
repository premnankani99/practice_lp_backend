import cron from 'node-cron';
import prisma from '../prismaClient';

/**
 * Executes the monthly leave accrual logic.
 * Adds 1 leave to the available_leaves of all active employees
 * whose date_of_joining is at least 6 months ago.
 */
export const runMonthlyAccrual = async () => {
    console.log(`[Cron] Running monthly leave accrual at ${new Date().toISOString()}`);

    try {
        const employees = await prisma.profiles.findMany({
            where: {
                is_active: true,
                is_deleted: false,
                role: 'employee',
                date_of_joining: { not: null }
            }
        });

        const today = new Date();
        let updatedCount = 0;

        for (const employee of employees) {
            if (!employee.date_of_joining) continue;

            const joinDate = new Date(employee.date_of_joining);
            
            // Calculate exact months difference
            let monthsDiff = (today.getFullYear() - joinDate.getFullYear()) * 12;
            monthsDiff -= joinDate.getMonth();
            monthsDiff += today.getMonth();

            // Adjust if the exact day hasn't occurred yet in the current month
            if (today.getDate() < joinDate.getDate()) {
                monthsDiff--;
            }

            // Employee is eligible if they have completed at least 6 months
            if (monthsDiff >= 6) {
                await prisma.profiles.update({
                    where: { id: employee.id },
                    data: {
                        available_leaves: { increment: 1 }
                    }
                });
                console.log(`[Cron] Credited +1 leave to ${employee.full_name} (${employee.email}). New Balance: ${employee.available_leaves + 1}`);
                updatedCount++;
            }
        }

        console.log(`[Cron] Monthly leave accrual completed successfully. ${updatedCount} employees received leaves.`);
    } catch (error) {
        console.error('[Cron] Error during monthly leave accrual:', error);
    }
};

// Schedule to run at 00:00 on the 1st of every month
export const initCronJobs = () => {
    cron.schedule('0 0 1 * *', () => {
        runMonthlyAccrual();
    });
    console.log('[Cron] Initialized monthly leave accrual job (Runs at 00:00 on the 1st of every month).');
};
