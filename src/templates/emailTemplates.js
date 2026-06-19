const getCredentialsEmail = (email, password, role) => {
  return {
    subject: 'Welcome to Hack-Portal - Account Credentials',
    text: `Hello,\n\nYour account has been created on the Competition / Hackathon / Internship Portal as a ${role}.\n\nCredentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease login and change your password immediately.\n\nRegards,\nPortal Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to the Portal</h2>
        <p>Your account has been created on the Competition / Hackathon / Internship Portal as a <strong>${role}</strong>.</p>
        <p>Here are your temporary credentials:</p>
        <table style="border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Password:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;"><code>${password}</code></td>
          </tr>
        </table>
        <p style="color: #ff3333; font-weight: bold;">You are required to change your password immediately upon your first login.</p>
        <br>
        <p>Regards,<br>Portal Team</p>
      </div>
    `
  };
};

const getCompetitionApprovedEmail = (title, org) => {
  return {
    subject: `Competition Approved: ${title}`,
    text: `Great news!\n\nThe competition "${title}" by ${org} has been reviewed and approved by the Super Admin. It is now published and visible to all eligible users.\n\nRegards,\nPortal Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">Competition Approved</h2>
        <p>The competition <strong>"${title}"</strong> hosted by <strong>${org}</strong> has been reviewed and approved by the Super Admin.</p>
        <p>It is now published and active on the portal.</p>
        <br>
        <p>Regards,<br>Portal Team</p>
      </div>
    `
  };
};

const getCompetitionRejectedEmail = (title, org, reason) => {
  return {
    subject: `Competition Rejected: ${title}`,
    text: `Hello,\n\nThe competition "${title}" by ${org} has been rejected during the review.\n\nRejection Reason:\n${reason || 'No specific reason provided.'}\n\nPlease revise and update the details if necessary.\n\nRegards,\nPortal Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #f44336;">Competition Rejected</h2>
        <p>The competition <strong>"${title}"</strong> hosted by <strong>${org}</strong> was rejected during the review phase.</p>
        <blockquote style="border-left: 4px solid #f44336; padding-left: 10px; color: #666; margin: 20px 0;">
          <strong>Rejection Reason:</strong><br>
          ${reason || 'No specific reason provided.'}
        </blockquote>
        <p>Please log in to the portal to revise and resubmit your details.</p>
        <br>
        <p>Regards,<br>Portal Team</p>
      </div>
    `
  };
};

const getCompetitionAssignedEmail = (title, roleName) => {
  return {
    subject: `Assigned to Competition: ${title}`,
    text: `Hello,\n\nYou have been assigned to the competition "${title}" as a ${roleName}.\n\nPlease check your portal dashboard for further details.\n\nRegards,\nPortal Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>New Competition Assignment</h2>
        <p>You have been assigned to the competition <strong>"${title}"</strong> as a <strong>${roleName}</strong>.</p>
        <p>Please log in to the portal to view the timelines, rounds, and associated student tracking sheets.</p>
        <br>
        <p>Regards,<br>Portal Team</p>
      </div>
    `
  };
};

const getDeadlineReminderEmail = (title, deadline) => {
  return {
    subject: `Registration Deadline Reminder: ${title}`,
    text: `Hello,\n\nThis is a friendly reminder that the registration deadline for "${title}" is approaching on ${new Date(deadline).toLocaleString()}.\n\nIf you haven't registered yet, please update your registration status on the portal.\n\nRegards,\nPortal Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #ff9800;">Registration Deadline Approaching</h2>
        <p>This is a reminder that the registration deadline for the competition <strong>"${title}"</strong> is approaching.</p>
        <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
        <p>Please log in and mark your registration status before the deadline passes.</p>
        <br>
        <p>Regards,<br>Portal Team</p>
      </div>
    `
  };
};

module.exports = {
  getCredentialsEmail,
  getCompetitionApprovedEmail,
  getCompetitionRejectedEmail,
  getCompetitionAssignedEmail,
  getDeadlineReminderEmail
};
