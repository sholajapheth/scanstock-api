import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    // You should add this to your .env file
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM_ADDRESS') ||
      'onboarding@resend.dev';
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}:`, error);
        return false;
      }

      this.logger.log(`Successfully sent email to ${to} with ID: ${data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}:`, error);
      return false;
    }
  }

  private getEmailTemplate(
    templateName: string,
    params: Record<string, any>,
  ): string {
    const templates = {
      welcome: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ScanStock</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; color: #333333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #00B74A; padding: 30px 20px; text-align: center;">
                    <!-- Logo can be added here -->
                    <img src="icon.png" alt="ScanStock Logo" style="width: 100px; height: 100px;">
                    <h1 style="color: #ffffff; margin: 0;">ScanStock</h1>
                </div>
                
                <div style="padding: 30px 20px; background-color: #ffffff;">
                    <div style="font-size: 24px; color: #00B74A; margin-bottom: 20px;">Welcome to ScanStock, ${params.name}!</div>
                    
                    <p>Thank you for joining ScanStock! We're excited to help you streamline your inventory management and make your business operations more efficient.</p>
                    
                    <p>With ScanStock, you can:</p>
                    <ul>
                        <li>Easily track your inventory in real-time</li>
                        <li>Manage products and categories efficiently</li>
                        <li>Monitor sales and stock levels</li>
                        <li>Generate detailed reports and insights</li>
                    </ul>
                    
                    <p>Ready to get started?</p>
                    
                    <a href="https://app.scanstock.com/dashboard" 
                       style="display: inline-block; padding: 12px 24px; background-color: #00B74A; color: #ffffff; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                        Access Your Dashboard
                    </a>
                    
                    <p>If you need any assistance or have questions, our support team is here to help.</p>
                    
                    <p>Best regards,<br>The ScanStock Team</p>
                </div>
                
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666666;">
                    <p>This email was sent to you because you registered for a ScanStock account.</p>
                    <p>© ${new Date().getFullYear()} ScanStock. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      resetPassword: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; color: #333333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #00B74A; padding: 30px 20px; text-align: center;">
                    <img src="icon.png" alt="ScanStock Logo" style="width: 100px; height: 100px;">
                    <h1 style="color: #ffffff; margin: 0;">ScanStock</h1>
                </div>
                <div style="padding: 30px 20px; background-color: #ffffff;">
                    <div style="font-size: 24px; color: #00B74A; margin-bottom: 20px;">Password Reset Request</div>
                    <p>Hello ${params.name},</p>
                    <p>We received a request to reset your password. Your verification code is:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
                        ${params.otp}
                    </div>
                    <p>This code will expire in 15 minutes. If you didn't request this change, please ignore this email or contact support if you have concerns.</p>
                    <p>Best regards,<br>The ScanStock Team</p>
                </div>
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666666;">
                    <p>This is a system-generated email. Please do not reply.</p>
                    <p>© ${new Date().getFullYear()} ScanStock. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      otp: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; color: #333333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #00B74A; padding: 30px 20px; text-align: center;">
                    <img src="icon.png" alt="ScanStock Logo" style="width: 100px; height: 100px;">
                    <h1 style="color: #ffffff; margin: 0;">ScanStock</h1>
                </div>
                <div style="padding: 30px 20px; background-color: #ffffff;">
                    <div style="font-size: 24px; color: #00B74A; margin-bottom: 20px;">Verification Code</div>
                    <p>Hello ${params.name},</p>
                    <p>Your verification code is:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
                        ${params.otp}
                    </div>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
                    <p>Best regards,<br>The ScanStock Team</p>
                </div>
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666666;">
                    <p>This is a system-generated email. Please do not reply.</p>
                    <p>© ${new Date().getFullYear()} ScanStock. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    return templates[templateName] || '';
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = this.getEmailTemplate('welcome', { name });
    return this.sendEmail(email, 'Welcome to ScanStock!', html);
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    otp: string,
  ): Promise<boolean> {
    const html = this.getEmailTemplate('resetPassword', { name, otp });
    return this.sendEmail(email, 'Reset Your Password - ScanStock', html);
  }

  async sendOtpEmail(
    email: string,
    name: string,
    otp: string,
  ): Promise<boolean> {
    const html = this.getEmailTemplate('otp', { name, otp });
    return this.sendEmail(email, 'Your Verification Code - ScanStock', html);
  }
}
