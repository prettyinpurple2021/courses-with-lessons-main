import resend from '../config/email.js';

export class EmailService {
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@solosuccess.com';
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Reset Your Password - SoloSuccess Intel Academy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password for SoloSuccess Intel Academy.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #6B7280; word-break: break-all;">${resetLink}</p>
            <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      console.log(`Password reset email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Welcome to SoloSuccess Intel Academy!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome, ${firstName}!</h2>
            <p>Thank you for joining SoloSuccess Intel Academy.</p>
            <p>We're excited to have you on board. Start exploring our courses and begin your learning journey today!</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Browse Courses
            </a>
          </div>
        `,
      });

      console.log(`Welcome email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error for welcome emails - it's not critical
    }
  }

  /**
   * Send course completion email
   */
  async sendCourseCompletionEmail(
    to: string,
    firstName: string,
    courseTitle: string,
    certificateUrl: string
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Congratulations! You've completed ${courseTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Congratulations, ${firstName}! 🎉</h2>
            <p>You've successfully completed <strong>${courseTitle}</strong>!</p>
            <p>Your certificate is ready. Click below to view and download it:</p>
            <a href="${certificateUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              View Certificate
            </a>
            <p>Keep up the great work and continue your learning journey!</p>
          </div>
        `,
      });

      console.log(`Course completion email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send course completion email:', error);
      // Don't throw error - it's not critical
    }
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return !!process.env.RESEND_API_KEY && !!this.fromEmail;
  }
}

export default new EmailService();
