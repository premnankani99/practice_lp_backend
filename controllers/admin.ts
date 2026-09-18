import { logger } from '../utils/logger';
import { Request, Response } from 'express';
import { sendEmail } from '../utils/emailService';
import { getAllLeaves } from './leaves';
import prisma from '../prismaClient';
import { MESSAGES } from '../constants/strings';
import { HTTP_STATUS } from '../constants/httpCodes';
import { syncEmployeeLeaveBalance } from '../services/leaveAccrualService';

/**
 * Fetches all pending employee verification requests.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const getPendingVerifications = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pending = await prisma.profiles.findMany({
      where: {
        verification_status: 'pending',
        email_verified: true,
        is_deleted: false
      },
      orderBy: { created_at: 'desc' }
    });
    res.status(HTTP_STATUS.OK).json(pending);
  } catch (_error) {
    logger.error("[Backend] Error caught in admin.ts", _error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
  }
};

/**
 * Fetches all verified employees.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const getVerifiedEmployees = async (_req: Request, res: Response): Promise<void> => {
  try {
    const verified = await prisma.profiles.findMany({
      where: {
        verification_status: 'approved',
        role: 'employee',
        is_deleted: false
      },
      include: {
        managers: {
          select: { id: true, full_name: true, email: true, role: true }
        }
      },
      orderBy: { full_name: 'asc' }
    });
    res.status(HTTP_STATUS.OK).json(verified);
  } catch (error) {
    logger.error("[Backend] Error caught in admin.ts:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
  }
};

/**
 * Fetches all managers (admins and HR) to be assigned as parents.
 */
export const getManagers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const managers = await prisma.profiles.findMany({
      where: {
        verification_status: 'approved',
        role: { in: ['admin', 'hr'] },
        is_deleted: false
      },
      orderBy: { full_name: 'asc' }
    });
    res.status(HTTP_STATUS.OK).json(managers);
  } catch (error) {
    logger.error("[Backend] Error caught in admin.ts:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.FETCH_ERROR });
  }
};

/**
 * Updates the verification status of an employee.
 * @param {Request} req - The Express request object containing status in body.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const updateVerificationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedProfile = await prisma.profiles.update({
      where: { id: Number(id) },
      data: {
        verification_status: status,
        is_active: status === 'approved'
      }
    });

    res.status(HTTP_STATUS.OK).json({ message: MESSAGES.VERIFICATION_UPDATED, profile: updatedProfile });
  } catch (error) {
    logger.error("[Backend] Error caught in admin.ts:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.UPDATE_ERROR });
  }
};

/**
 * Soft deletes an employee profile.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.profiles.update({
      where: { id: Number(id) },
      data: { is_deleted: true }
    });

    res.status(HTTP_STATUS.OK).json({ message: MESSAGES.EMPLOYEE_DELETED });
  } catch (error) {
    logger.error("[Backend] Error caught in admin.ts:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.DELETE_ERROR });
  }
};

/**
 * Updates an employee's details.
 * @param {Request} req - The Express request object containing updated fields.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} Resolves when the response is sent.
 */
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, designation, role, date_of_joining, probation_date, toggle_manager } = req.body;

    const updateData: any = { full_name, email, phone, designation, role };

    // Only allow admins to assign/unassign themselves
    if (toggle_manager !== undefined && (req as any).user?.role === 'admin') {
      const adminId = (req as any).user.id;
      updateData.managers = toggle_manager
        ? { connect: { id: adminId } }
        : { disconnect: { id: adminId } };
    }

    if (date_of_joining) {
      updateData.date_of_joining = new Date(date_of_joining);
    }

    if (probation_date) {
      updateData.probation_date = new Date(probation_date);
    } else if (probation_date === null) {
      updateData.probation_date = null;
    }

    const updatedProfile = await prisma.profiles.update({
      where: { id: Number(id) },
      data: updateData
    });

    if (date_of_joining) {
      await syncEmployeeLeaveBalance(Number(id));
    }

    // Fetch again to get latest synced balance if updated
    const finalProfile = await prisma.profiles.findUnique({ where: { id: Number(id) } });

    res.status(HTTP_STATUS.OK).json({ message: MESSAGES.EMPLOYEE_UPDATED, profile: finalProfile || updatedProfile });
  } catch (error) {
    logger.error("[Backend] Error caught in admin.ts:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.UPDATE_ERROR });
  }
};

