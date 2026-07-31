import { runMonthlyAccrual } from '../cron/leaveAccrual';

const testAccrual = async () => {
    console.log("=== Manual Leave Accrual Test ===");
    console.log("Running the monthly leave accrual script manually...");
    await runMonthlyAccrual();
    console.log("=== Test Complete ===");
    process.exit(0);
};

testAccrual();
