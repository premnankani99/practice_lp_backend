export const leaveAppliedAdminTemplate = (employeeName: string, durationText: string, startDate: string, endDate: string, reason: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50;">New Leave Request</h2>
    <p>Hello Admin,</p>
    <p><strong>${employeeName}</strong> has applied for a leave. Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Duration:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${durationText}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>From:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${startDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>To:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${endDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reason}</td>
        </tr>
    </table>
    <br/>
    <p>Please click below to take action on this request:</p>
    <div style="margin: 20px 0;">
        <a href="https://lp.landmaarkdeveloper.com/admin/leave-queue" style="display: inline-block; padding: 10px 20px; margin-right: 10px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Approve Request</a>
        <a href="https://lp.landmaarkdeveloper.com/admin/leave-queue" style="display: inline-block; padding: 10px 20px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reject Request</a>
    </div>
    <br/>
    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
</div>
`;

export const leaveAppliedEmployeeTemplate = (employeeName: string, durationText: string, startDate: string, endDate: string, reason: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50;">Leave Application Submitted</h2>
    <p>Dear ${employeeName},</p>
    <p>Your leave application has been successfully submitted and is pending review by the admin.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Duration:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${durationText}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>From:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${startDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>To:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${endDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reason}</td>
        </tr>
    </table>
    <br/>
    <p>We will notify you once a decision has been made.</p>
    <p><a href="https://lp.landmaarkdeveloper.com" style="display: inline-block; padding: 8px 15px; margin-top: 10px; background-color: #7e57c2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Leave Portal</a></p>
    <br/>
    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
</div>
`;

export const leaveStatusUpdateTemplate = (employeeName: string, startDate: string, endDate: string, status: string, adminNote: string) => {
    const statusColor = status.toLowerCase() === 'approved' ? '#27ae60' : (status.toLowerCase() === 'rejected' ? '#c0392b' : '#f39c12');
    
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: ${statusColor};">Leave Request ${status.toUpperCase()}</h2>
        <p>Dear ${employeeName},</p>
        <p>Your leave request from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been <strong style="color: ${statusColor};">${status}</strong>.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid ${statusColor}; margin-top: 15px;">
            <p style="margin: 0;"><strong>Admin Note:</strong> ${adminNote || 'No additional notes provided.'}</p>
        </div>
        <br/>
        <p>Log in to the Leave Portal for more details.</p>
        <p><a href="https://lp.landmaarkdeveloper.com" style="display: inline-block; padding: 8px 15px; margin-top: 10px; background-color: #7e57c2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Leave Portal</a></p>
        <br/>
        <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
    </div>
    `;
};

export const getOtpEmailTemplate = (fullName: string, otp: string) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #7e57c2; text-align: center;">Verify Your Email</h2>
      <p>Hi ${fullName},</p>
      <p>Welcome to the Leave Portal! Please use the OTP below to verify your email address. This OTP is valid for 10 minutes.</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
        ${otp}
      </div>
      <p>If you did not create an account, you can safely ignore this email.</p>
      <p style="text-align: center; margin-top: 20px;"><a href="https://lp.landmaarkdeveloper.com" style="color: #7e57c2; text-decoration: none; font-weight: bold;">Visit Leave Portal</a></p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">This is an automated message, please do not reply.</p>
    </div>
  `;
};

export const getResetPasswordEmailTemplate = (fullName: string, otp: string) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #7e57c2; text-align: center;">Reset Your Password</h2>
      <p>Hi ${fullName},</p>
      <p>We received a request to reset your password for the Leave Portal. Please use the OTP below to complete the process. This OTP is valid for 10 minutes.</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
        ${otp}
      </div>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p style="text-align: center; margin-top: 20px;"><a href="https://lp.landmaarkdeveloper.com" style="color: #7e57c2; text-decoration: none; font-weight: bold;">Visit Leave Portal</a></p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888; text-align: center;">This is an automated message, please do not reply.</p>
    </div>
  `;
};


export const leaveWithdrawalAdminTemplate = (employeeName: string, startDate: string, endDate: string, message: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #f39c12;">Leave Withdrawal Request</h2>
    <p>Hello Admin,</p>
    <p><strong>${employeeName}</strong> has requested to withdraw their approved/pending leave.</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>From:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${startDate}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>To:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${endDate}</td>
        </tr>
    </table>
    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #f39c12; margin-top: 15px;">
        <p style="margin: 0;"><strong>Message:</strong> ${message}</p>
    </div>
    <br/>
    <p>Please log in to the Leave Portal to review and approve the withdrawal.</p>
    <p><a href="https://lp.landmaarkdeveloper.com/admin/leave-queue" style="display: inline-block; padding: 8px 15px; margin-top: 10px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Leave Queue</a></p>
    <br/>
    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
</div>
`;

export const compOffAppliedAdminTemplate = (employeeName: string, daysGranted: number, reason: string, workedDates: string[]) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50;">New Comp-Off Request</h2>
    <p>Hello Admin,</p>
    <p><strong>${employeeName}</strong> has applied for Comp-Off. Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Days Requested:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${daysGranted}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Worked Dates:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${workedDates.join(', ')}</td>
        </tr>
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reason}</td>
        </tr>
    </table>
    <br/>
    <p>Please click below to take action on this request:</p>
    <div style="margin: 20px 0;">
        <a href="https://lp.landmaarkdeveloper.com/admin/comp-offs" style="display: inline-block; padding: 10px 20px; margin-right: 10px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Approve Request</a>
        <a href="https://lp.landmaarkdeveloper.com/admin/comp-offs" style="display: inline-block; padding: 10px 20px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reject Request</a>
    </div>
    <br/>
    <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
</div>
`;

export const compOffStatusUpdateTemplate = (employeeName: string, daysGranted: number, status: string, adminNote: string) => {
    const statusColor = status.toLowerCase() === 'approved' ? '#27ae60' : (status.toLowerCase() === 'rejected' ? '#c0392b' : '#f39c12');
    
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: ${statusColor};">Comp-Off Request ${status.toUpperCase()}</h2>
        <p>Dear ${employeeName},</p>
        <p>Your request for <strong>${daysGranted} day(s)</strong> of Comp-Off has been <strong style="color: ${statusColor};">${status}</strong>.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid ${statusColor}; margin-top: 15px;">
            <p style="margin: 0;"><strong>Admin Note:</strong> ${adminNote || 'No additional notes provided.'}</p>
        </div>
        <br/>
        <p>Log in to the Leave Portal for more details.</p>
        <p><a href="https://lp.landmaarkdeveloper.com" style="display: inline-block; padding: 8px 15px; margin-top: 10px; background-color: #7e57c2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Leave Portal</a></p>
        <br/>
        <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
    </div>
    `;
};