export const grantCompOff = async (req: any, res: Response): Promise<void> => {
  try {
    console.log("GRANT COMP OFF REQ.BODY:", req.body);
    const { employeeId, daysGranted, reason, workedDates } = req.body;

    if (!employeeId || !daysGranted || !reason || !workedDates || !Array.isArray(workedDates)) {
      res.status(400).json({ error: "Missing required fields (employeeId, daysGranted, reason, workedDates as array)" });
      return;
    }

    const parsedEmployeeId = Number(employeeId);
    const parsedDaysGranted = Number(daysGranted);

    if (isNaN(parsedEmployeeId) || isNaN(parsedDaysGranted)) {
      res.status(400).json({ error: "Invalid employeeId or daysGranted" });
      return;
    }

    if (new Set(workedDates).size !== workedDates.length) {
      res.status(400).json({ error: "Duplicate dates are not allowed in a single request." });
      return;
    }

    const adminId = req.user?.id;
    if (!adminId) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }
    const parsedAdminId = Number(adminId);
    if (isNaN(parsedAdminId)) {
      res.status(400).json({ error: "Invalid admin user ID" });
      return;
    }

    const employee = await prisma.profiles.findUnique({
      where: { id: parsedEmployeeId }
    });

    if (!employee || !employee.is_active || employee.is_deleted) {
      res.status(404).json({ error: "Employee not found or inactive" });
      return;
    }

    const existingCompOffs = await prisma.compOffGrant.findMany({
      where: {
        employeeId: Number(employeeId),
        status: { not: 'rejected' }
      }
    });

    let hasDuplicate = false;
    let duplicateDate = '';
    for (const grant of existingCompOffs) {
      if (Array.isArray(grant.workedDates)) {
        for (const date of workedDates) {
          if (grant.workedDates.includes(date)) {
            hasDuplicate = true;
            duplicateDate = date;
            break;
          }
        }
      }
      if (hasDuplicate) break;
    }

    if (hasDuplicate) {
      res.status(400).json({ error: `A Comp-Off for ${duplicateDate} has already been requested or processed.` });
      return;
    }

    const existingLeaves = await prisma.leave_requests.findMany({
      where: {
        employee_id: Number(employeeId),
        status: { in: ['approved', 'pending'] }
      }
    });

    for (const leave of existingLeaves) {
      const leaveStart = new Date(leave.start_date);
      const leaveEnd = new Date(leave.end_date);
      leaveStart.setUTCHours(0, 0, 0, 0);
      leaveEnd.setUTCHours(0, 0, 0, 0);

      for (const dateStr of workedDates) {
        const workedDate = new Date(dateStr);
        workedDate.setUTCHours(0, 0, 0, 0);

        if (workedDate >= leaveStart && workedDate <= leaveEnd) {
          res.status(400).json({ error: `Employee already has a leave request covering ${dateStr}. Comp-off cannot be granted for this date.` });
          return;
        }
      }
    }

    const updatedEmployee = await prisma.$transaction(async (tx) => {
      await tx.compOffGrant.create({
        data: {
          employeeId: parsedEmployeeId,
          daysGranted: parsedDaysGranted,
          reason,
          workedDates,
          grantedBy: parsedAdminId,
          status: 'approved'
        }
      });

      return await tx.profiles.update({
        where: { id: parsedEmployeeId },
        data: {
          comp_off_leaves: { increment: parsedDaysGranted }
        }
      });
    });

    if (parsedDaysGranted > 0) {
      // autoUpgradeUnpaidLeaves removed
    }

    const finalProfile = await prisma.profiles.findUnique({ where: { id: parsedEmployeeId } });
    if (!finalProfile) throw new Error("Profile not found after update");

    if (finalProfile.email) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #7e57c2; margin-top: 0;">Comp-Off Granted</h2>
          <p style="font-size: 16px;">Hi <strong>${finalProfile.full_name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5;">An Admin has granted you <strong style="color: #4ade80;">${parsedDaysGranted} day(s)</strong> of Comp-Off.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Worked Dates:</strong> ${workedDates.map((d: string) => new Date(d).toDateString()).join(', ')}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Your New Leave Balance:</strong> ${finalProfile.available_leaves} Days</p>
          </div>
          <p style="font-size: 14px; color: #64748b;">You can use this balance to apply for future Paid leaves.</p>
          <br/>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">Thanks,<br/>Admin Team</p>
        </div>
      `;
      sendEmail({
        to: finalProfile.email,
        subject: 'Comp-Off Granted',
        text: `You have been granted ${parsedDaysGranted} day(s) of Comp-Off for reason: ${reason}. Your new balance is ${finalProfile.available_leaves}.`,
        html: emailHtml
      }).catch(err => console.error('Failed to send comp-off email:', err));
    }

    res.json({
      message: "Comp-off granted successfully",
      newBalance: finalProfile.available_leaves
    });
  } catch (error) {
    logger.error("[Backend] Error caught in admin.ts:", error);
    console.error("Error granting comp off:", error);
    res.status(500).json({ error: "Failed to grant comp off" });
  }
};

export const getCompOffHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.query;

    const whereClause: any = { employee: { is_deleted: false } };
    if (employeeId) {
      whereClause.employeeId = Number(employeeId);
    }

    const history = await prisma.compOffGrant.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            full_name: true,
            email: true
          }
        }
      },
      orderBy: {
        grantedAt: 'desc'
      }
    });

    res.json(history);
  } catch (error) {
    logger.error("[Backend] Error caught in admin.ts:", error);
    console.error("Error fetching comp off history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};


export const adjustLeaveBalance = async (req: any, res: any) => {
  try {
    const { employeeId, amount, reason } = req.body;
    const adminId = req.user?.id;
    const parsedId = Number(employeeId), parsedAmt = Number(amount);

    if (!employeeId || amount === undefined || isNaN(parsedId) || isNaN(parsedAmt) || !adminId)
      return void res.status(400).json({ error: "Invalid inputs" });

    if (!(await prisma.profiles.findUnique({ where: { id: parsedId } })))
      return void res.status(404).json({ error: "Employee not found" });

    const updated = await prisma.profiles.update({
      where: { id: parsedId },
      data: { available_leaves: { increment: parsedAmt } }
    });

    await prisma.audit_logs.create({
      data: { actor_id: adminId, action: `Adjusted Standard Balance by ${parsedAmt}. Reason: ${reason || "None"}`, target_table: "profiles", target_id: parsedId }
    });

    logger.info(`[Backend] Admin ${adminId} adjusted leaves for emp ${parsedId} by ${parsedAmt}`);
    res.json({ message: "Balance adjusted successfully", newBalance: updated.available_leaves });
  } catch (err) { res.status(500).json({ error: "Failed to adjust balance" }); }
};

export const markLop = async (req: any, res: any) => {
  try {
    const { employeeId, lopDays, reason } = req.body;
    const adminId = req.user?.id;
    const parsedId = Number(employeeId), parsedAmt = Number(lopDays);

    if (!employeeId || !lopDays || isNaN(parsedId) || isNaN(parsedAmt) || parsedAmt <= 0 || !adminId)
      return void res.status(400).json({ error: "Invalid inputs" });

    if (!(await prisma.profiles.findUnique({ where: { id: parsedId } })))
      return void res.status(404).json({ error: "Employee not found" });

    const updated = await prisma.profiles.update({
      where: { id: parsedId },
      data: { available_leaves: { increment: parsedAmt } }
    });

    await prisma.audit_logs.create({
      data: { actor_id: adminId, action: `Marked LOP for ${parsedAmt} days. Reason: ${reason || "None"}`, target_table: "profiles", target_id: parsedId }
    });

    logger.info(`[Backend] Admin ${adminId} marked LOP for ${parsedAmt} days for emp ${parsedId}`);
    res.json({ message: "LOP marked successfully", newBalance: (updated.comp_off_leaves || 0) - (updated.available_leaves || 0) });
  } catch (err) { res.status(500).json({ error: "Failed to mark LOP" }); }
};

const fetchHistory = async (req: any, res: any, prefix: string) => {
  try {
    if (!req.query.employeeId) return void res.status(400).json({ error: "Missing employeeId" });
    const logs = await prisma.audit_logs.findMany({
      where: { target_table: "profiles", target_id: Number(req.query.employeeId), action: { startsWith: prefix } },
      orderBy: { created_at: "desc" }
    });
    res.json(logs);
  } catch (err) { res.status(500).json({ error: "Failed to fetch history" }); }
};

export const getAdjustBalanceHistory = (req: any, res: any) => fetchHistory(req, res, "Adjusted Standard Balance");
export const getLopHistory = (req: any, res: any) => fetchHistory(req, res, "Marked LOP");
